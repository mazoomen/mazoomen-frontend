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

// ── RSVP payload (matches backend POST /rsvps) ──

export interface CreateRsvpPayload {
  invitationId: string;
  guestName: string;
  willAttend: boolean;
  companionsCount: number;
}
