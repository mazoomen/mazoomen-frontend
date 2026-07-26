// ── Template Types ─────────────────────────────────────────────────────

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
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  previewImage: string;
  price: string | number;
  editableFields: Record<string, unknown>;
  demoLink?: string | null;
  isPremium: boolean;
  isActive: boolean;
  category: TemplateCategory;
  createdAt: string;
}
