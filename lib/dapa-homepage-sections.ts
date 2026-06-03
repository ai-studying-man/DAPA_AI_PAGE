export type DapaHomepageItem = {
  title: string;
  description?: string;
  href?: string;
  date?: string;
  sourceLabel: string;
};

export type DapaHomepageSection = {
  id: string;
  title: string;
  subtitle: string;
  source: string;
  items: DapaHomepageItem[];
};

const DAPA_HOME = "https://www.dapa.go.kr/dapa/index.do";
const menu = (menuSeq: number) => `${DAPA_HOME}?menuSeq=${menuSeq}`;

export const dapaHomepageSections: DapaHomepageSection[] = [
  {
    id: "major-services",
    title: "주요 서비스",
    subtitle: "방위사업청 공식 홈페이지의 업무 주요 서비스를 바로 찾을 수 있습니다.",
    source: `${DAPA_HOME} 주요 서비스 영역`,
    items: [
      { title: "국방전자 조달시스템", description: "국방 조달·입찰 업무 진입점", sourceLabel: "공식 홈페이지 주요 서비스" },
      { title: "국방 규격정보", description: "국방 규격과 표준 정보 확인", sourceLabel: "공식 홈페이지 주요 서비스" },
      { title: "국방통합 원가시스템", description: "원가 관련 업무 시스템", sourceLabel: "공식 홈페이지 주요 서비스" },
      { title: "체계지원 분석시스템", description: "체계지원 분석 업무", sourceLabel: "공식 홈페이지 주요 서비스" },
      { title: "방산수출입 지원시스템", description: "방산 수출입 지원 업무", sourceLabel: "공식 홈페이지 주요 서비스" },
      { title: "방위사업 협업체계", description: "방위사업 협업 업무", sourceLabel: "공식 홈페이지 주요 서비스" },
      { title: "신원조사 서류제출", description: "신원조사 제출 업무", sourceLabel: "공식 홈페이지 주요 서비스" },
      { title: "국방연구 & 개발참여", description: "국방 연구개발 참여 정보", sourceLabel: "공식 홈페이지 주요 서비스" }
    ]
  },
  {
    id: "frequent-menu",
    title: "자주 찾는 메뉴",
    subtitle: "공식 홈페이지에서 자주 사용하는 메뉴를 모은 영역입니다.",
    source: `${DAPA_HOME} 자주 찾는 메뉴 영역`,
    items: [
      { title: "방위사업 법령자료", href: menu(3087), sourceLabel: "공식 홈페이지 자주 찾는 메뉴" },
      { title: "주요정책정보", href: menu(3081), sourceLabel: "공식 홈페이지 자주 찾는 메뉴" },
      { title: "자체감사 결과", href: menu(3099), sourceLabel: "공식 홈페이지 자주 찾는 메뉴" },
      { title: "예산정보", href: menu(3103), sourceLabel: "공식 홈페이지 자주 찾는 메뉴" },
      { title: "반부패 청렴자료", href: menu(3101), sourceLabel: "공식 홈페이지 자주 찾는 메뉴" },
      { title: "정보공개", href: `${DAPA_HOME}#mGnb-anchor3`, sourceLabel: "공식 홈페이지 자주 찾는 메뉴" },
      { title: "부서 및 직원 안내", href: menu(3138), sourceLabel: "공식 홈페이지 자주 찾는 메뉴" },
      { title: "옴부즈만", href: menu(3123), sourceLabel: "공식 홈페이지 자주 찾는 메뉴" }
    ]
  },
  {
    id: "open-chief",
    title: "열린 청장실",
    subtitle: "국민에게 신뢰받는 방위사업청을 표방하는 청장실 영역입니다.",
    source: `${DAPA_HOME} 열린 청장실 영역`,
    items: [
      { title: "청장 인사말", description: "국방혁신과 공정·상생을 통해 K-방산의 지속 성장을 이끌겠습니다.", href: menu(3134), sourceLabel: "공식 홈페이지 열린 청장실" },
      { title: "역대청장", href: menu(3135), sourceLabel: "공식 홈페이지 열린 청장실" },
      { title: "청장과의 대화", href: menu(3136), sourceLabel: "공식 홈페이지 열린 청장실" },
      { title: "방위사업청장-인도 국방장관 방산협력 논의", date: "2026.05.20", sourceLabel: "공식 홈페이지 열린 청장실 활동" },
      { title: "방위사업청 직원 자녀초청 행사", date: "2026.05.13", sourceLabel: "공식 홈페이지 열린 청장실 활동" },
      { title: "제2차 한-나토 방산협의체 개최", date: "2026.05.11", sourceLabel: "공식 홈페이지 열린 청장실 활동" }
    ]
  },
  {
    id: "news",
    title: "알림/소식",
    subtitle: "공지사항, 보도자료, 언론보도 설명, 사업설명회, 입찰공고, 소식지 정보를 제공합니다.",
    source: `${DAPA_HOME} 알림/소식 영역`,
    items: [
      { title: "[제2회 방위산업의날] 방위산업 현장 시민참여 모집 안내", date: "2026.05.22", href: menu(3031), sourceLabel: "공식 홈페이지 공지사항" },
      { title: "26-2차 무기체계 부품국산화개발 지원사업 연구개발기관 모집 재공고", date: "2026.05.21", href: menu(3031), sourceLabel: "공식 홈페이지 공지사항" },
      { title: "제2차 방위사업청 임기제공무원 서류전형 합격자 및 면접시험 일정 공고", date: "2026.05.20", href: menu(3031), sourceLabel: "공식 홈페이지 인사/채용" },
      { title: "방위사업청 기간제근로자 채용 공고", date: "2026.05.22", href: menu(3031), sourceLabel: "공식 홈페이지 인사/채용" }
    ]
  },
  {
    id: "sns",
    title: "방위사업청 SNS",
    subtitle: "유튜브, 페이스북, 블로그, 인스타그램 등 공식 SNS 콘텐츠 영역입니다.",
    source: `${DAPA_HOME} SNS 영역`,
    items: [
      { title: "세계가 주목하는 K-방산, 이제 시민이 직접 체험합니다!", sourceLabel: "공식 홈페이지 SNS" },
      { title: "방위사업청에 나타난 귀요미들", sourceLabel: "공식 홈페이지 SNS" },
      { title: "제2회 방위산업의 날 방위산업 현장 시민참여", sourceLabel: "공식 홈페이지 SNS" },
      { title: "방위사업청 직원 자녀 초청 행사 공개", sourceLabel: "공식 홈페이지 SNS" }
    ]
  },
  {
    id: "performance",
    title: "국정성과",
    subtitle: "방위사업청의 국정성과와 주요 방산 성과를 보여주는 영역입니다.",
    source: `${DAPA_HOME} 국정성과 영역`,
    items: [
      { title: "[방사청-25-007] 폴란드 K2 전차 2차 수출 계약", href: menu(4199), sourceLabel: "공식 홈페이지 국정성과" },
      { title: "[방사청-25-006] 2025년 방위사업 방방톡톡 상생 워크숍 개최", href: menu(4199), sourceLabel: "공식 홈페이지 국정성과" },
      { title: "[방사청-26-001] 방위력개선사업 및 방산육성지원 통합설명회 개최", href: menu(4199), sourceLabel: "공식 홈페이지 국정성과" },
      { title: "[방사청-25-015] 제4기 방산혁신기업 100 선정", href: menu(4199), sourceLabel: "공식 홈페이지 국정성과" },
      { title: "[방사청-25-014] 브라질/말레이시아 방산협력 양해각서(MOU) 체결", href: menu(4199), sourceLabel: "공식 홈페이지 국정성과" },
      { title: "[방사청-25-008] 다산정약용함 진수식 개최", href: menu(4199), sourceLabel: "공식 홈페이지 국정성과" }
    ]
  },
  {
    id: "education",
    title: "방위사업교육원",
    subtitle: "방위사업의 혁신을 이끄는 전문교육기관 안내 영역입니다.",
    source: `${DAPA_HOME} 방위사업교육원 영역`,
    items: [
      { title: "최고의 방위사업 전문교육 기관", description: "방위사업의 혁신을 이끄는 최고의 전문교육기관이 되겠습니다.", sourceLabel: "공식 홈페이지 방위사업교육원" },
      { title: "알림판", description: "교육원 관련 알림판 콘텐츠", sourceLabel: "공식 홈페이지 방위사업교육원" }
    ]
  }
];

export function findHomepageSection(query: string) {
  return dapaHomepageSections.find((section) => query.includes(section.title) || section.items.some((item) => query.includes(item.title)));
}

export function homepageSectionSummary() {
  return dapaHomepageSections
    .map((section) => `${section.title}: ${section.items.map((item) => item.title).join(", ")}`)
    .join("\n");
}
