"use client";

import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { AdminReportsQueue } from "@/components/AdminReportsQueue";

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest text-[#ff003c]">
            <ShieldAlert className="h-3 w-3" />
            <span>ADMIN</span>
          </div>
          <h1 className="font-mono text-3xl font-bold text-[#e2e8ff]">
            Report{" "}
            <span className="text-[#ff003c]">Moderation</span>
          </h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Review pending community scam reports. Deep-link only until admin
            auth is configured.
          </p>
        </motion.div>

        <AdminReportsQueue />
      </div>
    </div>
  );
}
