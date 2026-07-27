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
  { key: 'totalPosts', label: 'Total Posts', color: 'bg-blue-500' },
  { key: 'pendingAudits', label: 'Pending Audits', color: 'bg-amber-500' },
  { key: 'todayPosts', label: "Today's Posts", color: 'bg-emerald-500' },
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-medium">Failed to load dashboard data</p>
          <p className="text-red-500 text-sm mt-1">
            {(error as Error)?.message || 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  const stats = data?.data;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <div key={card.key} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className={`${card.color} h-1.5`} />
              <div className="p-6">
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
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
