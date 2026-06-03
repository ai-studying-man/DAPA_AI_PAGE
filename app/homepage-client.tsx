"use client";

import { type FormEvent, useMemo, useRef, useState } from "react";
import { cleanAnswerText, type ChatResponse, isSource, type Source } from "./homepage-chat";
import {
  audienceCards,
  frequentMenus,
  homepageHighlights,
  notices,
  primaryNav,
  quickQueries,
  quickServices,
  recommendationActions,
  sourceGroups
} from "./homepage-content";

export function HomepageClient() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [sources, setSources] = useState<readonly Source[]>([]);
  const requestIdRef = useRef(0);
  const displayAnswer = useMemo(() => cleanAnswerText(answer), [answer]);
  const sourceSummary = useMemo(
    () => ({
      homepage: sources.filter((source) => source.type === "HOMEPAGE").length,
      file: sources.filter((source) => source.type === "FILE").length,
      api: sources.filter((source) => source.type === "API").length
    }),
    [sources]
  );

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
      if (!response.ok || typeof data.answer !== "string") {
        throw new Error("AI 응답을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
      setAnswer(data.answer);
      setSources(Array.isArray(data.sources) ? data.sources.filter(isSource) : []);
    } catch (caughtError) {
      if (requestId !== requestIdRef.current) return;
      const fallback = "AI 응답을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.";
      setError(caughtError instanceof Error && caughtError.message ? caughtError.message : fallback);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  return (
    <main className="landingShell dapaHome">
      <header className="siteHeader">
        <div className="govBanner">이 누리집은 대한민국 공식 전자정부 누리집입니다.</div>
        <div className="topUtilityBar portalContainer">
          <p>국민이 주인인 나라, 함께 행복한 대한민국</p>
          <div className="topUtilityLinks" aria-label="상단 유틸리티">
            <a href="https://www.dapa.go.kr/dapaen/index.do" rel="noreferrer" target="_blank">Language</a>
            <a href="#ai-search">화면크기</a>
            <a href="#ai-search">로그인</a>
            <a href="#ai-search">회원가입</a>
          </div>
        </div>
        <div className="logoRow portalContainer">
          <div className="brandLockup">
            <img alt="방위사업청 로고" src="/dapa-logo-combo.svg" />
            <strong>AI 통합검색</strong>
          </div>
          <nav aria-label="주요 메뉴" className="primaryNav">
            {primaryNav.map((item) => <a href={item.href} key={item.label}>{item.label}</a>)}
          </nav>
        </div>
      </header>

      <section aria-label="방위사업청 AI 검색" className="heroSection" id="ai-search">
        <div aria-hidden="true" className="heroSky"><span className="heroAircraft" /></div>
        <div className="portalContainer heroLayout">
          <div className="heroMainColumn">
            <p className="sectionEyebrow">DAPA AI SEARCH</p>
            <h1>AI와 함께, 더 스마트한 방위사업청</h1>
            <p className="heroLead">AI가 궁금증을 해결하고 필요한 정보를 빠르게 찾아드립니다. 공개 홈페이지와 데이터셋을 근거로 주요 서비스, 정책, 공지, 업무 진입점을 한 화면에서 연결합니다.</p>
            <form className="heroSearchBar" onSubmit={handleSubmit}>
              <label className="srOnly" htmlFor="dapa-search-input">AI 검색 질문</label>
              <input id="dapa-search-input" aria-label="AI 검색 질문" onChange={(event) => setMessage(event.target.value)} placeholder="궁금한 내용을 자연어로 질문해보세요." value={message} />
              <button className="secondaryActionButton" onClick={() => setShowSources((current) => !current)} type="button">근거 보기</button>
              <button className="heroSubmitButton" disabled={loading} type="submit">{loading ? "검색 중" : "AI 검색"}</button>
            </form>
            <div aria-label="추천 검색어" className="heroChipRow">
              {quickQueries.map((item) => <button disabled={loading} key={item.label} onClick={() => void submit(item.query, item.section)} type="button">{item.label}</button>)}
            </div>
            {(loading || error || answer) && (
              <section aria-live="polite" className="searchResultPanel">
                <div className="resultSummaryRow">
                  <strong>{loading ? "AI가 검색 근거를 정리하고 있습니다." : "AI 검색 결과"}</strong>
                  <span>홈페이지 {sourceSummary.homepage}건 · 파일 {sourceSummary.file}건 · API {sourceSummary.api}건</span>
                </div>
                <p className={error ? "errorText" : "answerText"}>{error || displayAnswer}</p>
              </section>
            )}
            {showSources && (
              <section aria-label="검색 근거 안내" className="sourceReferencePanel">
                <div className="sourcePanelHeader">
                  <div><strong>검색 근거 안내</strong><p>홈페이지 공개 정보, 파일데이터, 오픈API 표면을 기준으로 검색 범위를 설명합니다.</p></div>
                  <button onClick={() => setShowSources(false)} type="button">닫기</button>
                </div>
                <div className="sourceGroupGrid">
                  {sourceGroups.map((group) => <article key={group.title}><h2>{group.title}</h2><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}
                </div>
              </section>
            )}
            <section aria-label="AI 추천 브리핑" className="overviewPanel">
              <div><p className="sectionEyebrow contrastEyebrow">{homepageHighlights[0].eyebrow}</p><h2>{homepageHighlights[0].title}</h2><p>{homepageHighlights[0].text}</p></div>
              <div className="overviewActionRow">{recommendationActions.map((label) => <button disabled={loading} key={label} onClick={() => void submit(`${label} 관련 공개 정보를 요약해 주세요.`, label)} type="button">{label}</button>)}</div>
            </section>
          </div>

          <aside className="heroAsideColumn">
            {homepageHighlights.slice(1).map((item, index) => (
              <article className={`asideActionCard ${index === 0 ? "accentCard" : ""}`} id={index === 1 ? "employment" : undefined} key={item.title}>
                <p className="sectionEyebrow">{item.eyebrow}</p>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
                <button disabled={loading} onClick={() => void submit(`${item.eyebrow} 관련 주요 정보를 정리해 주세요.`, item.eyebrow)} type="button">{item.eyebrow} 보기</button>
              </article>
            ))}
          </aside>
        </div>
      </section>

      <section className="portalContainer audienceSection" id="policy">
        <div className="sectionHeading"><p className="sectionEyebrow">PUBLIC USER FLOWS</p><h2>중소기업, 국민, 군·예비인력 관점으로 자주 찾는 흐름을 정리했습니다.</h2></div>
        <div className="audienceCardGrid">{audienceCards.map((card) => <article className="audienceCard" key={card.title}><p className="sectionEyebrow">{card.eyebrow}</p><h3>{card.title}</h3><p>{card.text}</p></article>)}</div>
      </section>

      <section className="portalContainer noticeSection" id="notices">
        <div className="sectionHeading"><p className="sectionEyebrow">NOTICE & NEWS</p><h2>최신 공지와 설명회, 입찰 소식을 첫 화면에서 확인합니다.</h2></div>
        <div className="noticeGrid">{notices.map((notice) => <article className="noticeCard" key={notice.title}><span>{notice.category}</span><h3>{notice.title}</h3><p>{notice.date}</p></article>)}</div>
      </section>

      <section className="portalContainer quickServiceSection">
        <div className="sectionHeading"><p className="sectionEyebrow">QUICK SERVICES</p><h2>주요 서비스를 바로 찾아 이동할 수 있습니다.</h2></div>
        <div className="quickServiceGrid">{quickServices.map((service) => <a className="quickServiceLink" href="#ai-search" key={service}>{service}</a>)}</div>
      </section>

      <section className="portalContainer frequentMenuSection" id="citizen-services">
        <div className="sectionHeading"><p className="sectionEyebrow">FREQUENT MENUS</p><h2>자주 찾는 메뉴를 AI 질문 흐름에 맞춰 묶었습니다.</h2></div>
        <div className="frequentMenuGrid">{frequentMenus.map((menu) => <button disabled={loading} key={menu} onClick={() => void submit(`${menu} 메뉴에서 확인할 수 있는 정보를 알려주세요.`, menu)} type="button">{menu}</button>)}</div>
      </section>

      <footer className="footerBand">
        <div className="portalContainer footerInner">
          <div><strong>방위사업청 AI 통합검색</strong><p>공개 홈페이지와 공공데이터를 기반으로 주요 서비스, 공지, 정책 메뉴를 근거와 함께 탐색합니다.</p></div>
          <p>국민이 주인인 나라, 함께 행복한 대한민국</p>
        </div>
      </footer>
    </main>
  );
}
