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
  thumbnailUrl: string;
  demoLink?: string;
}

export interface InvitationData {
  id: string;
  templateId: string;
  slug: string;
  eventTitle: string;
  eventDate: string; // ISO 8601
  eventLocation: string;
  locationUrl?: string | null;
  welcomeText?: string | null;
  images: string[];
  musicUrl: string | null;
  eventProgram?: { time: string; title: string }[];
  eventDetails?: { text: string }[];
  createdAt: string;
  template: InvitationTemplate;
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

export interface Template {
  id: string;
  title: string;
  description: string;
  previewImage: string;
  price: string | number;
  editableFields: Record<string, unknown>;
  demoLink?: string | null;
  isPremium: boolean;
  isActive: boolean;
  category?: string;
  createdAt: string;
}

