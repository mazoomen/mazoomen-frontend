"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";

interface FAQItem {
  id: string;
  category: "general" | "customization" | "payment" | "technical";
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "faq-1",
    category: "general",
    questionAr: "ما هي منصة معزومين وكيف تعمل؟",
    questionEn: "What is Mazoomen and how does it work?",
    answerAr:
      "معزومين هي منصة إلكترونية متكاملة لتصميم وإدارة بطاقات ودعوات الزفاف والمناسبات. تبدأ باختيار القالب المناسب، ثم تخصيص التفاصيل كالأسماء والموعد والموقع والخريطة والموسيقى، وبعد ذلك يمكنك نشر رابط الدعوة ومشاركته مع ضيوفك لمتابعة ردود الحضور (RSVP) مباشرة.",
    answerEn:
      "Mazoomen is an all-in-one digital platform for creating and managing wedding and event invitations. Choose a template, customize the details (names, dates, location map, music), then share your interactive link to collect real-time RSVPs from your guests.",
  },
  {
    id: "faq-2",
    category: "customization",
    questionAr: "كيف يمكنني تخصيص تفاصيل القالب بعد الشراء؟",
    questionEn: "How do I customize a template after purchasing?",
    answerAr:
      "فور إتمام عملية الشراء، سيظهر القالب في لوحة التحكم الخاصة بك تحت 'مشترياتي'. اضغط على تعديل لتخصيص أسماء العروسين، التواريخ، موقع الحفل عبر خريطة تفاعلية، الموسيقى الخلفية، جدول الفقرات، ورسالة الترحيب بسهولة.",
    answerEn:
      "Immediately after purchase, your template will appear in your Dashboard under 'My Purchases'. Click Customize to edit names, dates, map location, background music, event schedule, and personalized greeting messages.",
  },
  {
    id: "faq-3",
    category: "customization",
    questionAr: "كيف يتلقى الضيوف الدعوة ويردون بالحضور (RSVP)؟",
    questionEn: "How do guests receive the invitation and send RSVPs?",
    answerAr:
      "يمكنك مشاركة رابط الدعوة الخاص بك عبر واتساب أو الرسائل النصية أو وسائل التواصل الاجتماعي. عند فتح الرابط، يرى الضيف البطاقة التفاعلية ويمكنه تأكيد الحضور، تحديد عدد المرافقين، وإرسال تهنئة خاصة تظهر لك في لوحة التحكم.",
    answerEn:
      "You can share your unique invitation link via WhatsApp, SMS, or social media. Guests open the link, view your interactive card, confirm attendance (RSVP), specify guest count, and write warm congratulations for you.",
  },
  {
    id: "faq-4",
    category: "customization",
    questionAr: "هل يمكنني تعديل تفاصيل الدعوة بعد إرسالها للضيوف؟",
    questionEn: "Can I update invitation details after sending links?",
    answerAr:
      "نعم! يمكنك تحديث أي معلومات (مثل توقيت الحفل أو موقع الخريطة) من لوحة التحكم في أي وقت، وتتحدث البيانات فوراً لدى الضيوف عند فتح الرابط دون الحاجة لإعادة إرسال رابط جديد.",
    answerEn:
      "Yes! You can update details (such as event timing or venue location) anytime from your dashboard. Updates reflect live immediately for all guests opening the link.",
  },
  {
    id: "faq-5",
    category: "payment",
    questionAr: "ما هي طرق الدفع المتاحة في المنصة؟",
    questionEn: "What payment methods are supported?",
    answerAr:
      "نوفر وسائل دفع إلكترونية آمنة وسريعة تشمل بطاقات مدى (Mada)، كي نت (KNET)، البطاقات الائتمانية (Visa / Mastercard)، و Apple Pay بحسب بلدك.",
    answerEn:
      "We support secure electronic payments including Mada, KNET, Credit Cards (Visa / Mastercard), and Apple Pay depending on your location.",
  },
  {
    id: "faq-6",
    category: "customization",
    questionAr: "هل يوجد حد أقصى لعدد الضيوف أو التفاعلات؟",
    questionEn: "Is there a limit on the number of invited guests?",
    answerAr:
      "لا يوجد حد أقصى لعدد الضيوف الذين يفتحون الرابط! يمكنك مشاركة الدعوة مع أي عدد من المدعوين وتتبع ردود الحضور وإحصائيات الحضور في لوحة التحكم دون قيود.",
    answerEn:
      "There is no limit on the number of guests who can view your invitation link! Share with as many guests as you like and track unlimited RSVPs easily.",
  },
  {
    id: "faq-7",
    category: "technical",
    questionAr: "هل تعمل بطاقات الدعوة على جميع أجهزة الجوال؟",
    questionEn: "Do invitations work on all smartphones and browsers?",
    answerAr:
      "بالتأكيد. جميع قوالب معزومين صُممت بتقنيات حديثة وتتجاوب تلقائياً مع كافة الشاشات وأجهزة آيفون، أندرويد، الأجهزة اللوحية، وأجهزة الكمبيوتر.",
    answerEn:
      "Absolutely. All Mazoomen templates are built with modern web technologies, fully responsive across iPhones, Android devices, tablets, and desktop browsers.",
  },
  {
    id: "faq-8",
    category: "technical",
    questionAr: "هل يمكن إتاحة تشغيل الموسيقى وإضافة موقع الخريطة؟",
    questionEn: "Can I add background music and Google Maps direction?",
    answerAr:
      "نعم، تتيح القوالب رفع أو اختيار مقطع صوتي يشتغل أثناء تصفح البطاقة، بالإضافة إلى زر توجيه مباشر برابط خرائط جوجل (Google Maps) ليسهل الوصول لمكان الحفل.",
    answerEn:
      "Yes, you can select or upload background music that plays during viewing, and attach a direct Google Maps button to guide your guests to the venue.",
  },
];

interface FAQSectionProps {
  onOpenContact?: () => void;
}

export default function FAQSection({ onOpenContact }: FAQSectionProps) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [openId, setOpenId] = useState<string | null>("faq-1");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", labelAr: "الكل", labelEn: "All" },
    { id: "general", labelAr: "عامة", labelEn: "General" },
    { id: "customization", labelAr: "التخصيص والـ RSVP", labelEn: "Customization & RSVP" },
    { id: "payment", labelAr: "الدفع والأسعار", labelEn: "Payments & Pricing" },
    { id: "technical", labelAr: "الدعم والدقة", labelEn: "Technical Support" },
  ];

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.questionAr.toLowerCase().includes(query) ||
      item.questionEn.toLowerCase().includes(query) ||
      item.answerAr.toLowerCase().includes(query) ||
      item.answerEn.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="px-4 sm:px-10 py-12 sm:py-20 bg-[#FAF8F5] border-t border-[#E6E2DA]">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8 sm:gap-12" dir={isAr ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#B89C72] bg-[#F4EDE1] border border-[#E8DCC4] rounded-full">
            {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-800">
            {isAr ? "كل ما تود معرفته عن دعوات معزومين" : "Everything You Need to Know"}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl leading-relaxed">
            {isAr
              ? "إليك إجابات لأكثر الأسئلة تداولاً حول كيفية اختيار القوالب، التخصيص، وتتبع ردود ضيوفك بسهولة."
              : "Find instant answers to popular questions regarding template customization, guest RSVPs, and payments."}
          </p>
        </div>

        {/* Search & Category Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                  selectedCategory === cat.id
                    ? "bg-[#2D3142] text-white border-[#2D3142] shadow-sm"
                    : "bg-white text-neutral-600 border-[#E9E4DC] hover:border-neutral-400"
                }`}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث في الأسئلة..." : "Search questions..."}
              className="w-full h-9 px-3 text-xs bg-white border border-[#E9E4DC] rounded-xl focus:outline-none focus:border-[#B89C72] text-neutral-800 placeholder-neutral-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute ltr:right-2.5 rtl:left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Accordion List */}
        {filteredFaqs.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "border-[#B89C72] shadow-sm ring-1 ring-[#B89C72]/20"
                      : "border-[#E9E4DC] hover:border-neutral-300"
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-5 sm:px-6 py-4 flex items-center justify-between text-left rtl:text-right gap-4 cursor-pointer focus:outline-none bg-transparent"
                    aria-expanded={isOpen}
                  >
                    <span className="font-sans font-bold text-xs sm:text-sm text-[#2D3142] leading-snug">
                      {isAr ? faq.questionAr : faq.questionEn}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                        isOpen
                          ? "bg-[#2D3142] text-white border-[#2D3142] rotate-180"
                          : "bg-[#FAF8F5] text-neutral-600 border-[#E9E4DC]"
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-[#F4EDE1]">
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                        {isAr ? faq.answerAr : faq.answerEn}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-white border border-[#E9E4DC] rounded-2xl">
            <p className="text-xs text-neutral-500">
              {isAr
                ? "لم نجد أي أسئلة تطابق بحثك."
                : "No questions match your search query."}
            </p>
          </div>
        )}

        {/* Contact Banner */}
        <div className="bg-white border border-[#E9E4DC] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-1 text-center sm:text-right rtl:sm:text-right ltr:sm:text-left">
            <h3 className="text-sm sm:text-base font-bold text-[#2D3142]">
              {isAr ? "هل لديك سؤال آخر؟" : "Still Have Questions?"}
            </h3>
            <p className="text-xs text-neutral-500">
              {isAr
                ? "فريق الدعم الفني جاهز لمساعدتك وإجابة كافة استفساراتك حول المناسبات."
                : "Our support team is here to assist you with any custom event requests."}
            </p>
          </div>
          <button
            onClick={onOpenContact}
            className="px-6 py-2.5 bg-[#2D3142] hover:bg-[#1E2230] text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
          >
            {isAr ? "تواصل مع الدعم" : "Contact Support"}
          </button>
        </div>
      </div>
    </section>
  );
}
