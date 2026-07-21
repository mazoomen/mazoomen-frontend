"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { Modal, Button } from "@/components/ui";
import type { Coupon } from "@/types/purchase";

interface CouponsTableProps {
  coupons: Coupon[];
  onRefresh: () => void;
}

export default function CouponsTable({
  coupons,
  onRefresh,
}: CouponsTableProps) {
  const { lang } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE" | "MAX_REACHED" | "DELETED"
  >("ALL");

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formCode, setFormCode] = useState("");
  const [formDiscountPercent, setFormDiscountPercent] = useState<number>(50);
  const [formMaxUses, setFormMaxUses] = useState<string>("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Action Loading states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormCode("");
    setFormDiscountPercent(50);
    setFormMaxUses("");
    setFormIsActive(true);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormCode(coupon.code);
    setFormDiscountPercent(coupon.discountPercent);
    setFormMaxUses(coupon.maxUses != null ? coupon.maxUses.toString() : "");
    setFormIsActive(coupon.isActive);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      setFormError(lang === "ar" ? "كود الخصم مطلوب" : "Coupon code is required");
      return;
    }
    if (formDiscountPercent < 1 || formDiscountPercent > 100) {
      setFormError(
        lang === "ar"
          ? "نسبة الخصم يجب أن تكون بين 1% و 100%"
          : "Discount percentage must be between 1% and 100%"
      );
      return;
    }

    const parsedMaxUses = formMaxUses.trim() !== "" ? parseInt(formMaxUses.trim(), 10) : null;

    if (editingCoupon && parsedMaxUses !== null) {
      const currentUsed = editingCoupon.usedCount ?? 0;
      if (parsedMaxUses < currentUsed) {
        setFormError(
          lang === "ar"
            ? `الحد الأقصى للاستخدام لا يمكن أن يكون أقل من عدد الاستخدامات الحالية (${currentUsed})`
            : `Max usage limit cannot be less than current usage count (${currentUsed})`
        );
        return;
      }
    }

    setSubmitting(true);
    setFormError("");

    try {
      if (editingCoupon) {
        await api.patch(`/coupons/${editingCoupon.id}`, {
          code: formCode.trim().toUpperCase(),
          discountPercent: formDiscountPercent,
          maxUses: parsedMaxUses,
          isActive: formIsActive,
        });
      } else {
        await api.post("/coupons", {
          code: formCode.trim().toUpperCase(),
          discountPercent: formDiscountPercent,
          maxUses: parsedMaxUses,
          isActive: formIsActive,
        });
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "";
      if (msg.includes("max_uses_cannot_be_less_than_used_count")) {
        const count = msg.split("|")[1] || "";
        setFormError(
          lang === "ar"
            ? `الحد الأقصى لا يمكن أن يكون أقل من عدد الاستخدامات الحالية (${count})`
            : `Max usage limit cannot be less than current usage count (${count})`
        );
      } else {
        setFormError(
          msg ||
            (lang === "ar" ? "حدث خطأ أثناء حفظ الكوبون" : "Failed to save coupon")
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    setActionLoadingId(coupon.id);
    try {
      await api.patch(`/coupons/${coupon.id}/toggle-active`);
      onRefresh();
    } catch (err) {
      console.error("Failed to toggle coupon active status", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSoftDelete = async (coupon: Coupon) => {
    if (
      !confirm(
        lang === "ar"
          ? `هل أنت أكتأكد من حذف الكوبون (${coupon.code})؟`
          : `Are you sure you want to soft-delete coupon (${coupon.code})?`
      )
    )
      return;

    setActionLoadingId(coupon.id);
    try {
      await api.delete(`/coupons/${coupon.id}`);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete coupon", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestore = async (coupon: Coupon) => {
    setActionLoadingId(coupon.id);
    try {
      await api.patch(`/coupons/${coupon.id}/restore`);
      onRefresh();
    } catch (err) {
      console.error("Failed to restore coupon", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter coupons
  const filteredCoupons = coupons.filter((coupon) => {
    // Filter by status
    if (
      selectedFilter === "ACTIVE" &&
      (!coupon.isActive ||
        coupon.isDeleted ||
        (coupon.maxUses != null && (coupon.usedCount ?? 0) >= coupon.maxUses))
    )
      return false;
    if (selectedFilter === "INACTIVE" && (coupon.isActive || coupon.isDeleted))
      return false;
    if (
      selectedFilter === "MAX_REACHED" &&
      (coupon.maxUses == null ||
        (coupon.usedCount ?? 0) < coupon.maxUses ||
        coupon.isDeleted)
    )
      return false;
    if (selectedFilter === "DELETED" && !coupon.isDeleted) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        coupon.code.toLowerCase().includes(q) ||
        coupon.discountPercent.toString().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E6E2DA] shadow-sm">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "ar"
                ? "ابحث بكود الكوبون..."
                : "Search by coupon code..."
            }
            className="px-4 py-2 bg-[#FAF9F6] border border-[#E6E2DA] rounded-xl text-xs focus:outline-none focus:border-[#B89C72] w-full sm:w-64"
          />

          {/* Filter Tabs */}
          <div className="flex items-center bg-[#FAF9F6] p-1 rounded-xl border border-[#E6E2DA] text-xs">
            {(["ALL", "ACTIVE", "INACTIVE", "MAX_REACHED", "DELETED"] as const).map(
              (filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setSelectedFilter(filterKey)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    selectedFilter === filterKey
                      ? "bg-white text-neutral-800 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {filterKey === "ALL" && (lang === "ar" ? "الكل" : "All")}
                  {filterKey === "ACTIVE" && (lang === "ar" ? "نشط" : "Active")}
                  {filterKey === "INACTIVE" && (lang === "ar" ? "غير نشط" : "Inactive")}
                  {filterKey === "MAX_REACHED" && (lang === "ar" ? "مكتملة الحد" : "Max Reached")}
                  {filterKey === "DELETED" && (lang === "ar" ? "محذوف" : "Deleted")}
                </button>
              )
            )}
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          className="!rounded-xl shadow-sm whitespace-nowrap"
        >
          + {lang === "ar" ? "إضافة كوبون جديد" : "Add New Coupon"}
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-[#E6E2DA] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#FAF9F6] border-b border-[#E6E2DA] text-[#6B6661] font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">{lang === "ar" ? "الكود" : "Code"}</th>
                <th className="px-5 py-4">{lang === "ar" ? "نسبة الخصم" : "Discount"}</th>
                <th className="px-5 py-4">{lang === "ar" ? "الحالة" : "Status"}</th>
                <th className="px-5 py-4">{lang === "ar" ? "الاستخدامات" : "Usage Count"}</th>
                <th className="px-5 py-4">{lang === "ar" ? "تاريخ الإنشاء" : "Created Date"}</th>
                <th className="px-5 py-4 text-center">{lang === "ar" ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E2DA]">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-neutral-400">
                    {lang === "ar"
                      ? "لا توجد كوبونات مطابقة."
                      : "No coupons found."}
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className={`hover:bg-[#FAF9F6]/60 transition-colors ${
                      coupon.isDeleted ? "bg-red-50/20" : ""
                    }`}
                  >
                    {/* Code */}
                    <td className="px-5 py-4 font-mono font-bold">
                      <span className="inline-flex items-center px-3 py-1 bg-[#F4F1EA] border border-[#E6E2DA] text-[#2C2A29] text-xs font-mono font-bold rounded-lg tracking-wider uppercase shadow-2xs">
                        {coupon.code}
                      </span>
                    </td>

                    {/* Discount */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full bg-[#EBF3EE] text-[#2D5A43] border border-[#D5E6DC]">
                        {coupon.discountPercent}% OFF
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {coupon.isDeleted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {lang === "ar" ? "محذوف" : "Soft Deleted"}
                        </span>
                      ) : coupon.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {lang === "ar" ? "نشط" : "Active"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {lang === "ar" ? "معطل" : "Inactive"}
                        </span>
                      )}
                    </td>

                    {/* Usage Count */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {coupon.maxUses != null ? (
                        (coupon.usedCount ?? 0) >= coupon.maxUses ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200/80 text-xs font-mono font-bold rounded-lg shadow-2xs">
                            <span>
                              {coupon.usedCount ?? 0} / {coupon.maxUses}
                            </span>
                            <span className="text-[10px] font-sans font-bold bg-red-100 text-red-800 px-1.5 py-0.2 rounded">
                              {lang === "ar" ? "مكتمل" : "Max"}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-[#F4F1EA] text-[#2C2A29] border border-[#E6E2DA] text-xs font-mono font-bold rounded-lg shadow-2xs">
                            {coupon.usedCount ?? 0} / {coupon.maxUses}
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 bg-[#FAF9F6] text-neutral-600 border border-[#E6E2DA] text-xs font-mono font-medium rounded-lg shadow-2xs">
                          {coupon.usedCount ?? 0} / {lang === "ar" ? "غير محدود" : "Unlimited"}
                        </span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="px-5 py-4 text-neutral-500 font-mono text-xs whitespace-nowrap">
                      {new Date(coupon.createdAt).toLocaleDateString(
                        lang === "ar" ? "ar-SA" : "en-US"
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {coupon.isDeleted ? (
                          <button
                            onClick={() => handleRestore(coupon)}
                            disabled={actionLoadingId === coupon.id}
                            className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-medium transition-all shadow-2xs"
                          >
                            {lang === "ar" ? "استعادة" : "Restore"}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEditModal(coupon)}
                              className="px-3 py-1.5 bg-white hover:bg-[#F4F1EA] text-[#2C2A29] border border-[#E6E2DA] rounded-xl text-xs font-medium transition-all shadow-2xs"
                            >
                              {lang === "ar" ? "تعديل" : "Edit"}
                            </button>
                            <button
                              onClick={() => handleToggleActive(coupon)}
                              disabled={actionLoadingId === coupon.id}
                              className={`px-3 py-1.5 border rounded-xl text-xs font-medium transition-all shadow-2xs ${
                                coupon.isActive
                                  ? "bg-white hover:bg-amber-50 text-amber-700 border-amber-200/80"
                                  : "bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200/80"
                              }`}
                            >
                              {coupon.isActive
                                ? lang === "ar"
                                  ? "تعطيل"
                                  : "Deactivate"
                                : lang === "ar"
                                ? "تفعيل"
                                : "Activate"}
                            </button>
                            <button
                              onClick={() => handleSoftDelete(coupon)}
                              disabled={actionLoadingId === coupon.id}
                              className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200/80 rounded-xl text-xs font-medium transition-all shadow-2xs"
                            >
                              {lang === "ar" ? "حذف" : "Delete"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        backdrop="dark"
        className="bg-[#FAF9F6] border border-[#E6E2DA] rounded-[24px] max-w-md w-full p-6 shadow-2xl relative text-right font-sans"
        ariaLabel={
          editingCoupon
            ? lang === "ar"
              ? "تعديل الكوبون"
              : "Edit Coupon"
            : lang === "ar"
            ? "إضافة كوبون جديد"
            : "Add New Coupon"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
          <div>
            <h3 className="text-lg font-bold text-neutral-800">
              {editingCoupon
                ? lang === "ar"
                  ? "تعديل الكوبون"
                  : "Edit Coupon"
                : lang === "ar"
                ? "إضافة كوبون جديد"
                : "Add New Coupon"}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              {lang === "ar"
                ? "أدخل كود الخصم ونسبة المئوية المخصومة والحد الأقصى للاستخدام."
                : "Enter coupon code, discount percentage, and max usage limit."}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {lang === "ar" ? "كود الخصم (رمز الكوبون)" : "Coupon Code"}
              </label>
              <input
                type="text"
                required
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="MAZOOM"
                className="w-full px-4 py-2.5 bg-white border border-[#E6E2DA] rounded-xl text-xs focus:outline-none focus:border-[#B89C72] font-mono uppercase"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {lang === "ar"
                  ? "نسبة الخصم المئوية (%) (من 1 إلى 100)"
                  : "Discount Percentage (%) (1 to 100)"}
              </label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={formDiscountPercent === 0 ? "" : formDiscountPercent}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setFormDiscountPercent(0);
                    return;
                  }
                  const parsed = parseInt(raw, 10);
                  if (isNaN(parsed)) return;
                  if (parsed > 100) {
                    setFormDiscountPercent(100);
                  } else if (parsed < 1) {
                    setFormDiscountPercent(1);
                  } else {
                    setFormDiscountPercent(parsed);
                  }
                }}
                placeholder="50"
                className="w-full px-4 py-2.5 bg-white border border-[#E6E2DA] rounded-xl text-xs focus:outline-none focus:border-[#B89C72] font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {lang === "ar"
                  ? "الحد الأقصى للاستخدام (مثال: 3 - اتركه فارغاً للاستخدام غير المحدود)"
                  : "Max Usage Limit (e.g., 3 - leave blank for unlimited)"}
              </label>
              <input
                type="number"
                min={editingCoupon ? (editingCoupon.usedCount ?? 1) : 1}
                value={formMaxUses}
                onChange={(e) => setFormMaxUses(e.target.value)}
                placeholder={lang === "ar" ? "مثلاً: 3 (اختياري)" : "e.g. 3 (optional)"}
                className="w-full px-4 py-2.5 bg-white border border-[#E6E2DA] rounded-xl text-xs focus:outline-none focus:border-[#B89C72] font-mono"
                dir="ltr"
              />
              {editingCoupon && (editingCoupon.usedCount ?? 0) > 0 && (
                <p className="text-[10px] text-amber-700 mt-1 font-medium">
                  {lang === "ar"
                    ? `تم استخدام الكوبون ${editingCoupon.usedCount} مرة. لا يمكن تقليل الحد الأقصى لأقل من ${editingCoupon.usedCount}.`
                    : `Coupon has been used ${editingCoupon.usedCount} times. Max limit cannot be set lower than ${editingCoupon.usedCount}.`}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="couponIsActive"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="w-4 h-4 text-[#B89C72] rounded border-[#E6E2DA] focus:ring-[#B89C72]"
              />
              <label htmlFor="couponIsActive" className="text-xs font-medium text-neutral-700 cursor-pointer">
                {lang === "ar" ? "تفعيل الكوبون فوراً" : "Activate coupon immediately"}
              </label>
            </div>
          </div>

          {formError && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg text-center font-medium">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="!rounded-xl"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
              className="!rounded-xl"
            >
              {lang === "ar" ? "حفظ الكوبون" : "Save Coupon"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
