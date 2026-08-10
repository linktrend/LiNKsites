"use client";

import "../styles/globals.css";
import "../styles/theme.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="default">
      <body>{children}</body>
    </html>
  );
}
