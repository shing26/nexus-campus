import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';

export default function ChannelPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const res = await apiClient.get('/channels');
      return res.data.data;
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 text-sm">未指定频道</p>
      </div>
    );
  }

  if (channels && !channel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">频道未找到</h2>
        <p className="text-slate-500 text-sm">频道 &ldquo;{slug}&rdquo; 不存在</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Channel header — compact with accent bar */}
      {channel && (
        <div className="mb-8 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
            <h1 className="text-xl font-bold text-slate-900">{channel.name}</h1>
          </div>
          {channel.description && (
            <p className="text-sm text-slate-500 mt-1 ml-[1.125rem]">{channel.description}</p>
          )}
        </div>
      )}

      {/* Post list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-full mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : postsData && postsData.list.length > 0 ? (
        <>
          <div className="space-y-3">
            {postsData.list.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            page={postsData.page}
            pages={postsData.pages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <p className="text-slate-500 text-center py-12 text-sm">这个频道还没有帖子</p>
      )}
    </div>
  );
}
