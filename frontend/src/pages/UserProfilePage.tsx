import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient } from '../api/client';

interface ProfileUser {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  createTime: string;
}

interface Post {
  id: number;
  title: string;
  categoryName: string;
  createTime: string;
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [userRes, postsRes] = await Promise.all([
          apiClient.get(`/users/${id}`),
          apiClient.get('/posts', { params: { userId: id } }),
        ]);
        setUser(userRes.data.data);
        setPosts(postsRes.data.data?.list || []);
      } catch {
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-vibe-card rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-vibe-card rounded w-1/4" />
              <div className="h-4 bg-vibe-card rounded w-1/3" />
            </div>
          </div>
          <div className="h-64 bg-vibe-card rounded" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-900/30 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg text-sm font-mono">
          {error || 'User not found.'}
        </div>
      </div>
    );
  }

  const joined = new Date(user.createTime).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-vibe-surface border border-vibe-border rounded-xl p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-vibe-cyan/20 flex items-center justify-center overflow-hidden shrink-0">
            {user.avatar && user.avatar !== 'default_avatar.png' ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-vibe-cyan">
                {user.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-100 truncate">
              {user.nickname || user.username}
            </h1>
            <p className="text-sm text-slate-500 font-mono">@{user.username}</p>
            {user.bio && (
              <p className="mt-1 text-slate-400 text-sm">{user.bio}</p>
            )}
            <p className="mt-1 text-xs text-slate-500 font-mono">Joined {joined}</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <h2 className="text-sm font-semibold font-mono text-slate-400 mb-4">// Posts</h2>
      {posts.length === 0 ? (
        <p className="text-slate-600 text-xs font-mono">No posts yet.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={'/post/' + post.id}
              className="block bg-vibe-surface border border-vibe-border rounded-lg p-4 hover:border-vibe-cyan/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold font-mono text-slate-200 truncate">{post.title}</h3>
                <span className="text-xs text-slate-500 shrink-0 ml-4">
                  {new Date(post.createTime).toLocaleDateString()}
                </span>
              </div>
              <span className="inline-block mt-1 text-[10px] font-mono text-vibe-cyan bg-vibe-cyan/15 px-2 py-0.5 rounded-full">
                {post.categoryName}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
