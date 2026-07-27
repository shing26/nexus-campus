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

  const stripMarkdown = (md: string, maxLen = 160) => {
    const plain = md
      .replace(/```[\s\S]*?```/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
      .replace(/[#*`>_~|]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    return plain.length > maxLen ? plain.slice(0, maxLen) + '…' : plain;
  };

  return (
    <div className={`bg-white rounded-lg border ${post.isPinned ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'} p-5 hover:border-slate-300 transition-colors`}>
      {post.isPinned && (
        <div className="flex items-center gap-1.5 mb-2">
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-medium text-amber-600">已置顶</span>
        </div>
      )}
      <Link to={`/post/${post.id}`} className="block">
        <h3 className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors mb-1.5 leading-snug">
          {post.title}
        </h3>
      </Link>
      <p className="text-sm text-slate-500 mb-3 line-clamp-2 leading-relaxed">
        {stripMarkdown(post.summary || post.content)}
      </p>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="font-medium text-slate-600">{post.authorName}</span>
        <span className="text-slate-300">·</span>
        <span>{post.categoryName}</span>
        <span className="text-slate-300">·</span>
        <span>{timeAgo(post.createTime)}</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1" title="Views">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.viewCount}
          </span>
          <span className="flex items-center gap-1" title="Likes">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {post.likeCount}
          </span>
          <span className="flex items-center gap-1" title="Comments">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {post.commentCount}
          </span>
        </div>
      </div>
    </div>
  );
}
