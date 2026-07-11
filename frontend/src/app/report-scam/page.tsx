"use client";

import { motion } from "framer-motion";
import { Flag } from "lucide-react";
import { ReportScamForm } from "@/components/ReportScamForm";

export default function ReportScamPage() {
  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest text-[#ffaa00]">
            <Flag className="h-3 w-3" />
            <span>COMMUNITY REPORT</span>
          </div>
          <h1 className="font-mono text-3xl font-bold text-[#e2e8ff]">
            Report a{" "}
            <span className="text-[#ffaa00]">Scam</span>
          </h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Submit a phone number, URL, business name, or message for admin
            review. Approved reports help protect others.
          </p>
        </motion.div>

        <ReportScamForm />
      </div>
    </div>
  );
}
