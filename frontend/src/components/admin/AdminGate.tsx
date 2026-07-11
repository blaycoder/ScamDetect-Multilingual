"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { AdminRole } from "@/types";

interface AdminContextValue {
  role: AdminRole;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within AdminGate");
  }
  return ctx;
}

export function AdminGate({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<AdminRole | null>(null);
  const [checking, setChecking] = useState(true);

  // Redirect unauthenticated users; pathname only used for ?next=
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const next = encodeURIComponent(pathname || "/admin/dashboard");
      router.replace(`/login?next=${next}`);
    }
  }, [user, authLoading, router, pathname]);

  // Verify admin role once per auth session — not on every tab change
  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (authLoading) return;

      if (!user) {
        setRole(null);
        setChecking(false);
        return;
      }

      setChecking(true);
      try {
        const data = await api.adminMe();
        if (!cancelled) {
          setRole(data.role);
          setChecking(false);
        }
      } catch {
        if (!cancelled) {
          setRole(null);
          setChecking(false);
          router.replace("/");
        }
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  if (authLoading || checking || !role) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff003c] border-t-transparent" />
          <span className="font-mono text-xs tracking-widest text-[#ff003c]">
            VERIFYING ADMIN...
          </span>
        </div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ role }}>{children}</AdminContext.Provider>
  );
}
