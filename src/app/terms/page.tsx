"use client";

import { useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import AuthModal from "@/components/AuthModal";
import ContactModal from "@/components/ContactModal";
import Footer from "@/components/Footer";
import { useLanguage } from "@/components/LanguageContext";

export default function TermsOfServicePage() {
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
                {isAr ? "شروط الخدمة" : "Terms of Service"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-[#E5C38B]">
              {isAr ? "شروط الخدمة الاستخدام" : "Terms of Service"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              {isAr
                ? "يُرجى قراءة شروط الخدمة بعناية قبل استخدام منصة معزومين وشراء القوالب أو إنشاء البطاقات الإلكترونية."
                : "Please read these Terms of Service carefully before utilizing Mazoomen to purchase templates or host digital invitations."}
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
                {isAr ? "1. قبول الشروط" : "1. Acceptance of Terms"}
              </h2>
              <p>
                {isAr
                  ? "باستخدامك لمنصة معزومين أو إنشاء حساب أو شراء قوالب بطاقات الدعوة، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يُرجى عدم استخدام الخدمة."
                  : "By accessing Mazoomen, registering an account, or purchasing templates, you agree to be bound by these Terms of Service. If you disagree with any part, please discontinue using the platform."}
              </p>
            </section>

            <hr className="border-[#E9E4DC]" />

            {/* Section 2 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D3142] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B89C72] inline-block shrink-0"></span>
                {isAr ? "2. رخصة استخدام القوالب والحقوق" : "2. Template Licensing & Intellectual Property"}
              </h2>
              <ul className="list-disc ltr:pl-6 rtl:pr-6 flex flex-col gap-2 text-neutral-600">
                <li>
                  {isAr
                    ? "عند شراء قالب من المنصة، يُمنح المستخدم رخصة شخصية غير حصرية لاستخدام القالب وتخصيصه لمناسبته الخاصة."
                    : "Purchasing a template grants a non-exclusive, non-transferable license to customize and host the invitation for your personal or corporate event."}
                </li>
                <li>
                  {isAr
                    ? "يُمنع منعاً باتاً إعادة بيع القوالب، نسخ الشفرة البرمجية، أو توزيع التصاميم كقوالب جاهزة لأطراف أخرى دون إذن كتابي من معزومين."
                    : "Reselling, copying template source code, or redistributing design assets as standalone products is strictly prohibited."}
                </li>
              </ul>
            </section>

            <hr className="border-[#E9E4DC]" />

            {/* Section 3 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D3142] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B89C72] inline-block shrink-0"></span>
                {isAr ? "3. المحتوى وسلوك المستخدم" : "3. User Content & Acceptable Use"}
              </h2>
              <p>
                {isAr
                  ? "يتحمل المستخدم المسؤولية الكاملة عن كافة النصوص والصور والموسيقى والتفاصيل التي يتم رفعها أو إضافتها على بطاقات الدعوة:"
                  : "Users maintain sole responsibility for all content, images, music, and details published on their digital invitations:"}
              </p>
              <ul className="list-disc ltr:pl-6 rtl:pr-6 flex flex-col gap-2 text-neutral-600">
                <li>{isAr ? "يجب ألا ينتهك المحتوى المرفوع حقوق الملكية الفكرية أو العلامات التجارية لأي طرف آخر." : "Uploaded media must not infringe upon copyright or trademark rights of third parties."}</li>
                <li>{isAr ? "يحظر رفع محتوى غير قانوني، مسيء، أو ينتهك الآداب العامة." : "Publishing illegal, defamatory, or inappropriate content is strictly forbidden."}</li>
                <li>{isAr ? "تحتفظ المنصة بحق حظر أو تعطيل أي رابط دعوة يخالف هذه الضوابط." : "Mazoomen reserves the right to suspend or deactivate invitation links violating these guidelines."}</li>
              </ul>
            </section>

            <hr className="border-[#E9E4DC]" />

            {/* Section 4 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D3142] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B89C72] inline-block shrink-0"></span>
                {isAr ? "4. عمليات الدفع وتفعيل الخدمة" : "4. Payments & Activation"}
              </h2>
              <ul className="list-disc ltr:pl-6 rtl:pr-6 flex flex-col gap-2 text-neutral-600">
                <li>{isAr ? "تتم عمليات الدفع إلكترونياً عبر الوسائل المتاحة (Mada, KNET, Credit Cards, Apple Pay)." : "Payments are conducted electronically via certified payment gateways."}</li>
                <li>{isAr ? "يتم تفعيل وتوفير وصول القالب في لوحة التحكم فور تأكيد عملية الدفع." : "Access to customize and activate the template is granted immediately upon successful payment authorization."}</li>
              </ul>
            </section>

            <hr className="border-[#E9E4DC]" />

            {/* Section 5 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D3142] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B89C72] inline-block shrink-0"></span>
                {isAr ? "5. استمرارية الخدمة وإخلاء المسؤولية" : "5. Service Availability & Limitations"}
              </h2>
              <p>
                {isAr
                  ? "تسعى المنصة لضمان عمل كافة الروابط الإلكترونية بأعلى كفاءة وسرعة على مدار الساعة. لا تتحمل المنصة المسؤولية عن الأخطاء المدخلة من قبل أصحاب المناسبة في التواريخ أو العناوين."
                  : "While Mazoomen strives to maintain max uptime and fast performance for digital links, we are not liable for incorrect details (dates, locations) entered by event hosts."}
              </p>
            </section>

            {/* Support Box */}
            <div className="bg-[#FAF8F5] border border-[#E9E4DC] rounded-2xl p-5 sm:p-6 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-1 text-center sm:text-right rtl:sm:text-right ltr:sm:text-left">
                <h3 className="font-bold text-[#2D3142]">
                  {isAr ? "هل لديك استفسار بشأن شروط الاستخدام؟" : "Questions Regarding Our Terms?"}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isAr ? "تواصل معنا لمساعدتك والإجابة على أي استفسارات قانونية أو فنية." : "Reach out to our team for any assistance or legal clarifications."}
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
