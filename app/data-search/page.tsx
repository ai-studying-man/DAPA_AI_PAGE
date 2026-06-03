import { getInventoryDatasetRows } from "@/lib/dataset-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DataSearchParams = {
  type?: string | string[];
  closed?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function filterHref(type: string, closed: string) {
  const params = new URLSearchParams();
  if (type !== "all") params.set("type", type);
  if (closed !== "all") params.set("closed", closed);
  const query = params.toString();
  return query ? `/data-search?${query}` : "/data-search";
}

export default async function DataSearchPage({ searchParams }: { searchParams?: Promise<DataSearchParams> }) {
  const params = (await searchParams) ?? {};
  const selectedType = firstParam(params.type) ?? "all";
  const selectedClosed = firstParam(params.closed) ?? "all";
  const allRows = getInventoryDatasetRows();
  const rows = allRows.filter((row) => {
    const matchesType = selectedType === "all" || row.type.toLowerCase() === selectedType;
    const matchesClosed =
      selectedClosed === "all" ||
      (selectedClosed === "supported" && row.closedNetworkSupported) ||
      (selectedClosed === "snapshot" && !row.closedNetworkSupported);
    return matchesType && matchesClosed;
  });
  const fileCount = allRows.filter((row) => row.type === "FILE").length;
  const apiCount = allRows.filter((row) => row.type === "API").length;
  const closedReadyCount = allRows.filter((row) => row.closedNetworkSupported).length;

  return (
    <main className="dataPage">
      <div className="dataPageInner">
        <header className="dataPageHeader">
          <div>
            <span className="dataEyebrow">PUBLIC DATA PROVENANCE</span>
            <h1>데이터셋·공공 API 운영 현황</h1>
            <p>
              방사청 AI 통합검색이 참조하는 공개 데이터의 유형, 운영 모드, 닫힌 망 지원 여부, 갱신 주기와 장애 시 fallback 방식을
              한 화면에서 확인합니다.
            </p>
          </div>
          <a className="backLink" href="/">AI 검색 화면으로 돌아가기</a>
        </header>

        <section className="dataStatsGrid" aria-label="데이터 통계">
          <div className="dataStat"><strong>{allRows.length}</strong><span>전체 공개 데이터</span></div>
          <div className="dataStat"><strong>{fileCount}</strong><span>파일 데이터</span></div>
          <div className="dataStat"><strong>{apiCount}</strong><span>공공 API</span></div>
          <div className="dataStat"><strong>{closedReadyCount}</strong><span>닫힌 망 즉시 지원</span></div>
        </section>

        <section className="dataControlPanel" aria-label="데이터 필터">
          <div>
            <span>유형 필터</span>
            <div className="filterPills">
              {[
                ["all", "전체"],
                ["file", "파일 데이터"],
                ["api", "공공 API"]
              ].map(([value, label]) => (
                <a className={selectedType === value ? "active" : ""} href={filterHref(value, selectedClosed)} key={value}>{label}</a>
              ))}
            </div>
          </div>
          <div>
            <span>닫힌 망 상태</span>
            <div className="filterPills">
              {[
                ["all", "전체"],
                ["supported", "즉시 지원"],
                ["snapshot", "스냅샷 필요"]
              ].map(([value, label]) => (
                <a className={selectedClosed === value ? "active" : ""} href={filterHref(selectedType, value)} key={value}>{label}</a>
              ))}
            </div>
          </div>
          <p>{rows.length}개 데이터셋 표시 중</p>
        </section>

        <section className="datasetTable" aria-label="데이터셋 목록">
          <div className="datasetRow header">
            <span>유형</span>
            <span>데이터셋</span>
            <span>모드</span>
            <span>닫힌 망</span>
            <span>갱신 주기</span>
            <span>Fallback</span>
            <span>원문</span>
          </div>
          {rows.map((row) => (
            <div className="datasetRow" key={`${row.type}-${row.id}`} title={row.fallbackBehavior}>
              <span className="datasetType">{row.type}</span>
              <strong>{row.title}</strong>
              <span className="datasetMode">{row.mode}</span>
              <span className={row.closedNetworkSupported ? "closedBadge ready" : "closedBadge snapshot"}>
                {row.closedNetworkSupported ? "지원" : "스냅샷 필요"}
              </span>
              <span>{row.cycle || "확인 필요"}</span>
              <span className="fallbackText">{row.fallbackBehavior}</span>
              <a href={row.url} target="_blank" rel="noreferrer">원문 열기</a>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
