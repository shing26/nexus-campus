 import { useState } from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import { apiClient } from '../api/client';
 import { useAuthStore } from '../stores/authStore';
 import type { ApiResponse } from '../api/client';
 
 interface RegisterData {
   token: string;
   username: string;
   role: string;
 }
 
 export default function RegisterPage() {
   const navigate = useNavigate();
   const setAuth = useAuthStore((s) => s.setAuth);
 
   const [username, setUsername] = useState('');
   const [nickname, setNickname] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
 
   const validate = (): string | null => {
     if (!username.trim()) return '请输入用户名';
     if (username.trim().length < 3) return '用户名至少需要3个字符';
     if (!nickname.trim()) return '请输入昵称';
     if (!password) return '请输入密码';
     if (password.length < 6) return '密码至少需要6个字符';
     if (password !== confirmPassword) return '两次密码不一致';
     return null;
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
 
     const validationError = validate();
     if (validationError) {
       setError(validationError);
       return;
     }
 
     setLoading(true);
     try {
       const res = await apiClient.post<ApiResponse<RegisterData>>('/auth/register', {
         username: username.trim(),
         nickname: nickname.trim(),
         password,
       });
       const data = res.data.data;
       setAuth(data.token, { username: data.username });
       navigate('/', { replace: true });
     } catch (err: any) {
       const msg =
         err?.response?.data?.message ||
         err?.response?.data?.error ||
         '注册失败，请重试';
       setError(msg);
     } finally {
       setLoading(false);
     }
   };
 
   return (
     <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
       <div className="w-full max-w-sm">
         <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">注册</h1>
 
         <form onSubmit={handleSubmit}>
           {error && (
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 mb-4 rounded-lg">
               {error}
             </div>
           )}
 
           <div className="mb-4">
             <input
               id="username"
               type="text"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               className="w-full px-0 py-2 text-sm border-0 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none focus:border-emerald-600 transition-colors placeholder-gray-400 dark:placeholder-gray-500 rounded-none"
               placeholder="用户名"
               autoComplete="username"
             />
           </div>
 
           <div className="mb-4">
             <input
               id="nickname"
               type="text"
               value={nickname}
               onChange={(e) => setNickname(e.target.value)}
               className="w-full px-0 py-2 text-sm border-0 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none focus:border-emerald-600 transition-colors placeholder-gray-400 dark:placeholder-gray-500 rounded-none"
               placeholder="昵称"
             />
           </div>
 
           <div className="mb-4">
             <input
               id="password"
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full px-0 py-2 text-sm border-0 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none focus:border-emerald-600 transition-colors placeholder-gray-400 dark:placeholder-gray-500 rounded-none"
               placeholder="密码"
               autoComplete="new-password"
             />
           </div>
 
           <div className="mb-6">
             <input
               id="confirmPassword"
               type="password"
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               className="w-full px-0 py-2 text-sm border-0 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none focus:border-emerald-600 transition-colors placeholder-gray-400 dark:placeholder-gray-500 rounded-none"
               placeholder="确认密码"
               autoComplete="new-password"
             />
           </div>
 
           <button
             type="submit"
             disabled={loading}
             className="w-full py-2 px-4 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             {loading ? '创建中...' : '创建账号'}
           </button>
         </form>
 
         <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
           已有账号？{' '}
           <Link to="/login" className="text-emerald-600 hover:text-emerald-500 font-medium">
             登录
           </Link>
         </p>
       </div>
     </div>
   );
 }
