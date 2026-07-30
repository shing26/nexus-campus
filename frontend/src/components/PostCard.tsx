import { Link } from 'react-router-dom';
import type { PostPageVo } from '../types/post';
import { SpotlightCard } from './ui/SpotlightCard';
import { BorderBeam } from './ui/BorderBeam';
import { Heart, MessageCircle, Eye } from 'lucide-react';
import { useToastStore } from '../stores/toastStore';

interface PostCardProps {
  post: PostPageVo;
}

const SUMMARY_LENGTH = 80;

function stripHtml(text: string): string {
  return text?.replace(/<[^>]*>/g, '') ?? '';
}

export default function PostCard({ post }: PostCardProps) {
  const addToast = useToastStore((s) => s.addToast);
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return minutes + 'm ago';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    const days = Math.floor(hours / 24);
    if (days < 30) return days + 'd ago';
    return new Date(dateStr).toLocaleDateString();
  };

  const scoreColor = post.aiReviewScore >= 80 ? 'text-vibe-cyan' : post.aiReviewScore >= 50 ? 'text-yellow-400' : 'text-red-400';
  const shortSummary = stripHtml(post.summary || post.content).slice(0, SUMMARY_LENGTH);

  const meta = post.promptMetadata ? (() => { try { return JSON.parse(post.promptMetadata); } catch { return null; } })() : null;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + '/post/' + post.id);
    addToast('Link copied to clipboard', 'success');
  };

  return (
    <div className="relative">
      {post.aiReviewed === 1 && <BorderBeam size={150} duration={6} />}
      <div className="active:scale-[0.99] transition-transform">
        <SpotlightCard>
          <Link to={'/post/' + post.id} className="block">
            {/* Title as code comment */}
            <h3 className="font-mono text-sm text-slate-100 leading-snug hover:text-vibe-cyan transition-colors">
              <span className="text-slate-500"># </span>{post.title}
            </h3>
            {/* Summary as code */}
            {shortSummary && (
              <p className="mt-1.5 font-mono text-[11px] text-slate-500 line-clamp-1">
                // {shortSummary}...
              </p>
            )}
          </Link>
          {/* Metadata row — compact */}
          <div className="mt-2.5 flex items-center gap-3 text-[11px] font-mono">
            <span className="bg-vibe-cyan/10 border border-vibe-cyan/30 text-vibe-cyan rounded-md px-2 py-0.5">
              {post.categoryName}
            </span>
            {post.postType === 'prompt' && (
              <span className="bg-vibe-purple/10 border border-vibe-purple/30 text-vibe-purple rounded-md px-2 py-0.5 text-[10px] font-mono">Template</span>
            )}
            {post.aiReviewed === 1 && (
              <span className={'font-mono ' + scoreColor}>AI: {post.aiReviewScore}</span>
            )}
            <span className="text-slate-500">{post.authorName}</span>
            {meta?.role && (
              <span className="text-slate-500 truncate max-w-[120px]" title={meta.role}>role: {meta.role}</span>
            )}
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">{timeAgo(post.createTime)}</span>
            <div className="ml-auto flex items-center gap-2 text-slate-500">
              <button onClick={handleCopyLink} className="hover:text-vibe-cyan transition-colors active:scale-[0.95]" title="Copy link">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likeCount}</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.commentCount}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount}</span>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
