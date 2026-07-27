import { Link } from 'react-router-dom';
import type { PostPageVo } from '../types/post';
import Avatar from './Avatar';
import { SpotlightCard } from './ui/SpotlightCard';
import { BorderBeam } from './ui/BorderBeam';

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
    if (minutes < 60) return minutes + '分钟前';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + '小时前';
    const days = Math.floor(hours / 24);
    if (days < 30) return days + '天前';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="relative">
      {post.aiReviewed === 1 && <BorderBeam />}
      <SpotlightCard>
        <div className="flex items-start gap-3">
          <Avatar name={post.authorName} size="md" />
          <div className="flex-1 min-w-0">
            <Link to={"/post/" + post.id} className="block">
              <h3 className="text-base font-semibold text-slate-100 hover:text-vibe-cyan transition-colors leading-snug">
                {post.title}
              </h3>
            </Link>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="bg-vibe-cyan/10 border border-vibe-cyan/30 text-vibe-cyan font-mono text-xs rounded-md px-2.5 py-0.5">
                {post.categoryName}
              </span>
              <span>{post.authorName}</span>
              <span>·</span>
              <span>{timeAgo(post.createTime)}</span>
              <span>·</span>
              <span>💬 {post.commentCount}</span>
              <span>·</span>
              <span>👁 {post.viewCount}</span>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}
