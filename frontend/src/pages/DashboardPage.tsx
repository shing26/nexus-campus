import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

interface DashboardData {
  totalPosts: number;
  pendingAudits: number;
  todayPosts: number;
}

interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

const statCards = [
  { key: 'totalPosts', label: 'Total Posts', color: 'bg-vibe-cyan' },
  { key: 'pendingAudits', label: 'Pending Audits', color: 'bg-amber-500' },
  { key: 'todayPosts', label: "Today's Posts", color: 'bg-vibe-emerald' },
] as const;

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery<DashboardResponse>({
    queryKey: ['admin', 'dashboard'],
    queryFn: () =>
      apiClient.get('/admin/dashboard').then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-base font-semibold font-mono text-slate-100 mb-8"><span className="text-vibe-cyan">$</span> Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-vibe-surface border border-vibe-border rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-vibe-card rounded w-24 mb-3" />
              <div className="h-8 bg-vibe-card rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-base font-semibold font-mono text-slate-100 mb-8"><span className="text-vibe-cyan">$</span> Dashboard</h1>
        <div className="bg-red-900/30 border border-red-500/40 rounded-lg p-6 text-center">
          <p className="text-red-400 font-mono text-sm">Failed to load dashboard data</p>
          <p className="text-red-500 text-xs font-mono mt-1">
            {(error as Error)?.message || 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  const stats = data?.data;

  return (
    <div>
      <h1 className="text-base font-semibold font-mono text-slate-100 mb-8"><span className="text-vibe-cyan">$</span> Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <div key={card.key} className="bg-vibe-surface border border-vibe-border rounded-lg overflow-hidden">
              <div className={`${card.color} h-1.5`} />
              <div className="p-6">
                <p className="text-xs font-mono text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold font-mono text-slate-100">
                  {stats[card.key].toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
