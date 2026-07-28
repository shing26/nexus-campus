 import { useState, useEffect } from 'react';
 import { useSearchParams } from 'react-router-dom';
 import { useQuery } from '@tanstack/react-query';
 import { apiClient } from '../api/client';
 import PostCard from '../components/PostCard';
 import Pagination from '../components/Pagination';
 import Sidebar from '../components/Sidebar';
 
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
     <div className="max-w-7xl mx-auto px-4 py-8">
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
                 <div key={i} className="animate-pulse bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                   <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                   <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
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
             <p className="text-gray-500 dark:text-gray-400 text-center py-12 text-sm">没有找到 &ldquo;{keyword}&rdquo; 的相关内容</p>
           )}
         </div>
       </div>
     </div>
   );
 }
