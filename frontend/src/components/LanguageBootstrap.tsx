"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/context/LanguageContext";

export function LanguageBootstrap({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
