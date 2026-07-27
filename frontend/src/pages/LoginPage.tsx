import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import type { ApiResponse } from '../api/client';

interface LoginData {
  token: string;
  username: string;
  role: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post<ApiResponse<LoginData>>('/auth/login', {
        username: username.trim(),
        password,
      });
      const data = res.data.data;
      setAuth(data.token, { username: data.username });
      navigate('/', { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        '登录失败，请检查用户名和密码';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-lg font-bold text-gray-900 mb-6 text-center">登录</h1>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-0 py-2 text-sm border-0 border-b border-gray-200 text-gray-900 focus:outline-none focus:border-indigo-600 transition-colors placeholder-gray-400 rounded-none"
              placeholder="用户名"
              autoComplete="username"
            />
          </div>

          <div className="mb-6">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-0 py-2 text-sm border-0 border-b border-gray-200 text-gray-900 focus:outline-none focus:border-indigo-600 transition-colors placeholder-gray-400 rounded-none"
              placeholder="密码"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 text-sm font-medium text-white bg-indigo-600 rounded-none hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          还没有账号？{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
            注册
          </Link>
        </p>
      </div>
    </div>
  );
}
