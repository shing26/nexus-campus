import { Link, useLocation } from 'react-router-dom';
import { Terminal, Palette, Cpu, Zap, Bug, BookOpen, Megaphone, FileText, Activity, Tag } from 'lucide-react';

const channels = [
  { slug: 'announcements', label: 'Announcements', icon: Megaphone, count: 3, desc: '平台公告与更新' },
  { slug: 'prompts', label: 'Prompt 工坊', icon: Terminal, count: 128, desc: 'System Prompt 设计、CoT' },
  { slug: 'showcase', label: '作品展示', icon: Palette, count: 64, desc: 'Vibe Coding 成品展示' },
  { slug: 'agents', label: 'Agent 实战', icon: Cpu, count: 48, desc: 'Agent 架构与案例' },
  { slug: 'vibe-coding', label: 'Vibe Coding', icon: Zap, count: 72, desc: 'AI Coding 经验分享' },
  { slug: 'debug', label: '代码急诊室', icon: Bug, count: 36, desc: 'Bug 诊断与修复讨论' },
  { slug: 'resources', label: '资源聚合', icon: BookOpen, count: 24, desc: '学习资源与工具收集' },
];

export default function Sidebar({ className = '' }: { className?: string }) {
  const location = useLocation();

  return (
    <aside className={'w-56 shrink-0 ' + className}>
      <div className="bg-vibe-surface border border-vibe-border rounded-xl p-4 space-y-5">
        {/* Channels */}
        <div>
          <h3 className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest mb-2.5">Channels</h3>
          <nav className="space-y-0.5">
            {channels.map((ch) => {
              const Icon = ch.icon;
              const isActive = location.pathname === '/channel/' + ch.slug;
              return (
                <Link
                  key={ch.slug}
                  to={'/channel/' + ch.slug}
                  className={
                    'flex flex-col px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors ' +
                    (isActive
                      ? 'bg-vibe-cyan/10 text-vibe-cyan'
                      : 'text-slate-400 hover:bg-vibe-card hover:text-slate-200')
                  }
                >
                  <span className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Icon className="w-3.5 h-3.5" />{ch.label}</span>
                    <span className="text-[10px] bg-vibe-cyan/15 text-vibe-cyan rounded-full px-1.5 py-0.5">{ch.count}</span>
                  </span>
                  <span className="text-[10px] text-slate-600 truncate ml-5">{ch.desc}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Menu */}
        <div>
          <h3 className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest mb-2.5">Quick</h3>
          <nav className="space-y-0.5">
            <Link to="/drafts" className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-mono text-slate-400 hover:bg-vibe-card hover:text-slate-200 transition-colors">
              <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" />My Drafts</span>
              <span className="text-[10px] text-slate-500">3</span>
            </Link>
            <Link to="/agent-logs" className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-mono text-slate-400 hover:bg-vibe-card hover:text-slate-200 transition-colors">
              <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" />Agent Logs</span>
              <span className="text-[10px] text-slate-500">12</span>
            </Link>
            <Link to="/tags" className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-mono text-slate-400 hover:bg-vibe-card hover:text-slate-200 transition-colors">
              <span className="flex items-center gap-2"><Tag className="w-3.5 h-3.5" />Hot Tags</span>
            </Link>
            <Link to="/channel/prompts?type=prompt" className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-mono text-slate-400 hover:bg-vibe-card hover:text-slate-200 transition-colors">
              <span className="flex items-center gap-2"><Terminal className="w-3.5 h-3.5" />Prompt Templates</span>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
