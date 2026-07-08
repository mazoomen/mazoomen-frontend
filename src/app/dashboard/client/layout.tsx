"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageLayout from "@/components/PageLayout";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/?auth=login");
    }
  }, [router]);

  return (
    <PageLayout>
      {/* ── Page Content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10">
        {children}
      </main>
    </PageLayout>
  );
}
