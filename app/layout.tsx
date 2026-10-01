import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TABI — Japan Journey Planner",
  description: "Plan Japan around festivals, cultural destinations and realistic rail journeys.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
