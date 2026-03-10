"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScannerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "cyan" | "magenta" | "purple";
}

const VARIANTS = {
  cyan: "border-[#00f0ff] bg-[rgba(0,240,255,0.1)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.2)] shadow-[0_0_12px_rgba(0,240,255,0.2)]",
  magenta:
    "border-[#ff00ff] bg-[rgba(255,0,255,0.1)] text-[#ff00ff] hover:bg-[rgba(255,0,255,0.2)] shadow-[0_0_12px_rgba(255,0,255,0.2)]",
  purple:
    "border-[#9d00ff] bg-[rgba(157,0,255,0.1)] text-[#9d00ff] hover:bg-[rgba(157,0,255,0.2)] shadow-[0_0_12px_rgba(157,0,255,0.2)]",
};

export function ScannerButton({
  children,
  loading = false,
  variant = "cyan",
  className,
  disabled,
  ...props
}: ScannerButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      disabled={loading || disabled}
      className={cn(
        "relative flex items-center gap-2 rounded border px-6 py-3 font-mono text-sm tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
