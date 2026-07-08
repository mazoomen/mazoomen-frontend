// ── Re-exports from split type files ───────────────────────────────────
// Kept for backward compatibility — new code should import directly
// from @/types/auth, @/types/template, or @/types/purchase.
export type { AuthUser, LoginResponse, UserProfile } from "./auth";
export type { Template, TemplateCategory } from "./template";
export type {
  PurchaseData,
  PurchaseInvitation,
  PurchaseTemplate,
  PurchaseRequestData,
} from "./purchase";

// ── Invitation-Specific Types ──────────────────────────────────────────

export interface EventProgramItem {
  time: string;
  title: string;
  titleAr?: string | null;
  titleEn?: string | null;
}

export interface EventDetailItem {
  text: string;
  textAr?: string | null;
  textEn?: string | null;
}

export interface InvitationTemplate {
  id: string;
  title: string;
  titleAr?: string | null;
  titleEn?: string | null;
  thumbnailUrl: string;
  demoLink?: string;
  editableFields?: any;
}

export interface InvitationData {
  id: string;
  templateId: string;
  userId?: string | null;
  purchaseId?: string | null;
  slug: string;
  languageMode?: string | null;
  eventTitle: string;
  eventTitleAr?: string | null;
  eventTitleEn?: string | null;
  eventDate: string; // ISO 8601
  eventLocation: string;
  eventLocationAr?: string | null;
  eventLocationEn?: string | null;
  locationUrl?: string | null;
  welcomeText?: string | null;
  welcomeTextAr?: string | null;
  welcomeTextEn?: string | null;
  images: string[];
  musicUrl: string | null;
  eventProgram?: EventProgramItem[];
  eventDetails?: EventDetailItem[];
  contactName?: string | null;
  contactPhone?: string | null;
  allowGuestUploads?: boolean;
  moments?: string[];
  createdAt: string;
  template: InvitationTemplate;
  wishes?: { name: string; text: string }[];
}

// ── RSVP Types ─────────────────────────────────────────────────────────

export interface CreateRsvpPayload {
  invitationId: string;
  name: string;
  attendance: "YES" | "NO";
  guestsCount: number;
  message?: string;
}

export interface RsvpResponse {
  id: string;
  invitationId: string;
  guestName: string;
  willAttend: boolean;
  companionsCount: number;
  createdAt: string;
}

export interface RsvpStatistics {
  totalResponses: number;
  totalAttending: number;
  totalExcused: number;
  totalCompanions: number;
}

export interface RsvpListResponse {
  invitationId: string;
  statistics: RsvpStatistics;
  rsvps: RsvpResponse[];
}
