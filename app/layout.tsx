import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Manager · AltF4 Masters",
  description: "Tablica zadań zespołu AltF4 Masters",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html:
          'try { if (localStorage.getItem("task-manager-theme") === "dark") document.documentElement.dataset.theme = "dark"; } catch {}'
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
