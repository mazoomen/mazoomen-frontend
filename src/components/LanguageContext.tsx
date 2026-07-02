"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  // Navigation & General UI
  "Mazoom": { en: "Mazoom", ar: "سوق القوالب" },
  "My Profile": { en: "My Profile", ar: "الملف الشخصي" },
  "Tickets": { en: "Tickets", ar: "التذاكر" },
  "My Purchases": { en: "My Purchases", ar: "مشترياتي" },
  "Settings": { en: "Settings", ar: "الإعدادات" },
  "Log Out": { en: "Log Out", ar: "تسجيل الخروج" },
  "Sign Out": { en: "Sign Out", ar: "تسجيل الخروج" },
  "Login": { en: "Login", ar: "تسجيل الدخول" },
  "Register": { en: "Register", ar: "إنشاء حساب" },
  "Templates": { en: "Templates", ar: "القوالب" },
  "Features": { en: "Features", ar: "المميزات" },
  "Pricing": { en: "Pricing", ar: "الأسعار" },
  "Explore Now": { en: "Explore Now", ar: "استكشف الآن" },
  "Register Now": { en: "Register Now", ar: "سجل الآن" },
  "Arabic": { en: "العربية", ar: "العربية" },
  "English": { en: "English", ar: "English" },

  // Homepage static content
  "DIGITAL WEDDING PLANNER": { en: "DIGITAL WEDDING PLANNER", ar: "مخطط ومصمم دعوات الزفاف الرقمية" },
  "A romantic design performs and wedded wedding template with elegant anniversaries.": {
    en: "A romantic design performs and wedded wedding template with elegant anniversaries.",
    ar: "تصاميم رومانسية ناعمة وقوالب بطاقات زفاف متميزة لحفلات الزفاف والمناسبات السعيدة.",
  },
  "Wedding Invitations": { en: "Wedding Invitations", ar: "دعوات زفاف" },
  "Choose your perfect premium template. All designs are fully customizable.": {
    en: "Choose your perfect premium template. All designs are fully customizable.",
    ar: "اختر قالبك المميز. جميع التصاميم قابلة للتخصيص بالكامل.",
  },
  "Search templates...": { en: "Search templates...", ar: "ابحث عن القوالب..." },
  "Testimonials": { en: "Testimonials", ar: "آراء العملاء" },
  "الكل": { en: "All", ar: "الكل" },
  "جاهزة للتعديل": { en: "Ready to Edit", ar: "جاهزة للتعديل" },
  "تنزيل": { en: "Download", ar: "تنزيل" },
  "تعديل": { en: "Customize", ar: "تعديل" },

  // Categories
  "Weddings": { en: "Weddings", ar: "حفلات زفاف" },
  "Corporate Events": { en: "Corporate Events", ar: "مناسبات شركات" },
  "Anniversaries": { en: "Anniversaries", ar: "ذكرى سنوية" },
  "Bridal Showers": { en: "Bridal Showers", ar: "توديع عزوبية" },
  "Engagement Parties": { en: "Engagement Parties", ar: "حفلات خطوبة" },
  "Birthdays": { en: "Birthdays", ar: "أعياد ميلاد" },

  // Quotes
  "The botanical templates are exceptionally elegant. The guest response tracker made coordinating RSVPs for our wedding completely stress-free.": {
    en: "The botanical templates are exceptionally elegant. The guest response tracker made coordinating RSVPs for our wedding completely stress-free.",
    ar: "كانت قوالب التصاميم النباتية أنيقة للغاية. تعقب ردود الضيوف جعل تنظيم الحضور لحفل زفافنا خالياً تماماً من التوتر.",
  },
  "So beautiful and extremely simple to customize. Approved in minutes, editable fields work like magic. The audio music player option was a massive hit!": {
    en: "So beautiful and extremely simple to customize. Approved in minutes, editable fields work like magic. The audio music player option was a massive hit!",
    ar: "جميل جداً وسهل التخصيص بشكل لا يصدق. تم اعتماده في دقائق، والحقول القابلة للتعديل تعمل كالسحر. خيار مشغل الموسيقى كان نجاحاً باهراً!",
  },
  "The guest RSVP count feature was incredibly helpful. I could see the exact counts and companion details live. Saved hours of phone calls!": {
    en: "The guest RSVP count feature was incredibly helpful. I could see the exact counts and companion details live. Saved hours of phone calls!",
    ar: "كانت ميزة حساب عدد حضور الضيوف مفيدة للغاية. تمكنت من رؤية الأعداد المحددة وتفاصيل المرافقين مباشرة. وفرت ساعات من الاتصالات الهاتفية!",
  },

  // Auth modal
  "Welcome Back!": { en: "Welcome Back!", ar: "مرحباً بعودتك!" },
  "Access your account and continue designing": { en: "Access your account and continue designing", ar: "سجّل الدخول إلى حسابك وتابع تصميم بطاقتك" },
  "Create Account": { en: "Create Account", ar: "إنشاء حساب جديد" },
  "Join us to save and coordinate your event invitations": { en: "Join us to save and coordinate your event invitations", ar: "انضم إلينا لحفظ وتنسيق بطاقات الدعوة الخاصة بك" },
  "Email Address": { en: "Email Address", ar: "البريد الإلكتروني" },
  "Password": { en: "Password", ar: "كلمة المرور" },
  "Forgot Password?": { en: "Forgot Password?", ar: "هل نسيت كلمة المرور؟" },
  "Or continue with": { en: "Or continue with", ar: "أو تابع باستخدام" },
  "Don't have an account?": { en: "Don't have an account?", ar: "ليس لديك حساب؟" },
  "Sign up": { en: "Sign up", ar: "سجل الآن" },
  "Already have an account?": { en: "Already have an account?", ar: "لديك حساب بالفعل؟" },
  "Log in": { en: "Log in", ar: "تسجيل الدخول" },
  "First Name": { en: "First Name", ar: "الاسم الأول" },
  "Last Name": { en: "Last Name", ar: "اسم العائلة" },
  "Phone Number (e.g. +966501234567)": { en: "Phone Number (e.g. +966501234567)", ar: "رقم الهاتف (مثال: +966501234567)" },
  "Password (Min. 8 characters)": { en: "Password (Min. 8 characters)", ar: "كلمة المرور (8 أحرف على الأقل)" },
  "Registering...": { en: "Registering...", ar: "جاري التسجيل..." },
  "Logging in...": { en: "Logging in...", ar: "جاري تسجيل الدخول..." },
  "Please fill in all fields.": { en: "Please fill in all fields.", ar: "يرجى ملء جميع الحقول." },
  "Invalid email or password. Please try again.": { en: "Invalid email or password. Please try again.", ar: "البريد الإلكتروني أو كلمة المرور غير صالحة. يرجى المحاولة مرة أخرى." },
  "Something went wrong. Please try again later.": { en: "Something went wrong. Please try again later.", ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقاً." },
  "All fields are required.": { en: "All fields are required.", ar: "جميع الحقول مطلوبة." },
  "Password must be at least 8 characters.": { en: "Password must be at least 8 characters.", ar: "يجب أن تكون كلمة المرور من 8 أحرف على الأقل." },
  "Registration failed. Please try again.": { en: "Registration failed. Please try again.", ar: "فشل التسجيل. يرجى المحاولة مرة أخرى." },

  // Catalog templates translations
  "دعوة زفاف أنيقة": { en: "Elegant Wedding Invitation", ar: "دعوة زفاف أنيقة" },
  "مجموعة منسقة من أوراق الشجر الخضراء الناعمة وتفاصيل ذهبية مرسومة يدويًا. مثالية لحفلات الزفاف الرومانسية.": {
    en: "A curated foliage design with soft green leaves and hand-drawn gold details. Perfect for romantic weddings.",
    ar: "مجموعة منسقة من أوراق الشجر الخضراء الناعمة وتفاصيل ذهبية مرسومة يدويًا. مثالية لحفلات الزفاف الرومانسية.",
  },
  "بطاقة ميلاد مودرن": { en: "Modern Birthday Card", ar: "بطاقة ميلاد مودرن" },
  "مثلثات حديثة ونظيفة وأشكال هندسية نحاسية مع طبقة نصية داكنة جريئة تناسب أعياد الميلاد المعاصرة.": {
    en: "Modern, clean triangles and copper geometric shapes with a bold dark text overlay suited for contemporary birthdays.",
    ar: "مثلثات حديثة ونظيفة وأشكال هندسية نحاسية مع طبقة نصية داكنة جريئة تناسب أعياد الميلاد المعاصرة.",
  },
  "دعوة لكاف مودرن": { en: "Modern Cafe Reception Invitation", ar: "دعوة لكاف مودرن" },
  "تصميم فاخر بلمسات ماربل ناعمة وخطوط عصرية أنيقة لحفلات الاستقبال والاجتماعات الراقية.": {
    en: "A luxurious design with soft marble accents and elegant modern lines for receptions and high-end meetings.",
    ar: "تصميم فاخر بلمسات ماربل ناعمة وخطوط عصرية أنيقة لحفلات الاستقبال والاجتماعات الراقية.",
  },
  "بطاقة العائلة": { en: "Family Gathering Card", ar: "بطاقة العائلة" },
  "تصميم دافئ وجميل يجمع العائلة والأصدقاء لمشاركة أجمل الأوقات والمناسبات السنوية.": {
    en: "A warm and beautiful design to gather family and friends to share the best times and anniversaries.",
    ar: "تصميم دافئ وجميل يجمع العائلة والأصدقاء لمشاركة أجمل الأوقات والمناسبات السنوية.",
  },
  "توديع العزوبية الكلاسيكي": { en: "Classic Bridal Shower Invitation", ar: "توديع العزوبية الكلاسيكي" },
  "ألوان باستيل ناعمة مع باقات ورد مائية كلاسيكية وخطوط رقيقة تليق بحفلات توديع العزوبية المتميزة.": {
    en: "Soft pastel colors with classic watercolor bouquets and delicate fonts worthy of distinguished bridal showers.",
    ar: "ألوان باستيل ناعمة مع باقات ورد مائية كلاسيكية وخطوط رقيقة تليق بحفلات توديع العزوبية المتميزة.",
  },
  "بطاقة دعوة خطوبة مميزة": { en: "Special Engagement Card", ar: "بطاقة دعوة خطوبة مميزة" },
  "تصميم احتفالي مبهج مع لمسات إضاءة ساحرة وتفاصيل أنيقة تعبر عن الفرح والخطوبة السعيدة.": {
    en: "A joyful festive design with magical lighting touches and elegant details expressing joy and happy engagement.",
    ar: "تصميم احتفالي مبهج مع لمسات إضاءة ساحرة وتفاصيل أنيقة تعبر عن الفرح والخطوبة السعيدة.",
  },
  "دعوة زفاف فاخرة": { en: "Luxury Wedding Invitation", ar: "دعوة زفاف فاخرة" },
  "تصميم رمادي راقٍ مع تفاصيل ملكية مذهبة وأماكن مخصصة للموقع الجغرافي وتفاصيل الحفل الكبيرة.": {
    en: "A sophisticated grey design with royal gilded details and designated spots for maps and ceremony details.",
    ar: "تصميم رمادي راقٍ مع تفاصيل ملكية مذهبة وأماكن مخصصة للموقع الجغرافي وتفاصيل الحفل الكبيرة.",
  },
  "عيد ميلاد سعيد للأطفال": { en: "Happy Kids Birthday", ar: "عيد ميلاد سعيد للأطفال" },
  "تصميم مبهج وملون بالونات مضحكة وحلوى طائرة، مثالي لأعياد ميلاد الأطفال السعيدة.": {
    en: "A cheerful and colorful design with funny balloons and flying candies, perfect for children's happy birthdays.",
    ar: "تصميم مبهج وملون بالونات مضحكة وحلوى طائرة، مثالي لأعياد ميلاد الأطفال السعيدة.",
  },
  "دعوة خطوبة كلاسيك": { en: "Classic Engagement Invitation", ar: "دعوة خطوبة كلاسيك" },
  "تصميم عصري وجذاب مخصص لإعلان الخطوبة والشبكة بمؤثرات بصرية ساحرة وإضاءة براقة.": {
    en: "A modern and attractive design dedicated to engagement announcements with charming visual effects and bright lights.",
    ar: "تصميم عصري وجذاب مخصص لإعلان الخطوبة والشبكة بمؤثرات بصرية ساحرة وإضاءة براقة.",
  },
  "Category": { en: "Category", ar: "الفئة" },
  "لا توجد قوالب تطابق خيارات البحث.": { en: "No templates match your search criteria.", ar: "لا توجد قوالب تطابق خيارات البحث." },
  "How It Works": { en: "How It Works", ar: "كيف يعمل الموقع" },
  "Select a Design": { en: "Select a Design", ar: "اختر التصميم المناسب" },
  "Curate your design layout by browsing and selecting from our premium template gallery.": {
    en: "Curate your design layout by browsing and selecting from our premium template gallery.",
    ar: "تصفح واطلع على تصاميم بطاقات الدعوة المتاحة في معرضنا واختر القالب الأنسب لمناسبتك.",
  },
  "Customize Online": { en: "Customize Online", ar: "عدّل تفاصيل مناسبتك" },
  "Customize details like date, coordinates, texts, and music instantly on your dashboard.": {
    en: "Customize details like date, coordinates, texts, and music instantly on your dashboard.",
    ar: "أدخل معلومات مناسبتك مثل التاريخ، التوقيت، الموقع الجغرافي، الموسيقى، والاسم مباشرة من حسابك.",
  },
  "Download & Share": { en: "Download & Share", ar: "احصل على بطاقتك وشاركها" },
  "Download your invitation image or share the interactive guest link for online RSVP tracking.": {
    en: "Download your invitation image or share the interactive guest link for online RSVP tracking.",
    ar: "حمّل بطاقة دعوتك أو انسخ رابط الدعوة التفاعلي وشاركه مع ضيوفك لتعقب الحضور.",
  },
  "Ahmed Al-Rashid": { en: "Ahmed Al-Rashid", ar: "أحمد الرشيد" },
  "Wedding Host": { en: "Wedding Host", ar: "مضيف حفل زفاف" },
  "Sarah Al-Mansoori": { en: "Sarah Al-Mansoori", ar: "سارة المنصوري" },
  "Bridal Shower Host": { en: "Bridal Shower Host", ar: "مضيفة حفلة توديع عزوبية" },
  "Khalid Bashir": { en: "Khalid Bashir", ar: "خالد بشير" },
  "Anniversary Host": { en: "Anniversary Host", ar: "مضيف ذكرى سنوية" },
  "Loading templates...": { en: "Loading templates...", ar: "جاري تحميل القوالب..." },

  // Profile Settings page
  "My Profile Settings": { en: "My Profile Settings", ar: "إعدادات ملفي الشخصي" },
  "View your account details and update your credentials or contact info. Changes will apply immediately to your active session.": {
    en: "View your account details and update your credentials or contact info. Changes will apply immediately to your active session.",
    ar: "عرض تفاصيل حسابك وتحديث بيانات الاعتماد أو معلومات الاتصال الخاصة بك. ستطبق التغييرات على الفور على جلستك النشطة.",
  },
  "Edit Profile Details": { en: "Edit Profile Details", ar: "تعديل تفاصيل الملف الشخصي" },
  "Member Since": { en: "Member Since", ar: "عضو منذ" },
  "New Password (leave blank to keep current)": { en: "New Password (leave blank to keep current)", ar: "كلمة مرور جديدة (اتركها فارغة للاحتفاظ بالحالية)" },
  "Enter at least 8 characters": { en: "Enter at least 8 characters", ar: "أدخل 8 أحرف على الأقل" },
  "Save Profile Settings": { en: "Save Profile Settings", ar: "حفظ إعدادات الملف الشخصي" },
  "Saving Changes...": { en: "Saving Changes...", ar: "جاري حفظ التغييرات..." },
  "Reload Page": { en: "Reload Page", ar: "إعادة تحميل الصفحة" },
  "ADMIN Account": { en: "ADMIN Account", ar: "حساب المشرف" },
  "CLIENT Account": { en: "CLIENT Account", ar: "حساب العميل" },
  "Phone Number": { en: "Phone Number", ar: "رقم الهاتف" },
  "Failed to load user profile. Make sure the backend server is running.": {
    en: "Failed to load user profile. Make sure the backend server is running.",
    ar: "فشل في تحميل الملف الشخصي. تأكد من تشغيل خادم الخلفية.",
  },
  "Fetching profile details...": {
    en: "Fetching profile details...",
    ar: "جاري جلب تفاصيل الملف الشخصي...",
  },
  "Could Not Load Profile": {
    en: "Could Not Load Profile",
    ar: "لم نتمكن من تحميل الملف الشخصي",
  },

  // Client Dashboard Alerts & Layout
  "Loading your dashboard...": { en: "Loading your dashboard...", ar: "جاري تحميل لوحة التحكم..." },
  "Connection Issue": { en: "Connection Issue", ar: "مشكلة في الاتصال" },
  "Retry Loading": { en: "Retry Loading", ar: "إعادة المحاولة" },
  "Manage your purchased templates, edit Groom & Bride details, copy shareable links, and monitor live RSVP statistics.": {
    en: "Manage your purchased templates, edit Groom & Bride details, copy shareable links, and monitor live RSVP statistics.",
    ar: "قم بإدارة القوالب التي اشتريتها، وتعديل تفاصيل العروسين، ونسخ روابط المشاركة، ومتابعة إحصائيات الرد على الدعوات.",
  },
  "No Purchases Found": { en: "No Purchases Found", ar: "لم يتم العثور على مشتريات" },
  "You haven't purchased any templates yet, or your orders are still pending admin approval.": {
    en: "You haven't purchased any templates yet, or your orders are still pending admin approval.",
    ar: "لم تقم بشراء أي قوالب بعد، أو أن طلباتك لا تزال قيد الانتظار لموافقة المشرف.",
  },
  "Browse Mazoom": { en: "Browse Mazoom", ar: "تصفح سوق القوالب" },
  "Purchased": { en: "Purchased", ar: "تم الشراء في" },
  "Active Invitation": { en: "Active Invitation", ar: "دعوة نشطة" },
  "Pending Setup": { en: "Pending Setup", ar: "إعداد معلق" },
  "Edit Details": { en: "Edit Details", ar: "تعديل التفاصيل" },
  "Copied!": { en: "Copied!", ar: "تم النسخ!" },
  "Copy Link": { en: "Copy Link", ar: "نسخ الرابط" },
  "Track RSVPs": { en: "Track RSVPs", ar: "تعقب الردود" },
  "Audience RSVPs": { en: "Audience RSVPs", ar: "ردود الحضور" },
  "Live guest feedback and attendance metrics.": { en: "Live guest feedback and attendance metrics.", ar: "بيانات حضور الضيوف المباشرة ومؤشراتها." },
  "Failed to load your purchased invitations. Make sure the backend server is running.": {
    en: "Failed to load your purchased invitations. Make sure the backend server is running.",
    ar: "فشل تحميل الدعوات المشتراة. تأكد من تشغيل خادم الخلفية.",
  },
  "Total RSVPs": { en: "Total RSVPs", ar: "إجمالي الردود" },
  "Declined": { en: "Declined", ar: "المعتذرين" },
  "Date Responded": { en: "Date Responded", ar: "تاريخ الرد" },
  "No responses yet": { en: "No responses yet", ar: "لا توجد ردود بعد" },
  "Share your invitation URL with guests to start collecting RSVPs.": {
    en: "Share your invitation URL with guests to start collecting RSVPs.",
    ar: "شارك رابط دعوتك مع الضيوف لبدء جمع ردود الحضور."
  },
  "Failed to load live RSVP guest responses. Please refresh the page.": {
    en: "Failed to load live RSVP guest responses. Please refresh the page.",
    ar: "فشل تحميل ردود حضور الضيوف المباشرة. يرجى إعادة تحميل الصفحة."
  },
  "Close": { en: "Close", ar: "إغلاق" },
  "Back": { en: "Back", ar: "عودة" },
  "None": { en: "None", ar: "لا يوجد" },

  // Alerts
  "Your profile has been updated successfully.": { en: "Your profile has been updated successfully.", ar: "تم تحديث ملفك الشخصي بنجاح." },
  "All fields except new password are required.": { en: "All fields except new password are required.", ar: "جميع الحقول مطلوبة باستثناء كلمة المرور الجديدة." },
  "Password must be at least 8 characters long.": { en: "Password must be at least 8 characters long.", ar: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل." },
  "An unexpected error occurred while updating profile.": { en: "An unexpected error occurred while updating profile.", ar: "حدث خطأ غير متوقع أثناء تحديث الملف الشخصي." },

  // Client Dashboard
  "Manage your purchased template invitations, edit details, and track RSVPs live.": {
    en: "Manage your purchased template invitations, edit details, and track RSVPs live.",
    ar: "قم بإدارة دعوات القوالب المشتراة، وتعديل التفاصيل، ومتابعة الردود مباشرة.",
  },
  "Preview & Share": { en: "Preview & Share", ar: "معاينة ومشاركة" },
  "Copy Invite Link": { en: "Copy Invite Link", ar: "نسخ رابط الدعوة" },
  "Customize Invitation": { en: "Customize Invitation", ar: "تخصيص الدعوة" },
  "Live RSVP Responses": { en: "Live RSVP Responses", ar: "الردود المباشرة على الدعوات" },
  "Manage Guests": { en: "Manage Guests", ar: "إدارة الضيوف" },
  "RSVP Tracker": { en: "RSVP Tracker", ar: "تعقب الردود على الدعوات" },
  "Guest Name": { en: "Guest Name", ar: "اسم الضيف" },
  "Companions": { en: "Companions", ar: "المرافقين" },
  "Status": { en: "Status", ar: "الحالة" },
  "Attending": { en: "Attending", ar: "سيحضر" },
  "Apologized": { en: "Apologized", ar: "أعتذر" },
  "Responses": { en: "Responses", ar: "الردود" },
  "Total Responses": { en: "Total Responses", ar: "إجمالي الردود" },
  "Total Attending": { en: "Total Attending", ar: "إجمالي الحضور" },
  "Excused": { en: "Excused", ar: "المعتذرين" },
  "Total Companions": { en: "Total Companions", ar: "إجمالي المرافقين" },
  "Close RSVP Tracker": { en: "Close RSVP Tracker", ar: "إغلاق تعقب الردود" },
  "Invitation Customizer": { en: "Invitation Customizer", ar: "مخصص الدعوة" },
  "Event Details": { en: "Event Details", ar: "تفاصيل المناسبة" },
  "Event Title": { en: "Event Title", ar: "عنوان المناسبة" },
  "Event Date & Time": { en: "Event Date & Time", ar: "تاريخ ووقت المناسبة" },
  "Location Map URL (Google Maps)": { en: "Location Map URL (Google Maps)", ar: "رابط موقع المناسبة (خرائط جوجل)" },
  "Welcome Message": { en: "Welcome Message", ar: "رسالة الترحيب" },
  "Background Music URL": { en: "Background Music URL", ar: "رابط الموسيقى الخلفية" },
  "Invitation Slide Images": { en: "Invitation Slide Images", ar: "صور شرائح الدعوة" },
  "Add Slide Image URL": { en: "Add Slide Image URL", ar: "إضافة رابط صورة شريحة" },
  "Remove": { en: "Remove", ar: "إزالة" },
  "Save Changes": { en: "Save Changes", ar: "حفظ التغييرات" },
  "Cancel": { en: "Cancel", ar: "إلغاء" },
  "Saving...": { en: "Saving...", ar: "جاري الحفظ..." },
  "Create Invitation": { en: "Create Invitation", ar: "إنشاء دعوة" },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("ar");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lang") as Language;
      if (stored === "en" || stored === "ar") {
        setTimeout(() => {
          setLangState(stored);
        }, 0);
      } else {
        localStorage.setItem("lang", "ar");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
      localStorage.setItem("lang", lang);
    }
  }, [lang]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const t = (key: string): string => {
    const term = translations[key];
    if (!term) return key;
    return term[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
