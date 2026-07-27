import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <span className="text-base font-bold text-gray-900 tracking-tight">Nexus-Vibe</span>
          </Link>

          {/* Channel links */}
          <div className="hidden md:flex items-center gap-1 ml-6">
            {visibleChannels.map((ch) => (
              <Link
                key={ch.slug}
                to={'/channel/' + ch.slug}
                className="px-2 py-1 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
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
                className="w-full pl-8 pr-3 py-1 text-sm border border-gray-200 text-gray-900 placeholder-gray-400 rounded-none focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </form>

          {/* Auth */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={'/user/' + user.id}
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {user.username}
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
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium px-3 py-1 bg-indigo-600 text-white rounded-none hover:bg-indigo-500 transition-colors"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
