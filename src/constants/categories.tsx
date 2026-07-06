import React from "react";

export interface CategoryItem {
  name: string;
  arName: string;
  icon: React.ReactNode;
}

export const CATEGORIES: CategoryItem[] = [
  {
    name: "All",
    arName: "All",
    icon: (
      <svg className="w-5 h-5 text-[#B89C72]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    name: "Weddings",
    arName: "Weddings",
    icon: (
      <svg className="w-5 h-5 text-[#B89C72]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    name: "Bridal Showers",
    arName: "Bridal Showers",
    icon: (
      <svg className="w-5 h-5 text-[#B89C72]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096m.813 5.096a9 9 0 0113.626-9.878m-13.626 9.878a9 9 0 1113.626-9.878" />
      </svg>
    ),
  },
  {
    name: "Engagement Parties",
    arName: "Engagement Parties",
    icon: (
      <svg className="w-5 h-5 text-[#B89C72]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="14" r="5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8V4m0 4l2-2m-2 2L10 6" />
      </svg>
    ),
  },
  {
    name: "Birthdays",
    arName: "Birthdays",
    icon: (
      <svg className="w-5 h-5 text-[#B89C72]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697-.056-4.024-.166C6.845 7.99 6 7.086 6 6V4.875C6 3.839 6.84 3 7.875 3h8.25c1.035 0 1.875.84 1.875 1.875V6c0 1.086-.845 1.99-1.976 2.084A41.748 41.748 0 0112 8.25zM12 8.25c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.414 18 10.5v.18c0 .907-.638 1.678-1.528 1.86A41.87 41.87 0 0112 12.75a41.87 41.87 0 01-4.472-.21c-.89-.182-1.528-.953-1.528-1.86v-.18c0-1.086.845-1.99 1.976-2.084A41.748 41.748 0 0112 8.25zm0 4.5c1.355 0 2.697.056 4.024.166C17.155 13.01 18 13.914 18 15v4.5A2.25 2.25 0 0115.75 21.75H8.25A2.25 2.25 0 016 19.5V15c0-1.086.845-1.99 1.976-2.084A41.748 41.748 0 0112 12.75z" />
      </svg>
    ),
  },
  {
    name: "Corporate Events",
    arName: "Corporate Events",
    icon: (
      <svg className="w-5 h-5 text-[#B89C72]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8v-1.661c0-.53-.222-1.03-.618-1.386l-1.382-1.244a2.25 2.25 0 00-1.508-.567H14.25m0 0V4.5A2.25 2.25 0 0012 2.25h-.75a2.25 2.25 0 00-2.25 2.25v2.25M9 6.75H5.25a2.25 2.25 0 00-1.508.567L2.36 8.56A2.25 2.25 0 001.74 9.95v1.661c0 .6.28 1.161.75 1.549M9 6.75h6" />
      </svg>
    ),
  },
];
