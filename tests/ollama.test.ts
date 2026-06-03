import { afterEach, describe, expect, it, vi } from "vitest";
import {
  checkOllamaHealth,
  checkOllamaModelAvailable,
  chatWithOllama,
  OllamaError
} from "../lib/ollama";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json" }
  });
}

describe("ollama adapter", () => {
  it("uses configurable base URL and model", async () => {
    let capturedBody: BodyInit | null | undefined;
    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      capturedBody = init?.body;
      return jsonResponse({ message: { content: "answer" } });
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const answer = await chatWithOllama(
      [{ role: "user", content: "hello" }],
      {
        baseUrl: "http://ollama.internal:11434",
        model: "qwen-test:4b",
        timeoutMs: 1000,
        enabled: true,
        noCloud: false
      }
    );

    expect(answer).toBe("answer");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://ollama.internal:11434/api/chat",
      expect.objectContaining({ method: "POST" })
    );
    expect(JSON.parse(String(capturedBody))).toMatchObject({ model: "qwen-test:4b" });
  });

  it("returns a typed error when Ollama is disabled", async () => {
    await expect(
      chatWithOllama([{ role: "user", content: "hello" }], {
        baseUrl: "http://ollama.internal:11434",
        model: "qwen-test:4b",
        timeoutMs: 1000,
        enabled: false,
        noCloud: false
      })
    ).rejects.toMatchObject({ code: "OLLAMA_DISABLED" });
  });

  it("maps non-200 chat responses to typed errors", async () => {
    globalThis.fetch = vi.fn(async () => new Response("missing model", { status: 404 })) as typeof fetch;

    await expect(
      chatWithOllama([{ role: "user", content: "hello" }], {
        baseUrl: "http://ollama.internal:11434",
        model: "missing:4b",
        timeoutMs: 1000,
        enabled: true,
        noCloud: false
      })
    ).rejects.toBeInstanceOf(OllamaError);
  });

  it("checks liveness via /api/version", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ version: "1.0.0" }));
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(checkOllamaHealth({ baseUrl: "http://ollama.internal:11434", timeoutMs: 1000 })).resolves.toEqual({
      ok: true,
      version: "1.0.0"
    });
    expect(fetchMock).toHaveBeenCalledWith("http://ollama.internal:11434/api/version", expect.any(Object));
  });

  it("checks model availability via /api/tags", async () => {
    globalThis.fetch = vi.fn(async () => jsonResponse({ models: [{ name: "qwen-test:4b" }] })) as typeof fetch;

    await expect(
      checkOllamaModelAvailable({ baseUrl: "http://ollama.internal:11434", model: "qwen-test:4b", timeoutMs: 1000 })
    ).resolves.toEqual({ ok: true, model: "qwen-test:4b" });
  });
});
