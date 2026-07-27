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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-1 h-5 bg-indigo-500 rounded-full" />
        <h1 className="text-lg font-bold text-slate-900">
          {keyword ? (
            <>搜索 &ldquo;<span className="text-indigo-600">{keyword}</span>&rdquo; 的结果</>
          ) : (
            '搜索'
          )}
        </h1>
      </div>

      {!keyword ? (
        <p className="text-slate-500 text-center py-12 text-sm">输入关键词搜索帖子</p>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-full mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : data && data.list.length > 0 ? (
        <>
          <div className="space-y-3">
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
        <p className="text-slate-500 text-center py-12 text-sm">没有找到 &ldquo;{keyword}&rdquo; 的相关内容</p>
      )}
    </div>
  );
}
