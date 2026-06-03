"use client";

import { type FormEvent, useMemo, useRef, useState } from "react";
import { dapaHomepageSections } from "@/lib/dapa-homepage-sections";
import { dapaOfficialNavMenus, type DapaNavMenu } from "@/lib/dapa-nav-data";

type Source = {
  type: "FILE" | "API" | "SECTION" | "HOMEPAGE";
  title: string;
  source: string;
  section?: string;
  modified?: string;
  score: number;
};

type ChatResponse = {
  answer?: unknown;
  sources?: unknown;
  message?: unknown;
  error?: unknown;
};

const navItems = [{ title: "AI 통합검색", href: "#ai-search" }, ...dapaOfficialNavMenus] as const;
const searchChips = [
  { label: "방산중소기업 지원", section: "중소기업 지원", query: "방산 중소기업이 확인해야 할 조달, 입찰, 계약 정보를 알려줘" },
  { label: "계약절차", section: "계약절차", query: "방위사업청 계약절차와 조달계획에서 먼저 볼 항목을 알려줘" },
  { label: "기술개발사업", section: "기술개발사업", query: "국방기술 R&D와 기술개발사업 공개 데이터를 요약해줘" },
  { label: "채용정보", section: "군·예비인력", query: "신규 직원과 예비 인력이 방위사업청에서 먼저 볼 메뉴를 알려줘" },
  { label: "국방획득제도", section: "업무·정책", query: "국방획득제도와 방위사업 정책 정보를 어디서 확인할 수 있어?" }
] as const;
const aiRecommendations = [
  { title: "중소기업 지원제도", text: "방산 진출을 위한 맞춤형 지원 제도 안내", query: "방산 중소기업 지원제도와 참여 경로를 알려줘" },
  { title: "사업공고", text: "참여 가능한 사업공고와 입찰 근거 탐색", query: "현재 확인할 수 있는 사업공고와 입찰 정보를 요약해줘" },
  { title: "획득절차 안내", text: "방위사업 진행 절차를 단계별로 안내", query: "방위사업 획득절차를 처음 보는 사람이 이해하게 설명해줘" },
  { title: "규정/지침 검색", text: "관련 법령 및 규정, 지침 근거 검색", query: "방위사업 법령자료와 규정 검색 경로를 알려줘" }
] as const;
const audienceCards = [
  { title: "중소기업 지원", text: "방산기업 진출을 위한 맞춤형 지원 정책과 프로그램을 안내합니다.", action: "바로가기", query: "중소기업 지원 정보를 보여줘" },
  { title: "국민 소통", text: "국민의 목소리를 듣고, 신뢰받는 방위사업을 만들어갑니다.", action: "바로가기", query: "국민 소통과 민원 참여 메뉴를 알려줘" },
  { title: "군·예비인력", text: "군인 및 예비 공무원을 위한 정보와 커리어 가이드를 제공합니다.", action: "바로가기", query: "군 예비인력과 신규 직원에게 필요한 정보를 알려줘" }
] as const;
const notices = [
  { title: "체계지원분석 담당자를 위한 KSP 사용자 교육 모집 공고", date: "2026.06.01" },
  { title: "’27~’31년 무기체계 개조개발 지원 소요조사 공고", date: "2026.05.28" },
  { title: "'26-1차 신속시범사업 예비 사업설명회 공고", date: "2026.05.27" },
  { title: "무기체계 연구개발사업 입찰공고(AFCCS 경미한 성능개량)", date: "2026.06.02" }
] as const;
const quickServices = ["사업공고", "입찰/계약정보", "민원신청", "규정/지침", "보도자료", "청렴신고"] as const;
const homepageSearchSections = dapaHomepageSections.map((section) => ({
  title: section.title,
  subtitle: section.subtitle,
  query: `${section.title} 공식 홈페이지에 있는 내용을 알려줘`,
  items: section.items.slice(0, 4)
}));
const sourceGroups = [
  { title: "홈페이지 공개 정보", items: ["주요 서비스", "자주 찾는 메뉴", "열린 청장실", "알림/소식", "SNS", "국정성과"] },
  { title: "파일 데이터", items: ["국내조달 조달계획", "국내조달 계약정보", "경쟁 입찰결과", "방산업체 지정현황"] },
  { title: "공공 API", items: ["공공데이터 인벤토리", "법령정보 API", "원문 링크", "스냅샷 fallback"] }
] as const;

function sourceTypeLabel(type: Source["type"]) {
  if (type === "FILE") return "데이터셋";
  if (type === "API") return "공공 API";
  if (type === "HOMEPAGE") return "공식 홈페이지";
  return "공개 섹션";
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [section, setSection] = useState("");
  const [activeMenu, setActiveMenu] = useState<DapaNavMenu | null>(dapaOfficialNavMenus[0] ?? null);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSources, setShowSources] = useState(false);
  const requestIdRef = useRef(0);
  const sourceSummary = useMemo(() => ({
    homepage: sources.filter((source) => source.type === "HOMEPAGE").length,
    file: sources.filter((source) => source.type === "FILE").length,
    api: sources.filter((source) => source.type === "API").length
  }), [sources]);

  async function submit(nextMessage = message, nextSection = section) {
    const trimmed = nextMessage.trim();
    if (!trimmed) return;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setMessage(trimmed);
    setSection(nextSection);
    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: trimmed, section: nextSection })
      });
      const data = (await response.json()) as ChatResponse;
      if (requestId !== requestIdRef.current) return;
      if (!response.ok) {
        const messageText = typeof data.message === "string" ? data.message : data.error;
        throw new Error(typeof messageText === "string" ? messageText : "응답 생성에 실패했습니다.");
      }
      if (typeof data.answer !== "string") throw new Error("응답 형식이 올바르지 않습니다.");
      setAnswer(data.answer);
      setSources(Array.isArray(data.sources) ? (data.sources as Source[]) : []);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submit();
  }

  return (
    <main className="aiPortalShell">
      <header className="dapaHeader">
        <div className="topHeader">
          <a className="brand" href="https://www.dapa.go.kr/dapa/index.do" target="_blank" rel="noreferrer">
            <img src="/dapa-logo-combo.svg" alt="방위사업청" />
            <span>국민이 주인인 나라,<br />함께 행복한 대한민국</span>
          </a>
          <div className="utilities" aria-label="상단 유틸리티">
            <button type="button">Language</button><span>화면크기</span><button type="button">-</button><button type="button">+</button><a href="#login">로그인</a><a href="#join">회원가입</a>
          </div>
        </div>
        <nav className="mainNav" aria-label="주요 메뉴">
          {navItems.map((item) => {
            if (item.title === "AI 통합검색") return <a key={item.title} href={item.href}>{item.title}</a>;
            const officialMenu = item as DapaNavMenu;
            const selected = activeMenu?.title === officialMenu.title;
            return (
              <button
                key={officialMenu.title}
                type="button"
                className={selected ? "active" : ""}
                aria-expanded={selected}
                onMouseEnter={() => setActiveMenu(officialMenu)}
                onFocus={() => setActiveMenu(officialMenu)}
                onClick={() => setActiveMenu(officialMenu)}
              >
                {officialMenu.title}
                <span aria-hidden="true">⌄</span>
              </button>
            );
          })}
        </nav>
        {activeMenu && (
          <section className="officialMegaMenu" aria-label={`${activeMenu.title} 공식 연결 메뉴`}>
            <div className="megaMenuLeft">
              <strong>{activeMenu.title}</strong>
              {activeMenu.groups.map((group, index) => (
                <a key={group.title} href={group.links[0]?.href ?? activeMenu.href} target="_blank" rel="noreferrer">
                  {group.title}
                  <span aria-hidden="true">{index === 0 ? "→" : "›"}</span>
                </a>
              ))}
            </div>
            <div className="megaMenuRight">
              {activeMenu.groups.map((group) => (
                <article key={group.title}>
                  <h2>{group.title}</h2>
                  <ul>
                    {group.links.map((link) => (
                      <li key={`${group.title}-${link.label}`}>
                        <a href={link.href} target="_blank" rel="noreferrer">
                          {link.label}
                          {link.external ? <span>새창</span> : null}
                        </a>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        )}
      </header>

      <section className="heroStage" id="ai-search" aria-label="방위사업청 AI 통합검색">
        <div className="skyScene" aria-hidden="true"><span className="bigAircraft" /><span className="smallAircraft" /></div>
        <div className="heroLeft">
          <h1>AI와 함께, 더 스마트한 방위사업청</h1>
          <p>AI가 궁금증을 해결하고, 필요한 정보를 빠르게 찾아드립니다.</p>
          <form className="aiSearchBox" onSubmit={onSubmit}>
            <button className="aiMark" type="button" onClick={() => setShowSources(true)} aria-label="검색 근거 보기">Ai</button>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="궁금한 내용을 자연어로 질문해보세요." aria-label="검색어 입력" />
            <button className="voiceButton" type="button" onClick={() => setShowSources(true)} aria-label="데이터셋 보기">i</button>
            <button className="searchButton" type="submit" disabled={loading}>{loading ? "검색중" : "검색"}</button>
          </form>
          <div className="suggestedSearches" aria-label="추천 검색어">
            <strong>추천 검색어</strong>
            {searchChips.map((chip) => <button key={chip.label} type="button" disabled={loading} onClick={() => void submit(chip.query, chip.section)}>{chip.label}</button>)}
          </div>
        </div>
        <aside className="aiRecommendationPanel" aria-label="AI 맞춤 추천">
          <div className="panelTitle"><h2>AI 맞춤 추천</h2><button type="button">나의 관심 설정</button></div>
          {aiRecommendations.map((item, index) => (
            <button className="recommendationItem" key={item.title} type="button" disabled={loading} onClick={() => void submit(item.query, item.title)}>
              <span>{index + 1}</span><strong>{item.title}</strong><small>{item.text}</small>
            </button>
          ))}
        </aside>
        <aside className="rightPromos" aria-label="홍보 정보">
          <article className="kDefensePromo"><span>K-방산, 세계로 미래로</span><h2>K-방산</h2><button type="button" onClick={() => void submit("K-방산과 방산수출입 지원 정보를 알려줘", "K-방산")}>자세히 보기</button></article>
          <article className="hirePromo"><h2>신규 직원 채용 안내</h2><p>방위사업청과 함께 국가 안보를 책임질 인재를 찾습니다.</p><button type="button" onClick={() => void submit("신규 직원과 예비 인력이 볼 채용 관련 메뉴를 알려줘", "군·예비인력")}>채용공고 보기</button></article>
        </aside>
      </section>

      {(loading || error || answer) && (
        <section className="answerPanel" aria-live="polite">
          <div><strong>{loading ? "AI가 공개 데이터를 검색하고 있습니다." : "AI 요약 결과"}</strong><span>홈페이지 {sourceSummary.homepage} · FILE {sourceSummary.file} · API {sourceSummary.api}</span></div>
          {error ? <p className="errorText">{error}</p> : <p>{answer}</p>}
          {sources.length > 0 && (
            <ul className="answerSources" aria-label="AI 답변 출처">
              {sources.slice(0, 5).map((source) => (
                <li key={`${source.type}-${source.title}-${source.score}`}>
                  <b>{sourceTypeLabel(source.type)}</b>
                  <span>{source.title}</span>
                  <small>{source.section ? `${source.section} · ` : ""}{source.source}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {showSources && (
        <section className="sourcePanel" aria-label="사용 데이터 안내">
          <div className="sourcePanelHead"><div><strong>사용 중인 검색 근거</strong><p>공식 홈페이지, 공공데이터 파일, API 인벤토리를 함께 참조합니다.</p></div><button type="button" onClick={() => setShowSources(false)}>닫기</button></div>
          <div className="sourceGroups">
            {sourceGroups.map((group) => <article key={group.title}><h2>{group.title}</h2><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}
          </div>
        </section>
      )}

      <section className="lowerGrid" id="official-info" aria-label="방위사업청 공식 정보">
        {audienceCards.map((card) => <article className="audienceCard" key={card.title}><h2>{card.title}</h2><p>{card.text}</p><button type="button" onClick={() => void submit(card.query, card.title)}>{card.action}</button></article>)}
        <article className="noticeCard">
          <div className="cardHead"><h2>공지사항</h2><a href="https://www.dapa.go.kr/dapa/index.do?menuSeq=3031" target="_blank" rel="noreferrer">+</a></div>
          {notices.map((notice) => <button key={notice.title} type="button" onClick={() => void submit(`${notice.title} 내용을 요약해줘`, "공지사항")}><span>{notice.title}</span><time>{notice.date}</time></button>)}
        </article>
        <article className="quickCard">
          <h2>빠른 서비스</h2>
          <div>{quickServices.map((service) => <button key={service} type="button" onClick={() => void submit(`${service} 관련 공개 정보와 원문 경로를 알려줘`, service)}><span aria-hidden="true" />{service}</button>)}</div>
        </article>
      </section>

      <section className="homepageSections" aria-label="공식 홈페이지 섹션 AI 검색">
        <div className="sectionIntro">
          <span>공식 홈페이지 콘텐츠 인덱스</span>
          <h2>홈페이지에 이미 있는 내용도 AI가 바로 찾아드립니다</h2>
          <p>데이터셋/API에 없는 화면 콘텐츠는 Playwright로 수집한 공식 홈페이지 스냅샷을 로컬 인덱스로 저장해 지연 없이 검색합니다.</p>
        </div>
        <div className="homepageSectionGrid">
          {homepageSearchSections.map((section) => (
            <article key={section.title} className="homepageSectionCard">
              <h3>{section.title}</h3>
              <p>{section.subtitle}</p>
              <ul>
                {section.items.map((item) => <li key={item.title}>{item.title}</li>)}
              </ul>
              <button type="button" onClick={() => void submit(section.query, section.title)}>AI로 검색</button>
            </article>
          ))}
        </div>
      </section>

      <footer className="portalFooter"><img src="/dapa-taeguk-symbol.svg" alt="" /><strong>방위사업청</strong><p>우 34060 대전광역시 유성구 태크노9로 24 · 대표전화 1577-1118</p><a href="/data-search">데이터셋/API 운영 현황</a></footer>
    </main>
  );
}
