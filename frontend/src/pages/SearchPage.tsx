import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import type { PostPageVo, PageResponse } from '../types/post';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  const { data, isLoading } = useQuery({
    queryKey: ['posts', 'search', keyword, page],
    queryFn: async () => {
      const res = await apiClient.get<PageResponse<PostPageVo>>('/posts', {
        params: { keyword, page, size: 10 },
      });
      return res.data;
    },
    enabled: !!keyword,
    staleTime: 1000 * 60,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {keyword ? (
          <>Search results for &ldquo;<span className="text-indigo-600">{keyword}</span>&rdquo;</>
        ) : (
          'Search'
        )}
      </h1>

      {!keyword ? (
        <p className="text-gray-500 text-center py-12">Enter a keyword to search posts.</p>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-full mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : data && data.records.length > 0 ? (
        <>
          <div className="space-y-4">
            {data.records.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            page={data.page}
            pages={data.pages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <p className="text-gray-500 text-center py-12">No results for &ldquo;{keyword}&rdquo;.</p>
      )}
    </div>
  );
}
