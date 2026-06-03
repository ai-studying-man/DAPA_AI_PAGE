import fs from "node:fs";
import path from "node:path";
import iconv from "iconv-lite";
import Papa from "papaparse";

export type DatasetMode = "static" | "external-api" | "homepage-snapshot" | "generated-analysis";

export type DatasetRegistryEntry = {
  id: string;
  title: string;
  sourcePath: string;
  mode: DatasetMode;
  closedNetworkSupported: boolean;
  lastUpdated?: string;
  schemaVersion: string;
  encoding: "utf8" | "cp949";
  validationCommand: string;
  fallbackBehavior: string;
  uiSurface: "/" | "/data-search" | "/api/chat";
  requiredColumns: string[];
};

export type ValidationResult = { ok: boolean; errors: string[] };

export type InventoryDatasetRow = {
  type: "FILE" | "API";
  id: string;
  title: string;
  formats: string;
  cycle: string;
  modified: string;
  url: string;
  mode: DatasetMode;
  closedNetworkSupported: boolean;
  fallbackBehavior: string;
};

type CsvRow = Record<string, string>;

const ROOT = process.cwd();
const INVENTORY_COLUMNS = ["Type", "Id", "Title", "Org", "Formats", "Cycle", "Next", "Rows", "Modified", "Url"];
const STOPPED_DAPA_API_IDS = new Set(["15002040", "15002018", "15002019", "15002017", "15020338", "15002020", "15064293"]);

const LOCAL_STATIC_DATASETS = [
  ["procurement-plan", "방위사업청 국내조달 조달계획", "analysis_outputs/dapa_procurement_plan_20251231.csv", ["대표품명", "예산금액", "계약방법", "집행기관", "진행상태"]],
  ["contract", "방위사업청 국내조달 계약정보", "analysis_outputs/dapa_contract_20251231.csv", ["계약명", "계약금액", "대표업체명", "계약체결방법명", "계약체결일자"]],
  ["bid-result", "방위사업청 국내조달 경쟁 입찰결과", "analysis_outputs/dapa_bid_result_20251231.csv", ["입찰공고명", "최종낙찰금액", "최종낙찰업체명", "계약체결방법명"]],
  ["participants", "방위사업청 국내조달 입찰참여업체정보", "analysis_outputs/dapa_participants_20251231.csv", ["업체명", "대표자"]],
  ["defense-firms", "방위사업청 방산업체 지정현황", "analysis_outputs/dapa_defense_firms_20250531.csv", ["업체명", "분야", "지정일자"]],
  ["rnd-budget", "방위사업청 무기체계 핵심기술 연구개발 예산 및 과제 현황", "analysis_outputs/dapa_core_rnd_budget_20241231.csv", ["연도", "예산(단위 억원)", "개발과제 누계(단위 개)"]]
] as const;

function readText(relativePath: string, encoding: "utf8" | "cp949") {
  const buffer = fs.readFileSync(path.join(ROOT, relativePath));
  return encoding === "cp949" ? iconv.decode(buffer, "cp949") : buffer.toString("utf8");
}

function parseCsv(text: string): CsvRow[] {
  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => String(value ?? "").trim()
  });
  return parsed.data.filter((row) => Object.values(row).some(Boolean));
}

export function validateCsvText(text: string, requiredColumns: readonly string[]): ValidationResult {
  const rows = parseCsv(text);
  const columns = rows[0] ? Object.keys(rows[0]) : [];
  const errors = requiredColumns.filter((column) => !columns.includes(column)).map((column) => `missing required column: ${column}`);
  if (!rows.length) errors.push("csv has no data rows");
  return { ok: errors.length === 0, errors };
}

export function buildDatasetRegistry(): DatasetRegistryEntry[] {
  const inventoryRows = parseCsv(readText("dapa_public_data_inventory.csv", "utf8"));
  const inventoryEntries: DatasetRegistryEntry[] = inventoryRows
    .filter((row) => !(row.Type === "API" && STOPPED_DAPA_API_IDS.has(row.Id)))
    .map((row, index) => {
      const type = row.Type === "API" ? "API" : "FILE";
      return {
        id: `inventory-${type}-${row.Id || index}`,
        title: row.Title || `공공데이터 ${index + 1}`,
        sourcePath: "dapa_public_data_inventory.csv",
        mode: type === "API" ? "external-api" : "static",
        closedNetworkSupported: type !== "API",
        lastUpdated: row.Modified,
        schemaVersion: "inventory-v1",
        encoding: "utf8",
        validationCommand: "npm test -- dataset-registry",
        fallbackBehavior: type === "API" ? "실시간 API가 닫힌 망에서 불가하면 정적 스냅샷과 원문 링크를 표시합니다." : "번들된 정적 공공데이터 스냅샷을 사용합니다.",
        uiSurface: "/data-search",
        requiredColumns: INVENTORY_COLUMNS
      };
    });

  const localEntries: DatasetRegistryEntry[] = LOCAL_STATIC_DATASETS.map(([id, title, sourcePath, requiredColumns]) => ({
    id,
    title,
    sourcePath,
    mode: "static",
    closedNetworkSupported: true,
    schemaVersion: "local-csv-v1",
    encoding: "cp949",
    validationCommand: "npm test -- dataset-registry",
    fallbackBehavior: "닫힌 망에서도 번들된 CSV 스냅샷으로 검색 근거를 제공합니다.",
    uiSurface: "/api/chat",
    requiredColumns: [...requiredColumns]
  }));

  return [
    {
      id: "dataset-map",
      title: "방사청 AI 데이터셋 목차 맵",
      sourcePath: "dapa_ai_agent_dataset_map.json",
      mode: "static",
      closedNetworkSupported: true,
      lastUpdated: "2026-05-20",
      schemaVersion: "dataset-map-v1",
      encoding: "utf8",
      validationCommand: "npm test -- dataset-registry",
      fallbackBehavior: "섹션별 데이터셋 매핑 파일을 사용합니다.",
      uiSurface: "/api/chat",
      requiredColumns: []
    },
    {
      id: "homepage-snapshot",
      title: "방위사업청 홈페이지 스냅샷",
      sourcePath: "dapa_homepage_snapshot.json",
      mode: "homepage-snapshot",
      closedNetworkSupported: true,
      schemaVersion: "homepage-snapshot-v1",
      encoding: "utf8",
      validationCommand: "npm test -- dataset-registry",
      fallbackBehavior: "공식 홈페이지 접근이 어려운 경우 번들된 홈페이지 JSON 스냅샷을 사용합니다.",
      uiSurface: "/api/chat",
      requiredColumns: []
    },
    ...inventoryEntries,
    ...localEntries
  ];
}

export function getInventoryDatasetRows(): InventoryDatasetRow[] {
  const inventoryRows = parseCsv(readText("dapa_public_data_inventory.csv", "utf8"));
  return buildDatasetRegistry()
    .filter((entry) => entry.sourcePath === "dapa_public_data_inventory.csv")
    .map((entry) => {
      const match = inventoryRows.find((row) => row.Id && entry.id.endsWith(row.Id));
      const type = entry.mode === "external-api" ? "API" : "FILE";
      return {
        type,
        id: match?.Id ?? entry.id,
        title: entry.title,
        formats: match?.Formats ?? "",
        cycle: match?.Cycle ?? "",
        modified: entry.lastUpdated ?? "",
        url: match?.Url ?? "",
        mode: entry.mode,
        closedNetworkSupported: entry.closedNetworkSupported,
        fallbackBehavior: entry.fallbackBehavior
      };
    });
}

export function validateDatasetRegistry(registry = buildDatasetRegistry()): ValidationResult {
  const errors: string[] = [];
  for (const entry of registry) {
    const absolutePath = path.join(ROOT, entry.sourcePath);
    if (!fs.existsSync(absolutePath)) {
      errors.push(`${entry.id}: missing source file ${entry.sourcePath}`);
      continue;
    }
    if (!entry.schemaVersion) errors.push(`${entry.id}: missing schema version`);
    if (!entry.validationCommand) errors.push(`${entry.id}: missing validation command`);
    if (!entry.fallbackBehavior) errors.push(`${entry.id}: missing fallback behavior`);
    if (entry.sourcePath.endsWith(".csv") && entry.requiredColumns.length) {
      const result = validateCsvText(readText(entry.sourcePath, entry.encoding), entry.requiredColumns);
      errors.push(...result.errors.map((error) => `${entry.id}: ${error}`));
    }
  }
  return { ok: errors.length === 0, errors };
}
