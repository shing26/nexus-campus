import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import PostCard from '../components/PostCard';


const heroChannels = [
  { slug: 'prompts', name: 'Prompt 工坊', description: 'System Prompt 设计、Chain-of-Thought、少样本技巧', icon: '\u{1F9E0}', color: 'from-violet-500 to-purple-600' },
  { slug: 'showcase', name: '作品展示', description: 'Vibe Coding 成品展示：网页、工具、自动化流程', icon: '\u{1F3A8}', color: 'from-pink-500 to-rose-600' },
  { slug: 'agents', name: 'Agent 实战', description: 'Multi-Agent、工具调用、OpenClaw/Codex 使用心得', icon: '\u{1F916}', color: 'from-blue-500 to-cyan-600' },
  { slug: 'vibe-coding', name: 'Vibe Coding 经验', description: '上下文控制、幻觉治理、架构设计的纯经验讨论', icon: '\u{26A1}', color: 'from-emerald-500 to-teal-600' },
  { slug: 'debug', name: '代码急诊室', description: '贴报错上下文，社区或 AI Agent 协助分析', icon: '\u{1F6A8}', color: 'from-red-500 to-orange-600' },
  { slug: 'resources', name: '资源聚合', description: '工具链推荐、API 评测、教程链接', icon: '\u{1F4DA}', color: 'from-amber-500 to-yellow-600' },
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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Nexus-Vibe
            </h1>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
              Prompt 设计、Agent 实战、Vibe Coding——AI 开发者的技术交流社区
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {heroChannels.map((ch) => (
              <Link
                key={ch.slug}
                to={"/channel/" + ch.slug}
                className={"bg-gradient-to-br " + ch.color + " rounded-xl p-5 hover:scale-[1.03] transition-transform shadow-lg"}
              >
                <div className="text-3xl mb-2">{ch.icon}</div>
                <h3 className="font-semibold text-lg">{ch.name}</h3>
                <p className="text-sm text-white/80 mt-1">{ch.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.993 22.016c-4.973 0-9-4.027-9-9s4.027-9 9-9 9 4.027 9 9-4.027 9-9 9zm0-16c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1.993 9.817l-2.517-1.62-2.483 1.62.657-2.76-2.123-1.82 2.763-.193 1.186-2.7 1.066 2.623 2.784.479-1.897 1.887.624 2.484z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900">Hot Posts</h2>
        </div>
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : hotPosts && hotPosts.length > 0 ? (
            <div className="space-y-4">
              {hotPosts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">No posts yet. Be the first to share!</p>
          )}
      </section>
    </div>
  );
}






