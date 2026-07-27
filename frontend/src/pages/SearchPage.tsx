import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';

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
      const res = await apiClient.get('/posts', {
        params: { keyword, page, size: 10 },
      });
      return res.data;
    },
    enabled: !!keyword,
    staleTime: 1000 * 60,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-200 mb-6">
        {keyword ? '搜索: ' + keyword : '搜索'}
      </h1>

      {!keyword ? (
        <p className="text-gray-500 text-center py-12 text-sm">输入关键词搜索帖子</p>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border-b border-gray-100 py-3">
              <div className="h-4 bg-gray-200 w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 w-1/3" />
            </div>
          ))}
        </div>
      ) : data && data.list && data.list.length > 0 ? (
        <>
          <div>
            {data.list.map((post: any) => (
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
        <p className="text-gray-500 text-center py-12 text-sm">没有找到 &ldquo;{keyword}&rdquo; 的相关内容</p>
      )}
    </div>
  );
}
