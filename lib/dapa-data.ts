import fs from "node:fs";
import path from "node:path";
import iconv from "iconv-lite";
import Papa from "papaparse";
import { dapaHomepageSections, findHomepageSection, homepageSectionSummary } from "@/lib/dapa-homepage-sections";
import { dapaOfficialNavMenus, findOfficialNavMenu, officialNavSummary } from "@/lib/dapa-nav-data";

export type SourceDoc = {
  id: string;
  type: "FILE" | "API" | "SECTION" | "HOMEPAGE";
  title: string;
  source: string;
  section?: string;
  modified?: string;
  content: string;
};
export type RetrievedSource = SourceDoc & { score: number };
export type DirectAnswer = { answer: string; sourceTitles: string[] };
type CsvRow = Record<string, string>;

const ROOT = process.cwd();
const OFFICIAL_URL = "https://www.dapa.go.kr/dapa/index.do";
const OFFICIAL_CAPTURED_AT = "2026-06-03 Asia/Seoul";
const STOPPED_DAPA_API_IDS = new Set(["15002040", "15002018", "15002019", "15002017", "15020338", "15002020", "15064293"]);
const LOCAL_DATASETS = [
  ["analysis_outputs/dapa_procurement_plan_20251231.csv", "방위사업청 국내조달 조달계획", "중소기업 지원", 140],
  ["analysis_outputs/dapa_contract_20251231.csv", "방위사업청 국내조달 계약정보", "계약절차", 100],
  ["analysis_outputs/dapa_bid_result_20251231.csv", "방위사업청 국내조달 경쟁 입찰결과", "사업공고", 100],
  ["analysis_outputs/dapa_participants_20251231.csv", "방위사업청 국내조달 입찰참여업체정보", "중소기업 지원", 100],
  ["analysis_outputs/dapa_defense_firms_20250531.csv", "방위사업청 방산업체 지정현황", "K-방산", 85],
  ["analysis_outputs/dapa_core_rnd_budget_20241231.csv", "방위사업청 무기체계 핵심기술 연구개발 예산 및 과제 현황", "기술개발사업", 30]
] as const;

let corpusCache: SourceDoc[] | null = null;

function fileExists(relativePath: string) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readText(relativePath: string, encoding: "utf8" | "cp949" = "utf8") {
  const buffer = fs.readFileSync(path.join(ROOT, relativePath));
  return encoding === "cp949" ? iconv.decode(buffer, "cp949") : buffer.toString("utf8");
}

function parseCsv(text: string): CsvRow[] {
  const parsed = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true, transformHeader: (header) => header.trim(), transform: (value) => String(value ?? "").trim() });
  return parsed.data.filter((row) => Object.values(row).some(Boolean));
}

function rowsFrom(relativePath: string) {
  return parseCsv(readText(relativePath, "cp949"));
}

function amount(value: string | undefined) {
  return Number(String(value ?? "").replace(/[^\d.-]/g, "")) || 0;
}

function amountText(value: string | undefined) {
  const parsed = amount(value);
  return parsed ? parsed.toLocaleString("ko-KR") : value || "0";
}

function topRows(rows: CsvRow[], key: string, limit = 8) {
  return [...rows].sort((a, b) => amount(b[key]) - amount(a[key])).slice(0, limit);
}

function countBy(rows: CsvRow[], key: string) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = row[key] || "미분류";
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function summarizeRows(rows: CsvRow[], fields: readonly string[]) {
  return rows.map((row, index) => `${index + 1}. ${fields.map((field) => `${field}: ${field.includes("금액") || field.includes("예산") ? amountText(row[field]) : row[field] || "없음"}`).join(" / ")}`).join("\n");
}

function sourceIntro(title: string, sourceType: SourceDoc["type"]) {
  if (sourceType === "FILE") return `방위사업청 ${title} 데이터셋을 통해 불러온 답변입니다.`;
  if (sourceType === "API") return `방위사업청 ${title} API를 통해 불러온 답변입니다.`;
  if (sourceType === "HOMEPAGE") return `방위사업청 공식 홈페이지의 ${title} 영역을 통해 불러온 답변입니다.`;
  return `방위사업청 ${title} 공개 섹션을 통해 불러온 답변입니다.`;
}

function answerFrame(title: string, sourceType: SourceDoc["type"], evidence: string, interpretation: string) {
  return [sourceIntro(title, sourceType), evidence, interpretation, "출처와 한계: 답변은 표시된 출처 근거만 사용합니다. 실시간 공고·계약 변경은 원문 링크 또는 공식 시스템에서 재확인해야 합니다."].join("\n\n");
}

function addHomepageDocs(docs: SourceDoc[]) {
  const source = `${OFFICIAL_URL} (captured ${OFFICIAL_CAPTURED_AT})`;
  docs.push(
    {
      id: "dapa-official-homepage-navigation-services",
      type: "HOMEPAGE",
      title: "방위사업청 공식 홈페이지 주요 서비스와 자주 찾는 메뉴",
      source,
      section: "AI 통합검색",
      modified: "2026-06-03",
      content: `상단 메뉴: 알림·소식, 업무·정책, 정보공개, 민원·참여, 방위사업청 소개.\n${officialNavSummary()}\n${homepageSectionSummary()}\n최신 공지 예시: 체계지원분석 담당자를 위한 KSP 사용자 교육 모집 공고, ’27~’31년 무기체계 개조개발 지원 소요조사 공고, '26-1차 신속시범사업 예비 사업설명회 공고.`
    },
    {
      id: "dapa-official-homepage-small-business",
      type: "HOMEPAGE",
      title: "방산 중소기업과 업체를 위한 공식 홈페이지 진입점",
      source,
      section: "중소기업 지원",
      modified: "2026-06-03",
      content: "중소기업과 방산업체는 국방전자 조달시스템, 입찰공고, 방산수출입 지원시스템, 방위사업 협업체계, 방산 중소기업 지원 안내를 우선 확인할 수 있다."
    },
    {
      id: "dapa-official-homepage-new-employee",
      type: "HOMEPAGE",
      title: "신규 직원과 예비 인력을 위한 공식 홈페이지 진입점",
      source,
      section: "군·예비인력",
      modified: "2026-06-03",
      content: "신규 직원과 예비 인력은 방위사업청 소개, 조직 및 직원 안내, 업무·정책, 방위사업교육원, 방위사업 법령자료를 통해 기관 구조와 업무 흐름을 확인할 수 있다."
    },
    {
      id: "dapa-official-homepage-public-citizen",
      type: "HOMEPAGE",
      title: "국민 소통과 정보공개를 위한 공식 홈페이지 진입점",
      source,
      section: "국민 소통",
      modified: "2026-06-03",
      content: "일반 국민은 공지사항, 보도자료, 정보공개, 민원·참여, 부서 및 직원 안내, 옴부즈만, SNS 채널을 통해 공개 정보와 민원 절차를 확인할 수 있다."
    }
  );
  for (const menuItem of dapaOfficialNavMenus) {
    docs.push({
      id: `dapa-official-nav-${menuItem.title}`,
      type: "HOMEPAGE",
      title: `${menuItem.title} 공식 연결 메뉴`,
      source,
      section: menuItem.title,
      modified: "2026-06-03",
      content: menuItem.groups.map((group) => `${group.title}: ${group.links.map((link) => `${link.label} (${link.href})`).join(", ")}`).join("\n")
    });
  }
  for (const section of dapaHomepageSections) {
    docs.push({
      id: `dapa-homepage-section-${section.id}`,
      type: "HOMEPAGE",
      title: `${section.title} 공식 홈페이지 섹션`,
      source: section.source,
      section: section.title,
      modified: "2026-06-03",
      content: [section.subtitle, ...section.items.map((item) => `${item.title}${item.date ? ` (${item.date})` : ""}${item.description ? `: ${item.description}` : ""}${item.href ? ` / 원문: ${item.href}` : ""}`)].join("\n")
    });
  }
}

function addInventoryDocs(docs: SourceDoc[]) {
  if (!fileExists("dapa_public_data_inventory.csv")) return;
  parseCsv(readText("dapa_public_data_inventory.csv")).forEach((row, index) => {
    if (row.Type === "API" && STOPPED_DAPA_API_IDS.has(row.Id)) return;
    docs.push({ id: `inventory-${row.Type || "DATA"}-${row.Id || index}`, type: row.Type === "API" ? "API" : "FILE", title: row.Title || `공공데이터 ${index + 1}`, source: row.Type === "API" ? "data.go.kr API catalog" : "data.go.kr file catalog", modified: row.Modified, content: [`데이터셋명: ${row.Title}`, `유형: ${row.Type}`, `제공형식: ${row.Formats}`, `갱신주기: ${row.Cycle}`, `수록건수: ${row.Rows}`, `수정일: ${row.Modified}`, `URL: ${row.Url}`].join("\n") });
  });
}

function addAnalyticDocs(docs: SourceDoc[]) {
  if (fileExists("analysis_outputs/dapa_procurement_plan_20251231.csv")) {
    docs.push({ id: "summary-procurement-budget", type: "FILE", title: "조달계획 예산 상위 사업 요약", source: "computed-summary:file", section: "계약절차", content: summarizeRows(topRows(rowsFrom("analysis_outputs/dapa_procurement_plan_20251231.csv"), "예산금액", 10), ["대표품명", "예산금액", "계약방법", "집행기관", "진행상태"]) });
  }
  if (fileExists("analysis_outputs/dapa_defense_firms_20250531.csv")) {
    docs.push({ id: "summary-defense-firms", type: "FILE", title: "방산업체 지정현황 분야별 요약", source: "computed-summary:file", section: "K-방산", content: countBy(rowsFrom("analysis_outputs/dapa_defense_firms_20250531.csv"), "분야").map(([name, count]) => `${name}: ${count}개 업체`).join("\n") });
  }
}

function addLocalFileDocs(docs: SourceDoc[]) {
  for (const [file, title, section, limit] of LOCAL_DATASETS) {
    if (!fileExists(file)) continue;
    parseCsv(readText(file, "cp949")).slice(0, limit).forEach((row, index) => {
      docs.push({ id: `${file}-${index}`, type: "FILE", title, source: "local-csv:file", section, content: Object.entries(row).filter(([, value]) => value).slice(0, 12).map(([key, value]) => `${key}: ${value}`).join(" / ") });
    });
  }
}

export function loadCorpus() {
  if (corpusCache) return corpusCache;
  const docs: SourceDoc[] = [];
  addHomepageDocs(docs);
  addInventoryDocs(docs);
  addAnalyticDocs(docs);
  addLocalFileDocs(docs);
  corpusCache = docs;
  return docs;
}

function tokenize(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}#]+/gu, " ").split(/\s+/).filter((word) => word.length >= 2);
}

export function retrieveContext(question: string, section?: string, limit = 8): RetrievedSource[] {
  const terms = tokenize(`${question} ${section ?? ""}`);
  const scored = loadCorpus().map((doc) => {
    const haystack = `${doc.title}\n${doc.section ?? ""}\n${doc.content}`.toLowerCase();
    let score = section && doc.section?.includes(section) ? 10 : 0;
    for (const term of terms) if (haystack.includes(term)) score += term.length > 3 ? 3 : 1;
    if (doc.type === "HOMEPAGE") score += 1;
    return { ...doc, score };
  }).filter((doc) => doc.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
  return scored.length ? scored : loadCorpus().slice(0, limit).map((doc) => ({ ...doc, score: 0 }));
}

export function getDirectAnswer(question: string, section?: string): DirectAnswer | null {
  const text = `${question} ${section ?? ""}`;
  const officialMenu = dapaOfficialNavMenus.find((menuItem) => text.includes(menuItem.title)) ?? (section ? findOfficialNavMenu(section) : undefined);
  if (officialMenu) {
    const lines = officialMenu.groups.map((group) => `- ${group.title}: ${group.links.map((link) => link.label).join(", ")}`).join("\n");
    return {
      answer: answerFrame(
        `${officialMenu.title} 공식 연결 메뉴`,
        "HOMEPAGE",
        `Playwright로 수집한 방위사업청 공식 홈페이지의 ${officialMenu.title} 연결 메뉴는 다음과 같습니다.\n${lines}`,
        "로컬 AI 홈페이지의 상단 메뉴 패널은 이 공식 링크 데이터를 그대로 사용하며, 각 항목은 원문 방위사업청 메뉴 URL로 연결됩니다."
      ),
      sourceTitles: [`${officialMenu.title} 공식 연결 메뉴`]
    };
  }
  const homepageSection = findHomepageSection(text);
  if (homepageSection) {
    const lines = homepageSection.items.map((item) => `- ${item.title}${item.date ? ` (${item.date})` : ""}${item.description ? `: ${item.description}` : ""}${item.href ? `\n  원문: ${item.href}` : ""}`).join("\n");
    return {
      answer: answerFrame(
        homepageSection.title,
        "HOMEPAGE",
        `${homepageSection.subtitle}\n${lines}`,
        "이 정보는 데이터셋/API가 아니라 공식 홈페이지 화면에 이미 포함된 콘텐츠를 로컬 인덱스로 저장해 즉시 검색한 결과입니다."
      ),
      sourceTitles: [`${homepageSection.title} 공식 홈페이지 섹션`]
    };
  }
  if (text.includes("홈페이지") || text.includes("주요 서비스") || text.includes("통합검색")) {
    return { answer: answerFrame("공식 홈페이지", "HOMEPAGE", "공식 홈페이지에서 확인한 주요 서비스는 국방전자 조달시스템, 국방 규격정보, 국방통합 원가시스템, 체계지원 분석시스템, 방산수출입 지원시스템, 방위사업 협업체계, 신원조사 서류제출, 국방연구 & 개발참여입니다.", "사용자는 AI 통합검색에서 메뉴명을 몰라도 조달, 계약, 기술개발, 채용, 정보공개 같은 자연어 질문으로 관련 공개 메뉴와 데이터셋 근거를 함께 확인할 수 있습니다."), sourceTitles: ["방위사업청 공식 홈페이지 주요 서비스와 자주 찾는 메뉴"] };
  }
  if (text.includes("중소기업") || text.includes("조달") || text.includes("입찰") || text.includes("계약")) {
    const rows = topRows(rowsFrom("analysis_outputs/dapa_procurement_plan_20251231.csv"), "예산금액", 8);
    return { answer: answerFrame("국내조달 조달계획", "FILE", `조달계획 CSV에는 대표품명, 예산금액, 계약방법, 집행기관, 진행상태가 들어 있습니다.\n${summarizeRows(rows, ["대표품명", "예산금액", "계약방법", "집행기관", "진행상태"])}`, "중소기업은 조달계획으로 예정 사업을 보고, 입찰공고와 계약정보로 실제 공고·낙찰·계약 흐름을 이어서 확인하는 방식이 가장 실무적입니다."), sourceTitles: ["방위사업청 국내조달 조달계획"] };
  }
  if (text.includes("방산업체") || text.includes("K-방산") || text.includes("수출")) {
    const summary = countBy(rowsFrom("analysis_outputs/dapa_defense_firms_20250531.csv"), "분야").map(([name, count]) => `${name}: ${count}개 업체`).join("\n");
    return { answer: answerFrame("방산업체 지정현황", "FILE", `방산업체 지정현황은 업체명, 분야, 지정일자를 제공합니다.\n${summary}`, "K-방산 관련 탐색에서는 업체 지정 분야와 방산수출입 지원시스템, 방위사업 협업체계, 무기체계 개조개발 지원 공고를 함께 확인하는 것이 적합합니다."), sourceTitles: ["방위사업청 방산업체 지정현황"] };
  }
  if (text.includes("기술개발") || text.includes("R&D") || text.includes("연구개발")) {
    const latest = [...rowsFrom("analysis_outputs/dapa_core_rnd_budget_20241231.csv")].sort((a, b) => Number(b["연도"]) - Number(a["연도"]))[0];
    return { answer: answerFrame("무기체계 핵심기술 연구개발 예산 및 과제 현황", "FILE", `R&D 데이터는 연도, 예산, 개발과제 누계, 신규 개발과제, 계속 개발과제, 완료 과제를 제공합니다. 최신 연도 ${latest?.["연도"] ?? "확인 필요"}년 예산은 ${latest?.["예산(단위 억원)"] ?? "확인 필요"}억 원입니다.`, "기술개발사업은 국방기술 R&D 사업 메뉴와 공공데이터의 연도별 예산·과제 추이를 함께 보면 사업 방향을 빠르게 파악할 수 있습니다."), sourceTitles: ["방위사업청 무기체계 핵심기술 연구개발 예산 및 과제 현황"] };
  }
  return null;
}

export function dataStats() {
  const corpus = loadCorpus();
  const count = (type: SourceDoc["type"]) => corpus.filter((doc) => doc.type === type).length;
  return { corpusDocs: corpus.length, fileDocs: count("FILE"), apiDocs: count("API"), sectionDocs: count("SECTION"), homepageDocs: count("HOMEPAGE") };
}
