import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { ShimmerButton } from './ui/ShimmerButton';
import { Plus, Search, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();
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
    <nav className="bg-vibe-bg border-b border-vibe-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link to="/" className="text-base font-bold text-slate-100 font-mono shrink-0">
            Nexus.<span className="text-vibe-cyan">Vibe</span>
          </Link>

          {/* Cmd+K Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="⌘K  Search prompts, code..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-vibe-surface border border-vibe-border rounded-md text-slate-300 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-vibe-cyan/50 focus:border-vibe-cyan/50 transition-colors"
              />
            </div>
          </form>

          {/* Right toolbar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* AI Status */}
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-vibe-emerald/10 border border-vibe-emerald/20">
              <span className="w-1.5 h-1.5 rounded-full bg-vibe-emerald animate-pulse" />
              <span className="text-[10px] font-mono text-vibe-emerald">Agent Active</span>
            </div>

            {/* Dark mode toggle */}
            <button onClick={toggle} className="p-1.5 rounded-md hover:bg-vibe-surface transition-colors">
              {dark ? <Sun className="w-3.5 h-3.5 text-slate-400" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* New Post */}
            {isAuthenticated && (
              <Link to="/post/new">
                <ShimmerButton>
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Post</span>
                </ShimmerButton>
              </Link>
            )}

            {/* Auth */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors">Login</Link>
                <Link to="/register">
                  <ShimmerButton><span>Register</span></ShimmerButton>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to={'/user/' + user?.id} className="text-xs font-mono text-slate-400 hover:text-slate-200">{user?.username}</Link>
                <button onClick={handleLogout} className="text-[10px] font-mono text-slate-600 hover:text-red-400">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
