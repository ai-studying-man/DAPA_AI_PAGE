import { NextResponse } from "next/server";
import { synthesizeAnswer, type AnswerMode } from "@/lib/answer-synthesis";
import { dataStats, getDirectAnswer, retrieveContext } from "@/lib/dapa-data";
import { answerDapaLawQuestion, isDapaLawQuestion } from "@/lib/law-open-api";
import { OLLAMA_MODEL } from "@/lib/ollama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRequest = {
  message?: string;
  section?: string;
};

const MAX_MESSAGE_LENGTH = 2000;
const MAX_BODY_BYTES = 8192;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function errorResponse(code: string, message: string, status: number, recoverable = true) {
  return NextResponse.json({ code, message, recoverable }, { status });
}

function cleanAnswerText(text: string) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/^\s{0,3}#{1,6}\s*/gm, "").replace(/\*\*/g, "").replace(/#/g, "").trim();
}

function clientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "unknown";
}

function checkRateLimit(request: Request) {
  const now = Date.now();
  const key = clientKey(request);
  const current = rateLimitBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }
  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS ? errorResponse("RATE_LIMITED", "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.", 429) : null;
}

async function parseChatRequest(request: Request): Promise<ChatRequest | NextResponse> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const parsed = Number(contentLength);
    if (Number.isFinite(parsed) && parsed > MAX_BODY_BYTES) return errorResponse("PAYLOAD_TOO_LARGE", "request body must be 8192 bytes or fewer", 413);
  }
  try {
    const reader = request.body?.getReader();
    if (!reader) return errorResponse("BAD_REQUEST", "valid JSON body is required", 400);
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BODY_BYTES) {
        await reader.cancel();
        return errorResponse("PAYLOAD_TOO_LARGE", "request body must be 8192 bytes or fewer", 413);
      }
      chunks.push(value);
    }
    const bodyBytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      bodyBytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder().decode(bodyBytes)) as ChatRequest;
  } catch {
    return errorResponse("BAD_REQUEST", "valid JSON body is required", 400);
  }
}

function sourcePayload(sources: ReturnType<typeof retrieveContext>) {
  return sources.map((source) => ({ type: source.type, title: source.title, source: source.source, sourceUrl: sourceUrl(source), section: source.section, modified: source.modified, score: source.score }));
}

function sourceUrl(source: ReturnType<typeof retrieveContext>[number]) {
  const contentUrl = source.content.match(/https?:\/\/[^\s),]+/)?.[0];
  const sourceTextUrl = source.source.match(/https?:\/\/[^\s),]+/)?.[0];
  return contentUrl ?? sourceTextUrl;
}

function modelPayload(mode: AnswerMode) {
  return { provider: "ollama", name: OLLAMA_MODEL, mode };
}

export async function POST(request: Request) {
  try {
    const rateLimitError = checkRateLimit(request);
    if (rateLimitError) return rateLimitError;
    const body = await parseChatRequest(request);
    if (body instanceof NextResponse) return body;
    const message = body.message?.trim();
    const section = body.section?.trim();
    if (!message) return errorResponse("BAD_REQUEST", "message is required", 400);
    if (message.length > MAX_MESSAGE_LENGTH) return errorResponse("MESSAGE_TOO_LONG", "message must be 2000 characters or fewer", 400);
    const sources = retrieveContext(message, section);
    if (isDapaLawQuestion(message, section)) {
      const lawAnswer = await answerDapaLawQuestion(message);
      if (lawAnswer) {
        return NextResponse.json({ answer: cleanAnswerText(lawAnswer.answer), model: modelPayload("fallback"), stats: dataStats(), sources: lawAnswer.sources, apiNote: "법제처 국가법령정보 공동활용 API에서 방위사업 관련 법령 근거를 조회했습니다." });
      }
    }
    const directAnswer = getDirectAnswer(message, section);
    const result = await synthesizeAnswer({ message, section, sources, directAnswer });
    return NextResponse.json({ answer: cleanAnswerText(result.answer), model: modelPayload(result.mode), stats: dataStats(), sources: sourcePayload(sources), apiNote: "현재 구현은 공식 홈페이지 Playwright 수집 정보, 공공데이터 인벤토리, 로컬 CSV 스냅샷을 검색 근거로 사용합니다." });
  } catch {
    return errorResponse("INTERNAL_ERROR", "요청을 처리하지 못했습니다.", 500, false);
  }
}
