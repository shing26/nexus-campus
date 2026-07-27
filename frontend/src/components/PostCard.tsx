import { Link } from 'react-router-dom';
import type { PostPageVo } from '../types/post';

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
    <div className="border-b border-gray-100 py-3">
      <Link to={`/post/${post.id}`} className="block">
        <h3 className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors leading-snug">
          {post.title}
        </h3>
      </Link>
      <div className="mt-1 text-xs text-gray-400">
        {post.authorName} · {post.categoryName} · {timeAgo(post.createTime)} · 💬 {post.commentCount} · 👁 {post.viewCount}
      </div>
    </div>
  );
}
