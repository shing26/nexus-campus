import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import { Terminal, Palette, Cpu, Zap, Bug } from 'lucide-react';

type Tab = 'hot' | 'latest' | 'ai-verified' | 'debug' | 'prompts';

const tabs: { key: Tab; label: string }[] = [
  { key: 'hot', label: 'Hot (Decay)' },
  { key: 'latest', label: 'Latest' },
  { key: 'ai-verified', label: 'AI Verified' },
  { key: 'debug', label: 'Debug' },
  { key: 'prompts', label: 'Prompts' },
];

const channelGrid = [
  { slug: 'prompts', label: 'Prompt 工坊', icon: Terminal, count: 128, desc: 'System Prompt 设计、CoT' },
  { slug: 'showcase', label: '作品展示', icon: Palette, count: 64, desc: 'Vibe Coding 成品展示' },
  { slug: 'agents', label: 'Agent 实战', icon: Cpu, count: 48, desc: 'Agent 架构与案例' },
  { slug: 'vibe-coding', label: 'Vibe Coding', icon: Zap, count: 72, desc: 'AI Coding 经验分享' },
  { slug: 'debug', label: '代码急诊室', icon: Bug, count: 36, desc: 'Bug 诊断与修复讨论' },
];

function SkeletonCard() {
  return (
    <div className="bg-vibe-surface/50 border border-vibe-border rounded-xl p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-vibe-cyan/5 to-transparent bg-[length:200%_100%] animate-shimmer" />
      <div className="h-3 bg-vibe-card rounded w-3/4 mb-3 relative" />
      <div className="h-2.5 bg-vibe-card/50 rounded w-1/2 mb-2 relative" />
      <div className="h-2 bg-vibe-card/30 rounded w-1/4 relative" />
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
      if (activeTab === 'prompts') {
        params.type = 'prompt';
      } else {
        params.type = 'post';
      }
      const res = await apiClient.get('/posts', { params });
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const postList = posts?.list ?? posts ?? [];
  const isEmpty = !isLoading && postList.length === 0;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-6">
      {/* Channel Grid — full-width, no sidebar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {channelGrid.map((ch) => {
          const Icon = ch.icon;
          return (
            <Link
              key={ch.slug}
              to={'/channel/' + ch.slug}
              className="group bg-vibe-surface/50 border border-vibe-border rounded-xl p-3.5 transition-all hover:bg-vibe-card hover:border-vibe-cyan/30 active:scale-[0.97]"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-vibe-cyan/10 border border-vibe-cyan/20 flex items-center justify-center group-hover:bg-vibe-cyan/20 transition-colors">
                  <Icon className="w-4 h-4 text-vibe-cyan" />
                </div>
                <span className="text-xs font-mono text-slate-300 group-hover:text-white transition-colors truncate">{ch.label}</span>
              </div>
              <div className="flex items-center justify-between pl-[42px]">
                <span className="text-[10px] font-mono text-slate-500 truncate">{ch.desc}</span>
                <span className="text-[11px] font-mono text-vibe-cyan/80 font-semibold shrink-0">{ch.count}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pill Tabs — full-width */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={
              'px-4 py-1.5 rounded-full text-xs font-mono border transition-all active:scale-95 ' +
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
      {isEmpty && <EmptyState preset="noPosts" />}

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
  );
}
