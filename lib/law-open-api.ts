import { runtimeEnv } from "./env";

const LAW_API_BASE = "https://www.law.go.kr/DRF";
const LAW_TARGET = "dapaCgmExpc";
const LAW_API_TIMEOUT_MS = 8000;

type LawSearchItem = {
  id?: string;
  안건명?: string;
  안건번호?: string;
  법령해석일련번호?: string;
  질의기관명?: string;
  해석기관명?: string;
  해석일자?: string;
  데이터기준일시?: string;
  법령해석상세링크?: string;
};

type LawDetail = {
  법령해석일련번호?: string;
  안건명?: string;
  안건번호?: string;
  해석일자?: string;
  해석기관명?: string;
  질의기관명?: string;
  질의요지?: string;
  회답?: string;
  이유?: string;
  관련법령?: string;
  데이터기준일시?: string;
};

export type LawApiAnswer = {
  answer: string;
  sources: Array<{
    type: "API";
    title: string;
    source: string;
    modified?: string;
    score: number;
  }>;
};

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function compact(text: string | undefined, maxLength = 700) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function lawUrl(path: string, oc: string, params: Record<string, string | number | undefined>) {
  const url = new URL(`${LAW_API_BASE}/${path}`);
  url.searchParams.set("OC", oc);
  url.searchParams.set("target", LAW_TARGET);
  url.searchParams.set("type", "JSON");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && String(value).trim()) url.searchParams.set(key, String(value));
  }
  return url;
}

async function fetchLawJson(url: URL, timeoutMs = LAW_API_TIMEOUT_MS): Promise<unknown | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractQueryTerms(message: string) {
  const stopwords = new Set([
    "방위사업청",
    "방사청",
    "법령",
    "법령해석",
    "규정",
    "관련",
    "해석",
    "알려줘",
    "확인",
    "가능",
    "어떻게",
    "무엇",
    "데이터",
    "기준"
  ]);

  return message
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && !stopwords.has(term))
    .slice(0, 4);
}

export function isDapaLawQuestion(message: string, section?: string) {
  const text = `${message} ${section || ""}`;
  return /법령|법령해석|규정|질의|회답|관련법령|원가|방산물자|노임단가|제비율/.test(text);
}

async function searchLawList(oc: string, query: string, search = 2) {
  const url = lawUrl("lawSearch.do", oc, {
    query,
    search,
    display: 5,
    page: 1,
    sort: "ddes"
  });
  const json = await fetchLawJson(url);
  if (!isObject(json)) return null;
  const result = json.CgmExpc as
    | {
        resultCode?: string;
        resultMsg?: string;
        totalCnt?: string;
        cgmExpc?: LawSearchItem | LawSearchItem[];
      }
    | undefined;
  if (result?.resultCode && result.resultCode !== "00") return [];
  return asArray(result?.cgmExpc);
}

async function getLawDetail(oc: string, id: string) {
  const url = lawUrl("lawService.do", oc, { ID: id });
  const json = await fetchLawJson(url);
  if (!isObject(json)) return null;
  return json.CgmExpcService as LawDetail | undefined;
}

async function findLawItems(oc: string, message: string) {
  const terms = extractQueryTerms(message);
  const candidates = [terms.join(" "), ...terms].filter(Boolean).slice(0, 3);
  const merged = new Map<string, LawSearchItem>();

  for (const query of candidates) {
    const byBody = await searchLawList(oc, query, 2);
    if (!byBody) return null;
    byBody.forEach((item) => {
      const id = item.법령해석일련번호 || item.id || `${item.안건명}-${item.안건번호}`;
      merged.set(id, item);
    });

    const byTitle = await searchLawList(oc, query, 1);
    if (!byTitle) return null;
    byTitle.forEach((item) => {
      const id = item.법령해석일련번호 || item.id || `${item.안건명}-${item.안건번호}`;
      merged.set(id, item);
    });
  }

  const items = [...merged.values()];
  if (items.length) {
    const scored = items
      .map((item, index) => {
        const haystack = `${item.안건명 || ""} ${item.안건번호 || ""}`.toLowerCase();
        const score = terms.reduce((sum, term) => {
          return sum + (haystack.includes(term.toLowerCase()) ? term.length : 0);
        }, 0);
        return { item, score, index };
      })
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map(({ item }) => item);

    return { query: terms.join(" "), items: scored };
  }

  const fallback = await searchLawList(oc, "", 2);
  if (!fallback) return null;
  return { query: "", items: fallback };
}

export async function answerDapaLawQuestion(message: string): Promise<LawApiAnswer | null> {
  const oc = runtimeEnv.lawOpenApiOc;
  if (runtimeEnv.closedNetwork || !oc) return null;

  const found = await findLawItems(oc, message);
  if (!found) return null;

  const { query, items } = found;
  const first = items[0];
  const firstId = first?.법령해석일련번호;

  if (!firstId) {
    return {
      answer: [
        "방위사업청 법제처 법령해석 목록 조회 데이터를 바탕으로 방사청AI가 답변 드립니다.",
        "법령해석 목록 조회 API와 연동하여 해석해 본 결과, 질문과 직접 연결되는 방위사업청 법령해석 안건은 현재 응답 데이터에서 확인되지 않습니다.",
        "그리고 예상되는 결과는 질문어를 안건명 또는 본문 검색어로 더 구체화해야 관련 법령해석을 확인할 수 있다는 점입니다.",
        "데이터 한계는 법제처 방위사업청 법령해석 API에 등록된 안건 범위 안에서만 확인 가능하다는 점입니다."
      ].join("\n\n"),
      sources: [
        {
          type: "API",
          title: "법제처_방위사업청 법령해석 목록 조회",
          source: "https://www.law.go.kr/DRF/lawSearch.do?target=dapaCgmExpc",
          score: 10
        }
      ]
    };
  }

  const detail = await getLawDetail(oc, firstId);
  if (!detail) return null;
  const relatedItems = items
    .slice(0, 3)
    .map((item, index) => {
      const title = item.안건명 || "안건명 없음";
      const no = item.안건번호 ? ` / 안건번호: ${item.안건번호}` : "";
      const id = item.법령해석일련번호 ? ` / 일련번호: ${item.법령해석일련번호}` : "";
      return `${index + 1}. ${title}${no}${id}`;
    })
    .join("\n");

  const answer = [
    "방위사업청 법제처 법령해석 목록 조회와 본문 조회 데이터를 바탕으로 방사청AI가 답변 드립니다.",
    `목록 조회 API에서 안건명, 안건번호, 법령해석일련번호, 해석기관명, 데이터기준일시가 명시되어 있으며, 본문 조회 API에서 질의요지, 회답, 관련법령 항목을 확인할 수 있습니다. 검색어 "${query || "전체"}"와 연동하여 해석해 본 결과, 가장 관련성이 높은 안건은 "${detail?.안건명 || first.안건명 || "안건명 없음"}"입니다.`,
    `질의요지: ${compact(detail?.질의요지) || "본문 조회 데이터에 질의요지가 명시되어 있지 않습니다."}`,
    `회답: ${compact(detail?.회답) || "본문 조회 데이터에 회답이 명시되어 있지 않습니다."}`,
    `관련법령: ${compact(detail?.관련법령, 350) || "본문 조회 데이터에 관련법령이 명시되어 있지 않습니다."}`,
    `그리고 예상되는 결과는 이 질문에 대해 방위사업청 법령해석 데이터가 안건명과 본문 회답을 기준으로 검토 가능한 근거를 제공한다는 점입니다. 함께 확인된 관련 안건은 다음과 같습니다.\n${relatedItems}`,
    "데이터 한계는 법제처 방위사업청 법령해석 API의 등록 안건과 본문 항목 안에서만 확인 가능하며, 최종 법적 판단이나 최신 개별 사안 적용은 담당 부서 확인이 필요하다는 점입니다."
  ].join("\n\n");

  return {
    answer,
    sources: [
      {
        type: "API",
        title: "법제처_방위사업청 법령해석 목록 조회",
        source: "https://www.law.go.kr/DRF/lawSearch.do?target=dapaCgmExpc",
        modified: first.데이터기준일시,
        score: 12
      },
      {
        type: "API",
        title: "법제처_방위사업청 법령해석 본문 조회",
        source: "https://www.law.go.kr/DRF/lawService.do?target=dapaCgmExpc",
        modified: detail?.데이터기준일시,
        score: 11
      }
    ]
  };
}
