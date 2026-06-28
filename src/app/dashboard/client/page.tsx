import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Invitations — Mazoom",
  description: "Manage your wedding invitations and track RSVPs.",
};

export default function ClientDashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-rose-100 bg-white/90 p-10 text-center shadow-xl backdrop-blur-md">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
          💌 My Invitations
        </h1>
        <p className="text-gray-500">
          Create, customize, and share your wedding invitations.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          {["My Invitations", "Guest List", "RSVP Tracking", "Settings"].map(
            (item) => (
              <div
                key={item}
                className="rounded-xl border border-rose-200 bg-rose-50/50 px-6 py-8 transition-colors hover:border-rose-400 hover:bg-rose-50"
              >
                <p className="text-lg font-medium text-gray-700">{item}</p>
              </div>
            ),
          )}
        </div>
      </div>
    </main>
  );
}
