# Frontend Handoff

This document is the execution contract for improving or outsourcing the DAPA public-data AI frontend.

## Product Intent

The service is a public, no-login entry point for lowering the barrier to DAPA work. It helps small defense companies, prospective public servants, and citizens ask natural-language questions about DAPA public data, procurement, contracts, legal interpretation, terminology, and agency work.

The UI must not imply internal-only access, login, private data search, or final legal judgment. Every answer surface should reinforce data-first interpretation and visible provenance.

## Routes

| Route | Type | Contract |
| --- | --- | --- |
| `/` | Client route | Korean-first landing, AI search form, quick prompts, source panel, result panel, implementation story, force visual sections. |
| `/data-search` | Server route | Dataset provenance dashboard backed by `getInventoryDatasetRows()`, query-string filters, metadata badges, public source links. |
| `/api/chat` | Server API | Receives `{ message, section? }`, returns answer/sources or controlled recoverable errors. Browser must only call this API, never Ollama directly. |

## Visual System

Keep the current dark command-center system. Do not introduce light mode.

| Token | Value | Usage |
| --- | --- | --- |
| `--dapa-canvas` | `#101010` | Page background. |
| `--dapa-canvas-soft` | `#1a1a1a` | Cards and dashboard panels. |
| `--dapa-primary` | `#00d992` | Primary actions, active filter states, data accents. |
| `--dapa-line` | `#3d3a39` | Hairline borders. |
| `--dapa-ink` | `#f2f2f2` | Main foreground text. |
| `--dapa-body` | `#bdbdbd` | Secondary copy. |
| `--font-sans` | `Inter, Malgun Gothic, Segoe UI, Arial, sans-serif` | Korean-first body/UI. |
| `--font-mono` | `SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace` | Labels, telemetry, metadata. |

## Page Contracts

### `/`

Required visible content:

- Heading: `방위사업청 공개데이터를 한 번에 묻고, 근거까지 확인합니다`
- No-login explanation for public access.
- Readiness cards for `로그인 없음`, `데이터 우선`, `인터넷망·폐쇄망`.
- Search input with accessible name `검색어 입력`.
- Source-panel button with accessible name `활용 데이터 보기`.
- Source panel region with accessible name `활용 데이터 안내`.
- Result panel with `aria-live="polite"`.

Behavior:

- Submit sends `POST /api/chat` with `{ message, section }`.
- Quick search buttons must continue to call `submit(button.query, button.section)`.
- Raw chain-of-thought style text must stay stripped by `cleanAnswerText()`.
- Source counts must distinguish `HOMEPAGE`, `FILE`, and `API`.

### `/data-search`

Required visible content:

- Heading: `데이터셋·오픈API 운영 대시보드`.
- Statistics for all rows, FILE rows, API rows, and closed-network-ready rows.
- Filter region with accessible name `데이터 필터`.
- Dataset list region with accessible name `데이터셋 목록`.
- Columns/metadata for type, title, mode, closed-network status, refresh cycle, fallback behavior, public source link.

Behavior:

- Supported query params: `type=all|file|api`, `closed=all|supported|snapshot`.
- Keep data loading server-side via `getInventoryDatasetRows()`.
- Do not expose API keys or runtime env values to the browser.

## QA Selectors and Assertions

Use semantic selectors rather than brittle CSS selectors where possible:

```ts
page.getByRole("heading", { name: "방위사업청 공개데이터를 한 번에 묻고, 근거까지 확인합니다" })
page.getByRole("textbox", { name: "검색어 입력" })
page.getByRole("button", { name: "활용 데이터 보기" })
page.getByRole("region", { name: "활용 데이터 안내" })
page.getByRole("heading", { name: "데이터셋·오픈API 운영 대시보드" })
page.getByRole("region", { name: "데이터 필터" })
page.getByRole("region", { name: "데이터셋 목록" })
```

Required commands before handoff acceptance:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Screenshot Acceptance

Capture at minimum:

- Desktop `/` at 1440 px width.
- Mobile `/` at 390 x 844.
- Desktop `/data-search` at 1440 px width.
- Mobile `/data-search` at 390 x 844.

Acceptance criteria:

- No horizontal overflow on mobile.
- Search form remains visible above the fold on `/`.
- Filter pills and dataset metadata remain readable on `/data-search`.
- Dark canvas remains `#101010` and the primary action keeps sufficient contrast.
- Console has no functional errors. A missing favicon alone is not a release blocker.

## Do Not Change Without Approval

- No login, auth, admin, or private data upload flows.
- No browser calls to Ollama or external API keys.
- No remote fonts, analytics, CDN scripts, or client-exposed secrets.
- No light mode or visual system reset.
- No weakening tests to pass visual changes.
