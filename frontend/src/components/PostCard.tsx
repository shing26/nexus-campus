import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import type { PostPageVo } from '../types/post';
 import Avatar from './Avatar';
 
 interface PostCardProps {
   post: PostPageVo;
 }
 
 export default function PostCard({ post }: PostCardProps) {
   const timeAgo = (dateStr: string) => {
     const now = Date.now();
     const date = new Date(dateStr).getTime();
     const diff = now - date;
     const minutes = Math.floor(diff / 60000);
     if (minutes < 1) return '刚刚';
     if (minutes < 60) return `${minutes}分钟前`;
     const hours = Math.floor(minutes / 60);
     if (hours < 24) return `${hours}小时前`;
     const days = Math.floor(hours / 24);
     if (days < 30) return `${days}天前`;
     return new Date(dateStr).toLocaleDateString();
   };
 
 return (
   <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15, ease: "easeOut" }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar name={post.authorName} size="md" />
        <div className="flex-1 min-w-0">
           <Link to={`/post/${post.id}`} className="block">
             <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors leading-snug">
               {post.title}
             </h3>
           </Link>
           <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
             {post.authorName} · {post.categoryName} · {timeAgo(post.createTime)} · 💬 {post.commentCount} · 👁 {post.viewCount}
           </div>
        </div>
      </div>
   </motion.div>
  );
}
