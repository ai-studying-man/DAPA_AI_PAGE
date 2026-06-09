export type Source = {
  readonly type: "FILE" | "API" | "SECTION" | "HOMEPAGE";
  readonly title: string;
  readonly source: string;
  readonly sourceUrl?: string;
  readonly section?: string;
  readonly modified?: string;
  readonly score: number;
};

export type ChatResponse = {
  readonly answer?: unknown;
  readonly sources?: unknown;
  readonly model?: unknown;
  readonly message?: unknown;
  readonly error?: unknown;
};

type ModelMetadata = {
  readonly provider?: unknown;
  readonly name?: unknown;
  readonly mode?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isModelMetadata(value: unknown): value is ModelMetadata {
  return isRecord(value);
}

function isSourceType(value: unknown): value is Source["type"] {
  return value === "FILE" || value === "API" || value === "SECTION" || value === "HOMEPAGE";
}

export function isSource(value: unknown): value is Source {
  if (!isRecord(value)) return false;
  return (
    isSourceType(value.type) &&
    typeof value.title === "string" &&
    typeof value.source === "string" &&
    typeof value.score === "number" &&
    (typeof value.sourceUrl === "undefined" || typeof value.sourceUrl === "string") &&
    (typeof value.section === "undefined" || typeof value.section === "string") &&
    (typeof value.modified === "undefined" || typeof value.modified === "string")
  );
}

export function modelLabel(value: unknown) {
  if (typeof value === "string") return value;
  if (!isModelMetadata(value)) return "";
  const provider = typeof value.provider === "string" ? value.provider : "model";
  const name = typeof value.name === "string" ? value.name : "";
  const mode = typeof value.mode === "string" ? value.mode : "";
  return [provider, name, mode].filter(Boolean).join(" · ");
}

export function sourceTypeLabel(type: Source["type"]) {
  if (type === "FILE") return "데이터셋";
  if (type === "API") return "공공 API";
  if (type === "HOMEPAGE") return "공식 홈페이지";
  return "공개 섹션";
}
