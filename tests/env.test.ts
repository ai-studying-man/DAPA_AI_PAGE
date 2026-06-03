import { describe, expect, it } from "vitest";
import { parseRuntimeEnv } from "../lib/env";

describe("parseRuntimeEnv", () => {
  it("applies safe defaults for local development", () => {
    const config = parseRuntimeEnv({});

    expect(config.deploymentProfile).toBe("local");
    expect(config.ollama.baseUrl).toBe("http://127.0.0.1:11434");
    expect(config.ollama.model).toBe("qwen3.5:4b");
    expect(config.ollama.enabled).toBe(true);
    expect(config.ollama.timeoutMs).toBe(30_000);
    expect(config.closedNetwork).toBe(false);
  });

  it("parses explicit deployment and Ollama settings", () => {
    const config = parseRuntimeEnv({
      DEPLOYMENT_PROFILE: "closed",
      OLLAMA_BASE_URL: "http://ollama.internal:11434",
      OLLAMA_MODEL: "qwen-test:4b",
      OLLAMA_TIMEOUT_MS: "12000",
      OLLAMA_ENABLED: "false",
      OLLAMA_NO_CLOUD: "true",
      LAW_OPEN_API_OC: "law-secret",
      PUBLIC_DATA_API_KEY: "data-secret"
    });

    expect(config.deploymentProfile).toBe("closed");
    expect(config.closedNetwork).toBe(true);
    expect(config.ollama.baseUrl).toBe("http://ollama.internal:11434");
    expect(config.ollama.model).toBe("qwen-test:4b");
    expect(config.ollama.enabled).toBe(false);
    expect(config.ollama.noCloud).toBe(true);
    expect(config.ollama.timeoutMs).toBe(12_000);
    expect(config.lawOpenApiOc).toBe("law-secret");
    expect(config.publicDataApiKey).toBe("data-secret");
  });

  it("rejects invalid deployment profiles", () => {
    expect(() => parseRuntimeEnv({ DEPLOYMENT_PROFILE: "staging" })).toThrow(
      "DEPLOYMENT_PROFILE must be one of local, public-cloud, institution, closed"
    );
  });

  it("rejects invalid numeric values", () => {
    expect(() => parseRuntimeEnv({ OLLAMA_TIMEOUT_MS: "soon" })).toThrow(
      "OLLAMA_TIMEOUT_MS must be a positive integer"
    );
  });
});
