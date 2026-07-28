import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { apiClient } from '../api/client';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import { Sparkles } from 'lucide-react';

type Tab = 'hot' | 'latest' | 'ai-verified' | 'debug';

const tabs: { key: Tab; label: string }[] = [
  { key: 'hot', label: '🔥 Hot (Decay)' },
  { key: 'latest', label: '⚡ Latest' },
  { key: 'ai-verified', label: '🤖 AI Verified' },
  { key: 'debug', label: '💬 Debug' },
];

function SkeletonCard() {
  return (
    <div className="bg-vibe-surface/50 border border-vibe-border rounded-xl p-5 animate-pulse">
      <div className="h-3 bg-vibe-card rounded w-3/4 mb-3" />
      <div className="h-2.5 bg-vibe-card/50 rounded w-1/2 mb-2" />
      <div className="h-2 bg-vibe-card/30 rounded w-1/4" />
    </div>
  );
}

function TerminalBanner() {
  return (
    <div className="bg-vibe-surface border border-vibe-border rounded-xl p-5 font-mono text-xs space-y-1.5">
      <p className="text-vibe-cyan">&gt; <span className="text-slate-400">System.init():</span> Vibe Coding Workspace ready.</p>
      <p className="text-slate-500">&gt; Publish your first prompt to trigger AI Auto-Review...</p>
      <button className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-vibe-cyan/20 text-vibe-cyan border border-vibe-cyan/30 text-xs font-mono hover:bg-vibe-cyan/30 transition-colors">
        <Sparkles className="w-3.5 h-3.5" />
        Fill Sample Prompt
      </button>
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('hot');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', activeTab],
    queryFn: async () => {
      const params: Record<string, any> = { size: 10 };
      if (activeTab === 'hot') params.hot = true;
      const res = await apiClient.get('/posts', { params });
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const postList = posts?.list ?? posts ?? [];
  const isEmpty = !isLoading && postList.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 shrink-0 hidden lg:block">
          <Sidebar />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Pill Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={
                  'px-4 py-1.5 rounded-full text-xs font-mono border transition-colors ' +
                  (activeTab === tab.key
                    ? 'bg-vibe-cyan/20 text-vibe-cyan border-vibe-cyan/40'
                    : 'bg-transparent text-slate-400 border-vibe-border hover:border-vibe-cyan/40 hover:text-slate-200')
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Terminal Hero Banner (shown when no posts) */}
          {isEmpty && <TerminalBanner />}

          {/* Post Feed */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : !isEmpty ? (
            <div className="space-y-3">
              {postList.map((post: any, i: number) => (
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
