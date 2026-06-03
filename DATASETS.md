# Dataset Registry

The service uses documented DAPA public datasets through a runtime registry in `lib/dataset-registry.ts`.

## Registry Fields

Each dataset entry includes:

- `sourcePath`: local file or inventory source
- `mode`: `static`, `external-api`, `homepage-snapshot`, or `generated-analysis`
- `closedNetworkSupported`: whether runtime use works without outbound internet
- `lastUpdated`: source freshness marker when available
- `schemaVersion`: validation contract version
- `encoding`: `utf8` or `cp949`
- `validationCommand`: command proving the dataset contract
- `fallbackBehavior`: public/closed-mode degradation rule
- `uiSurface`: route or API surface where the source appears

## Core Runtime Sources

| Source | Mode | Encoding | Closed network | UI surface | Fallback |
| --- | --- | --- | --- | --- | --- |
| `dapa_public_data_inventory.csv` | static/external-api catalog | utf8 | partial | `/data-search` | Static inventory rows remain visible; API rows require snapshots or unavailable state |
| `dapa_ai_agent_dataset_map.json` | static | utf8 | yes | `/api/chat` | Use bundled section-to-dataset map |
| `dapa_homepage_snapshot.json` | homepage-snapshot | utf8 | yes | `/api/chat` | Use bundled homepage snapshot |
| `analysis_outputs/dapa_procurement_plan_20251231.csv` | static | cp949 | yes | `/api/chat` | Use bundled static CSV snapshot |
| `analysis_outputs/dapa_contract_20251231.csv` | static | cp949 | yes | `/api/chat` | Use bundled static CSV snapshot |
| `analysis_outputs/dapa_bid_result_20251231.csv` | static | cp949 | yes | `/api/chat` | Use bundled static CSV snapshot |
| `analysis_outputs/dapa_participants_20251231.csv` | static | cp949 | yes | `/api/chat` | Use bundled static CSV snapshot |
| `analysis_outputs/dapa_defense_firms_20250531.csv` | static | cp949 | yes | `/api/chat` | Use bundled static CSV snapshot |
| `analysis_outputs/dapa_core_rnd_budget_20241231.csv` | static | cp949 | yes | `/api/chat` | Use bundled static CSV snapshot |

## Validation

Run:

```powershell
npm test -- dataset-registry
```

Current validation covers:

- required inventory columns
- required local CSV columns
- CP949 CSV decoding
- missing/malformed CSV column failures
- required registry metadata such as schema version and fallback behavior

## Closed-Network Behavior

Static CSV/JSON files are closed-network compatible. External API entries in the inventory are not directly closed-network compatible unless converted into approved snapshots. In closed mode, API-backed features must either use a bundled snapshot or show a clear unavailable/stale-data message.
