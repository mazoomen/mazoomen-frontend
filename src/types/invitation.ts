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
  eventDate: string; // ISO 8601
  locationUrl: string;
  welcomeText: string;
  images: string[];
  musicUrl: string | null;
  createdAt: string;
  template: InvitationTemplate;
}

/** Full invitation response including userId (returned on create/update) */
export interface InvitationFull extends InvitationData {
  userId: string;
}

// ── RSVP ───────────────────────────────────────────────────────────────

export interface CreateRsvpPayload {
  invitationId: string;
  guestName: string;
  willAttend: boolean;
  companionsCount: number;
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

