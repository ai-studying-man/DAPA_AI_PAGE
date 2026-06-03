import { expect, test } from "@playwright/test";

test.describe("public landing", () => {
  test("renders the requested DAPA AI homepage shell in Korean", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "AI와 함께, 더 스마트한 방위사업청" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link", { name: "AI 통합검색" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "검색어 입력" })).toBeVisible();
    await expect(page.getByRole("button", { name: "방산중소기업 지원" })).toBeVisible();
    await expect(page.getByRole("complementary", { name: "AI 맞춤 추천" })).toContainText("중소기업 지원제도");
    await expect(page.getByRole("complementary", { name: "홍보 정보" })).toContainText("K-방산");
    await expect(page.getByRole("region", { name: "방위사업청 공식 정보" })).toContainText("빠른 서비스");
  });

  test("opens official DAPA connected menu links in the provided UX pattern", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /정보공개/ }).click();

    const menuPanel = page.getByRole("region", { name: "정보공개 공식 연결 메뉴" });
    await expect(menuPanel).toBeVisible();
    await expect(menuPanel).toContainText("정보공개안내");
    await expect(menuPanel).toContainText("공공데이터 개방");
    await expect(menuPanel).toContainText("정책실명제");
    await expect(menuPanel.getByRole("link", { name: "정보공개제도 안내" })).toHaveAttribute("href", /menuSeq=3089/);
    await expect(menuPanel.getByRole("link", { name: "예산정보" })).toHaveAttribute("href", /menuSeq=3103/);

    await page.getByRole("button", { name: /민원·참여/ }).click();
    const civilPanel = page.getByRole("region", { name: "민원·참여 공식 연결 메뉴" });
    await expect(civilPanel).toContainText("전자민원 신청");
    await expect(civilPanel).toContainText("옴부즈만 민원신청");
  });

  test("runs a quick query and shows answer provenance", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "방산중소기업 지원" }).click();

    const resultPanel = page.locator(".answerPanel");
    await expect(resultPanel).toContainText("AI 요약 결과");
    await expect(resultPanel).toContainText("방위사업청 국내조달 조달계획");
    await expect(resultPanel).toContainText(/홈페이지 \d+ · FILE \d+ · API \d+/);
  });

  test("opens the source reference panel without requiring search execution", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "데이터셋 보기" }).click();

    const referencePanel = page.getByRole("region", { name: "사용 데이터 안내" });
    await expect(referencePanel).toBeVisible();
    await expect(referencePanel).toContainText("홈페이지 공개 정보");
    await expect(referencePanel).toContainText("파일 데이터");
    await expect(referencePanel).toContainText("공공 API");
  });

  test("shows official homepage sections and searches homepage-only content", async ({ page }) => {
    await page.goto("/");

    const sectionIndex = page.getByRole("region", { name: "공식 홈페이지 섹션 AI 검색" });
    await expect(sectionIndex).toContainText("열린 청장실");
    await expect(sectionIndex).toContainText("방위사업청 SNS");
    await expect(sectionIndex).toContainText("국정성과");

    await sectionIndex.getByRole("button", { name: "AI로 검색" }).nth(4).click();

    const resultPanel = page.locator(".answerPanel");
    await expect(resultPanel).toContainText("공식 홈페이지의 방위사업청 SNS 영역");
    await expect(resultPanel).toContainText("세계가 주목하는 K-방산");
    await expect(resultPanel.getByRole("list", { name: "AI 답변 출처" })).toContainText("공식 홈페이지");
  });

  test("keeps the mobile landing within the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe("data provenance dashboard", () => {
  test("shows Korean dataset provenance labels and filters", async ({ page }) => {
    await page.goto("/data-search");

    await expect(page.getByRole("heading", { name: "데이터셋·공공 API 운영 현황" })).toBeVisible();
    await expect(page.getByRole("region", { name: "데이터 통계" })).toContainText("전체 공개 데이터");
    await expect(page.getByRole("region", { name: "데이터 필터" })).toContainText("유형 필터");
    await expect(page.getByRole("region", { name: "데이터셋 목록" })).toContainText("원문");
  });

  test("filters API rows and snapshot-required rows with Korean controls", async ({ page }) => {
    await page.goto("/data-search");

    await page.getByRole("link", { name: "공공 API" }).click();
    await expect(page).toHaveURL(/type=api/);
    await expect(page.getByRole("region", { name: "데이터셋 목록" })).toContainText("API");

    await page.getByRole("link", { name: "스냅샷 필요" }).click();
    await expect(page).toHaveURL(/closed=snapshot/);
    await expect(page.getByRole("region", { name: "데이터셋 목록" })).toContainText("스냅샷 필요");
  });

  test("keeps the mobile dashboard within the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/data-search");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
