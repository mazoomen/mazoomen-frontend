// ── Auth / User ────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

// ── Invitation data shape (matches backend GET /invitations/slug/:slug) ──

export interface InvitationTemplate {
  id: string;
  title: string;
  titleAr?: string | null;
  titleEn?: string | null;
  thumbnailUrl: string;
  demoLink?: string;
}

export interface InvitationData {
  id: string;
  templateId: string;
  userId?: string | null;
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
  eventProgram?: { time: string; title: string; titleAr?: string | null; titleEn?: string | null }[];
  eventDetails?: { text: string; textAr?: string | null; textEn?: string | null }[];
  contactName?: string | null;
  contactPhone?: string | null;
  allowGuestUploads?: boolean;
  moments?: string[];
  createdAt: string;
  template: InvitationTemplate;
  wishes?: { name: string; text: string }[];
}


// ── RSVP ───────────────────────────────────────────────────────────────

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

export type TemplateCategory =
  | "Weddings"
  | "Bridal Showers"
  | "Engagement Parties"
  | "Birthdays"
  | "Corporate Events";

export interface Template {
  id: string;
  title: string;
  titleAr?: string | null;
  titleEn?: string | null;
  description: string;
  previewImage: string;
  price: string | number;
  editableFields: Record<string, unknown>;
  demoLink?: string | null;
  isPremium: boolean;
  isActive: boolean;
  category: TemplateCategory;
  createdAt: string;
}

