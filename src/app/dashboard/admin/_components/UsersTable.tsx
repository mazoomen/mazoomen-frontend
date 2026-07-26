"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";

export interface User {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  role: "ADMIN" | "CLIENT";
  isActive: boolean;
  createdAt: string;
}

interface UsersTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onAddUser: () => void;
}

export default function UsersTable({ users, onEditUser, onAddUser }: UsersTableProps) {
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter users by search query
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    return (
      fullName.includes(query) ||
      (user.email || "").toLowerCase().includes(query) ||
      (user.phoneNumber || "").includes(query)
    );
  });

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1 max-w-2xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={
                lang === "ar"
                  ? "ابحث عن المستخدمين بالاسم، البريد أو الهاتف..."
                  : "Search users by name, email, or phone number..."
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

          <button
            onClick={onAddUser}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0B1528] px-4 py-2.5 text-xs font-bold text-[#E5C38B] hover:bg-[#1E2E4A] transition-all cursor-pointer shadow-sm shrink-0 font-sans"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>{lang === "ar" ? "إضافة مستخدم" : "Add User"}</span>
          </button>
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
          <span>{lang === "ar" ? "مستخدمين في الصفحة" : "users per page"}</span>
        </div>
      </div>

      {/* ── Table Container ─────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-[#EBE7DF] bg-white shadow-sm">
        {totalItems === 0 ? (
          <div className="p-12 text-center bg-[#FAF9F6]/50 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-3">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="mt-1 text-xs text-neutral-400 font-sans">
              {lang === "ar"
                ? "لم يتم العثور على مستخدمين يطابقون بحثك."
                : "No users found matching your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full ${lang === "ar" ? "text-right" : "text-left"} text-xs font-sans`}>
              <thead>
                <tr className="border-b border-[#EBE7DF] bg-[#FAF8F5]">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "اسم المستخدم" : "User Name"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "رقم الهاتف" : "Phone Number"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "الصلاحية" : "Role"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "الحالة" : "Status"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "تاريخ الانضمام" : "Date Joined"}
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">
                    {lang === "ar" ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF1EA]">
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-[#FAF9F6]/50 text-neutral-800"
                  >
                    {/* User Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#B89C72]/15 text-[10px] font-bold text-[#B89C72]">
                          {user.firstName?.[0] || ""}
                          {user.lastName?.[0] || ""}
                        </div>
                        <span className="font-semibold text-neutral-800">
                          {user.firstName || ""} {user.lastName || ""}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3.5 text-neutral-600 font-mono">
                      {user.email || "—"}
                    </td>

                    {/* Phone Number */}
                    <td className="px-4 py-3.5">
                      {user.phoneNumber ? (
                        <a
                          href={`https://wa.me/${user.phoneNumber.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 transition-colors hover:text-emerald-700 font-semibold"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="shrink-0"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          {user.phoneNumber}
                        </a>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          user.role === "ADMIN"
                            ? "bg-purple-50 text-purple-600 border-purple-100"
                            : "bg-[#B89C72]/10 text-[#B89C72] border-[#B89C72]/20"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-rose-50 text-rose-600 border-rose-100"
                        }`}
                      >
                        {user.isActive
                          ? (lang === "ar" ? "نشط" : "Active")
                          : (lang === "ar" ? "معطل" : "Deactive")}
                      </span>
                    </td>

                    {/* Date Joined */}
                    <td className="px-4 py-3.5 text-neutral-500 font-sans">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Edit Action Button */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => onEditUser(user)}
                        className="inline-flex items-center gap-1 rounded-md border border-[#EBE7DF] bg-white px-2.5 py-1.5 text-[10px] font-bold text-neutral-600 hover:bg-[#FAF8F5] transition-colors select-none cursor-pointer"
                      >
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        {lang === "ar" ? "تعديل" : "Edit"}
                      </button>
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
              من أصل <span className="font-semibold text-neutral-800">{totalItems}</span> مستخدم
            </p>
          ) : (
            <p className="text-neutral-500">
              Showing <span className="font-semibold text-neutral-800">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-neutral-800">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{" "}
              of <span className="font-semibold text-neutral-800">{totalItems}</span> users
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
