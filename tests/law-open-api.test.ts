import { afterEach, describe, expect, it, vi } from "vitest";

const originalFetch = globalThis.fetch;
const originalDeploymentProfile = process.env.DEPLOYMENT_PROFILE;
const originalLawOpenApiOc = process.env.LAW_OPEN_API_OC;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
  vi.resetModules();
  setEnv(originalDeploymentProfile, originalLawOpenApiOc);
});

function setEnv(profile: string | undefined, oc: string | undefined) {
  if (profile === undefined) {
    delete process.env.DEPLOYMENT_PROFILE;
  } else {
    process.env.DEPLOYMENT_PROFILE = profile;
  }

  if (oc === undefined) {
    delete process.env.LAW_OPEN_API_OC;
  } else {
    process.env.LAW_OPEN_API_OC = oc;
  }
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json" }
  });
}

async function importAdapter(profile: string | undefined, oc: string | undefined) {
  vi.resetModules();
  setEnv(profile, oc);
  return await import("../lib/law-open-api");
}

describe("law open api adapter", () => {
  it("returns null without calling fetch when LAW_OPEN_API_OC is missing", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
    const { answerDapaLawQuestion } = await importAdapter("local", undefined);

    await expect(answerDapaLawQuestion("방산물자 원가 법령해석 알려줘")).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null without calling fetch in the closed-network profile", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
    const { answerDapaLawQuestion } = await importAdapter("closed", "test-oc");

    await expect(answerDapaLawQuestion("방산물자 원가 법령해석 알려줘")).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses only the configured OC value when querying the Law API", async () => {
    const capturedUrls: string[] = [];
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      capturedUrls.push(url);

      if (url.includes("lawService.do")) {
        return jsonResponse({
          CgmExpcService: {
            안건명: "방산물자 원가 산정 기준",
            질의요지: "방산물자 원가 산정 기준 질의",
            회답: "관련 규정에 따라 산정합니다.",
            관련법령: "방위사업법",
            데이터기준일시: "2026-05-01"
          }
        });
      }

      return jsonResponse({
        CgmExpc: {
          resultCode: "00",
          cgmExpc: [
            {
              법령해석일련번호: "12345",
              안건명: "방산물자 원가 산정 기준",
              안건번호: "24-001",
              데이터기준일시: "2026-05-01"
            }
          ]
        }
      });
    });
    globalThis.fetch = fetchMock;
    const { answerDapaLawQuestion } = await importAdapter("local", "configured-oc");

    const answer = await answerDapaLawQuestion("방산물자 원가 법령해석 알려줘");

    expect(answer?.answer).toContain("방산물자 원가 산정 기준");
    expect(capturedUrls.length).toBeGreaterThan(0);
    expect(capturedUrls.every((url) => url.includes("OC=configured-oc"))).toBe(true);
  });

  it("returns null on non-200 upstream responses", async () => {
    globalThis.fetch = vi.fn(async () => new Response("upstream unavailable", { status: 503 }));
    const { answerDapaLawQuestion } = await importAdapter("local", "configured-oc");

    await expect(answerDapaLawQuestion("방산물자 원가 법령해석 알려줘")).resolves.toBeNull();
  });

  it("returns null on malformed JSON responses", async () => {
    globalThis.fetch = vi.fn(async () => new Response("not json", { status: 200 }));
    const { answerDapaLawQuestion } = await importAdapter("local", "configured-oc");

    await expect(answerDapaLawQuestion("방산물자 원가 법령해석 알려줘")).resolves.toBeNull();
  });

  it("returns null on transport or timeout errors", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new DOMException("The operation was aborted.", "AbortError");
    });
    const { answerDapaLawQuestion } = await importAdapter("local", "configured-oc");

    await expect(answerDapaLawQuestion("방산물자 원가 법령해석 알려줘")).resolves.toBeNull();
  });
});
