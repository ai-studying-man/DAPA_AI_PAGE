# Deployment Guide

This service is a Next.js App Router application with three runtime surfaces:

- `/` public Korean-first story and AI search experience
- `/data-search` dataset and OpenAPI provenance dashboard
- `/api/chat` server-side RAG/LLM API boundary

Ollama must never be called directly from the browser. Public deployments either connect the Next.js backend to a private Ollama host or run with controlled LLM-disabled fallback behavior.

## Required Checks

Run before any release:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Optional browser verification, when a server is running:

```powershell
npm run test:e2e
npm run agent:test
```

## Environment Variables

Use `.env.example` as the source of truth.

| Variable | Secret | Profiles | Purpose |
| --- | --- | --- | --- |
| `DEPLOYMENT_PROFILE` | No | all | `local`, `public-cloud`, `institution`, or `closed` |
| `OLLAMA_BASE_URL` | No, but server-only | local, institution, closed | Private Ollama endpoint |
| `OLLAMA_MODEL` | No | all | Configurable model tag; verify on target host |
| `OLLAMA_TIMEOUT_MS` | No | all | Server-side inference timeout |
| `OLLAMA_ENABLED` | No | all | Disable LLM when inference host is unavailable |
| `OLLAMA_NO_CLOUD` | No | closed | Disables cloud behavior in closed-network profile |
| `LAW_OPEN_API_OC` | Yes | public-cloud, institution | Law.go.kr OC key |
| `PUBLIC_DATA_API_KEY` | Yes | public-cloud, institution | Public data portal API key |
| `PLAYWRIGHT_BASE_URL` | No | verification | E2E target URL |

Never prefix API keys or Ollama host settings with `NEXT_PUBLIC_`.

## Profile 1: Local Development

Use this profile for developer iteration.

```powershell
copy .env.example .env.local
npm ci
npm run dev
```

Default URL:

```text
http://127.0.0.1:3000
```

Local Ollama default:

```text
http://127.0.0.1:11434
```

Health checks:

```powershell
Invoke-WebRequest http://127.0.0.1:3000/ -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:3000/data-search -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:11434/api/version -UseBasicParsing
```

## Profile 2: Public Cloud / Vercel or Netlify Style

Use this profile for a public internet service with managed frontend hosting.

Build command:

```powershell
npm ci
npm run build
```

Required deployment settings:

```text
DEPLOYMENT_PROFILE=public-cloud
OLLAMA_ENABLED=false
```

If LLM responses are required, use a separate private inference host reachable only by the backend. Do not expose Ollama port `11434` to the public internet.

Notes:

- Typical serverless runtimes cannot run local Ollama inside the Next.js function.
- Static datasets can ship with the app, but large CSV tracing must be scoped before production release.
- External API calls must use server-side env variables only.
- If inference is disabled, `/api/chat` must return controlled degraded messaging rather than raw errors.

## Profile 3: Public Institution Infrastructure

Use this profile for DAPA or institution-hosted internet infrastructure.

Expected topology:

```text
Browser -> HTTPS reverse proxy -> Next.js Node runtime -> private Ollama / external APIs / static datasets
```

Runtime command after build:

```powershell
$env:HOSTNAME="0.0.0.0"
$env:PORT="3000"
npm run start
```

Reverse proxy must provide:

- TLS certificate for the DAPA subdomain
- HTTP to HTTPS redirect
- Request body size limits
- Access logs without prompt secrets
- Health route checks for `/`, `/data-search`, and `/api/chat` smoke behavior

Ollama host must be private-network only. Backend checks should use:

```text
GET /api/version
GET /api/ps
GET /api/tags
```

## Profile 4: Closed-Network / Offline

Use this profile when runtime outbound internet is unavailable.

Required deployment settings:

```text
DEPLOYMENT_PROFILE=closed
OLLAMA_NO_CLOUD=true
LAW_OPEN_API_OC=
PUBLIC_DATA_API_KEY=
```

Closed mode must use:

- Local static dataset snapshots
- Local Ollama model store
- Local fonts/assets only
- No Google Fonts, CDN scripts, hosted analytics, or external API calls at runtime
- Snapshot or disabled-state messaging for law.go.kr/data.go.kr features

See `CLOSED_NETWORK.md` for the full runbook.

## DNS and Subdomain Checklist

- Confirm subdomain owner under the existing DAPA domain.
- Confirm DNS record target for hosting platform or reverse proxy.
- Issue TLS certificate before public launch.
- Verify `/`, `/data-search`, and `/api/chat` behind the final hostname.
- Confirm no secrets appear in browser source, network responses, or client bundles.

## Known Current Release Gaps

- `package.json` currently binds dev/start to `127.0.0.1`; institution deployment should override host/port or update scripts.
- Next build currently warns that dynamic filesystem reads may trace the whole project. Scope dataset reads to a dedicated data directory before final release.
- LLM and external API failure modes need the planned hardening tasks before public operation.
