# DAPA 공공데이터·AI 활용 경진대회 작업물

## 핵심 문서

| 파일 | 목적 |
| --- | --- |
| `intro.md` | 경진대회 포스터 요약 |
| `dapa_dataset_ui_service_strategy.md` | 공공데이터셋 조합, 획득유형별 리스크, UI/UX 3안, 법령AI 연계 전략 |
| `DESIGN.md` | Starbucks 디자인 시스템을 차용한 DAPA 통합관제 UI/UX 디자인 가이드 |
| `dapa_acquisition_control_tower_prd.md` | DAPA 획득체계 통합관제 서비스 PRD |
| `dapa_control_tower_service_draft.md` | LLM 기능, 데이터 처리, TODO, 화면 구성 초안 |
| `dapa_lessons_quality_plan.md` | Lessons Learned AI와 Data Quality Monitor 구현 검토 |
| `dapa_acquisition_type_check.md` | 국내구매·국외구매·연구개발·양산 획득유형 적용 검토 |
| `dapa_dataset_structure_and_risk_management.md` | 핵심·보강·확장 데이터셋 구조, 결합 방식, 위험관리 활용안 |
| `world_market.md` | 해외 방위사업 자동화·전자조달·사업관리 시스템 비교 |

## 프로토타입

| 파일 | 설명 |
| --- | --- |
| `dapa_control_tower_demo.html` | 정적 HTML 화면 프로토타입 |
| `dapa_control_tower_style.css` | 화면 스타일 |
| `dapa_control_tower_app.js` | 샘플 데이터 및 인터랙션 |

## 로컬 실행

현재 작업 폴더에서 아래 명령을 실행한 뒤 브라우저에서 접속한다.

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

접속 URL:

```text
http://127.0.0.1:8765/dapa_control_tower_demo.html
```
