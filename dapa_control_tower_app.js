const projects = [
  {
    id: "p1",
    name: "전술통신장비 성능개량 부품 조달",
    acquisitionType: "국내구매",
    brief: "반복 조달 품목이지만 동일 분야 참여업체가 줄고 있으며, 공고부터 계약까지의 소요기간이 유사 품목 평균보다 길어지고 있습니다.",
    score: 82,
    level: "high",
    matchConfidence: 0.87,
    risks: {
      schedule: 86,
      cost: 72,
      competition: 91,
      anomaly: 65,
      performance: 78
    },
    quality: {
      total: 74,
      completeness: 81,
      keyConsistency: 68,
      nameStandardization: 72,
      linkage: 75
    },
    knowhow: [
      ["일정", 86, "높음", "공고 전 참가자격과 품목명세서 확정 여부를 먼저 확인해야 합니다. 유사사업 대비 계약까지 24일 이상 지연될 가능성이 있습니다."],
      ["비용", 72, "주의", "예산금액과 유사 계약의 예정가격 편차가 커지고 있습니다. 기초금액 산정 근거와 낙찰하한율을 재확인해야 합니다."],
      ["성능", 78, "높음", "제한경쟁 조건이 성능 요구사항과 과도하게 결합되면 참여업체가 줄 수 있습니다. 필수 성능과 권장 성능을 분리해야 합니다."]
    ],
    roadmap: [
      {
        key: "조달계획 및 조달요구",
        title: "2026.03 발주 예정",
        meta: ["대표품목: 전술통신장비 부품", "예산금액: 38.5억 원", "계약방법: 제한경쟁"],
        risk: 72
      },
      {
        key: "입찰공고",
        title: "공고 준비 단계",
        meta: ["유사 공고 평균 마감기간: 18일", "예상 참여업체: 2개 이하", "공고 품질 점검 필요"],
        risk: 91
      },
      {
        key: "입찰결과",
        title: "과거 유사품목 유찰 2회",
        meta: ["참여업체 감소 추세", "단일 참여 발생 이력", "경쟁 부족 위험 높음"],
        risk: 88
      },
      {
        key: "계약정보",
        title: "계약 지연 가능",
        meta: ["유사 계약 평균 54일", "예상 78일 이상", "일정 조기관리 필요"],
        risk: 84
      }
    ],
    drivers: [
      ["참여업체 감소", 91, "red"],
      ["공고-계약 기간 증가", 86, "red"],
      ["예산 대비 계약금액 편차", 72, "amber"],
      ["동일 업체 반복 낙찰", 65, "amber"],
      ["품목명 매칭 신뢰도", 47, "blue"]
    ],
    briefItems: [
      ["판단 요약", "경쟁 부족과 일정 지연 위험이 가장 큽니다. 발주 전 유사 공고의 마감기간과 참가자격 조건을 재검토해야 합니다."],
      ["근거", "최근 유사 품목 입찰에서 참여업체 수가 4개에서 2개 이하로 감소했고, 계약 체결까지 걸린 기간이 평균 대비 24일 길었습니다."],
      ["권고 조치", "입찰공고 전 참가자격 조건을 완화할 수 있는지 검토하고, 대체 참여 가능 업체 후보군을 사전 확인하십시오."],
      ["담당자 확인", "단일 업체 참여 가능성, 제한경쟁 사유, 납기 요구조건, 예산 산정 근거를 우선 확인해야 합니다."]
    ]
  },
  {
    id: "p2",
    name: "항공유도 장비 정비용 구성품 구매",
    acquisitionType: "양산",
    brief: "예정가격 대비 계약금액 편차는 안정적이지만, 특정 업체 반복 계약과 수의계약 사유 검토가 필요한 사업입니다.",
    score: 64,
    level: "medium",
    matchConfidence: 0.92,
    risks: {
      schedule: 44,
      cost: 58,
      competition: 68,
      anomaly: 76,
      performance: 61
    },
    quality: {
      total: 86,
      completeness: 88,
      keyConsistency: 84,
      nameStandardization: 82,
      linkage: 91
    },
    knowhow: [
      ["일정", 44, "낮음", "일정 영향은 제한적입니다. 다만 반복 낙찰 업체의 납품 이력을 주기적으로 확인해야 합니다."],
      ["비용", 58, "주의", "비용은 정상 범위이나 낙찰률이 유사군보다 높아지는 조짐이 있습니다. 예정가격 산정 기준을 비교하십시오."],
      ["성능", 61, "주의", "특정 업체 반복 낙찰이 규격 특수성 때문인지 확인해야 합니다. 동등품 허용 조건을 검토하십시오."]
    ],
    roadmap: [
      {
        key: "조달계획 및 조달요구",
        title: "2026.04 발주 예정",
        meta: ["대표품목: 항공유도 정비 구성품", "예산금액: 21.2억 원", "집행유형: 구매"],
        risk: 52
      },
      {
        key: "입찰공고",
        title: "공고 조건 안정",
        meta: ["마감기간: 유사군 평균 수준", "계약방법: 제한경쟁", "품목명세서 확인 필요"],
        risk: 47
      },
      {
        key: "입찰결과",
        title: "반복 낙찰 후보 탐지",
        meta: ["동일 업체 낙찰 이력 3회", "참가업체 평균 3.1개", "이상패턴 점검 필요"],
        risk: 76
      },
      {
        key: "계약정보",
        title: "비용 편차 보통",
        meta: ["낙찰률: 유사군 평균 +3.2%p", "계약기간: 정상 범위", "수의계약 사유 없음"],
        risk: 58
      }
    ],
    drivers: [
      ["동일 업체 반복 낙찰", 76, "amber"],
      ["참여업체 수 제한", 68, "amber"],
      ["낙찰률 편차", 58, "amber"],
      ["일정 지연 가능성", 44, "blue"],
      ["데이터 연결 신뢰도", 18, "green"]
    ],
    briefItems: [
      ["판단 요약", "전체 위험은 중간 수준입니다. 비용과 일정은 안정적이나 동일 업체 반복 낙찰 신호가 있어 점검 우선순위에 올려야 합니다."],
      ["근거", "최근 3개 유사 계약에서 동일 업체 낙찰 빈도가 높고, 경쟁 참여업체 수가 충분히 넓지 않습니다."],
      ["권고 조치", "참가 가능 업체 풀을 방산업체 지정현황과 입찰참여업체정보로 재확인하고, 과거 낙찰 조건의 반복성을 검토하십시오."],
      ["담당자 확인", "특정 규격 요구가 경쟁을 제한하는지, 대체품 또는 동등품 조건을 명확히 제시할 수 있는지 확인해야 합니다."]
    ]
  },
  {
    id: "p3",
    name: "함정 전자장비 교체 사업",
    acquisitionType: "연구개발 후 양산",
    brief: "공고·계약 데이터 연결 신뢰도가 높고 경쟁성도 양호합니다. 다만 일정 관리와 성능 요구사항 변경 가능성을 추적해야 합니다.",
    score: 39,
    level: "low",
    matchConfidence: 0.96,
    risks: {
      schedule: 52,
      cost: 34,
      competition: 28,
      anomaly: 22,
      performance: 48
    },
    quality: {
      total: 92,
      completeness: 93,
      keyConsistency: 95,
      nameStandardization: 88,
      linkage: 94
    },
    knowhow: [
      ["일정", 52, "주의", "현재 일정은 관리 가능하지만 성능시험 일정이 변경되면 계약기간에 영향을 줄 수 있습니다."],
      ["비용", 34, "낮음", "예산과 계약금액 편차는 낮습니다. 비용 리스크보다 성능 요구사항 변경 가능성을 우선 관리하십시오."],
      ["성능", 48, "관찰", "성능 영향은 관찰 수준입니다. 형상 변경 가능성과 시험평가 조건만 월별로 추적하면 됩니다."]
    ],
    roadmap: [
      {
        key: "조달계획 및 조달요구",
        title: "2026.02 조달판단 완료",
        meta: ["대표품목: 함정 전자장비", "예산금액: 64.8억 원", "진행상태: 공고의뢰중"],
        risk: 42
      },
      {
        key: "입찰공고",
        title: "경쟁성 양호",
        meta: ["유사 공고 참여업체 평균 5.4개", "마감기간 충분", "품목명세서 연결 완료"],
        risk: 28
      },
      {
        key: "입찰결과",
        title: "정상 분포 예상",
        meta: ["낙찰률 편차 낮음", "반복 낙찰 신호 낮음", "경쟁 부족 위험 낮음"],
        risk: 24
      },
      {
        key: "계약정보",
        title: "일정 추적 필요",
        meta: ["성능 요구 변경 가능성", "계약기간 유사군 대비 +8일", "월별 점검 권고"],
        risk: 52
      }
    ],
    drivers: [
      ["계약기간 증가", 52, "amber"],
      ["성능 요구 변경 가능성", 48, "blue"],
      ["예산 편차", 34, "green"],
      ["경쟁 부족", 28, "green"],
      ["이상 낙찰", 22, "green"]
    ],
    briefItems: [
      ["판단 요약", "전체 위험은 낮습니다. 다만 함정 전자장비 특성상 성능 요구 변경이 일정 지연으로 이어질 수 있으므로 월별 추적이 필요합니다."],
      ["근거", "공고와 계약 연결 신뢰도가 높고 유사 품목의 참여업체 수가 충분합니다. 낙찰률도 정상 분포에 가깝습니다."],
      ["권고 조치", "성능 요구사항 변경 이력과 계약기간 변경 가능성을 별도 관리 지표로 등록하십시오."],
      ["담당자 확인", "성능시험 일정, 납품 검수 조건, 형상 변경 가능성을 계약 전 검토해야 합니다."]
    ]
  }
];

const todoItems = [
  "공공데이터포털 OpenAPI 활용신청 및 서비스키 발급",
  "최근 3~5년 조달계획·입찰공고·입찰결과·계약정보 월 단위 수집",
  "CSV 보조 데이터 다운로드 및 업체명·품목명 표준화",
  "공고번호·계약번호 기반 1차 연결, 실패 건은 유사도 매칭",
  "일정·비용·경쟁·이상 낙찰 리스크 점수 산출",
  "사업 상세 화면과 AI 브리핑 출력 검증",
  "과거 유찰·지연 사례로 점수 정확도 검증"
];

const colorMap = {
  red: "var(--red)",
  amber: "var(--amber)",
  blue: "var(--blue)",
  green: "var(--green)"
};

const levelText = {
  low: "낮음",
  medium: "주의",
  high: "높음"
};

function scoreColor(score) {
  if (score >= 75) return "var(--red)";
  if (score >= 55) return "var(--amber)";
  if (score >= 40) return "var(--blue)";
  return "var(--green)";
}

function initialize() {
  const select = document.querySelector("#projectSelect");
  projects.forEach((project) => {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name;
    select.appendChild(option);
  });
  select.addEventListener("change", () => renderProject(select.value));
  renderTodo();
  renderProject(projects[0].id);
}

function renderTodo() {
  const list = document.querySelector("#todoList");
  list.innerHTML = todoItems.map((item, index) => `
    <div class="todo-item">
      <span class="todo-num">${index + 1}</span>
      <span>${item}</span>
    </div>
  `).join("");
}

function renderProject(id) {
  const project = projects.find((item) => item.id === id) || projects[0];
  const gauge = document.querySelector("#riskGauge");
  gauge.style.setProperty("--score", project.score);
  gauge.style.setProperty("--gauge-color", scoreColor(project.score));

  document.querySelector("#riskScore").textContent = project.score;
  document.querySelector("#projectName").textContent = project.name;
  document.querySelector("#acquisitionType").textContent = `획득유형 ${project.acquisitionType}`;
  document.querySelector("#projectBrief").textContent = project.brief;
  document.querySelector("#riskLevel").textContent = `위험 ${levelText[project.level]}`;
  document.querySelector("#riskLevel").className = `risk-badge ${project.level}`;
  document.querySelector("#matchConfidence").textContent = `연결 신뢰도 ${Math.round(project.matchConfidence * 100)}%`;

  document.querySelector("#scheduleRisk").textContent = project.risks.schedule;
  document.querySelector("#costRisk").textContent = project.risks.cost;
  document.querySelector("#competitionRisk").textContent = project.risks.competition;
  document.querySelector("#anomalyRisk").textContent = project.risks.anomaly;
  document.querySelector("#performanceRisk").textContent = project.risks.performance;
  document.querySelector("#qualityScore").textContent = `품질 ${project.quality.total}점`;

  renderRoadmap(project);
  renderRiskBars(project);
  renderBrief(project);
  renderKnowhow(project);
  renderQuality(project);
}

function renderRoadmap(project) {
  const roadmap = document.querySelector("#roadmap");
  roadmap.innerHTML = project.roadmap.map((stage, index) => `
    <article class="road-stage">
      <span class="stage-kicker">STEP ${index + 1}</span>
      <h3>${stage.key}</h3>
      <strong>${stage.title}</strong>
      <div class="stage-meta">
        ${stage.meta.map((item) => `<span>${item}</span>`).join("")}
      </div>
      <div class="stage-risk" title="단계 리스크 ${stage.risk}">
        <span style="width:${stage.risk}%; --stage-color:${scoreColor(stage.risk)}"></span>
      </div>
    </article>
  `).join("");
}

function renderRiskBars(project) {
  const bars = document.querySelector("#riskBars");
  bars.innerHTML = project.drivers.map(([name, score, color]) => `
    <div class="risk-row">
      <span class="risk-name">${name}</span>
      <span class="bar-track">
        <span class="bar-fill" style="width:${score}%; --bar-color:${colorMap[color]}"></span>
      </span>
      <strong>${score}</strong>
    </div>
  `).join("");
}

function renderBrief(project) {
  const brief = document.querySelector("#llmBrief");
  brief.innerHTML = project.briefItems.map(([title, body]) => `
    <div class="brief-item">
      <strong>${title}</strong>
      <span>${body}</span>
    </div>
  `).join("");
}

function impactColor(label) {
  if (label === "높음") return "var(--red)";
  if (label === "주의") return "var(--amber)";
  if (label === "관찰") return "var(--blue)";
  return "var(--green)";
}

function renderKnowhow(project) {
  const grid = document.querySelector("#knowhowGrid");
  grid.innerHTML = project.knowhow.map(([name, score, impact, description]) => `
    <article class="knowhow-card">
      <div class="knowhow-head">
        <h3>${name} 관리</h3>
        <span class="impact-pill" style="--impact-color:${impactColor(impact)}">${impact} ${score}</span>
      </div>
      <div class="mini-meter">
        <span style="--value:${score}%; --meter-color:${scoreColor(score)}"></span>
      </div>
      <p>${description}</p>
    </article>
  `).join("");
}

function renderQuality(project) {
  const grid = document.querySelector("#qualityGrid");
  const rows = [
    ["완전성", project.quality.completeness, "필수 날짜·금액·기관 필드 누락률 점검"],
    ["키 일관성", project.quality.keyConsistency, "공고번호·계약번호·판단번호 형식 및 중복 점검"],
    ["명칭 표준화", project.quality.nameStandardization, "품목명·업체명 표기 차이와 접미어 정규화 점검"],
    ["연결률", project.quality.linkage, "조달계획-공고-결과-계약 단계 연결 성공률 점검"]
  ];
  grid.innerHTML = rows.map(([name, score, description]) => `
    <article class="quality-card">
      <div class="quality-ring" style="--q:${score}; --ring-color:${scoreColor(score)}">${score}</div>
      <div>
        <div class="quality-head">
          <h3>${name}</h3>
        </div>
        <p>${description}</p>
      </div>
    </article>
  `).join("");
}

initialize();
