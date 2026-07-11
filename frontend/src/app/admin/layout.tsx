"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminGate, useAdmin } from "@/components/admin/AdminGate";
import { cn } from "@/lib/utils";

function AdminSubnav() {
  const pathname = usePathname();
  const { role } = useAdmin();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/reports", label: "Reports" },
    ...(role === "superadmin"
      ? [{ href: "/admin/team", label: "Team" }]
      : []),
  ];

  return (
    <div className="mb-8 border-b border-[rgba(255,0,60,0.25)] pb-4">
      <div className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest text-[#ff003c]">
        <span>ADMIN MODE</span>
        <span className="text-[#6b7280]">·</span>
        <span className="uppercase text-[#94a3b8]">{role}</span>
      </div>
      <nav className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors",
              pathname === link.href
                ? "border-[#ff003c] bg-[rgba(255,0,60,0.12)] text-[#e2e8ff]"
                : "border-[rgba(255,255,255,0.1)] text-[#94a3b8] hover:border-[rgba(255,0,60,0.35)]",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGate>
      <div className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <AdminSubnav />
          {children}
        </div>
      </div>
    </AdminGate>
  );
}
