# Closed-Network Runbook

Closed-network mode supports installation where the service has no outbound internet dependency at runtime.

## Runtime Rule

In closed mode, the service must not require:

- External APIs at runtime
- Google Fonts or remote font CDNs
- Hosted analytics
- External LLM APIs
- Hosted vector databases
- Public package registries at runtime

Use local static snapshots and local Ollama only.

## Required Environment

```text
DEPLOYMENT_PROFILE=closed
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3.5:4b
OLLAMA_TIMEOUT_MS=30000
OLLAMA_ENABLED=true
OLLAMA_NO_CLOUD=true
LAW_OPEN_API_OC=
PUBLIC_DATA_API_KEY=
```

The exact `OLLAMA_MODEL` tag must be verified on the target machine with `ollama list` or `GET /api/tags`.

## Installation Steps

On a connected preparation machine:

1. Install Node.js compatible with the project.
2. Run `npm ci` to populate dependencies.
3. Prepare static dataset snapshots from the approved repo data files.
4. Install Ollama.
5. Pull the approved Qwen 4B-class model.
6. Export or copy the Ollama model store according to the target OS policy.

Transfer to the closed network:

1. Source tree excluding `.next`, `node_modules` if dependencies are installed from an internal mirror, logs, and agent evidence.
2. Dependency mirror or prebuilt dependency package, according to institution policy.
3. Static datasets.
4. Ollama model store or model import artifact.
5. `.env` created from `.env.example` with closed profile values.

On the closed-network host:

```powershell
npm ci
npm run build
npm run start
```

If the environment cannot reach the public npm registry, use the institution package mirror or an approved offline dependency bundle.

## Ollama Checks

```powershell
Invoke-WebRequest http://127.0.0.1:11434/api/version -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:11434/api/tags -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:11434/api/ps -UseBasicParsing
```

Required failure behavior:

- Ollama missing: `/api/chat` returns controlled unavailable response.
- Model missing: `/api/chat` returns controlled model unavailable response.
- Timeout: `/api/chat` returns recoverable timeout response.
- Static datasets available: `/data-search` still renders dataset provenance.

## Dataset Snapshot Rules

Closed-network data must include:

- `dapa_public_data_inventory.csv`
- `dapa_ai_agent_dataset_map.json`
- `dapa_homepage_snapshot.json`
- Approved `analysis_outputs/*.csv` files used by the runtime registry

External API features must either use approved snapshots or show a clear unavailable/stale-data message.

## Hardware Guidance

Qwen 4B-class model requirements depend on quantization and context length. Validate on target hardware before acceptance.

Minimum validation:

- Model appears in `/api/tags`
- Chat request completes within the configured `OLLAMA_TIMEOUT_MS`
- System remains responsive under one concurrent request
- Increasing context length does not cause memory pressure or CPU fallback beyond acceptable latency

## No-Outbound Verification Checklist

- Build succeeds using approved local or mirrored dependencies.
- Browser loads `/` and `/data-search` without remote font/CDN requests.
- `/api/chat` does not call law.go.kr or data.go.kr when closed profile disables live APIs.
- Ollama requests go only to `OLLAMA_BASE_URL` inside the closed network.
- Logs do not contain API keys or internal host secrets.
