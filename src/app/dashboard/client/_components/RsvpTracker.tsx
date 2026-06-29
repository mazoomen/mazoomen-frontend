"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { RsvpListResponse, RsvpResponse } from "@/types/invitation";

interface RsvpTrackerProps {
  invitationId: string;
}

type LoadStatus = "loading" | "loaded" | "error";

export default function RsvpTracker({ invitationId }: RsvpTrackerProps) {
  const [data, setData] = useState<RsvpListResponse | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    const fetchRsvps = async () => {
      try {
        const res = await api.get<RsvpListResponse>(
          `/invitations/${invitationId}/rsvps`,
        );
        setData(res.data);
        setStatus("loaded");
      } catch {
        setStatus("error");
      }
    };

    fetchRsvps();
  }, [invitationId]);

  if (status === "loading") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">RSVP Responses</h2>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-gray-800/50"
            />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-gray-800/50" />
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <p className="text-sm text-red-400">
          Failed to load RSVP data. Please try refreshing.
        </p>
      </div>
    );
  }

  const { statistics, rsvps } = data;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">RSVP Responses</h2>

      {/* ── Stats Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Responses"
          value={statistics.totalResponses}
          color="indigo"
        />
        <StatCard
          label="Attending"
          value={statistics.totalAttending}
          color="emerald"
        />
        <StatCard
          label="Declined"
          value={statistics.totalExcused}
          color="rose"
        />
        <StatCard
          label="Companions"
          value={statistics.totalCompanions}
          color="amber"
        />
      </div>

      {/* ── Guest Table ────────────────────────────────────────── */}
      {rsvps.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-10 text-center">
          <p className="text-3xl">📋</p>
          <p className="mt-3 text-sm text-gray-400">
            No responses yet. Share your invitation link to start receiving
            RSVPs!
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/80">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                    Guest Name
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                    Companions
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 sm:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {rsvps.map((rsvp: RsvpResponse) => (
                  <tr
                    key={rsvp.id}
                    className="transition-colors hover:bg-gray-800/30"
                  >
                    <td className="px-4 py-3 font-medium text-gray-200">
                      {rsvp.guestName}
                    </td>
                    <td className="px-4 py-3">
                      {rsvp.willAttend ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Attending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/10 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                          Declined
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {rsvp.companionsCount > 0
                        ? `+${rsvp.companionsCount}`
                        : "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                      {new Date(rsvp.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat Card Sub-Component ──────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "indigo" | "emerald" | "rose" | "amber";
}) {
  const colorMap = {
    indigo: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400",
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    rose: "border-rose-500/20 bg-rose-500/5 text-rose-400",
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-400",
  };

  return (
    <div
      className={`rounded-xl border p-4 text-center ${colorMap[color]}`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider opacity-70">
        {label}
      </p>
    </div>
  );
}
