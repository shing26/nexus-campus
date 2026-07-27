import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import ShimmerButton from './ShimmerButton';

const channels = [
  { slug: 'announcements', label: '公告' },
  { slug: 'prompts', label: 'Prompt 工坊' },
  { slug: 'showcase', label: '作品展示' },
  { slug: 'agents', label: 'Agent 实战' },
  { slug: 'vibe-coding', label: 'Vibe Coding' },
  { slug: 'debug', label: '代码急诊室' },
  { slug: 'resources', label: '资源聚合' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const isAdmin = user?.role === 'ADMIN';
  const visibleChannels = channels.filter(ch => isAdmin || ch.slug !== 'announcements');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/search?q=' + encodeURIComponent(searchQuery.trim()));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <span className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">Nexus-Vibe</span>
          </Link>

          {/* Channel links */}
          <div className="hidden md:flex items-center gap-1 ml-6">
            {visibleChannels.map((ch) => (
              <Link
                key={ch.slug}
                to={'/channel/' + ch.slug}
                className="px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors"
              >
                {ch.label}
              </Link>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xs mx-4">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索帖子..."
                className="w-full pl-8 pr-3 py-1 text-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors bg-transparent"
              />
            </div>
          </form>

          {/* Dark mode toggle + Auth */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Dark mode toggle */}
            <motion.button
              onClick={toggle}
              whileTap={{ rotate: 180, scale: 0.9 }}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              aria-label={dark ? '切换到亮色模式' : '切换到暗色模式'}
              title={dark ? '切换到亮色模式' : '切换到暗色模式'}
            >
              {dark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </motion.button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={'/user/' + user.id}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors"
                >
                  {user.username}
                </Link>
                <Link to="/create-post">
                  <ShimmerButton className="!px-3 !py-1 text-xs">
                    写帖子
                  </ShimmerButton>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                >
                  退出
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors"
                >
                  登录
                </Link>
                <Link to="/register">
                  <ShimmerButton className="!px-3 !py-1 text-xs">
                    注册
                  </ShimmerButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
