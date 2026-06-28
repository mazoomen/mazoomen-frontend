import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — Mazoom",
  description: "Manage templates, users, and platform settings.",
};

export default function AdminDashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-6 text-white">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-900/80 p-10 text-center shadow-2xl backdrop-blur-md">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          🛡️ Admin Dashboard
        </h1>
        <p className="text-gray-400">
          Manage templates, users, orders, and platform settings.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          {["Templates", "Users", "Orders", "Settings"].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-gray-700 bg-gray-800/50 px-6 py-8 transition-colors hover:border-indigo-500 hover:bg-gray-800"
            >
              <p className="text-lg font-medium text-gray-200">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
