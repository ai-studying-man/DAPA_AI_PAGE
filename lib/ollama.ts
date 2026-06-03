import { runtimeEnv, type RuntimeEnv } from "./env";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OllamaConfig = RuntimeEnv["ollama"];

export class OllamaError extends Error {
  constructor(
    public readonly code: "OLLAMA_DISABLED" | "OLLAMA_REQUEST_FAILED" | "OLLAMA_UNAVAILABLE" | "OLLAMA_MODEL_MISSING",
    message: string
  ) {
    super(message);
    this.name = "OllamaError";
  }
}

export const OLLAMA_MODEL = runtimeEnv.ollama.model;

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, done: () => clearTimeout(timeout) };
}

async function fetchJson(url: string, init: RequestInit, timeoutMs: number) {
  const timeout = withTimeout(timeoutMs);
  try {
    return await fetch(url, { ...init, signal: timeout.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new OllamaError("OLLAMA_UNAVAILABLE", "Ollama request timed out");
    }
    throw new OllamaError("OLLAMA_UNAVAILABLE", "Ollama is unavailable");
  } finally {
    timeout.done();
  }
}

export async function chatWithOllama(messages: ChatMessage[], config: OllamaConfig = runtimeEnv.ollama) {
  if (!config.enabled) throw new OllamaError("OLLAMA_DISABLED", "Ollama is disabled for this deployment profile");

  const response = await fetchJson(`${normalizeBaseUrl(config.baseUrl)}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: false,
      think: false,
      keep_alive: "10m",
      options: {
        temperature: 0.2,
        num_ctx: 4096,
        top_p: 0.9
      }
    })
  }, config.timeoutMs);

  if (!response.ok) {
    const text = await response.text();
    const code = response.status === 404 ? "OLLAMA_MODEL_MISSING" : "OLLAMA_REQUEST_FAILED";
    throw new OllamaError(code, `Ollama request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return String(data?.message?.content ?? "");
}

export async function checkOllamaHealth(config: Pick<OllamaConfig, "baseUrl" | "timeoutMs">) {
  const response = await fetchJson(`${normalizeBaseUrl(config.baseUrl)}/api/version`, { method: "GET" }, config.timeoutMs);
  if (!response.ok) throw new OllamaError("OLLAMA_UNAVAILABLE", `Ollama health check failed: ${response.status}`);
  const data = await response.json();
  return { ok: true, version: String(data?.version ?? "unknown") };
}

export async function checkOllamaModelAvailable(config: Pick<OllamaConfig, "baseUrl" | "model" | "timeoutMs">) {
  const response = await fetchJson(`${normalizeBaseUrl(config.baseUrl)}/api/tags`, { method: "GET" }, config.timeoutMs);
  if (!response.ok) throw new OllamaError("OLLAMA_UNAVAILABLE", `Ollama model check failed: ${response.status}`);
  const data = await response.json();
  const models = Array.isArray(data?.models) ? (data.models as Array<{ name?: string; model?: string }>) : [];
  const found = models.some((model) => model.name === config.model || model.model === config.model);
  if (!found) throw new OllamaError("OLLAMA_MODEL_MISSING", `Ollama model is missing: ${config.model}`);
  return { ok: true, model: config.model };
}
