export type SourceType = "FILE" | "API" | "SECTION" | "HOMEPAGE";

export type Source = {
  readonly type: SourceType;
  readonly title: string;
  readonly source: string;
  readonly section?: string;
  readonly modified?: string;
  readonly score: number;
};

export type ChatResponse = {
  readonly answer?: unknown;
  readonly sources?: unknown;
  readonly message?: unknown;
  readonly error?: unknown;
};

export function cleanAnswerText(text: string) {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^\s*Thinking\.\.\.[\s\S]*?\.\.\.done thinking\.\s*/i, "")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/\*\*/g, "")
    .replace(/#/g, "")
    .replace(/^\s*-{3,}\s*$/gm, "")
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isSource(value: unknown): value is Source {
  if (!isRecord(value)) return false;
  return (
    typeof value.type === "string" &&
    typeof value.title === "string" &&
    typeof value.source === "string" &&
    typeof value.score === "number"
  );
}
