import type { Metadata } from "next";
import { Playfair_Display, Inter, Aref_Ruqaa, Amiri, Cinzel } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import { CurrencyProvider } from "@/components/CurrencyContext";
import LocationPromptBanner from "@/components/LocationPromptBanner";
import CookieConsentBanner from "@/components/CookieConsentBanner";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const arefRuqaa = Aref_Ruqaa({
  variable: "--font-aref-ruqaa",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mazoomen — Digital Wedding Invitations",
    template: "%s | Mazoomen",
  },
  description:
    "Create and share beautiful digital wedding invitations with Mazoomen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${playfair.variable} ${inter.variable} ${arefRuqaa.variable} ${amiri.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider>
          <CurrencyProvider>
            {children}
            <LocationPromptBanner />
            <CookieConsentBanner />
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

