export type DapaNavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type DapaNavGroup = {
  title: string;
  links: DapaNavLink[];
};

export type DapaNavMenu = {
  title: string;
  href: string;
  groups: DapaNavGroup[];
};

const DAPA_HOME = "https://www.dapa.go.kr/dapa/index.do";
const menu = (menuSeq: number) => `${DAPA_HOME}?menuSeq=${menuSeq}`;

export const dapaOfficialNavMenus: DapaNavMenu[] = [
  {
    title: "알림·소식",
    href: `${DAPA_HOME}#mGnb-anchor1`,
    groups: [
      { title: "공지사항", links: [{ label: "공지사항", href: menu(3031) }, { label: "입찰공고", href: menu(3032), external: true }] },
      { title: "보도·설명자료", links: [{ label: "보도자료", href: menu(3069) }, { label: "언론보도설명", href: menu(3070) }] },
      { title: "홍보자료", links: [{ label: "소통활동", href: menu(3073) }, { label: "국정성과", href: menu(4199) }, { label: "국정성과 주요 목록", href: menu(4198) }] },
      { title: "소식지(청아람)", links: [{ label: "구독 신청", href: menu(3671) }, { label: "소식지(청아람)", href: menu(4117) }] }
    ]
  },
  {
    title: "업무·정책",
    href: `${DAPA_HOME}#mGnb-anchor2`,
    groups: [
      { title: "방위사업의 이해", links: [{ label: "국방기술 R&D 사업", href: menu(4086) }] },
      { title: "방위력개선사업", links: [{ label: "기획조정", href: menu(3074) }, { label: "사업관리", href: menu(3075) }, { label: "방위사업정책", href: menu(3076) }] },
      { title: "군수품 조달", links: [{ label: "계약관리", href: menu(3077) }, { label: "신속시범사업", href: menu(3078) }] },
      { title: "방산수출", links: [{ label: "국제협력", href: menu(3079) }, { label: "무기체계개조개발", href: menu(3080) }] },
      { title: "방산육성 및 경쟁력 강화", links: [{ label: "주요정책", href: menu(3081) }, { label: "방위산업진흥", href: menu(3082) }, { label: "방위사업교육", href: menu(3083) }] },
      { title: "국방기술 연구개발 및 보호", links: [{ label: "국방기술보호", href: menu(3084) }] },
      { title: "방위사업 감독 및 감사", links: [{ label: "방위사업 감독", href: menu(3085) }, { label: "방위사업 감사", href: menu(3086) }] },
      { title: "업무자료실", links: [{ label: "업무게시판", href: menu(3042) }, { label: "업무가이드북", href: menu(3043) }, { label: "국방조달공고", href: menu(3044) }] },
      { title: "법령", links: [{ label: "방위사업법령", href: menu(3087) }, { label: "방위사업청 행정규칙", href: menu(3088) }] }
    ]
  },
  {
    title: "정보공개",
    href: `${DAPA_HOME}#mGnb-anchor3`,
    groups: [
      { title: "정보공개안내", links: [{ label: "정보공개제도 안내", href: menu(3089) }, { label: "정보목록", href: menu(3090) }] },
      { title: "공공데이터 개방", links: [{ label: "개방현황", href: menu(3092) }, { label: "수요조사", href: menu(3093) }] },
      { title: "사전정보공개", links: [{ label: "사전정보공개", href: menu(3049) }] },
      { title: "정책실명제", links: [{ label: "정책실명제 사업안내", href: menu(3235) }, { label: "중점관리대상사업목록", href: menu(3236) }] },
      { title: "청렴관련 정보공개", links: [{ label: "자체감사 결과", href: menu(3099) }, { label: "옴부즈만 운영", href: menu(3100) }, { label: "반부패 청렴자료", href: menu(3101) }] },
      { title: "재정정보공개", links: [{ label: "예산정보", href: menu(3103) }, { label: "세입·세출 예산 운용실적", href: menu(3104) }, { label: "세입·세출 예산 사업별 설명자료", href: menu(3105) }, { label: "업무추진비 정보", href: menu(3106) }] },
      { title: "국방규격 정보공개", links: [{ label: "국방규격 정보공개", href: menu(3053) }] },
      { title: "방위산업통계", links: [{ label: "방위산업통계", href: menu(3054) }] },
      { title: "방위사업 자료열람", links: [{ label: "방위사업자료열람 안내", href: menu(3107) }, { label: "'찾아가는방위사업 자료열람' 서비스 안내", href: menu(3108) }] }
    ]
  },
  {
    title: "민원·참여",
    href: `${DAPA_HOME}#mGnb-anchor4`,
    groups: [
      { title: "이용안내", links: [{ label: "민원업무안내", href: menu(3110) }, { label: "법정민원 신청안내", href: menu(3111) }, { label: "정부민원인안내콜센터", href: menu(3112), external: true }, { label: "고객지원센터 안내", href: menu(3112) }] },
      { title: "전자민원 신청", links: [{ label: "전자민원 신청", href: menu(3057), external: true }] },
      { title: "국민참여", links: [{ label: "국민제안", href: menu(3113) }, { label: "국방규격 개선 제안", href: menu(3114) }, { label: "국민생각함", href: menu(3116), external: true }, { label: "방위사업 비정상의 정상화 국민제안", href: menu(4236) }] },
      { title: "적극행정", links: [{ label: "제도소개", href: menu(3118) }, { label: "적극행정 국민참여", href: menu(3119) }, { label: "적극행정 소식", href: menu(3121) }] },
      { title: "신고센터", links: [{ label: "신고센터", href: menu(3060) }] },
      { title: "옴부즈만", links: [{ label: "옴부즈만이란?", href: menu(3122) }, { label: "옴부즈만 소개", href: menu(3123) }, { label: "옴부즈만 민원신청", href: menu(4137) }, { label: "옴부즈만 활동현황", href: menu(3125) }, { label: "자주묻는질문(FAQ)", href: menu(3126) }] },
      { title: "방위산업 상담신청", links: [{ label: "방위산업 통합 상담신청", href: menu(3128) }, { label: "방산 중소기업 지원 안내", href: menu(4170) }, { label: "절충교역 컨설팅", href: menu(4073) }] }
    ]
  },
  {
    title: "방위사업청 소개",
    href: `${DAPA_HOME}#mGnb-anchor5`,
    groups: [
      { title: "기관소개", links: [{ label: "설립목적과 기능", href: menu(3434) }, { label: "연혁", href: menu(3131) }, { label: "MI&캐릭터", href: menu(3132) }] },
      { title: "청·차장소개", links: [{ label: "약력", href: menu(3133) }, { label: "청장인사말", href: menu(3134) }, { label: "역대청장", href: menu(3135) }, { label: "청장과의 대화", href: menu(3136) }] },
      { title: "조직 및 직원안내", links: [{ label: "조직도", href: menu(3137) }, { label: "직원안내", href: menu(3138) }, { label: "찾아오시는길", href: menu(3066) }, { label: "자주묻는질문(FAQ)", href: menu(3067) }] }
    ]
  }
];

export function officialNavSummary() {
  return dapaOfficialNavMenus
    .map((menuItem) => {
      const groups = menuItem.groups.map((group) => `${group.title}: ${group.links.map((link) => link.label).join(", ")}`).join(" / ");
      return `${menuItem.title} - ${groups}`;
    })
    .join("\n");
}

export function findOfficialNavMenu(title: string) {
  return dapaOfficialNavMenus.find((menuItem) => menuItem.title === title);
}
