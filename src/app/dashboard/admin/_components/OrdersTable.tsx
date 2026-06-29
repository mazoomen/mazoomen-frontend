"use client";

import { useState } from "react";
import api from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────────

interface OrderUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface OrderTemplate {
  id: string;
  title: string;
  thumbnailUrl: string;
  price: string;
}

export interface Order {
  id: string;
  userId: string;
  templateId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: OrderUser;
  template: OrderTemplate;
}

interface OrdersTableProps {
  orders: Order[];
  onStatusUpdated: (orderId: string, newStatus: "APPROVED" | "REJECTED") => void;
}

// ── Component ────────────────────────────────────────────────────────────

export default function OrdersTable({ orders, onStatusUpdated }: OrdersTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: "APPROVED" | "REJECTED",
  ) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      onStatusUpdated(orderId, newStatus);
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
        <p className="text-3xl">📦</p>
        <p className="mt-3 text-sm text-gray-400">
          No orders found. Orders will appear here when clients purchase
          templates.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/80">
              <th className="px-4 py-3.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                Order ID
              </th>
              <th className="px-4 py-3.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                Client
              </th>
              <th className="hidden px-4 py-3.5 text-xs font-medium uppercase tracking-wider text-gray-400 md:table-cell">
                Email
              </th>
              <th className="hidden px-4 py-3.5 text-xs font-medium uppercase tracking-wider text-gray-400 lg:table-cell">
                WhatsApp
              </th>
              <th className="px-4 py-3.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                Template
              </th>
              <th className="px-4 py-3.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="hidden px-4 py-3.5 text-xs font-medium uppercase tracking-wider text-gray-400 sm:table-cell">
                Date
              </th>
              <th className="px-4 py-3.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="transition-colors hover:bg-gray-800/30"
              >
                {/* Order ID (truncated) */}
                <td className="px-4 py-3.5">
                  <span className="font-mono text-xs text-gray-500">
                    {order.id.slice(0, 8)}…
                  </span>
                </td>

                {/* Client Name */}
                <td className="px-4 py-3.5">
                  <p className="font-medium text-gray-200">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                </td>

                {/* Email */}
                <td className="hidden px-4 py-3.5 text-gray-400 md:table-cell">
                  {order.user.email}
                </td>

                {/* WhatsApp / Phone */}
                <td className="hidden px-4 py-3.5 lg:table-cell">
                  <a
                    href={`https://wa.me/${order.user.phoneNumber.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-400 transition-colors hover:text-emerald-300"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {order.user.phoneNumber}
                  </a>
                </td>

                {/* Template */}
                <td className="px-4 py-3.5">
                  <span className="text-gray-300">{order.template.title}</span>
                  <span className="ml-1.5 text-xs text-gray-600">
                    ({order.template.price} SAR)
                  </span>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3.5">
                  <StatusBadge status={order.status} />
                </td>

                {/* Date */}
                <td className="hidden px-4 py-3.5 text-gray-500 sm:table-cell">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  {order.status === "PENDING" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(order.id, "APPROVED")}
                        disabled={updatingId === order.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === order.id ? (
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border border-emerald-400/30 border-t-emerald-400" />
                        ) : (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M20 6L9 17l-5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, "REJECTED")}
                        disabled={updatingId === order.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === order.id ? (
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border border-red-400/30 border-t-red-400" />
                        ) : (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M18 6L6 18M6 6l12 12"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Status Badge Sub-Component ──────────────────────────────────────────

function StatusBadge({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" }) {
  const styles = {
    PENDING:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
    APPROVED:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    REJECTED:
      "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const dots = {
    PENDING: "bg-amber-400",
    APPROVED: "bg-emerald-400",
    REJECTED: "bg-red-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
