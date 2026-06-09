"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { isSource, modelLabel, sourceTypeLabel, type ChatResponse, type Source } from "@/lib/chat-response-view";

type ChatMessage = {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly sources: readonly Source[];
  readonly model: string;
  readonly status: "pending" | "done" | "error";
};

const promptChips = [
  { label: "방산기업 진입 절차", question: "방산기업 진입 절차를 알려줘", section: "중소기업 지원" },
  { label: "최근 입찰공고", question: "현재 확인할 수 있는 사업공고와 입찰 정보를 요약해줘", section: "사업공고" },
  { label: "방산수출 지원사업", question: "방산수출 지원사업이 있나요?", section: "K-방산" },
  { label: "방위사업청 조직", question: "방위사업청 조직은 어떻게 구성되어 있나요?", section: "방위사업청 소개" }
] as const;

const stackItems = ["Playwright 홈페이지 수집", "Lang RAG 검색", "BM25 + Vector Hybrid", "Qdrant dapa_knowledge", "Graph RAG 확장 준비"] as const;

function messageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sourceSummary(sources: readonly Source[]) {
  return {
    homepage: sources.filter((source) => source.type === "HOMEPAGE").length,
    file: sources.filter((source) => source.type === "FILE").length,
    api: sources.filter((source) => source.type === "API").length
  };
}

function latestSources(messages: readonly ChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const sources = messages[index]?.sources;
    if (sources && sources.length > 0) return sources;
  }
  return [];
}

export function AiSearchClient() {
  const [input, setInput] = useState("");
  const [section, setSection] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const bootstrapped = useRef(false);
  const latestAssistantId = useRef("");

  const activeSources = useMemo(() => latestSources(messages), [messages]);
  const counts = sourceSummary(activeSources);

  async function ask(question: string, nextSection = section) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userId = messageId("user");
    const assistantId = messageId("assistant");
    latestAssistantId.current = assistantId;
    setInput("");
    setSection(nextSection);
    setLoading(true);
    setMessages((current) => [
      ...current,
      { id: userId, role: "user", content: trimmed, sources: [], model: "", status: "done" },
      { id: assistantId, role: "assistant", content: "답변 생성 중", sources: [], model: "", status: "pending" }
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: trimmed, section: nextSection })
      });
      const data = (await response.json()) as ChatResponse;
      if (assistantId !== latestAssistantId.current) return;
      if (!response.ok) {
        const messageText = typeof data.message === "string" ? data.message : data.error;
        throw new Error(typeof messageText === "string" ? messageText : "응답 생성에 실패했습니다.");
      }
      if (typeof data.answer !== "string") throw new Error("응답 형식이 올바르지 않습니다.");
      const answer = data.answer;
      const sources = Array.isArray(data.sources) ? data.sources.filter(isSource) : [];
      setMessages((current) => current.map((message) => (
        message.id === assistantId
          ? { ...message, content: answer, sources, model: modelLabel(data.model), status: "done" }
          : message
      )));
    } catch (err) {
      if (assistantId !== latestAssistantId.current) return;
      setMessages((current) => current.map((message) => (
        message.id === assistantId
          ? { ...message, content: err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.", status: "error" }
          : message
      )));
    } finally {
      if (assistantId === latestAssistantId.current) setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") ?? "";
    const initialSection = params.get("section") ?? "";
    if (initialSection) setSection(initialSection);
    if (query) void ask(query, initialSection);
  }, []);

  return (
    <main className="aiSearchPortal" aria-label="방위사업청 생성형 AI 포털">
      <header className="aiSearchTop">
        <a className="aiSearchBrand" href="/" aria-label="방위사업청 홈페이지로 이동">
          <img src="/dapa-logo-combo.svg" alt="방위사업청" />
          <span>생성형 AI 통합검색</span>
        </a>
        <nav aria-label="AI 포털 이동">
          <a href="/">홈페이지</a>
          <a href="/data-search">데이터셋/API</a>
          <a href="https://www.dapa.go.kr/dapa/index.do" target="_blank" rel="noreferrer">공식 사이트</a>
        </nav>
      </header>

      <section className="aiSearchLayout">
        <aside className="aiContextRail" aria-label="RAG 검색 구성">
          <span className="portalEyebrow">DAPA RAG MVP</span>
          <h1>방위사업청 AI 검색</h1>
          <p>홈페이지 문서, 수집 스냅샷, 공개 데이터셋을 검색해 근거가 있는 답변만 제공합니다.</p>
          <div className="ragStatusCard">
            <strong>응답 모델</strong>
            <span>ollama · qwen3.5:4b · fallback</span>
          </div>
          <ul className="ragStackList">
            {stackItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </aside>

        <section className="aiChatSurface" aria-label="AI 챗봇">
          <div className="aiChatHeader">
            <div>
              <span>AI 검색 대화</span>
              <h2>원하는 정보를 자연어로 질문하세요</h2>
            </div>
            <p>홈페이지 {counts.homepage} · FILE {counts.file} · API {counts.api}</p>
          </div>

          <div className="portalPromptGrid" aria-label="추천 질문">
            {promptChips.map((chip) => (
              <button key={chip.label} type="button" disabled={loading} onClick={() => void ask(chip.question, chip.section)}>
                {chip.label}
              </button>
            ))}
          </div>

          <div className="aiConversation" role="log" aria-label="AI 대화 내용" aria-live="polite">
            {messages.length === 0 ? (
              <div className="emptyConversation">
                <strong>무엇을 도와드릴까요?</strong>
                <p>예: 최근 입찰공고, 방산기업 진입 절차, 방산수출 지원사업, 조직 구성</p>
              </div>
            ) : messages.map((message) => (
              <article className={`aiMessage ${message.role} ${message.status}`} key={message.id}>
                <span>{message.role === "user" ? "사용자 질문" : "AI 답변"}</span>
                {message.status === "pending" ? (
                  <p className="typingLine">답변 생성 중<span className="typingDots" aria-hidden="true"><i /><i /><i /></span></p>
                ) : (
                  <p>{message.content}</p>
                )}
                {message.model ? <small>사용 모델: {message.model}</small> : null}
                {message.sources.length > 0 ? (
                  <ul className="inlineSourceList" aria-label="AI 답변 출처">
                    {message.sources.slice(0, 3).map((source) => (
                      <li key={`${message.id}-${source.type}-${source.title}`}>
                        <a href={source.sourceUrl ?? source.source} target="_blank" rel="noreferrer">
                          {source.title}
                        </a>
                        <span>{sourceTypeLabel(source.type)}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>

          <form className="aiComposer" onSubmit={submit}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="무엇이든 물어보세요" aria-label="AI 챗봇 질문" />
            <button type="submit" disabled={loading || !input.trim()}>{loading ? "생성 중" : "질문하기"}</button>
          </form>
        </section>

        <aside className="aiEvidencePanel" aria-label="답변 근거 링크">
          <div>
            <span>근거 문서</span>
            <strong>클릭 가능한 출처</strong>
          </div>
          {activeSources.length === 0 ? (
            <p>답변이 생성되면 공식 홈페이지, 데이터셋, API 근거가 여기에 표시됩니다.</p>
          ) : (
            <ul className="aiSourceList">
              {activeSources.map((source) => (
                <li key={`${source.type}-${source.title}-${source.source}`}>
                  <b>{sourceTypeLabel(source.type)}</b>
                  <a href={source.sourceUrl ?? source.source} target="_blank" rel="noreferrer">{source.title}</a>
                  <small>{source.section ?? source.modified ?? source.source}</small>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </main>
  );
}
