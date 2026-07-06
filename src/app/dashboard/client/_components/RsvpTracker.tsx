'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { RsvpListResponse, RsvpResponse } from '@/types/invitation';
import { useLanguage } from '@/components/LanguageContext';

interface RsvpTrackerProps {
  invitationId: string;
}

type LoadStatus = 'loading' | 'loaded' | 'error';

export default function RsvpTracker({ invitationId }: RsvpTrackerProps) {
  const { lang, t } = useLanguage();
  const [data, setData] = useState<RsvpListResponse | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');

  useEffect(() => {
    const fetchRsvps = async () => {
      try {
        setStatus('loading');
        const res = await api.get<RsvpListResponse>(
          `/invitations/${invitationId}/rsvps`
        );
        setData(res.data);
        setStatus('loaded');
      } catch {
        setStatus('error');
      }
    };

    fetchRsvps();
  }, [invitationId]);

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-neutral-100 border border-[#E9E4DC]"
            />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-2xl bg-neutral-50 border border-[#E9E4DC]" />
      </div>
    );
  }

  if (status === 'error' || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-xs font-semibold text-red-600">
          {t('Failed to load live RSVP guest responses. Please refresh the page.')}
        </p>
      </div>
    );
  }

  const { statistics, rsvps } = data;

  const formatCompanions = (count: number) => {
    if (count === 0) return t('None');
    if (lang === 'ar') {
      if (count === 1) return 'مرافق واحد';
      if (count === 2) return 'مرافقين اثنين';
      return `+${count} مرافقين`;
    }
    return `+${count} companion${count > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* ── Stats Metrics Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label={t('Total Responses')}
          value={statistics.totalResponses}
          color="neutral"
        />
        <StatCard
          label={t('Total Attending')}
          value={statistics.totalAttending}
          color="emerald"
        />
        <StatCard
          label={t('Excused')}
          value={statistics.totalExcused}
          color="rose"
        />
        <StatCard
          label={t('Total Companions')}
          value={statistics.totalCompanions}
          color="amber"
        />
      </div>

      {/* ── Guest Attendance Table ─────────────────────────────────── */}
      {rsvps.length === 0 ? (
        <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF8F5] p-10 text-center shadow-inner">
          <p className="text-4xl block mb-2 select-none">📋</p>
          <h4 className="font-bold text-sm text-neutral-800">{t('No responses yet')}</h4>
          <p className="mt-1 text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
            {t('Share your invitation URL with guests to start collecting RSVPs.')}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#EBE7DF] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <thead>
                <tr className="border-b border-[#EBE7DF] bg-[#FAF8F5] select-none text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3 text-start">{t('Guest Name')}</th>
                  <th className="px-5 py-3 text-start">{t('Status')}</th>
                  <th className="px-5 py-3 text-start">{t('Companions')}</th>
                  <th className="px-5 py-3 text-start hidden sm:table-cell">{t('Date Responded')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF1EA]">
                {rsvps.map((rsvp: RsvpResponse) => {
                  const willAttend = rsvp.willAttend;
                  const count = rsvp.companionsCount;

                  return (
                    <tr
                      key={rsvp.id}
                      className="transition-colors hover:bg-[#FAF8F5] text-neutral-700"
                    >
                      <td className="px-5 py-3.5 font-semibold text-neutral-800">
                        {rsvp.guestName}
                      </td>
                      <td className="px-5 py-3.5">
                        {willAttend ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {t('Attending')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 border border-neutral-300 text-neutral-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                            {t('Declined')}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-neutral-500">
                        {formatCompanions(count)}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-400 hidden sm:table-cell">
                        {new Date(rsvp.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat Card Helper Sub-Component ─────────────────────────────────────
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'neutral' | 'emerald' | 'rose' | 'amber';
}) {
  const colorMap = {
    neutral: 'border-neutral-200 bg-[#FAF8F5] text-neutral-800',
    emerald: 'border-emerald-100 bg-emerald-50/50 text-emerald-700',
    rose: 'border-red-100 bg-red-50/50 text-red-600',
    amber: 'border-amber-100 bg-amber-50/50 text-amber-600',
  };

  return (
    <div className={`rounded-2xl border p-4 text-center shadow-sm ${colorMap[color]}`}>
      <p className="text-2xl font-bold tracking-tight font-sans leading-none">{value}</p>
      <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wider opacity-85">{label}</p>
    </div>
  );
}
