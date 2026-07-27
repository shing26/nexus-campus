import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { apiClient } from '../api/client';
 import PostCard from '../components/PostCard';
 import Sidebar from '../components/Sidebar';
 import type { Channel } from '../types/post';
 
 const channelEmojis: Record<string, string> = {
   prompts: '🧪',
   showcase: '🖼️',
   agents: '🤖',
   'vibe-coding': '🎵',
   debug: '🔧',
   resources: '📚',
   announcements: '📢',
 };
 
 export default function HomePage() {
   const { data: channels } = useQuery({
     queryKey: ['channels'],
     queryFn: async () => {
       const res = await apiClient.get('/channels');
       return res.data.data as Channel[];
     },
     staleTime: 1000 * 60 * 10,
   });
 
   const { data: hotPosts, isLoading: hotLoading } = useQuery({
     queryKey: ['posts', 'hot'],
     queryFn: async () => {
       const res = await apiClient.get('/posts', {
         params: { hot: true, size: 10 },
       });
       return res.data.data;
     },
     staleTime: 1000 * 60 * 2,
   });
 
   const { data: recentPosts, isLoading: recentLoading } = useQuery({
     queryKey: ['posts', 'recent'],
     queryFn: async () => {
       const res = await apiClient.get('/posts', {
         params: { size: 10 },
       });
       return res.data.data;
     },
     staleTime: 1000 * 60 * 2,
   });
 
   return (
     <div className="max-w-7xl mx-auto px-4 py-8">
       <div className="flex gap-6">
         {/* Sidebar */}
         <div className="w-64 shrink-0 hidden lg:block">
           <Sidebar />
         </div>
 
         {/* Content */}
         <div className="flex-1 min-w-0 space-y-10">
           {/* Channel Grid */}
           <section>
             <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">频道</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {(channels ?? []).map((ch, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Link
                    to={'/channel/' + ch.slug}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer block"
                  >
                    <span className="text-xl">{channelEmojis[ch.slug] ?? '💬'}</span>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{ch.name}</p>
                  </Link>
                </motion.div>
              ))}
             </div>
           </section>
 
           {/* Hot Posts */}
           <section>
             <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">🔥 热帖</h2>
             {hotLoading ? (
               <div className="space-y-3">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="animate-pulse bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                     <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                   </div>
                 ))}
               </div>
             ) : hotPosts && hotPosts.length > 0 ? (
               <div className="space-y-3">
                {hotPosts.map((post: any, i: number) => (
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
             ) : (
               <p className="text-gray-500 dark:text-gray-400 text-center py-12 text-sm">还没有帖子，来做第一个分享的人吧</p>
             )}
           </section>
 
           {/* Recent Posts */}
           <section>
             <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">📋 最新</h2>
             {recentLoading ? (
               <div className="space-y-3">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="animate-pulse bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                     <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                   </div>
                 ))}
               </div>
             ) : recentPosts && recentPosts.length > 0 ? (
               <div className="space-y-3">
                {recentPosts.map((post: any, i: number) => (
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
             ) : (
               <p className="text-gray-500 dark:text-gray-400 text-center py-12 text-sm">还没有帖子</p>
             )}
           </section>
         </div>
       </div>
     </div>
   );
 }
