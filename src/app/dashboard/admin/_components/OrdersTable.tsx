"use client";

import React, { useState } from 'react';
import { getS3Url } from "@/lib/s3";
import api from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { getTemplateTitle } from "@/lib/template-utils";

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
  previewImage: string;
  price: string;
}

export interface Order {
  id: string;
  userId: string;
  templateId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  couponId?: string | null;
  couponCode?: string | null;
  discountAmount?: number | string | null;
  finalPrice?: number | string | null;
  createdAt: string;
  user: OrderUser;
  template: OrderTemplate;
  purchase?: {
    id: string;
    invitation?: {
      id: string;
      slug: string;
      isActive: boolean;
    } | null;
  } | null;
}

interface OrdersTableProps {
  orders: Order[];
  onStatusUpdated: (orderId: string, newStatus: "APPROVED" | "REJECTED") => void;
  onLinkStatusUpdated?: (invitationId: string, isActive: boolean) => void;
  onEditInvitation?: (purchase: any) => void;
  onTrackInvitation?: (invitation: any) => void;
}

// ── Component ────────────────────────────────────────────────────────────

export default function OrdersTable({
  orders,
  onStatusUpdated,
  onLinkStatusUpdated,
  onEditInvitation,
  onTrackInvitation,
}: OrdersTableProps) {
  const { lang } = useLanguage();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: "APPROVED" | "REJECTED",
  ) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/purchase-requests/${orderId}/status`, { status: newStatus });
      onStatusUpdated(orderId, newStatus);
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleInvitation = async (invitationId: string, currentActive: boolean) => {
    setTogglingId(invitationId);
    try {
      const newActive = !currentActive;
      await api.patch(`/invitations/${invitationId}/status`, { isActive: newActive });
      if (onLinkStatusUpdated) {
        onLinkStatusUpdated(invitationId, newActive);
      }
    } catch (err) {
      console.error("Failed to toggle invitation status:", err);
    } finally {
      setTogglingId(null);
    }
  };

  // Filter orders by search query and selected status
  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== "ALL" && order.status !== selectedStatus) {
      return false;
    }

    const query = searchQuery.toLowerCase();
    const clientName = `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.toLowerCase();
    const templateTitle = (order.template?.title || "").toLowerCase();
    return (
      clientName.includes(query) ||
      (order.user?.email || "").toLowerCase().includes(query) ||
      (order.user?.phoneNumber || "").includes(query) ||
      templateTitle.includes(query) ||
      (order.id || "").toLowerCase().includes(query)
    );
  });

  // Pagination calculations
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Search and Controls ──────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white border border-[#EBE7DF] p-4 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
          {/* Search box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={
                lang === "ar"
                  ? "ابحث عن الطلبات بالاسم، الهاتف، البريد أو القالب..."
                  : "Search requests by name, phone, email, or template..."
              }
              value={searchQuery}
              onChange={handleSearchChange}
              className={`w-full ${lang === "ar" ? "pl-4 pr-9" : "pl-9 pr-4"} py-2 bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg text-xs outline-none focus:border-[#B89C72] text-neutral-800 placeholder-neutral-400`}
            />
            <div className={`absolute inset-y-0 ${lang === "ar" ? "right-3" : "left-3"} flex items-center pointer-events-none text-neutral-400`}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg px-3 py-2 text-xs outline-none text-neutral-800 font-medium font-sans cursor-pointer focus:border-[#B89C72]"
          >
            <option value="ALL">{lang === "ar" ? "كل الحالات" : "All Statuses"}</option>
            <option value="PENDING">{lang === "ar" ? "قيد الانتظار" : "Pending"}</option>
            <option value="APPROVED">{lang === "ar" ? "مقبول" : "Approved"}</option>
            <option value="REJECTED">{lang === "ar" ? "مرفوض" : "Rejected"}</option>
            <option value="CANCELLED">{lang === "ar" ? "ملغي" : "Cancelled"}</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500 font-sans">
          <span>{lang === "ar" ? "عرض" : "Show"}</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-[#FAF9F6] border border-[#EBE7DF] rounded px-2 py-1 outline-none text-neutral-800 font-medium"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span>{lang === "ar" ? "طلب في الصفحة" : "requests per page"}</span>
        </div>
      </div>

      {/* ── Table Container ─────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-[#EBE7DF] bg-white shadow-sm">
        {totalItems === 0 ? (
          <div className="p-12 text-center bg-[#FAF9F6]/50 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-3">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="mt-1 text-xs text-neutral-400 font-sans">
              {lang === "ar"
                ? "لم يتم العثور على طلبات شراء تطابق بحثك."
                : "No template requests found matching your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full ${lang === "ar" ? "text-right" : "text-left"} text-xs font-sans`}>
              <thead>
                <tr className="border-b border-[#EBE7DF] bg-[#FAF8F5]">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "رقم الطلب" : "Order ID"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "العميل" : "Client"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "البريد" : "Email"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "واتساب" : "WhatsApp"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "القالب" : "Template"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "الحالة" : "Status"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "حالة الرابط" : "Link Status"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "تاريخ الطلب" : "Date Requested"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF1EA]">
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-[#FAF9F6]/50 text-neutral-800"
                  >
                    {/* Order ID */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-neutral-500 select-all">
                        {order.id.slice(0, 8)}…
                      </span>
                    </td>

                    {/* Client Name */}
                    <td className="px-4 py-3.5 font-semibold text-neutral-800">
                      {order.user.firstName} {order.user.lastName}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3.5 text-neutral-600 font-mono">
                      {order.user.email}
                    </td>

                    {/* WhatsApp */}
                    <td className="px-4 py-3.5">
                      {order.user?.phoneNumber ? (
                        <a
                          href={`https://wa.me/${order.user.phoneNumber.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-600 transition-colors hover:text-emerald-700 font-semibold"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          {order.user.phoneNumber}
                        </a>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    {/* Template Card details */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="relative h-8 w-12 shrink-0 overflow-hidden rounded border border-[#EBE7DF] bg-[#FAF8F5]">
                          <img
                            src={getS3Url(order.template.previewImage)}
                            alt={getTemplateTitle(order.template, lang)}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-800">{getTemplateTitle(order.template, lang)}</p>
                          {order.couponCode ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-neutral-400 font-sans line-through">
                                {order.template.price} JOD
                              </span>
                              <span className="text-[10px] text-emerald-600 font-bold font-sans">
                                {order.finalPrice} JOD
                              </span>
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                                {order.couponCode}
                              </span>
                            </div>
                          ) : (
                            <p className="text-[10px] text-neutral-500 font-sans">{order.template.price} JOD</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={order.status} lang={lang} />
                    </td>

                    {/* Link Status & Control */}
                    <td className="px-4 py-3.5">
                      {order.status === "APPROVED" ? (
                        order.purchase?.invitation ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                                order.purchase.invitation.isActive
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : "bg-rose-50 text-rose-600 border-rose-100"
                              }`}
                            >
                              {order.purchase.invitation.isActive
                                ? lang === "ar"
                                  ? "نشط"
                                  : "Active"
                                : lang === "ar"
                                ? "معطل"
                                : "Deactivated"}
                            </span>
                            <button
                              onClick={() =>
                                handleToggleInvitation(
                                  order.purchase!.invitation!.id,
                                  order.purchase!.invitation!.isActive
                                )
                              }
                              disabled={togglingId === order.purchase.invitation.id}
                              className={`text-[9px] px-2 py-0.5 rounded-full border bg-white font-medium hover:bg-neutral-50 cursor-pointer transition-all ${
                                order.purchase.invitation.isActive
                                  ? "text-rose-600 border-rose-100 hover:bg-rose-50"
                                  : "text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                              } disabled:opacity-50`}
                            >
                              {togglingId === order.purchase.invitation.id ? (
                                <span className="inline-block h-2 w-2 animate-spin rounded-full border border-neutral-300 border-t-neutral-600" />
                              ) : order.purchase.invitation.isActive ? (
                                lang === "ar" ? "تعطيل" : "Deactivate"
                              ) : (
                                lang === "ar" ? "تفعيل" : "Activate"
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic">
                            {lang === "ar" ? "لم ينشأ بعد" : "Not created yet"}
                          </span>
                        )
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    {/* Date Requested */}
                    <td className="px-4 py-3.5 text-neutral-500 font-sans">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      {order.status === "PENDING" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(order.id, "APPROVED")}
                            disabled={updatingId === order.id}
                            className="inline-flex items-center gap-1 rounded bg-[#B89C72] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#A3875D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer"
                          >
                            {updatingId === order.id ? (
                              <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border border-white/30 border-t-white" />
                            ) : (
                              lang === "ar" ? "موافقة" : "Approve"
                            )}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, "REJECTED")}
                            disabled={updatingId === order.id}
                            className="inline-flex items-center gap-1 rounded bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer"
                          >
                            {updatingId === order.id ? (
                              <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border border-white/30 border-t-white" />
                            ) : (
                              lang === "ar" ? "رفض" : "Reject"
                            )}
                          </button>
                        </div>
                      ) : order.status === "APPROVED" && order.purchase?.invitation ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => {
                              if (onEditInvitation) {
                                onEditInvitation(order.purchase);
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded bg-[#0B1528] px-2.5 py-1 text-[10px] font-bold text-[#E5C38B] hover:bg-[#15243F] transition-colors select-none cursor-pointer"
                          >
                            {lang === "ar" ? "تعديل الدعوة" : "Edit Invitation"}
                          </button>
                          {onTrackInvitation && (
                            <button
                              onClick={() => onTrackInvitation(order.purchase?.invitation)}
                              className="inline-flex items-center gap-1 rounded border border-[#B89C72] bg-[#FAF9F6] px-2 py-1 text-[10px] font-bold text-[#B89C72] hover:bg-[#F4F1EA] transition-colors select-none cursor-pointer"
                            >
                              {lang === "ar" ? "متابعة (الردود والصور)" : "Track (RSVPs & Photos)"}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-400 font-sans">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination Controls ────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 font-sans text-xs">
          {lang === "ar" ? (
            <p className="text-neutral-500">
              عرض <span className="font-semibold text-neutral-800">{startIndex + 1}</span> إلى{" "}
              <span className="font-semibold text-neutral-800">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{" "}
              من أصل <span className="font-semibold text-neutral-800">{totalItems}</span> طلب
            </p>
          ) : (
            <p className="text-neutral-500">
              Showing <span className="font-semibold text-neutral-800">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-neutral-800">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{" "}
              of <span className="font-semibold text-neutral-800">{totalItems}</span> requests
            </p>
          )}

          <div className="inline-flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-[#EBE7DF] bg-white text-neutral-600 font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer"
            >
              {lang === "ar" ? "السابق" : "Prev"}
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center font-semibold text-[11px] transition-colors select-none cursor-pointer ${
                  page === currentPage
                    ? "bg-[#0B1528] border-[#0B1528] text-[#E5C38B]"
                    : "border-[#EBE7DF] bg-white text-[#7F8487] hover:bg-neutral-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-[#EBE7DF] bg-white text-neutral-600 font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer"
            >
              {lang === "ar" ? "التالي" : "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Status Badge Sub-Component ──────────────────────────────────────────

function StatusBadge({ status, lang }: { status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"; lang: "en" | "ar" }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    REJECTED: "bg-red-50 text-red-600 border-red-100",
    CANCELLED: "bg-neutral-50 text-neutral-600 border-neutral-200",
  };

  const dots = {
    PENDING: "bg-amber-500",
    APPROVED: "bg-emerald-500",
    REJECTED: "bg-red-500",
    CANCELLED: "bg-neutral-400",
  };

  const labels = {
    PENDING: lang === "ar" ? "قيد الانتظار" : "Pending",
    APPROVED: lang === "ar" ? "مقبول" : "Approved",
    REJECTED: lang === "ar" ? "مرفوض" : "Rejected",
    CANCELLED: lang === "ar" ? "ملغي" : "Cancelled",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {labels[status]}
    </span>
  );
}
