import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { apiClient } from '../api/client';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import Sidebar from '../components/Sidebar';
import EmptyState from '../components/EmptyState';
import type { Channel } from '../types/post';

export default function ChannelPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const res = await apiClient.get('/channels');
      return res.data.data as Channel[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const channel = channels?.find((c: any) => c.slug === slug);

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts', 'channel', slug, page],
    queryFn: async () => {
      const res = await apiClient.get('/posts', {
        params: { channelSlug: slug, page, size: 10 },
      });
      return res.data.data;
    },
    enabled: !!slug && !!channel,
    staleTime: 1000 * 60 * 2,
  });

  if (!slug) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 text-sm font-mono">No channel specified</p>
      </div>
    );
  }

  if (channels && !channel) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold font-mono text-slate-100 mb-2">Channel Not Found</h2>
        <p className="text-sm font-mono text-slate-500">Channel &quot;{slug}&quot; doesn&apos;t exist</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="flex gap-4">
        {/* Icon-rail sidebar */}
        <div className="w-12 shrink-0 hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0">
          {channel && (
            <h1 className="text-lg font-bold font-mono text-slate-100 pb-3 border-b border-vibe-border mb-6">
              # {channel.name}
            </h1>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-vibe-surface/50 border border-vibe-border rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-vibe-cyan/5 to-transparent bg-[length:200%_100%] animate-shimmer" />
                  <div className="h-3 bg-vibe-card rounded w-3/4 mb-3 relative" />
                  <div className="h-2.5 bg-vibe-card/50 rounded w-1/2 mb-2 relative" />
                  <div className="h-2 bg-vibe-card/30 rounded w-1/4 relative" />
                </div>
              ))}
            </div>
          ) : postsData && postsData.list.length > 0 ? (
            <>
              <div className="space-y-3">
                {postsData.list.map((post: any, i: number) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </div>
              <Pagination
                page={postsData.page}
                pages={postsData.pages}
                onPageChange={setPage}
              />
            </>
          ) : (
            <EmptyState preset="noPosts" />
          )}
        </div>
      </div>
    </div>
  );
}
