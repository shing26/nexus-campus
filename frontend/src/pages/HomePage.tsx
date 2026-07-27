import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import PostCard from '../components/PostCard';

const channelList = [
  { slug: 'prompts', name: 'Prompt 工坊' },
  { slug: 'showcase', name: '作品展示' },
  { slug: 'agents', name: 'Agent 实战' },
  { slug: 'vibe-coding', name: 'Vibe Coding' },
  { slug: 'debug', name: '代码急诊室' },
  { slug: 'resources', name: '资源聚合' },
];

export default function HomePage() {
  const { data: hotPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', 'hot'],
    queryFn: async () => {
      const res = await apiClient.get('/posts', {
        params: { hot: true, size: 20 },
      });
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Channels */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">频道</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {channelList.map((ch) => (
            <Link
              key={ch.slug}
              to={'/channel/' + ch.slug}
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              {ch.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Hot Posts */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">热帖</h2>
        {postsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border-b border-gray-100 py-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : hotPosts && hotPosts.length > 0 ? (
          <div>
            {hotPosts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12 text-sm">还没有帖子，来做第一个分享的人吧</p>
        )}
      </section>
    </div>
  );
}
