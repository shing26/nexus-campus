import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const channels = [
  { slug: 'general', label: 'General' },
  { slug: 'tech', label: 'Tech' },
  { slug: 'design', label: 'Design' },
  { slug: 'random', label: 'Random' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
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
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-indigo-600 shrink-0">
            Nexus-Vibe
          </Link>

          <div className="hidden md:flex items-center gap-6 ml-8">
            {channels.map((ch) => (
              <Link
                key={ch.slug}
                to={'/channel/' + ch.slug}
                className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {ch.label}
              </Link>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </form>

          <div className="flex items-center gap-4 shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={'/user/' + user.id}
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
