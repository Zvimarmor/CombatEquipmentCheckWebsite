import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "בדיקת צל״ם | אימות ציוד קרבי",
  description: "מערכת לאימות ציוד קרבי יומי — בדיקת צל״ם לחיילים ומפקדים",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
