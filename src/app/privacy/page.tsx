"use client";

import { useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import AuthModal from "@/components/AuthModal";
import ContactModal from "@/components/ContactModal";
import Footer from "@/components/Footer";
import { useLanguage } from "@/components/LanguageContext";

export default function PrivacyPolicyPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <PageLayout>
      <main className="flex-1 flex flex-col min-w-0 bg-[#FAF8F5]">
        {/* Header Banner */}
        <div className="bg-[#0B1528] text-white border-b border-[#1E2E4A] py-10 sm:py-14 px-4 sm:px-10">
          <div className="max-w-[1100px] mx-auto flex flex-col gap-3" dir={isAr ? "rtl" : "ltr"}>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Link href="/" className="hover:text-[#E5C38B] transition-colors">
                {isAr ? "الرئيسية" : "Home"}
              </Link>
              <span>/</span>
              <span className="text-[#E5C38B] font-medium">
                {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-[#E5C38B]">
              {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              {isAr
                ? "نحن نلتزم بحماية خصوصيتك وبيانات ضيوفك. يوضح هذا المستند كيفية جمع المعلومات واستخدامها وحمايتها في منصة معزومين."
                : "We are committed to protecting your privacy and your guests' data. This document outlines how information is collected, used, and safeguarded at Mazoomen."}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-10 py-12 sm:py-16" dir={isAr ? "rtl" : "ltr"}>
          <div className="bg-white border border-[#E9E4DC] rounded-3xl p-6 sm:p-12 shadow-sm flex flex-col gap-8 text-neutral-700 leading-relaxed text-xs sm:text-sm">
            
            {/* Section 1 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D3142] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B89C72] inline-block shrink-0"></span>
                {isAr ? "1. المعلومات التي نجمعها" : "1. Information We Collect"}
              </h2>
              <p>
                {isAr
                  ? "عند استخدام منصة معزومين، نجمع البيانات الضرورية لإنشاء وإدارة بطاقات الدعوة الخاصة بك وتأكيد الحضور:"
                  : "When using Mazoomen, we collect information essential to creating and managing your invitations and RSVP responses:"}
              </p>
              <ul className="list-disc ltr:pl-6 rtl:pr-6 flex flex-col gap-2 text-neutral-600">
                <li>
                  <strong>{isAr ? "بيانات حساب صاحب المناسبة:" : "Host Account Data:"}</strong>{" "}
                  {isAr ? "الاسم الأول والعائلة، البريد الإلكتروني، ورقم الهاتف عند التسجيل." : "First and last name, email address, and phone number."}
                </li>
                <li>
                  <strong>{isAr ? "بيانات تفاصيل المناسبة:" : "Event Invitation Content:"}</strong>{" "}
                  {isAr ? "أسماء العروسين أو أصحاب الحفل، تاريخ المناسبة، توقيتها، موقع الحفل عبر الخريطة، الموسيقى الخلفية، والصور المرفقة." : "Event dates, times, venue locations, background audio, and cover imagery."}
                </li>
                <li>
                  <strong>{isAr ? "ردود تفاعلات الضيوف (RSVP):" : "Guest RSVP Responses:"}</strong>{" "}
                  {isAr ? "أسماء الضيوف، حالة تأكيد الحضور، عدد المرافقين، والتهاني والرسائل المتروكة على الدعوة." : "Guest names, attendance confirmation status, companion counts, and congratulatory notes."}
                </li>
              </ul>
            </section>

            <hr className="border-[#E9E4DC]" />

            {/* Section 2 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D3142] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B89C72] inline-block shrink-0"></span>
                {isAr ? "2. كيفية استخدام البيانات" : "2. How We Use Your Information"}
              </h2>
              <p>
                {isAr
                  ? "تُستخدم البيانات التي نجمعها حصرياً للأغراض التشغيلية التالية:"
                  : "Collected data is used strictly for the following operational purposes:"}
              </p>
              <ul className="list-disc ltr:pl-6 rtl:pr-6 flex flex-col gap-2 text-neutral-600">
                <li>{isAr ? "إنشاء واستضافة رابط الدعوة الإلكتروني التفاعلي الخاص بك." : "Generating and hosting your customized digital invitation page."}</li>
                <li>{isAr ? "عرض إحصائيات وتأكيدات حضور الضيوف مباشرة في لوحة التحكم الخاصة بك." : "Displaying real-time RSVP responses and guest count analytics on your dashboard."}</li>
                <li>{isAr ? "معالجة طلبات شراء القوالب وتأكيد عمليات الدفع الإلكتروني." : "Processing template orders and verifying secure electronic payment transactions."}</li>
                <li>{isAr ? "تقديم الدعم الفني وإخطارك فور تحديث حالة طلباتك." : "Providing technical customer support and notifying you regarding order updates."}</li>
              </ul>
            </section>

            <hr className="border-[#E9E4DC]" />

            {/* Section 3 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D3142] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B89C72] inline-block shrink-0"></span>
                {isAr ? "3. حماية البيانات وعدم المشاركة" : "3. Data Security & Third-Party Sharing"}
              </h2>
              <p>
                {isAr
                  ? "نحن نولي أهمية قصوى للأمان والحفاظ على الخصوصية:"
                  : "We place the highest priority on security and data privacy:"}
              </p>
              <ul className="list-disc ltr:pl-6 rtl:pr-6 flex flex-col gap-2 text-neutral-600">
                <li>{isAr ? "يتم تشفير كافة الاتصالات والبيانات عبر بروتوكولات الأمان المشفرة (SSL)." : "All web traffic and data transmissions are encrypted using standard SSL protocols."}</li>
                <li>{isAr ? "نلتزم بعدم بيع أو تأجير أو مشاركة بياناتك الشخصية أو بيانات ضيوفك مع أي أطراف ثالثة لأغراض إعلانية." : "We strictly commit never to sell, rent, or trade personal data or guest lists to third-party advertisers."}</li>
                <li>{isAr ? "تتم معالجة عمليات الدفع عبر بوابات مشفرة ومحمية بالكامل بواسطة مزودي خدمات الدفع المعتمدين." : "Payments are securely processed directly by certified financial payment gateways."}</li>
              </ul>
            </section>

            <hr className="border-[#E9E4DC]" />

            {/* Section 4 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D3142] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B89C72] inline-block shrink-0"></span>
                {isAr ? "4. ملفات تعريف الارتباط (Cookies)" : "4. Cookies & Local Storage"}
              </h2>
              <p>
                {isAr
                  ? "نستخدم ملفات تعريف الارتباط الأساسية للحفاظ على جلسة تسجيل الدخول وتذكر تفضيلات اللغة (العربية/الإنجليزية) والعملة لضمان تجربة تصفح سلسة."
                  : "We use essential cookies to maintain secure authenticated sessions and remember your preferred language and currency."}
              </p>
            </section>

            <hr className="border-[#E9E4DC]" />

            {/* Section 5 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D3142] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B89C72] inline-block shrink-0"></span>
                {isAr ? "5. حقوق المستخدم وإلغاء الرابط" : "5. User Rights & Data Retention"}
              </h2>
              <p>
                {isAr
                  ? "يحق لك في أي وقت تعديل تفاصيل دعوتك، تعطل رابط الدعوة، أو طلب إزالة البيانات الخاصة بك نهائياً عبر التواصل مع فريق الدعم الفني."
                  : "You have full control to edit, deactivate invitation links, or request complete account data removal at any time."}
              </p>
            </section>

            {/* Support Box */}
            <div className="bg-[#FAF8F5] border border-[#E9E4DC] rounded-2xl p-5 sm:p-6 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-1 text-center sm:text-right rtl:sm:text-right ltr:sm:text-left">
                <h3 className="font-bold text-[#2D3142]">
                  {isAr ? "هل لديك استفسار حول الخصوصية؟" : "Have Privacy Questions?"}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isAr ? "فريقنا متواجد دائماً للإجابة على جميع تساؤلاتك حول أمان بياناتك." : "Our support team is ready to answer any questions regarding your data security."}
                </p>
              </div>
              <button
                onClick={() => setIsContactOpen(true)}
                className="px-5 py-2 bg-[#2D3142] hover:bg-[#1E2230] text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
              >
                {isAr ? "تواصل معنا" : "Contact Support"}
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onOpenContact={() => setIsContactOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </PageLayout>
  );
}
