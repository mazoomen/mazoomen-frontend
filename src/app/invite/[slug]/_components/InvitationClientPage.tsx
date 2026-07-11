'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { InvitationData } from '@/types/invitation';
import api from '@/lib/api';
import InvitationClientPageGarden from './garden';
import InvitationClientPageEmerald from './emerald';
import InvitationClientPageRoyalGold from './royal-gold';
import InvitationClientPageBohoTerracotta from './boho-terracotta';
import InvitationClientPageWatercolorLily from './watercolor-lily';
import InvitationEditor from '@/app/dashboard/client/_components/InvitationEditor';
import "../invitation.css";

interface InvitationClientPageProps {
  invitation?: InvitationData;
  slug?: string;
  isDeactivatedInitial?: boolean;
}

export default function InvitationClientPage({
  invitation,
  slug,
  isDeactivatedInitial = false,
}: InvitationClientPageProps) {
  const [localInvitation, setLocalInvitation] = useState<InvitationData | undefined>(invitation);
  const [loading, setLoading] = useState(isDeactivatedInitial);
  const [error, setError] = useState(false);
  const [viewingLang, setViewingLang] = useState<"ar" | "en">("ar");

  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Check if owner or admin is logged in
  useEffect(() => {
    if (typeof window !== "undefined" && localInvitation) {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user) {
            if (localInvitation.userId && user.id === localInvitation.userId) {
              setIsOwner(true);
            }
            if (user.role === "ADMIN") {
              setIsAdmin(true);
            }
          }
        } catch {}
      }
    }
  }, [localInvitation]);

  const fetchFreshInvitation = useCallback(() => {
    if (!slug) return;
    api.get<InvitationData>(`/invitations/slug/${slug}`)
      .then((res) => {
        setLocalInvitation(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch fresh invitation:", err);
      });
  }, [slug]);

  useEffect(() => {
    if (localInvitation) {
      if (localInvitation.languageMode === "en") {
        setViewingLang("en");
      } else {
        setViewingLang("ar");
      }
    }
  }, [localInvitation]);

  // ── Client-side fetch with token if initial load was deactivated ──
  useEffect(() => {
    if (!isDeactivatedInitial || !slug) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      setError(true);
      return;
    }

    api.get<InvitationData>(`/invitations/slug/${slug}`)
      .then((res) => {
        setLocalInvitation(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Client side invitation lookup failed:", err);
        setLoading(false);
        setError(true);
      });
  }, [isDeactivatedInitial, slug]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F2EB] font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-[#B89C72]" />
          <p className="text-xs text-neutral-400 font-medium">جاري التحقق من الرابط والتصريح…</p>
        </div>
      </div>
    );
  }

  // Deactivated state
  if (error || !localInvitation) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FBF9F5] px-6 text-center font-sans">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4 border border-red-100 shadow-xs">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="mb-3 font-serif text-xl text-[#2C2C2C] font-bold">
          هذه الدعوة غير متاحة حالياً
        </h1>
        <p className="mb-8 max-w-sm text-xs text-[#9B9B9B] leading-relaxed">
          تم إيقاف تفعيل هذا الرابط مؤقتاً من قِبل صاحب الدعوة أو إدارة المنصة. يرجى التواصل مع ناشر الرابط للمزيد من التفاصيل.
        </p>
      </main>
    );
  }

  let pageContent: React.ReactNode;

  // Delegate rendering to corresponding template component
  if (
    localInvitation.template?.title === 'Watercolor Garden Wedding' ||
    localInvitation.template?.titleEn === 'Watercolor Garden Wedding'
  ) {
    pageContent = (
      <InvitationClientPageGarden
        invitation={localInvitation}
        slug={slug}
        isDeactivatedInitial={isDeactivatedInitial}
        viewingLangProp={viewingLang}
        setViewingLangProp={setViewingLang}
      />
    );
  } else if (
    localInvitation.template?.title === 'Emerald Luxury Wedding' ||
    localInvitation.template?.titleEn === 'Emerald Luxury Wedding'
  ) {
    pageContent = (
      <InvitationClientPageEmerald
        invitation={localInvitation}
        slug={slug}
        isDeactivatedInitial={isDeactivatedInitial}
        viewingLangProp={viewingLang}
        setViewingLangProp={setViewingLang}
      />
    );
  } else if (
    localInvitation.template?.title === 'Boho Terracotta Wedding' ||
    localInvitation.template?.titleEn === 'Boho Terracotta Wedding'
  ) {
    pageContent = (
      <InvitationClientPageBohoTerracotta
        invitation={localInvitation}
        slug={slug}
        isDeactivatedInitial={isDeactivatedInitial}
        viewingLangProp={viewingLang}
        setViewingLangProp={setViewingLang}
      />
    );
  } else if (
    localInvitation.template?.title === 'Watercolor Lily Wedding' ||
    localInvitation.template?.titleEn === 'Watercolor Lily Wedding'
  ) {
    pageContent = (
      <InvitationClientPageWatercolorLily
        invitation={localInvitation}
        slug={slug}
        isDeactivatedInitial={isDeactivatedInitial}
        viewingLangProp={viewingLang}
        setViewingLangProp={setViewingLang}
      />
    );
  } else {
    // Default fallback to Royal Gold Wedding (1st template)
    pageContent = (
      <InvitationClientPageRoyalGold
        invitation={localInvitation}
        slug={slug}
        isDeactivatedInitial={isDeactivatedInitial}
        viewingLangProp={viewingLang}
        setViewingLangProp={setViewingLang}
      />
    );
  }

  const showEditButton = isOwner || isAdmin;

  return (
    <>
      {pageContent}

      {showEditButton && (
        <>
          {/* Floating Premium edit button */}
          <button
            id="floating-edit-invitation-btn"
            onClick={() => setIsEditorOpen(true)}
            className="fixed bottom-6 left-6 z-[99999] px-5 py-3.5 rounded-full bg-gradient-to-r from-[#0b1528] to-[#15243f] text-[#E5C38B] border border-[#E5C38B]/35 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer font-sans font-bold text-xs select-none"
            style={{
              boxShadow: 'rgba(229, 195, 139, 0.25) 0px 8px 24px',
            }}
          >
            <svg className="w-4 h-4 text-[#E5C38B]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            <span>{viewingLang === 'en' ? 'Edit Details' : 'تعديل البيانات'}</span>
          </button>

          {/* Invitation Editor Modal Overlay */}
          {isEditorOpen && (
            <div
              className="fixed inset-0 bg-[#2D3142]/45 backdrop-blur-sm z-[999999] overflow-y-auto p-4 flex justify-center items-start"
              role="dialog"
              aria-modal="true"
            >
              <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[32px] max-w-xl w-full p-8 shadow-2xl relative my-8 mx-auto text-neutral-800">
                {/* Close Button */}
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="absolute top-6 right-6 text-neutral-450 hover:text-black transition-colors cursor-pointer"
                  aria-label="Close editor"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Modal Body */}
                <InvitationEditor
                  purchaseId={localInvitation.purchaseId || ""}
                  invitation={localInvitation}
                  templateTitle={localInvitation.template?.title || ""}
                  onSaved={() => {
                    setIsEditorOpen(false);
                    fetchFreshInvitation();
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
