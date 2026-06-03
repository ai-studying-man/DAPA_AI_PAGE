import type { DirectAnswer, RetrievedSource, SourceDoc } from "@/lib/dapa-data";
import { runtimeEnv } from "@/lib/env";
import { chatWithOllama, OllamaError, OLLAMA_MODEL } from "@/lib/ollama";

type AnswerInput = {
  readonly message: string;
  readonly section?: string;
  readonly sources: readonly RetrievedSource[];
  readonly directAnswer: DirectAnswer | null;
};

export type AnswerMode = "synthesized" | "fallback";

export type SynthesizedAnswer = {
  readonly answer: string;
  readonly mode: AnswerMode;
};

type SourceCounts = {
  readonly homepage: number;
  readonly file: number;
  readonly api: number;
};

const SOURCE_LABELS: Record<SourceDoc["type"], string> = {
  FILE: "데이터셋",
  API: "API",
  SECTION: "공개 섹션",
  HOMEPAGE: "공식 홈페이지"
};

function sourceCounts(sources: readonly RetrievedSource[]): SourceCounts {
  return {
    homepage: sources.filter((source) => source.type === "HOMEPAGE").length,
    file: sources.filter((source) => source.type === "FILE").length,
    api: sources.filter((source) => source.type === "API").length
  };
}

function sourceIntro(source: RetrievedSource) {
  if (source.type === "FILE") return `${source.title} 데이터셋을 통해 불러온 근거입니다.`;
  if (source.type === "API") return `${source.title} API를 통해 불러온 근거입니다.`;
  if (source.type === "HOMEPAGE") return `${source.title} 공식 홈페이지 화면을 통해 불러온 근거입니다.`;
  return `${source.title} 공개 섹션을 통해 불러온 근거입니다.`;
}

function compactContent(content: string, maxLength = 420) {
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized;
}

function evidenceLines(sources: readonly RetrievedSource[]) {
  return sources.slice(0, 5).map((source, index) => {
    const section = source.section ? ` · ${source.section}` : "";
    return `${index + 1}. ${source.title} (${SOURCE_LABELS[source.type]}${section}) - ${compactContent(source.content, 180)}`;
  });
}

function primarySourceSummary(sources: readonly RetrievedSource[]) {
  const primary = sources[0];
  if (!primary) return "검색된 공개 근거가 없어 기본 홈페이지 인덱스를 기준으로 안내합니다.";
  return `${sourceIntro(primary)} 질문과 가장 가까운 근거는 '${primary.title}'이며, 보조 근거 ${Math.max(0, sources.length - 1)}건을 함께 대조했습니다.`;
}

function questionIntent(input: AnswerInput) {
  if (input.section) return `${input.section} 관련 공개 정보 안내`;
  if (/정보공개|공개|메뉴/.test(input.message)) return "방위사업청 정보공개 메뉴 안내";
  if (/중소기업|조달|입찰|계약/.test(input.message)) return "방산 중소기업 조달·입찰 정보 안내";
  if (/채용|직원|예비/.test(input.message)) return "방위사업청 채용·예비인력 정보 안내";
  if (/R&D|연구개발|기술개발/.test(input.message)) return "국방기술 연구개발 정보 안내";
  return "방위사업청 공개 정보 안내";
}

function reasoningText(input: AnswerInput) {
  const counts = sourceCounts(input.sources);
  const target = input.section ? `${input.section} 영역` : "전체 공개 정보";
  return [
    `질문은 '${questionIntent(input)}'에 대한 ${target} 탐색으로 해석했습니다.`,
    `검색 근거는 공식 홈페이지 ${counts.homepage}건, 데이터셋 ${counts.file}건, API ${counts.api}건입니다.`,
    primarySourceSummary(input.sources)
  ].join("\n");
}

function deterministicAnswer(input: AnswerInput) {
  const evidence = input.directAnswer?.answer ?? evidenceLines(input.sources).join("\n");
  const nextSteps = input.sources.slice(0, 3).map((source, index) => {
    const label = SOURCE_LABELS[source.type];
    return `${index + 1}. ${source.title} (${label})에서 원문 경로와 세부 항목을 확인하세요.`;
  });
  const steps = nextSteps.length ? nextSteps.join("\n") : "1. 방위사업청 공식 홈페이지 원문 링크에서 최신 여부를 확인하세요.";

  return [
    `사용 모델: ${OLLAMA_MODEL} (Ollama 오픈소스 로컬 LLM 설정, RAG 검색 근거 기반 응답)`,
    "",
    "질문 이해",
    reasoningText(input),
    "",
    "Reasoning/근거 판단",
    "질문 의도와 가장 가까운 공식 홈페이지/데이터셋/API 근거를 먼저 고르고, 서로 다른 출처가 같은 업무 흐름을 가리키는지 확인한 뒤 사용자가 바로 이동할 수 있는 메뉴와 데이터 항목을 우선 정리했습니다.",
    "",
    "답변",
    evidence,
    "",
    "추천 다음 행동",
    steps,
    "",
    "출처와 한계",
    "답변은 표시된 출처 근거만 사용합니다. 데이터셋/API 답변은 해당 데이터 또는 API 근거를, 홈페이지 답변은 Playwright로 수집한 공식 홈페이지 화면 근거를 사용합니다. 실시간 공고·계약 변경은 원문 링크 또는 공식 시스템에서 재확인해야 합니다."
  ].join("\n");
}

function llmPrompt(input: AnswerInput) {
  return [
    `질문 의도: ${questionIntent(input)}`,
    input.section ? `관심 영역: ${input.section}` : "관심 영역: 전체",
    "",
    "검색 근거:",
    evidenceLines(input.sources).join("\n"),
    input.directAnswer ? `\n직접 근거 요약:\n${input.directAnswer.answer}` : "",
    "",
    "한국어로 답변하라. 숨은 chain-of-thought를 노출하지 말고, 다음 제목을 그대로 사용하라: 사용 모델, 질문 이해, Reasoning/근거 판단, 답변, 추천 다음 행동, 출처와 한계. Reasoning/근거 판단은 2-3문장의 공개 근거 판단 요약만 쓴다. 근거에 없는 사실은 추정하지 않는다."
  ].join("\n");
}

async function tryOllamaAnswer(input: AnswerInput) {
  if (process.env.NODE_ENV === "test" && process.env.OLLAMA_TEST_SYNTHESIS !== "true") return null;
  if (process.env.OLLAMA_SYNTHESIS_ENABLED !== "true") return null;
  if (!runtimeEnv.ollama.enabled) return null;
  try {
    const answer = await chatWithOllama(
      [
        { role: "system", content: "당신은 방위사업청 공개 홈페이지와 공공데이터 근거만 사용해 친절하고 실무적인 한국어 답변을 작성하는 RAG 도우미입니다." },
        { role: "user", content: llmPrompt(input) }
      ],
      { ...runtimeEnv.ollama, timeoutMs: Math.min(runtimeEnv.ollama.timeoutMs, 3500) }
    );
    return answer.trim() ? answer : null;
  } catch (error) {
    if (error instanceof OllamaError) return null;
    throw error;
  }
}

export async function synthesizeAnswer(input: AnswerInput) {
  const generated = await tryOllamaAnswer(input);
  if (generated) return { answer: generated, mode: "synthesized" } satisfies SynthesizedAnswer;
  return { answer: deterministicAnswer(input), mode: "fallback" } satisfies SynthesizedAnswer;
}
