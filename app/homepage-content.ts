export type QuickQuery = {
  readonly label: string;
  readonly section: string;
  readonly query: string;
};

export type LabelCard = {
  readonly eyebrow: string;
  readonly title: string;
  readonly text: string;
};

export type NoticeItem = {
  readonly category: string;
  readonly title: string;
  readonly date: string;
};

export const primaryNav = [
  { label: "AI 통합검색", href: "#ai-search" },
  { label: "알림·소식", href: "#notices" },
  { label: "업무·정책", href: "#policy" },
  { label: "정보공개", href: "#citizen-services" },
  { label: "민원·참여", href: "#citizen-services" },
  { label: "방위사업청 소개", href: "#employment" }
] as const;

export const quickQueries: readonly QuickQuery[] = [
  { label: "방산중소기업 지원", section: "중소기업 지원", query: "방산중소기업 지원 제도와 상담 창구를 알려주세요." },
  { label: "계약절차", section: "업무·정책", query: "방위사업청 계약절차와 입찰 준비 순서를 알려주세요." },
  { label: "기술개발사업", section: "기술개발사업", query: "기술개발사업과 연구개발 예산 정보를 알려주세요." },
  { label: "채용정보", section: "채용정보", query: "방위사업청 채용정보와 신규 직원이 먼저 볼 메뉴를 알려주세요." },
  { label: "국방획득제도", section: "국방획득제도", query: "국방획득제도와 방위사업 법령 자료를 알려주세요." }
] as const;

export const sourceGroups = [
  { title: "홈페이지 공개 정보", items: ["주요 서비스", "자주 찾는 메뉴", "알림·소식", "정보공개", "민원·참여"] },
  { title: "파일데이터", items: ["국내조달 경쟁 입찰결과", "국내조달 계약정보", "방산업체 지정현황", "국방통합 용어사전"] },
  { title: "오픈API", items: ["입찰공고 API", "계약정보 API", "법령 해석용 공개 API", "대국민 공개 서비스 API"] }
] as const;

export const recommendationActions = [
  "중소기업 지원제도",
  "입찰·계약 일정",
  "공개 데이터 근거",
  "법령·규정 찾기"
] as const;

export const audienceCards: readonly LabelCard[] = [
  {
    eyebrow: "중소기업 지원",
    title: "사업 참여 기회와 조달 흐름을 한곳에서 확인합니다.",
    text: "입찰공고, 계약정보, 방산수출입 지원, 협업체계를 연결해 중소기업 관점의 첫 진입 경로를 정리했습니다."
  },
  {
    eyebrow: "국민 소통",
    title: "공지, 보도자료, 정보공개, 민원 참여를 빠르게 찾습니다.",
    text: "대국민 대표 메뉴를 검색 흐름에 맞게 묶어 필요한 공개 정보와 참여 창구를 짧은 동선으로 제공합니다."
  },
  {
    eyebrow: "군·예비인력",
    title: "획득제도와 업무자료를 현장 언어에 맞춰 찾아봅니다.",
    text: "군수품 조달, 방위력개선사업, 규정과 용어 자료를 함께 보여줘 실무 확인 속도를 높입니다."
  }
] as const;

export const quickServices = [
  "국방전자조달시스템",
  "국방규격정보",
  "국방통합원가시스템",
  "체계지원분석시스템",
  "방산수출입지원시스템",
  "방위사업협업체계",
  "신원조사 서류제출",
  "국방연구 & 개발참여"
] as const;

export const frequentMenus = [
  "방위사업 법령자료",
  "주요정책정보",
  "자체감사 결과",
  "예산정보",
  "반부패 청렴자료",
  "정보공개",
  "부서 및 직원 안내",
  "옴부즈만"
] as const;

export const notices: readonly NoticeItem[] = [
  { category: "공지사항", title: "체계지원분석 담당자를 위한 KSP 사용자 교육 모집 공고", date: "2026.06.02" },
  { category: "사업설명회", title: "’27~’31년 무기체계 개조개발 지원 소요조사 공고", date: "2026.06.01" },
  { category: "입찰공고", title: "'26-1차 신속시범사업 예비 사업설명회 공고", date: "2026.05.31" },
  { category: "보도자료", title: "무기체계 연구개발사업 입찰공고(공군전술C4I체계(AFCCS) 경미한 성능개량)", date: "2026.05.30" }
] as const;

export const homepageHighlights: readonly LabelCard[] = [
  {
    eyebrow: "AI 추천 브리핑",
    title: "오늘 가장 많이 찾는 방위사업 검색 경로",
    text: "중소기업 지원, 계약절차, 기술개발사업, 공개 공지 흐름을 AI가 먼저 묶어서 보여드립니다."
  },
  {
    eyebrow: "K-방산",
    title: "해외 진출과 협업체계 진입점을 빠르게 연결합니다.",
    text: "방산수출입지원시스템과 방위사업협업체계, 조달 시스템 바로가기를 한 번에 정리했습니다."
  },
  {
    eyebrow: "채용·온보딩",
    title: "신규 직원이 먼저 볼 메뉴와 교육 흐름을 정리합니다.",
    text: "방위사업청 소개, 업무·정책, 조직·직원 안내, 교육원 경로를 첫 화면에서 찾을 수 있습니다."
  }
] as const;
