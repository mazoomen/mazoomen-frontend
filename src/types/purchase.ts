// ── Purchase Types ─────────────────────────────────────────────────────
// Extracted from inline type definitions in client dashboard pages.

import type { EventProgramItem, EventDetailItem } from "./invitation";

export interface PurchaseTemplate {
  id: string;
  title: string;
  titleAr?: string | null;
  titleEn?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  previewImage: string;
  price: string | number;
  editableFields?: any;
}

export interface PurchaseInvitation {
  id: string;
  slug: string;
  languageMode?: string | null;
  eventTitle: string;
  eventTitleAr?: string | null;
  eventTitleEn?: string | null;
  eventDate: string;
  eventLocation?: string | null;
  eventLocationAr?: string | null;
  eventLocationEn?: string | null;
  locationUrl?: string | null;
  welcomeText?: string | null;
  welcomeTextAr?: string | null;
  welcomeTextEn?: string | null;
  images?: string[];
  musicUrl?: string | null;
  eventProgram?: EventProgramItem[];
  eventDetails?: EventDetailItem[];
  contactName?: string | null;
  contactPhone?: string | null;
  allowGuestUploads?: boolean;
  showMoments?: boolean;
  allowCompanions?: boolean;
  isActive: boolean;
  moments?: string[];
  hiddenMoments?: string[];
  deletedMoments?: string[];
  deletedImages?: string[];
  hiddenImages?: string[];
  galleryOrder?: string[];
}

export interface PurchaseData {
  id: string;
  templateId: string;
  purchaseRequestId: string;
  slug: string;
  createdAt: string;
  template: PurchaseTemplate;
  invitation: PurchaseInvitation | null;
}

export interface CouponUsageUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
}

export interface CouponUsageTemplate {
  id: string;
  title: string;
  previewImage?: string;
  price?: number | string;
}

export interface CouponPurchaseRequest {
  id: string;
  userId: string;
  contactEmail: string;
  contactPhone: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  discountAmount?: number | string | null;
  finalPrice?: number | string | null;
  createdAt: string;
  user?: CouponUsageUser | null;
  template?: CouponUsageTemplate | null;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  maxUses?: number | null;
  usedCount?: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    purchaseRequests: number;
  };
  purchaseRequests?: CouponPurchaseRequest[];
}

export interface PurchaseRequestData {
  id: string;
  templateId: string;
  contactEmail: string;
  contactPhone: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  couponId?: string | null;
  couponCode?: string | null;
  discountAmount?: number | string | null;
  finalPrice?: number | string | null;
  coupon?: {
    id: string;
    code: string;
    discountPercent: number;
  } | null;
  createdAt: string;
  template: PurchaseTemplate;
  purchase?: {
    id: string;
    slug: string;
    testimonial?: {
      id: string;
      rating: number;
      comment: string;
      isDeleted?: boolean;
    } | null;
  } | null;
}
