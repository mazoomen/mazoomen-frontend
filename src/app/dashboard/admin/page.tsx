"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import {
  OrdersTable,
  AddTemplateForm,
  StatsCards,
  type Order,
} from "./_components";

type LoadStatus = "loading" | "loaded" | "error";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  // ── Fetch all orders on mount ─────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get<Order[]>("/orders");
      setOrders(res.data);
      setStatus("loaded");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Optimistic status update ──────────────────────────────────────────
  const handleStatusUpdated = (
    orderId: string,
    newStatus: "APPROVED" | "REJECTED",
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
  };

  // ── Compute summary stats from loaded data ───────────────────────────
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const approvedCount = orders.filter((o) => o.status === "APPROVED").length;
  const rejectedCount = orders.filter((o) => o.status === "REJECTED").length;
  const totalRevenue = orders
    .filter((o) => o.status === "APPROVED")
    .reduce((sum, o) => sum + parseFloat(o.template.price), 0);

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header skeleton */}
        <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-800" />
        <div className="h-4 w-80 animate-pulse rounded-lg bg-gray-800/50" />

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-gray-800/50"
            />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="h-96 animate-pulse rounded-xl bg-gray-800/30" />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-3xl">⚠️</p>
          <p className="mt-3 text-sm text-red-400">
            Failed to load dashboard data. Please try refreshing the page.
          </p>
          <button
            onClick={() => {
              setStatus("loading");
              fetchOrders();
            }}
            className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage client orders and platform templates.
        </p>
      </div>

      {/* ── Summary Stats ────────────────────────────────────── */}
      <StatsCards
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        totalRevenue={totalRevenue}
      />

      {/* ── Orders Management ────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Purchase Orders
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {orders.length} total order{orders.length !== 1 ? "s" : ""} ·{" "}
              {pendingCount} awaiting review
            </p>
          </div>
          <button
            onClick={() => {
              setStatus("loading");
              fetchOrders();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-300"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M1 4v6h6M23 20v-6h-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Refresh
          </button>
        </div>
        <OrdersTable orders={orders} onStatusUpdated={handleStatusUpdated} />
      </section>

      {/* ── Add New Template ──────────────────────────────────── */}
      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            Add New Template
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Create a new invitation design template for clients.
          </p>
        </div>
        <AddTemplateForm />
      </section>
    </div>
  );
}
