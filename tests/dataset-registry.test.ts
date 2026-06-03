import { describe, expect, it } from "vitest";
import { buildDatasetRegistry, validateCsvText, validateDatasetRegistry } from "../lib/dataset-registry";
import { retrieveContext } from "../lib/dapa-data";

describe("dataset registry", () => {
  it("builds registry entries with deployment metadata", () => {
    const registry = buildDatasetRegistry();
    const procurement = registry.find((item) => item.sourcePath === "analysis_outputs/dapa_procurement_plan_20251231.csv");

    expect(registry.length).toBeGreaterThan(0);
    expect(procurement).toMatchObject({
      title: "방위사업청 국내조달 조달계획",
      mode: "static",
      closedNetworkSupported: true,
      encoding: "cp949",
      fallbackBehavior: "닫힌 망에서도 번들된 CSV 스냅샷으로 검색 근거를 제공합니다."
    });
    expect(procurement?.requiredColumns).toContain("대표품명");
    expect(procurement?.requiredColumns).toContain("예산금액");
  });

  it("validates registry source files and required metadata", () => {
    const result = validateDatasetRegistry(buildDatasetRegistry());

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects malformed CSV fixtures with missing required columns", () => {
    const result = validateCsvText("wrong,columns\n1,2", ["Type", "Title"]);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("missing required column: Type");
    expect(result.errors).toContain("missing required column: Title");
  });

  it("retrieves official homepage sources for target audience entry points", () => {
    const cases = [
      { question: "중소기업 방산업체 입찰공고 주요 서비스", section: "중소기업 지원", expected: "dapa-official-homepage-small-business" },
      { question: "신규 직원 방위사업교육원 주요 서비스", section: "군·예비인력", expected: "dapa-official-homepage-new-employee" },
      { question: "국민 정보공개 민원 참여 주요 서비스", section: "국민 소통", expected: "dapa-official-homepage-public-citizen" }
    ];

    for (const item of cases) {
      const sources = retrieveContext(item.question, item.section, 6);
      const homepageSources = sources.filter((source) => source.type === "HOMEPAGE");

      expect(homepageSources.map((source) => source.id)).toContain(item.expected);
      expect(homepageSources.some((source) => source.source.includes("https://www.dapa.go.kr/dapa/index.do"))).toBe(true);
      expect(homepageSources.some((source) => source.source.includes("2026-06-03 Asia/Seoul"))).toBe(true);
    }

    const navigationSources = retrieveContext("정보공개 민원 참여 주요 서비스", undefined, 6);
    expect(navigationSources.some((source) => source.id === "dapa-official-homepage-navigation-services")).toBe(true);
  });

  it("retrieves official connected navigation menus collected with Playwright", () => {
    const sources = retrieveContext("민원·참여 전자민원 옴부즈만 연결 메뉴", "민원·참여", 8);

    expect(sources.some((source) => source.id === "dapa-official-nav-민원·참여")).toBe(true);
    expect(sources.find((source) => source.id === "dapa-official-nav-민원·참여")?.content).toContain("옴부즈만 민원신청");
  });
});
