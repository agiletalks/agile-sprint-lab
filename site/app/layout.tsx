import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agile Sprint Lab",
  description: "A shared space for real challenges, useful solutions, and better collaboration.",
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
