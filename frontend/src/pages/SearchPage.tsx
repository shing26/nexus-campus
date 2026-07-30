 import { useState, useEffect } from 'react';
 import { useSearchParams } from 'react-router-dom';
 import { useQuery } from '@tanstack/react-query';
 import { apiClient } from '../api/client';
 import PostCard from '../components/PostCard';
 import Pagination from '../components/Pagination';
 import Sidebar from '../components/Sidebar';
 import EmptyState from '../components/EmptyState';
 
 export default function SearchPage() {
   const [searchParams] = useSearchParams();
   const keyword = searchParams.get('q') || '';
   const [page, setPage] = useState(1);
 
   useEffect(() => {
     setPage(1);
   }, [keyword]);
 
   const { data, isLoading } = useQuery({
     queryKey: ['posts', 'search', keyword, page],
     queryFn: async () => {
       const res = await apiClient.get('/posts', {
         params: { keyword, page, size: 10 },
       });
       return res.data;
     },
     enabled: !!keyword,
     staleTime: 1000 * 60,
   });
 
   return (
     <div className="max-w-[1400px] mx-auto px-4 py-8">
       <div className="flex gap-6">
         <div className="w-64 shrink-0 hidden lg:block">
           <Sidebar />
         </div>
         <div className="flex-1 min-w-0">
           <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-200 dark:border-gray-800 mb-6">
             {keyword ? '搜索: ' + keyword : '搜索'}
           </h1>
 
           {!keyword ? (
             <p className="text-gray-500 dark:text-gray-400 text-center py-12 text-sm">输入关键词搜索帖子</p>
           ) : isLoading ? (
             <div className="space-y-3">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="bg-vibe-surface/50 border border-vibe-border rounded-xl p-5 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-vibe-cyan/5 to-transparent bg-[length:200%_100%] animate-shimmer" />
                   <div className="h-3 bg-vibe-card rounded w-3/4 mb-3 relative" />
                   <div className="h-2.5 bg-vibe-card/50 rounded w-1/2 mb-2 relative" />
                   <div className="h-2 bg-vibe-card/30 rounded w-1/4 relative" />
                 </div>
               ))}
             </div>
           ) : data && data.list && data.list.length > 0 ? (
             <>
               <div className="space-y-3">
                 {data.list.map((post: any) => (
                   <PostCard key={post.id} post={post} />
                 ))}
               </div>
               <Pagination
                 page={data.page}
                 pages={data.pages}
                 onPageChange={setPage}
               />
             </>
           ) : (
             <EmptyState preset="noResults" />
           )}
         </div>
       </div>
     </div>
   );
 }
