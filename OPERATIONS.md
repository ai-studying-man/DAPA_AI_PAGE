# Operations Runbook

This runbook describes ownership, launch checks, monitoring, and incident response for the DAPA public data AI service.

## Ownership

Assign one owner for each item before production launch.

| Area | Owner | Required Decision |
| --- | --- | --- |
| DNS/subdomain | DAPA or institution IT | Final hostname under existing DAPA domain |
| TLS certificate | Institution IT or hosting provider | Certificate issue/renewal process |
| Runtime hosting | Service operator | Public cloud, institution Node host, or closed-network host |
| Dataset updates | Data operator | Snapshot cadence and source approval |
| External API keys | Service operator | Key storage and rotation |
| Ollama host/model | AI operator | Model tag, hardware, health checks |
| Incident response | Service owner | Escalation and public notice path |

## Pre-Launch Checklist

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Then verify the real surface:

```powershell
Invoke-WebRequest https://<dapa-subdomain>/ -UseBasicParsing
Invoke-WebRequest https://<dapa-subdomain>/data-search -UseBasicParsing
```

For `/api/chat`, use a known non-sensitive prompt and confirm a structured response with data source provenance.

## Health Checks

Application health:

- `/` returns HTTP 200
- `/data-search` returns HTTP 200 and a nonzero dataset count
- `/api/chat` returns either a valid answer or a controlled recoverable error

Ollama health, when enabled:

- `GET {OLLAMA_BASE_URL}/api/version`
- `GET {OLLAMA_BASE_URL}/api/ps`
- `GET {OLLAMA_BASE_URL}/api/tags`

## Monitoring

Minimum production signals:

- HTTP 5xx rate
- `/api/chat` latency and timeout rate
- Ollama unavailable count
- External API timeout count
- Dataset validation failures
- Build/deploy status
- Disk usage for static datasets and model store

Do not log raw API keys, model host secrets, or full user prompts if operational policy treats prompts as sensitive.

## Backup and Recovery

Back up these artifacts:

- Source repository
- Static dataset snapshots
- Dataset registry metadata
- `.env` values in the institution secret store
- Closed-network Ollama model manifest, not necessarily model weights in git

Recovery order:

1. Restore source and dependencies.
2. Restore `.env` from secret store.
3. Restore static datasets.
4. Restore or re-pull Ollama model.
5. Run build and health checks.
6. Reopen public traffic only after `/`, `/data-search`, and `/api/chat` pass.

## Incident Response

For external API outage:

- Disable live API mode or use snapshots.
- Keep public UI available with stale-data notice.
- Record affected dataset and outage window.

For Ollama outage:

- Return controlled LLM unavailable response.
- Keep dataset search/provenance surfaces available.
- Check `/api/version`, `/api/ps`, and model availability.

For malformed dataset:

- Fail validation.
- Keep last known good snapshot.
- Do not deploy partial malformed data.

For suspected secret exposure:

- Rotate affected key.
- Check client bundle and logs.
- Redeploy with verified server-only env usage.

## Release Evidence

Store release evidence under `.omo/evidence/` during agent work, but do not deploy that directory as part of the public service bundle.
