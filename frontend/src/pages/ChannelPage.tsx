 import { useState } from 'react';
 import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { apiClient } from '../api/client';
 import PostCard from '../components/PostCard';
 import Pagination from '../components/Pagination';
 import Sidebar from '../components/Sidebar';
 import type { Channel } from '../types/post';
 
 export default function ChannelPage() {
   const { slug } = useParams<{ slug: string }>();
   const [page, setPage] = useState(1);
 
   const { data: channels } = useQuery({
     queryKey: ['channels'],
     queryFn: async () => {
       const res = await apiClient.get('/channels');
       return res.data.data as Channel[];
     },
     staleTime: 1000 * 60 * 10,
   });
 
   const channel = channels?.find((c: any) => c.slug === slug);
 
   const { data: postsData, isLoading } = useQuery({
     queryKey: ['posts', 'channel', slug, page],
     queryFn: async () => {
       const res = await apiClient.get('/posts', {
         params: { channelSlug: slug, page, size: 10 },
       });
       return res.data.data;
     },
     enabled: !!slug && !!channel,
     staleTime: 1000 * 60 * 2,
   });
 
   if (!slug) {
     return (
       <div className="max-w-7xl mx-auto px-4 py-16 text-center">
         <p className="text-gray-500 dark:text-gray-400 text-sm">未指定频道</p>
       </div>
     );
   }
 
   if (channels && !channel) {
     return (
       <div className="max-w-7xl mx-auto px-4 py-16 text-center">
         <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">频道未找到</h2>
         <p className="text-gray-500 dark:text-gray-400 text-sm">频道 &ldquo;{slug}&rdquo; 不存在</p>
       </div>
     );
   }
 
   return (
     <div className="max-w-7xl mx-auto px-4 py-8">
       <div className="flex gap-6">
         <div className="w-64 shrink-0 hidden lg:block">
           <Sidebar />
         </div>
         <div className="flex-1 min-w-0">
           {channel && (
             <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-800 mb-6">
               {channel.name}
             </h1>
           )}
 
           {isLoading ? (
             <div className="space-y-3">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="animate-pulse bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                   <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                   <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                 </div>
               ))}
             </div>
           ) : postsData && postsData.list.length > 0 ? (
             <>
               <div className="space-y-3">
                 {postsData.list.map((post: any, i: number) => (
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
               <Pagination
                 page={postsData.page}
                 pages={postsData.pages}
                 onPageChange={setPage}
               />
             </>
           ) : (
             <p className="text-gray-500 dark:text-gray-400 text-center py-12 text-sm">这个频道还没有帖子</p>
           )}
         </div>
       </div>
     </div>
   );
 }
