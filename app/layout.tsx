import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "방위사업청 AI 검색",
  description: "방위사업청 홈페이지와 공개데이터 기반 AI 검색 서비스",
  icons: {
    icon: [{ url: "/dapa-taeguk-symbol.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/dapa-taeguk-symbol.svg", type: "image/svg+xml" }]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
