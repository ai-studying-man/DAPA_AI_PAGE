# Ollama LLM Operations

This service uses Ollama only from the Next.js server boundary. Browser code must never call `OLLAMA_BASE_URL` directly, and Ollama port `11434` must not be exposed to the public internet.

## Runtime Contract

Configure Ollama through server-side environment variables only:

```text
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3.5:4b
OLLAMA_TIMEOUT_MS=30000
OLLAMA_ENABLED=true
OLLAMA_NO_CLOUD=true
```

Profile rules:

| Profile | Expected mode |
| --- | --- |
| `local` | Local developer Ollama is allowed. |
| `public-cloud` | Set `OLLAMA_ENABLED=false` unless the backend can reach a private inference host. |
| `institution` | Use a private-network Ollama host behind the institution network boundary. |
| `closed` | Use only a local or closed-network Ollama host and set `OLLAMA_NO_CLOUD=true`. |

## Connected Preparation

On an internet-connected preparation machine:

```powershell
ollama --version
ollama pull qwen3.5:4b
ollama list
```

Record the exact model tag and digest from `ollama list` in the release evidence or institution asset register. The application must use the same tag in `OLLAMA_MODEL`.

Run application verification before transfer:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

## Closed-Network Transfer

Transfer only approved artifacts according to institution policy:

- Source bundle or repository export.
- Dependency mirror or approved offline dependency bundle.
- Static dataset snapshots described in `CLOSED_NETWORK.md`.
- Ollama installer approved for the target OS.
- Ollama model store or model export artifact approved by the AI operator.
- `.env` values based on `.env.example` with `DEPLOYMENT_PROFILE=closed`.

Do not put model weights, `.env` files, API keys, or internal hostnames in git.

## Closed Host Setup

On the closed-network host, install Ollama and confirm the local service is reachable:

```powershell
ollama list
Invoke-WebRequest http://127.0.0.1:11434/api/version -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:11434/api/tags -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:11434/api/ps -UseBasicParsing
```

Then build and start the service:

```powershell
npm ci
npm run build
npm run start
```

If the host cannot reach the public npm registry, use the approved package mirror or offline dependency bundle instead of direct public registry access.

## Health Checks

Ollama readiness requires all of the following:

- `GET {OLLAMA_BASE_URL}/api/version` returns HTTP 200.
- `GET {OLLAMA_BASE_URL}/api/tags` includes the configured `OLLAMA_MODEL`.
- `/api/chat` returns either a valid answer or a controlled recoverable error.
- `/data-search` remains available even if Ollama is disabled or unavailable.

Manual smoke prompt for `/api/chat`:

```powershell
$body = @{ message = "방위사업청 공개데이터로 확인 가능한 조달 리스크를 요약해줘" } | ConvertTo-Json
Invoke-WebRequest http://127.0.0.1:3000/api/chat -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```

Do not use sensitive operational prompts in public or shared logs.

## Failure Modes

Expected service behavior:

| Failure | Expected response |
| --- | --- |
| `OLLAMA_ENABLED=false` | Controlled disabled or unavailable response from `/api/chat`. |
| Ollama host down | Recoverable `OLLAMA_UNAVAILABLE` response. |
| Model tag missing | Controlled model-missing response. |
| Request timeout | Recoverable timeout/unavailable response within `OLLAMA_TIMEOUT_MS`. |
| Closed-network external API disabled | Dataset/search surfaces stay available with static data or unavailable-state messaging. |

Operational response:

1. Check `OLLAMA_BASE_URL` and host firewall rules.
2. Check `ollama list` or `/api/tags` for the configured model tag.
3. Check CPU/GPU memory pressure and model load time.
4. Increase hardware capacity or lower concurrency before increasing `OLLAMA_TIMEOUT_MS`.
5. Keep `/data-search` public while AI response recovery is in progress.

## Public Internet Boundary

For Vercel, Netlify-style hosting, or public institution subdomains:

- Never expose `http://<host>:11434` to browsers or the public internet.
- Keep `OLLAMA_BASE_URL` server-only and never prefix it with `NEXT_PUBLIC_`.
- Prefer `OLLAMA_ENABLED=false` if a private inference host is not available.
- If a private inference host is used, restrict access to the Next.js backend network path only.
- Monitor `/api/chat` latency, timeout rate, and unavailable count as described in `OPERATIONS.md`.

## Acceptance Evidence

Before release, capture:

- Output of `ollama list` showing the configured model tag.
- HTTP 200 response from `/api/version`.
- HTTP 200 response from `/api/tags` containing `OLLAMA_MODEL`.
- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` results.
- Browser or HTTP smoke result for `/api/chat` using a non-sensitive prompt.
