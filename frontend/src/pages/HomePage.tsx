import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import PostCard from '../components/PostCard';

const heroChannels = [
  { slug: 'prompts', name: 'Prompt 工坊', description: 'System Prompt 设计、Chain-of-Thought、少样本技巧', icon: '🧠' },
  { slug: 'showcase', name: '作品展示', description: 'Vibe Coding 成品展示：网页、工具、自动化流程', icon: '🎨' },
  { slug: 'agents', name: 'Agent 实战', description: 'Multi-Agent、工具调用、OpenClaw/Codex 使用心得', icon: '🤖' },
  { slug: 'vibe-coding', name: 'Vibe Coding 经验', description: '上下文控制、幻觉治理、架构设计的纯经验讨论', icon: '⚡' },
  { slug: 'debug', name: '代码急诊室', description: '贴报错上下文，社区或 AI Agent 协助分析', icon: '🚨' },
  { slug: 'resources', name: '资源聚合', description: '工具链推荐、API 评测、教程链接', icon: '📚' },
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
    <div>
      {/* Hero Section — dark, dense, channel cards as content containers */}
      <section className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Nexus-Vibe
            </h1>
            <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
              Prompt 设计、Agent 实战、Vibe Coding——AI 开发者的技术交流社区
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {heroChannels.map((ch) => (
              <Link
                key={ch.slug}
                to={'/channel/' + ch.slug}
                className="flex items-start gap-3 bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800 hover:border-slate-600 transition-colors group"
              >
                <span className="text-xl shrink-0 mt-0.5">{ch.icon}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                    {ch.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{ch.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Posts — clean list */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-5 bg-indigo-500 rounded-full" />
          <h2 className="text-lg font-bold text-slate-900">热门帖子</h2>
        </div>
        {postsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : hotPosts && hotPosts.length > 0 ? (
          <div className="space-y-3">
            {hotPosts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-12 text-sm">还没有帖子，来做第一个分享的人吧</p>
        )}
      </section>
    </div>
  );
}
