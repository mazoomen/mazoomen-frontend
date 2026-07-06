"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  purchase: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    };
    template: {
      id: string;
      title: string;
    };
  };
}

interface ReviewsTableProps {
  reviews: Review[];
  onDeleteReview: (id: string) => Promise<void> | void;
}

export default function ReviewsTable({ reviews, onDeleteReview }: ReviewsTableProps) {
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState<number | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter reviews by search query and star count
  const filteredReviews = reviews.filter((review) => {
    // 1. Search Query filter
    const query = searchQuery.toLowerCase();
    const user = review.purchase?.user;
    const fullName = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : "";
    const email = user?.email?.toLowerCase() || "";
    const templateTitle = review.purchase?.template?.title?.toLowerCase() || "";
    const comment = review.comment?.toLowerCase() || "";

    const matchesSearch =
      fullName.includes(query) ||
      email.includes(query) ||
      templateTitle.includes(query) ||
      comment.includes(query);

    // 2. Star count filter
    const matchesStar = starFilter === "all" ? true : review.rating === starFilter;

    return matchesSearch && matchesStar;
  });

  // Pagination calculations
  const totalItems = filteredReviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStarFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStarFilter(val === "all" ? "all" : Number(val));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const confirmDelete = async (id: string) => {
    setDeletingId(null);
    await onDeleteReview(id);
  };

  // Render gold star icons
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="12"
            height="12"
            fill={i < rating ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className="shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499c.195-.572.93-.572 1.125 0l2.122 6.24a.75.75 0 00.716.521h6.562c.607 0 .86.779.37 1.17l-5.309 4.148a.75.75 0 00-.273.839l2.122 6.24c.196.572-.453 1.05-.94.7l-5.308-4.149a.75.75 0 00-.895 0l-5.308 4.149c-.487.35-1.136-.128-.94-.7l2.12-6.24a.75.75 0 00-.273-.839l-5.308-4.148c-.49-.391-.237-1.17.37-1.17h6.563a.75.75 0 00.716-.521l2.122-6.24z"
            />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* ── Search and Controls ──────────────────────────────── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white border border-[#EBE7DF] p-4 rounded-xl shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1 max-w-3xl">
          {/* Text Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={
                lang === "ar"
                  ? "ابحث بالاسم، البريد، النموذج أو نص التقييم..."
                  : "Search reviews by name, email, template, or comment..."
              }
              value={searchQuery}
              onChange={handleSearchChange}
              className={`w-full ${lang === "ar" ? "pl-4 pr-9" : "pl-9 pr-4"} py-2.5 bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg text-xs outline-none focus:border-[#B89C72] text-neutral-800 placeholder-neutral-400`}
            />
            <div className={`absolute inset-y-0 ${lang === "ar" ? "right-3" : "left-3"} flex items-center pointer-events-none text-neutral-400`}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Star Filter */}
          <div className="flex items-center gap-2 text-xs font-sans text-neutral-500 shrink-0">
            <span>{lang === "ar" ? "التقييم:" : "Rating:"}</span>
            <select
              value={starFilter}
              onChange={handleStarFilterChange}
              className="bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg px-3 py-2.5 outline-none text-neutral-805 font-medium cursor-pointer"
            >
              <option value="all">{lang === "ar" ? "كل التقييمات" : "All Ratings"}</option>
              <option value="5">⭐⭐⭐⭐⭐ (5)</option>
              <option value="4">⭐⭐⭐⭐ (4)</option>
              <option value="3">⭐⭐⭐ (3)</option>
              <option value="2">⭐⭐ (2)</option>
              <option value="1">⭐ (1)</option>
            </select>
          </div>
        </div>

        {/* Page size controller */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-sans shrink-0">
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
          <span>{lang === "ar" ? "تقييمات في الصفحة" : "reviews per page"}</span>
        </div>
      </div>

      {/* ── Table Container ─────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-[#EBE7DF] bg-white shadow-sm">
        {totalItems === 0 ? (
          <div className="p-12 text-center bg-[#FAF9F6]/50 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-3">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.195-.572.93-.572 1.125 0l2.122 6.24a.75.75 0 00.716.521h6.562c.607 0 .86.779.37 1.17l-5.309 4.148a.75.75 0 00-.273.839l2.122 6.24c.196.572-.453 1.05-.94.7l-5.308-4.149a.75.75 0 00-.895 0l-5.308 4.149c-.487.35-1.136-.128-.94-.7l2.12-6.24a.75.75 0 00-.273-.839l-5.308-4.148c-.49-.391-.237-1.17.37-1.17h6.563a.75.75 0 00.716-.521l2.122-6.24z" />
              </svg>
            </div>
            <p className="mt-1 text-xs text-neutral-400 font-sans">
              {lang === "ar"
                ? "لم يتم العثور على تقييمات تطابق بحثك."
                : "No reviews found matching your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full ${lang === "ar" ? "text-right" : "text-left"} text-xs font-sans`}>
              <thead>
                <tr className="border-b border-[#EBE7DF] bg-[#FAF8F5]">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "العميل" : "Client"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "النموذج" : "Template"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "التقييم" : "Rating"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "التعليق" : "Comment"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "تاريخ الإضافة" : "Date Posted"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF1EA]">
                {paginatedReviews.map((review) => {
                  const user = review.purchase?.user;
                  const clientName = user ? `${user.firstName} ${user.lastName}` : "Client";
                  const templateTitle = review.purchase?.template?.title || "Template";

                  return (
                    <tr
                      key={review.id}
                      className="transition-colors hover:bg-[#FAF9F6]/50 text-neutral-800"
                    >
                      {/* Client info */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-neutral-800">{clientName}</span>
                          <span className="text-[10px] text-neutral-400 font-mono mt-0.5">{user?.email}</span>
                          <span className="text-[10px] text-neutral-400 mt-0.5">{user?.phoneNumber}</span>
                        </div>
                      </td>

                      {/* Template */}
                      <td className="px-4 py-3.5 text-neutral-700 font-medium">
                        {templateTitle}
                      </td>

                      {/* Rating stars */}
                      <td className="px-4 py-3.5">
                        {renderStars(review.rating)}
                      </td>

                      {/* Comment text */}
                      <td className="px-4 py-3.5 text-neutral-600 max-w-xs md:max-w-sm truncate whitespace-pre-wrap leading-relaxed">
                        {review.comment}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-neutral-500 font-sans">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3.5">
                        {deletingId === review.id ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => confirmDelete(review.id)}
                              className="bg-rose-600 hover:bg-rose-700 text-white rounded px-2 py-1 text-[9px] font-bold cursor-pointer transition-colors"
                            >
                              {lang === "ar" ? "نعم، احذف" : "Yes, Delete"}
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded px-2 py-1 text-[9px] font-semibold cursor-pointer transition-colors"
                            >
                              {lang === "ar" ? "إلغاء" : "Cancel"}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(review.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-colors select-none cursor-pointer"
                          >
                            <svg
                              width="10"
                              height="10"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              className="shrink-0"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            {lang === "ar" ? "حذف" : "Delete"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
              من أصل <span className="font-semibold text-neutral-800">{totalItems}</span> تقييم
            </p>
          ) : (
            <p className="text-neutral-500">
              Showing <span className="font-semibold text-neutral-800">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-neutral-800">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{" "}
              of <span className="font-semibold text-neutral-800">{totalItems}</span> reviews
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
