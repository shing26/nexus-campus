import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import type { PostPageVo, Channel, PageResponse } from '../types/post';

export default function ChannelPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const res = await apiClient.get<Channel[]>('/channels');
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const channel = channels?.find((c) => c.slug === slug);

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts', 'channel', slug, page],
    queryFn: async () => {
      const res = await apiClient.get<PageResponse<PostPageVo>>('/posts', {
        params: { channelSlug: slug, page, size: 10 },
      });
      return res.data;
    },
    enabled: !!slug && !!channel,
    staleTime: 1000 * 60 * 2,
  });

  if (!slug) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">No channel specified.</p>
      </div>
    );
  }

  if (channels && !channel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Channel not found</h2>
        <p className="text-gray-500">The channel &ldquo;{slug}&rdquo; doesn&rsquo;t exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {channel && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{channel.name}</h1>
          {channel.description && (
            <p className="text-gray-500 mt-1">{channel.description}</p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-full mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : postsData && postsData.records.length > 0 ? (
        <>
          <div className="space-y-4">
            {postsData.records.map((post) => (
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
        <p className="text-gray-500 text-center py-12">No posts in this channel yet.</p>
      )}
    </div>
  );
}
