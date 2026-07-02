"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AuthUser } from "@/types/invitation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // ── Auth guard — redirect non-ADMIN users ───────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.replace("/?auth=login");
      return;
    }

    if (storedUser) {
      try {
        const parsed: AuthUser = JSON.parse(storedUser);
        if (parsed.role !== "ADMIN") {
          router.replace("/dashboard/client");
          return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAuthChecked(true);
      } catch {
        localStorage.removeItem("user");
        router.replace("/?auth=login");
        return;
      }
    } else {
      router.replace("/?auth=login");
      return;
    }
  }, [router]);

  // Don't render anything until auth is verified
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#EBE7DF] border-t-[#B89C72]" />
          <p className="text-xs text-neutral-400 font-sans">Verifying access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {children}
    </div>
  );
}
