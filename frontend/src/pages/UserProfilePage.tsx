import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient } from '../api/client';

interface ProfileUser {
  id: number;
  username: string;
  nickname?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

interface Post {
  id: number;
  title: string;
  channel: string;
  createdAt: string;
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
        setPosts(postsRes.data.data || []);
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
            <div className="w-20 h-20 bg-gray-200 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error || 'User not found.'}
        </div>
      </div>
    );
  }

  const joined = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-indigo-600">
                {user.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {user.nickname || user.username}
            </h1>
            <p className="text-sm text-gray-500">@{user.username}</p>
            {user.bio && (
              <p className="mt-1 text-gray-700">{user.bio}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">Joined {joined}</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Posts</h2>
      {posts.length === 0 ? (
        <p className="text-gray-400 text-sm">No posts yet.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 truncate">{post.title}</h3>
                <span className="text-xs text-gray-400 shrink-0 ml-4">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <span className="inline-block mt-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {post.channel}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
