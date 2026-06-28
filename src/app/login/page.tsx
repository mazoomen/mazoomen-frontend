import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Mazoom",
  description: "Sign in to manage your wedding invitations.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">
          Sign In
        </h1>

        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="mt-2 rounded-lg bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
