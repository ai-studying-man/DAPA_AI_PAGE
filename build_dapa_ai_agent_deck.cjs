const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const out = path.resolve(__dirname, "DAPA_AI_Data_Agent_Proposal.pptx");
const svgShot = path.resolve(__dirname, "dapa_ai_agent_current_page.png");
const datasetMapPath = path.resolve(__dirname, "dapa_ai_agent_dataset_map.json");
const csvPath = path.resolve(__dirname, "dapa_public_data_inventory.csv");

const map = JSON.parse(fs.readFileSync(datasetMapPath, "utf8"));

function flattenSection(sec) {
  const items = [];
  if (Array.isArray(sec.datasets)) items.push(...sec.datasets);
  if (Array.isArray(sec.subsections)) {
    for (const sub of sec.subsections) {
      if (Array.isArray(sub.datasets)) items.push(...sub.datasets);
    }
  }
  return items;
}

const sections = map.sections.map((sec) => {
  const items = flattenSection(sec);
  return {
    title: sec.title.replace(" 검색", ""),
    total: items.length,
    file: items.filter((d) => d.type === "FILE").length,
    api: items.filter((d) => d.type === "API").length,
    keywords: sec.keywords || [],
    goal: sec.agentGoal,
    datasets: items.map((d) => d.title),
  };
});

const totals = {
  total: map.totalDatasets || 44,
  file: map.counts.FILE || 31,
  api: map.counts.API || 13,
};

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "DAPA AI Agent Proposal";
pptx.company = "방위사업청 AI 데이터 에이전트 제안";
pptx.subject = "공공데이터 기반 SLM/RAG 에이전트 도입 제안";
pptx.title = "방위사업청 AI 데이터 에이전트 도입 제안";
pptx.lang = "ko-KR";
pptx.theme = {
  headFontFace: "Malgun Gothic",
  bodyFontFace: "Malgun Gothic",
  lang: "ko-KR",
};
pptx.defineLayout({ name: "DAPA_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "DAPA_WIDE";

const W = 13.333;
const H = 7.5;
const C = {
  ink: "132033",
  muted: "617085",
  paper: "F6F8FC",
  white: "FFFFFF",
  blue: "1557C0",
  blue2: "EAF2FF",
  green: "0B6B57",
  green2: "E7F7F1",
  gold: "C8952D",
  gold2: "FFF2D8",
  line: "D9E2EE",
  navy: "0F1B2D",
  slate: "26364D",
};

function addBg(slide, dark = false) {
  slide.background = { color: dark ? C.navy : C.paper };
  if (!dark) {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: W,
      h: H,
      fill: { color: C.paper },
      line: { color: C.paper },
    });
  }
}

function addFooter(slide, num, dark = false) {
  slide.addText("방위사업청 AI 데이터 에이전트 제안", {
    x: 0.48,
    y: 7.08,
    w: 4.2,
    h: 0.18,
    fontFace: "Malgun Gothic",
    fontSize: 6.8,
    color: dark ? "AAB8CA" : "748299",
    margin: 0,
  });
  slide.addText(String(num).padStart(2, "0"), {
    x: 12.35,
    y: 7.04,
    w: 0.5,
    h: 0.24,
    fontSize: 8,
    color: dark ? "AAB8CA" : "748299",
    bold: true,
    align: "right",
    margin: 0,
  });
}

function kicker(slide, text, dark = false) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.55,
    y: 0.35,
    w: 0.08,
    h: 0.25,
    fill: { color: dark ? "A6D8FF" : C.blue },
    line: { color: dark ? "A6D8FF" : C.blue },
  });
  slide.addText(text.toUpperCase(), {
    x: 0.72,
    y: 0.35,
    w: 4.2,
    h: 0.25,
    fontSize: 7.2,
    bold: true,
    charSpacing: 1.4,
    color: dark ? "C9D6E6" : C.muted,
    margin: 0,
  });
}

function title(slide, t, sub, dark = false) {
  slide.addText(t, {
    x: 0.55,
    y: 0.78,
    w: 7.9,
    h: 0.7,
    fontSize: 24,
    bold: true,
    color: dark ? C.white : C.ink,
    margin: 0,
    breakLine: false,
    fit: "shrink",
  });
  if (sub) {
    slide.addText(sub, {
      x: 0.57,
      y: 1.52,
      w: 7.3,
      h: 0.42,
      fontSize: 10.5,
      color: dark ? "B5C2D3" : C.muted,
      margin: 0,
      breakLine: false,
      fit: "shrink",
    });
  }
}

function pill(slide, x, y, w, label, color = C.blue, fill = C.blue2) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.28,
    rectRadius: 0.06,
    fill: { color: fill },
    line: { color: fill },
  });
  slide.addText(label, {
    x: x + 0.08,
    y: y + 0.07,
    w: w - 0.16,
    h: 0.12,
    fontSize: 6.8,
    bold: true,
    color,
    align: "center",
    margin: 0,
    fit: "shrink",
  });
}

function metric(slide, x, y, value, label, note, dark = false) {
  slide.addText(value, {
    x,
    y,
    w: 1.5,
    h: 0.5,
    fontSize: 26,
    bold: true,
    color: dark ? "FFFFFF" : C.blue,
    margin: 0,
  });
  slide.addText(label, {
    x,
    y: y + 0.55,
    w: 1.75,
    h: 0.18,
    fontSize: 8.2,
    bold: true,
    color: dark ? "CAD7E8" : C.ink,
    margin: 0,
  });
  slide.addText(note, {
    x,
    y: y + 0.82,
    w: 1.9,
    h: 0.28,
    fontSize: 6.4,
    color: dark ? "95A4BA" : C.muted,
    margin: 0,
    fit: "shrink",
  });
}

function addSource(slide, text, dark = false) {
  slide.addText(text, {
    x: 0.56,
    y: 6.78,
    w: 10.6,
    h: 0.16,
    fontSize: 5.6,
    color: dark ? "7E8DA3" : "8A96A8",
    margin: 0,
    fit: "shrink",
  });
}

function addTextBox(slide, x, y, w, h, head, body, opts = {}) {
  const fill = opts.fill || C.white;
  const line = opts.line || C.line;
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: fill },
    line: { color: line, width: 0.75 },
    shadow: opts.shadow ? { type: "outer", color: "000000", blur: 1, offset: 1, angle: 45, opacity: 0.06 } : undefined,
  });
  slide.addText(head, {
    x: x + 0.18,
    y: y + 0.18,
    w: w - 0.36,
    h: 0.22,
    fontSize: 9.2,
    bold: true,
    color: opts.headColor || C.ink,
    margin: 0,
    fit: "shrink",
  });
  slide.addText(body, {
    x: x + 0.18,
    y: y + 0.52,
    w: w - 0.36,
    h: h - 0.65,
    fontSize: opts.bodySize || 7.4,
    color: opts.bodyColor || C.muted,
    breakLine: false,
    margin: 0,
    fit: "shrink",
    valign: "top",
  });
}

function addBar(slide, x, y, w, label, value, max, color) {
  slide.addText(label, { x, y: y - 0.04, w: 2.1, h: 0.17, fontSize: 7.1, bold: true, color: C.ink, margin: 0, fit: "shrink" });
  slide.addShape(pptx.ShapeType.rect, { x: x + 2.35, y, w: 3.0, h: 0.16, fill: { color: "E4EAF3" }, line: { color: "E4EAF3" } });
  slide.addShape(pptx.ShapeType.rect, { x: x + 2.35, y, w: 3.0 * value / max, h: 0.16, fill: { color }, line: { color } });
  slide.addText(String(value), { x: x + 5.48, y: y - 0.04, w: 0.35, h: 0.17, fontSize: 7.1, bold: true, color, align: "right", margin: 0 });
}

// Slide 1
{
  const slide = pptx.addSlide();
  addBg(slide, true);
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.navy }, line: { color: C.navy } });
  slide.addShape(pptx.ShapeType.rect, { x: 9.1, y: 0, w: 4.24, h: H, fill: { color: "102E4B" }, line: { color: "102E4B" } });
  slide.addShape(pptx.ShapeType.arc, { x: 8.55, y: -1.1, w: 4.7, h: 4.7, line: { color: "2C79D9", transparency: 45, width: 1.1 }, adjustPoint: 0.25 });
  kicker(slide, "public data ai agent", true);
  slide.addText("방위사업청 AI 데이터 에이전트\n도입 제안", {
    x: 0.6,
    y: 1.15,
    w: 7.5,
    h: 1.3,
    fontSize: 30,
    bold: true,
    color: C.white,
    breakLine: false,
    margin: 0,
    fit: "shrink",
  });
  slide.addText("공개데이터 44건을 직원·방산업체·공공기관·국민이 바로 질문하고 활용하는 SLM 기반 서비스로 전환합니다.", {
    x: 0.63,
    y: 2.72,
    w: 7.2,
    h: 0.46,
    fontSize: 12.2,
    color: "C9D6E6",
    margin: 0,
    fit: "shrink",
  });
  metric(slide, 0.75, 4.2, "44", "공공데이터셋", "FILE 31 + API 13", true);
  metric(slide, 2.85, 4.2, "5", "데이터 목차", "업무 질문 단위로 재구성", true);
  metric(slide, 4.95, 4.2, "RAG", "근거 기반 답변", "데이터 출처를 답변 안에 표시", true);
  addTextBox(slide, 9.55, 1.28, 2.8, 0.95, "도입 메시지", "홈페이지에 챗봇을 붙이는 것이 아니라, 공개데이터를 실제 의사결정 언어로 바꾸는 서비스입니다.", { fill: "173A5C", line: "355D83", headColor: "FFFFFF", bodyColor: "C9D6E6", bodySize: 7.3 });
  addTextBox(slide, 9.55, 2.55, 2.8, 0.95, "운영 원칙", "대화 저장은 최소화하고, 원문 데이터셋과 API 응답을 답변 하단에 함께 제시합니다.", { fill: "173A5C", line: "355D83", headColor: "FFFFFF", bodyColor: "C9D6E6", bodySize: 7.3 });
  addTextBox(slide, 9.55, 3.82, 2.8, 0.95, "모델 방향", "기본 모델은 로컬 Ollama Qwen3.5-4B, 확장 후보는 Hugging Face Gemma4 오픈 모델로 둡니다.", { fill: "173A5C", line: "355D83", headColor: "FFFFFF", bodyColor: "C9D6E6", bodySize: 7.3 });
  addSource(slide, "근거: dapa_public_data_inventory.csv, dapa_ai_agent_dataset_map.json, Ollama 공식 API 문서", true);
  addFooter(slide, 1, true);
}

// Slide 2
{
  const slide = pptx.addSlide();
  addBg(slide);
  kicker(slide, "why this matters");
  title(slide, "공개는 충분하지만, 사용자는 데이터 이름을 모릅니다.", "에이전트의 역할은 데이터셋 목록을 보여주는 것이 아니라 질문을 업무 답변으로 바꾸는 것입니다.");
  const xs = [0.72, 4.22, 7.72];
  const heads = ["데이터는 흩어져 있음", "질문은 업무 언어로 들어옴", "답변은 근거가 필요함"];
  const bods = [
    "파일데이터와 오픈 API가 분리되어 있어 일반 사용자는 어떤 데이터를 봐야 할지 판단하기 어렵습니다.",
    "방산업체는 ‘참여 가능한 사업’, 국민은 ‘무슨 뜻인지’, 직원은 ‘근거 자료’를 묻습니다.",
    "공공기관 서비스는 답변만으로 부족합니다. 사용한 데이터셋과 최신성, 추정 여부가 함께 나와야 합니다.",
  ];
  for (let i = 0; i < 3; i++) {
    slide.addShape(pptx.ShapeType.rect, { x: xs[i], y: 2.25, w: 2.75, h: 0.04, fill: { color: [C.blue, C.gold, C.green][i] }, line: { color: [C.blue, C.gold, C.green][i] } });
    addTextBox(slide, xs[i], 2.45, 2.75, 2.0, heads[i], bods[i], { fill: C.white, shadow: true, bodySize: 8.1 });
  }
  slide.addShape(pptx.ShapeType.line, { x: 0.72, y: 5.05, w: 10.0, h: 0, line: { color: C.line, width: 1.2 } });
  const steps = [
    ["목차 선택", "5개 데이터 목차"],
    ["예상 질문", "사용자 언어"],
    ["RAG 검색", "파일 + API"],
    ["SLM 답변", "Qwen3.5-4B\nGemma4"],
    ["근거 표시", "데이터셋 출처"],
  ];
  steps.forEach((s, i) => {
    const x = 0.75 + i * 2.15;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: 4.88, w: 0.34, h: 0.34, fill: { color: i === 4 ? C.green : C.blue }, line: { color: i === 4 ? C.green : C.blue } });
    slide.addText(s[0], { x: x - 0.15, y: 5.35, w: 1.2, h: 0.2, fontSize: 8, bold: true, color: C.ink, align: "center", margin: 0 });
    slide.addText(s[1], { x: x - 0.35, y: 5.65, w: 1.6, h: 0.2, fontSize: 6.7, color: C.muted, align: "center", margin: 0 });
  });
  addFooter(slide, 2);
}

// Slide 3
{
  const slide = pptx.addSlide();
  addBg(slide);
  kicker(slide, "users and situations");
  title(slide, "한 화면이 네 집단의 다른 질문을 받아야 합니다.", "직원용 업무 검색, 기업용 기회 탐색, 공공기관용 정책 이해, 국민용 쉬운 설명을 같은 데이터 기반으로 처리합니다.");
  const rows = [
    ["방위사업청 직원", "업무 근거·법령·조달 이력 확인", "자료 찾는 시간을 줄이고 답변 근거를 표준화"],
    ["방산업체·중소기업", "조달계획, 입찰공고, 계약정보 연결", "참여 가능한 사업과 준비 요건을 빠르게 파악"],
    ["정부·공공기관", "정책자료, 법령해석, 산업 현황 비교", "타 기관 협업과 정책 검토의 공통 언어 제공"],
    ["국민·관심 사용자", "전문 용어, K-방산 현황, 공개자료 안내", "방위사업의 투명성과 이해 가능성 확대"],
  ];
  slide.addShape(pptx.ShapeType.rect, { x: 0.7, y: 2.15, w: 11.6, h: 0.34, fill: { color: C.navy }, line: { color: C.navy } });
  ["대상", "대표 상황", "도움이 되는 지점"].forEach((h, i) => {
    slide.addText(h, { x: [0.95, 3.35, 7.65][i], y: 2.24, w: [1.6, 3.3, 3.9][i], h: 0.12, fontSize: 7.5, bold: true, color: "FFFFFF", margin: 0 });
  });
  rows.forEach((r, i) => {
    const y = 2.72 + i * 0.78;
    slide.addShape(pptx.ShapeType.rect, { x: 0.7, y: y - 0.08, w: 11.6, h: 0.64, fill: { color: i % 2 ? "FFFFFF" : "F1F5FA" }, line: { color: C.line, transparency: 40 } });
    slide.addText(r[0], { x: 0.95, y, w: 1.9, h: 0.22, fontSize: 8.8, bold: true, color: C.blue, margin: 0 });
    slide.addText(r[1], { x: 3.35, y, w: 3.4, h: 0.22, fontSize: 8.2, color: C.ink, margin: 0, fit: "shrink" });
    slide.addText(r[2], { x: 7.65, y, w: 4.0, h: 0.22, fontSize: 8.2, color: C.muted, margin: 0, fit: "shrink" });
  });
  addSource(slide, "사용자 흐름: 직원·방산업체·공공기관·국민 모두 공개데이터 접근 장벽을 낮추는 방향으로 설계", false);
  addFooter(slide, 3);
}

// Slide 4
{
  const slide = pptx.addSlide();
  addBg(slide);
  kicker(slide, "data foundation");
  title(slide, "44개 공개데이터를 5개 질문 목차로 다시 묶었습니다.", "기술 제안의 출발점은 모델이 아니라 데이터셋 재구성입니다.");
  metric(slide, 0.78, 2.25, String(totals.total), "총 데이터셋", "공공데이터포털 기준", false);
  metric(slide, 2.72, 2.25, String(totals.file), "파일데이터", "분석·이력·대량 조회", false);
  metric(slide, 4.66, 2.25, String(totals.api), "오픈 API", "최신성·실시간 조회", false);
  const max = Math.max(...sections.map((s) => s.total));
  sections.forEach((s, i) => addBar(slide, 0.85, 4.15 + i * 0.38, 5.8, s.title, s.total, max, [C.blue, C.gold, C.green, "6B5B95", "C94C4C"][i]));
  addTextBox(slide, 7.25, 2.15, 4.4, 1.35, "파일데이터의 역할", "연간·수시 갱신되는 원본 목록을 정규화해 과거 이력, 분포, 비교 분석의 기준 데이터로 사용합니다.", { fill: "FFFFFF", bodySize: 8.1 });
  addTextBox(slide, 7.25, 3.85, 4.4, 1.35, "오픈 API의 역할", "조달계획, 입찰공고, 계약정보, 법령해석, 해외입찰처럼 최신 조회가 필요한 항목을 보완합니다.", { fill: "FFFFFF", bodySize: 8.1 });
  addSource(slide, "근거 파일: dapa_public_data_inventory.csv — FILE 31건, API 13건 / dapa_ai_agent_dataset_map.json — 5개 목차 매핑", false);
  addFooter(slide, 4);
}

// Slide 5
{
  const slide = pptx.addSlide();
  addBg(slide);
  kicker(slide, "interface model");
  title(slide, "사용자는 데이터셋을 몰라도 질문할 수 있어야 합니다.", "화면은 ‘데이터 목차 → 예상되는 질문 → 채팅 답변 → 사용한 데이터’ 순서로 읽히도록 설계합니다.");
  if (fs.existsSync(svgShot)) {
    slide.addImage({ path: svgShot, x: 0.65, y: 2.05, w: 7.25, h: 4.08, sizing: { type: "contain", w: 7.25, h: 4.08 } });
  }
  addTextBox(slide, 8.38, 2.0, 3.95, 0.95, "1. 데이터 목차", "방위사업 용어·규격, 법령·민원, 군수품 조달, 국내 정보, 해외 정보로 진입합니다.", { fill: C.white, bodySize: 7.4 });
  addTextBox(slide, 8.38, 3.16, 3.95, 0.95, "2. 예상되는 질문", "선택한 목차에 따라 질문 후보가 바뀌고 클릭하면 중앙 채팅에 반영됩니다.", { fill: C.white, bodySize: 7.4 });
  addTextBox(slide, 8.38, 4.32, 3.95, 0.95, "3. 근거 포함 답변", "답변 안에서 사용한 파일데이터와 API를 구분해 표시합니다.", { fill: C.white, bodySize: 7.4 });
  addFooter(slide, 5);
}

// Slide 6
{
  const slide = pptx.addSlide();
  addBg(slide);
  kicker(slide, "screen-by-screen function");
  title(slide, "각 화면 구성은 ‘탐색’이 아니라 ‘질문 유도’에 집중합니다.", "방위사업청 인터넷망 홈페이지에서는 별도 학습 없이 클릭 가능한 질문과 근거 기반 답변을 제공합니다.");
  const items = [
    ["상단 데이터 목차", "공개데이터 44건을 5개 업무 목차로 묶어 사용자가 시작점을 고르게 합니다."],
    ["우측 예상되는 질문", "목차 클릭 시 해당 데이터셋으로 답할 수 있는 질문 리스트를 자동으로 보여줍니다."],
    ["중앙 채팅 답변", "선택 질문 또는 직접 입력 질문에 대해 RAG 검색 결과와 SLM 답변을 함께 제공합니다."],
    ["사용한 데이터 표시", "답변 카드 안에서 FILE·API 근거를 구분해 신뢰성과 감사 가능성을 확보합니다."],
    ["핵심 키워드", "사용자가 조달계획, 국방규격, K-방산 등 주제 축을 빠르게 이해하게 합니다."],
  ];
  items.forEach((it, i) => {
    const y = 2.05 + i * 0.82;
    slide.addShape(pptx.ShapeType.ellipse, { x: 0.78, y: y + 0.02, w: 0.34, h: 0.34, fill: { color: i === 2 ? C.green : C.blue }, line: { color: i === 2 ? C.green : C.blue } });
    slide.addText(String(i + 1), { x: 0.78, y: y + 0.09, w: 0.34, h: 0.12, fontSize: 7.2, bold: true, color: "FFFFFF", align: "center", margin: 0 });
    slide.addText(it[0], { x: 1.32, y, w: 2.3, h: 0.22, fontSize: 9.2, bold: true, color: C.ink, margin: 0 });
    slide.addText(it[1], { x: 3.75, y, w: 7.4, h: 0.24, fontSize: 8.2, color: C.muted, margin: 0, fit: "shrink" });
  });
  addTextBox(slide, 1.28, 6.15, 10.45, 0.58, "핵심 UX 원칙", "데이터 이름을 노출하는 화면이 아니라, 사용자가 실제로 묻고 싶은 문장으로 출발하게 만드는 화면입니다.", { fill: C.blue2, line: "BDD7FF", headColor: C.blue, bodySize: 8.1 });
  addFooter(slide, 6);
}

// Slide 7
{
  const slide = pptx.addSlide();
  addBg(slide);
  kicker(slide, "target architecture");
  title(slide, "SLM은 답변 엔진이고, 데이터 파이프라인이 신뢰를 만듭니다.", "로컬 Ollama Qwen3.5-4B를 기본 모델로 두고, Hugging Face Gemma4는 대체·확장 모델로 검증합니다.");
  const nodes = [
    ["홈페이지 UI", "React/Next.js\n채팅·목차·예상질문", 0.78, 2.35, C.blue],
    ["Agent API", "FastAPI\n권한·질문 라우팅", 3.05, 2.35, C.gold],
    ["RAG 검색", "PostgreSQL + pgvector\n키워드 + 의미 검색", 5.32, 2.35, C.green],
    ["SLM 서버", "Ollama\nQwen3.5-4B", 7.59, 2.35, "6B5B95"],
    ["답변/근거", "출처 데이터셋\n추정 여부 표시", 9.86, 2.35, "C94C4C"],
  ];
  nodes.forEach((n, i) => {
    slide.addShape(pptx.ShapeType.roundRect, { x: n[2], y: n[3], w: 1.72, h: 1.05, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: n[4], width: 1.1 } });
    slide.addText(n[0], { x: n[2] + 0.13, y: n[3] + 0.18, w: 1.45, h: 0.2, fontSize: 8.5, bold: true, color: n[4], margin: 0 });
    slide.addText(n[1], { x: n[2] + 0.13, y: n[3] + 0.52, w: 1.45, h: 0.35, fontSize: 6.5, color: C.muted, margin: 0, fit: "shrink" });
    if (i < nodes.length - 1) {
      slide.addShape(pptx.ShapeType.line, { x: n[2] + 1.78, y: n[3] + 0.52, w: 0.43, h: 0, line: { color: "9FB3CC", width: 1.4, beginArrowType: "none", endArrowType: "triangle" } });
    }
  });
  addTextBox(slide, 1.1, 4.55, 2.4, 1.08, "수집/정규화", "CSV·JSON·XML 파일을 정기 수집하고 필드 표준화, 중복 제거, 날짜 기준 정렬을 수행합니다.", { fill: C.white, bodySize: 7.4 });
  addTextBox(slide, 3.86, 4.55, 2.4, 1.08, "색인/검색", "원문 테이블 검색과 임베딩 검색을 함께 사용해 질문과 관련된 근거 문단을 찾습니다.", { fill: C.white, bodySize: 7.4 });
  addTextBox(slide, 6.62, 4.55, 2.4, 1.08, "생성/검증", "SLM은 검색된 근거만 사용하도록 프롬프트를 제한하고, 답변에 데이터셋 출처를 표시합니다.", { fill: C.white, bodySize: 7.4 });
  addTextBox(slide, 9.38, 4.55, 2.4, 1.08, "운영/감사", "질문 로그는 비식별화하고, API 호출·데이터 버전·답변 출처를 감사 로그로 남깁니다.", { fill: C.white, bodySize: 7.4 });
  addSource(slide, "모델 연동: Ollama /api/chat, 임베딩: Ollama /api/embed, Gemma4 검증: Hugging Face Transformers/vLLM, 데이터 저장: PostgreSQL·pgvector 또는 Qdrant", false);
  addFooter(slide, 7);
}

// Slide 8
{
  const slide = pptx.addSlide();
  addBg(slide);
  kicker(slide, "model strategy");
  title(slide, "Qwen은 기본 실행 모델, Gemma4는 확장 검증 모델입니다.", "현재 PC의 Ollama Qwen 4B급 모델을 PoC 기본값으로 두고, Hugging Face Gemma4는 성능·멀티모달 확장 후보로 비교합니다.");
  addTextBox(slide, 0.8, 2.05, 3.25, 1.65, "기본 모델: Ollama Qwen3.5-4B", "로컬 설치 모델로 빠르게 PoC를 시작합니다. 실제 실행명은 hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M 기준으로 확인됐습니다.", { fill: C.white, headColor: C.blue, bodySize: 7.3 });
  addTextBox(slide, 4.25, 2.05, 3.25, 1.65, "확장 모델: Hugging Face Gemma4", "Gemma4는 Hugging Face의 google/gemma-4-* 계열 오픈 모델로 검증합니다. 필요 시 Transformers, vLLM, GGUF 경로를 선택합니다.", { fill: C.white, headColor: C.green, bodySize: 7.3 });
  addTextBox(slide, 7.7, 2.05, 3.25, 1.65, "Embedding 계층", "SLM에 모든 데이터를 넣지 않고, 질문과 관련된 데이터 조각만 검색해 컨텍스트로 전달합니다.", { fill: C.white, headColor: C.gold, bodySize: 7.9 });
  slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 4.35, w: 10.2, h: 0.04, fill: { color: C.line }, line: { color: C.line } });
  const decision = [
    ["1", "Qwen PoC", "로컬 Ollama Qwen3.5-4B로 응답 흐름 검증"],
    ["2", "파일+API RAG", "데이터셋 44건 색인과 출처 표시 검증"],
    ["3", "Gemma4 비교", "HF Gemma4로 응답 품질·자원 요구 비교"],
    ["4", "운영 모델 확정", "서버 자원과 공개 서비스 SLA 기준으로 모델 선택"],
  ];
  decision.forEach((d, i) => {
    const x = 0.9 + i * 2.55;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: 4.18, w: 0.36, h: 0.36, fill: { color: C.blue }, line: { color: C.blue } });
    slide.addText(d[0], { x, y: 4.26, w: 0.36, h: 0.12, fontSize: 7, bold: true, color: "FFFFFF", align: "center", margin: 0 });
    slide.addText(d[1], { x: x - 0.1, y: 4.75, w: 1.3, h: 0.2, fontSize: 8.4, bold: true, color: C.ink, margin: 0 });
    slide.addText(d[2], { x: x - 0.1, y: 5.08, w: 2.1, h: 0.45, fontSize: 6.8, color: C.muted, margin: 0, fit: "shrink" });
  });
  addSource(slide, "참고: 로컬 ollama list 확인 모델명, Hugging Face Gemma4 model cards, Ollama API chat·embed documentation", false);
  addFooter(slide, 8);
}

// Slide 9
{
  const slide = pptx.addSlide();
  addBg(slide);
  kicker(slide, "internet service operations");
  title(slide, "인터넷망 홈페이지에 올리려면 ‘공개 서비스 운영’ 기준이 필요합니다.", "모델 성능보다 중요한 것은 데이터 최신성, 출처 표시, 개인정보·보안 통제입니다.");
  const layers = [
    ["공개 웹", "방위사업청 홈페이지\nAI 데이터 에이전트 UI"],
    ["서비스 API", "질문 라우팅\n목차별 정책·금칙어·속도 제한"],
    ["데이터 계층", "파일데이터 캐시\n오픈 API 조회·응답 캐시"],
    ["모델 계층", "Ollama SLM 서버\nRAG 컨텍스트 기반 생성"],
    ["통제 계층", "감사로그\n비식별화·출처·버전 관리"],
  ];
  layers.forEach((l, i) => {
    const y = 2.0 + i * 0.78;
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y, w: 3.0, h: 0.52, fill: { color: i % 2 ? "FFFFFF" : "F0F5FB" }, line: { color: C.line } });
    slide.addText(l[0], { x: 1.0, y: y + 0.13, w: 0.95, h: 0.12, fontSize: 8, bold: true, color: C.blue, margin: 0 });
    slide.addText(l[1], { x: 2.0, y: y + 0.08, w: 1.45, h: 0.24, fontSize: 6.7, color: C.muted, margin: 0, fit: "shrink" });
  });
  addTextBox(slide, 4.65, 2.05, 2.65, 1.15, "개인정보 최소화", "대화 원문 장기 저장을 기본 기능으로 두지 않고, 통계 목적 로그는 비식별화합니다.", { fill: C.white, bodySize: 7.4 });
  addTextBox(slide, 7.65, 2.05, 2.65, 1.15, "출처 의무화", "답변 하단에 사용한 데이터셋, 갱신일, FILE/API 구분을 자동 표시합니다.", { fill: C.white, bodySize: 7.4 });
  addTextBox(slide, 4.65, 3.65, 2.65, 1.15, "오답 억제", "검색 근거가 없으면 답변을 보류하고, 추정 답변은 추정임을 명시합니다.", { fill: C.white, bodySize: 7.4 });
  addTextBox(slide, 7.65, 3.65, 2.65, 1.15, "API 안정성", "오픈 API 장애 시 파일데이터 캐시 기반 답변으로 서비스 연속성을 유지합니다.", { fill: C.white, bodySize: 7.4 });
  addTextBox(slide, 10.65, 2.05, 1.75, 2.75, "운영 KPI", "검색 성공률\n출처 포함률\n응답 지연시간\n오답 신고율\nAPI 장애 전환율", { fill: C.navy, line: C.navy, headColor: "FFFFFF", bodyColor: "CAD7E8", bodySize: 8.2 });
  addFooter(slide, 9);
}

// Slide 10
{
  const slide = pptx.addSlide();
  addBg(slide, true);
  kicker(slide, "implementation roadmap", true);
  slide.addText("도입은 ‘모델 구축’이 아니라\n데이터 서비스 제품화로 진행해야 합니다.", {
    x: 0.6,
    y: 0.95,
    w: 7.4,
    h: 1.15,
    fontSize: 27,
    bold: true,
    color: C.white,
    margin: 0,
    fit: "shrink",
  });
  const phases = [
    ["1단계", "PoC", "44개 데이터셋 수집·정규화\nQwen3.5-4B 기본 응답 검증\nGemma4 비교 기준 수립"],
    ["2단계", "시범 서비스", "홈페이지 UI 연결\n파일+API RAG 검색 적용\n출처 표시와 오답 신고 도입"],
    ["3단계", "정식 운영", "운영 KPI 모니터링\n부서별 데이터 추가\n대국민 서비스 고도화"],
  ];
  phases.forEach((p, i) => {
    const x = 0.75 + i * 3.85;
    slide.addShape(pptx.ShapeType.rect, { x, y: 3.0, w: 3.2, h: 0.04, fill: { color: ["A6D8FF", "FFD98A", "92E0C1"][i] }, line: { color: ["A6D8FF", "FFD98A", "92E0C1"][i] } });
    slide.addText(p[0], { x, y: 2.58, w: 0.8, h: 0.2, fontSize: 8, bold: true, color: ["A6D8FF", "FFD98A", "92E0C1"][i], margin: 0 });
    slide.addText(p[1], { x, y: 3.25, w: 2.5, h: 0.35, fontSize: 17, bold: true, color: C.white, margin: 0 });
    slide.addText(p[2], { x, y: 3.85, w: 3.1, h: 0.92, fontSize: 8.4, color: "C9D6E6", margin: 0, breakLine: false, fit: "shrink" });
  });
  addTextBox(slide, 0.75, 5.78, 10.95, 0.72, "담당부서 의사결정 항목", "1. 인터넷망 배포 범위  2. API 인증·호출 정책  3. 대화 로그 보관 기준  4. 우선 적용 목차  5. 운영 KPI", { fill: "173A5C", line: "355D83", headColor: "FFFFFF", bodyColor: "C9D6E6", bodySize: 7.8 });
  addFooter(slide, 10, true);
}

pptx.writeFile({ fileName: out });
