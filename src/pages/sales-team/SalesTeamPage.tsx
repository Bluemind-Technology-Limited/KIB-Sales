import { useCallback, useEffect, useState } from 'react';
import { Call, DirectInbox, Profile2User } from 'iconsax-reactjs';
import { useAppSelector } from '../../hooks/redux';
import { selectUser } from '../../store/slices/authSlice';
import { salesTeamService, type SalesMember } from '../../services/salesTeamService';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Avatar } from '../../components/ui/Avatar';

/** Read-only roster of the sales users assigned to this distributor. */
export function SalesTeamPage() {
  const user = useAppSelector(selectUser);
  const [members, setMembers] = useState<SalesMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError(false);
    // The distributor's own user id IS the distributor id the backend keys on.
    salesTeamService
      .list(user.id)
      .then(setMembers)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load, key]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Team"
        subtitle="Sales users assigned to your distribution channel."
      />

      {error && (
        <div className="bg-white border border-[#E9E9E9] rounded-xl">
          <ErrorState title="Could not load sales team" onRetry={() => setKey((k) => k + 1)} />
        </div>
      )}

      {loading ? (
        <TableSkeleton cols={4} rows={5} hasAvatar />
      ) : members.length === 0 ? (
        <div className="bg-white border border-[#E9E9E9] rounded-xl">
          <EmptyState title="No sales users assigned yet" hint="Sales users you are assigned will appear here." />
        </div>
      ) : (
        <div className="bg-white border border-[#E9E9E9] rounded-xl overflow-hidden">
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 font-semibold">Sales User</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={member.fullName} size="sm" />
                        <p className="text-xs font-bold text-[#171717] leading-none">{member.fullName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 flex items-center gap-1.5">
                        <DirectInbox size={12} className="text-slate-400" /> {member.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 flex items-center gap-1.5 whitespace-nowrap">
                        <Call size={12} className="text-slate-400" /> {member.phone || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary strip */}
      {!loading && !error && members.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-[#E9E9E9] rounded-lg px-4 py-3">
          <Profile2User size={16} className="text-[#EA4335]" />
          <span>
            <span className="font-bold text-[#171717]">{members.length}</span> sales user
            {members.length === 1 ? '' : 's'} assigned to your distribution channel.
          </span>
        </div>
      )}
    </div>
  );
}
