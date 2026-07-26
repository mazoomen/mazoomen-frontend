/**
 * Helper functions for retrieving localized template fields (title & description).
 */

export function getTemplateTitle(
  template: { title?: string; titleAr?: string | null; titleEn?: string | null } | null | undefined,
  lang: string
): string {
  if (!template) return "";
  if (lang === "ar") {
    return template.titleAr || template.title || "";
  }
  return template.titleEn || template.title || "";
}

export function getTemplateDescription(
  template: { description?: string; descriptionAr?: string | null; descriptionEn?: string | null } | null | undefined,
  lang: string
): string {
  if (!template) return "";
  if (lang === "ar") {
    return template.descriptionAr || template.description || "";
  }
  return template.descriptionEn || template.description || "";
}
