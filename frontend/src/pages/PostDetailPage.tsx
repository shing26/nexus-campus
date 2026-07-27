import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { apiClient } from '../api/client';
import Pagination from '../components/Pagination';
import type { PostPageVo } from '../types/post';

const AI_USER_ID = 999;

function RobotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <circle cx="15" cy="9" r="2" />
      <circle cx="9" cy="15" r="1" fill="currentColor" />
      <circle cx="15" cy="15" r="1" fill="currentColor" />
      <path d="M12 3v2" />
      <path d="M12 21v-1" />
    </svg>
  );
}

function AiReviewBadge({ reviewed, score }: { reviewed: number; score: number }) {
  if (reviewed === 0) return null;

  if (reviewed === 2) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 transition-all duration-300">
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        审核中&hellip;
      </span>
    );
  }

  let badgeStyle: { container: string; dot: string };
  if (score >= 7) {
    badgeStyle = { container: 'bg-green-100 text-[#22c55e]', dot: 'bg-[#22c55e]' };
  } else if (score >= 4) {
    badgeStyle = { container: 'bg-amber-100 text-[#f59e0b]', dot: 'bg-[#f59e0b]' };
  } else {
    badgeStyle = { container: 'bg-red-100 text-[#ef4444]', dot: 'bg-[#ef4444]' };
  }

  return (
    <span
      className={'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ease-out ' + badgeStyle.container}
      title={'AI Code Review: ' + score + '/10'}
    >
      <span className={'w-1.5 h-1.5 rounded-full shrink-0 ' + badgeStyle.dot} />
      <RobotIcon className="w-4 h-4 shrink-0" />
      <span className="font-semibold">{score}</span>
      <span className="opacity-70">/10</span>
    </span>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
    >
      {copied ? '已复制!' : '复制'}
    </button>
  );
}

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

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [commentPage, setCommentPage] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [aiReviewOpen, setAiReviewOpen] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await apiClient.get('/posts/' + id);
      return res.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60,
  });

  const { data: allCommentsData } = useQuery({
    queryKey: ['comments', id, 'all'],
    queryFn: async () => {
      const res = await apiClient.get('/posts/' + id + '/comments', {
        params: { page: 1, size: 100 },
      });
      return res.data.data;
    },
    enabled: !!id && !!post && post.aiReviewed === 1,
    staleTime: 1000 * 30,
  });

  const aiReviewComment = useMemo(() => {
    if (!allCommentsData) return null;
    return allCommentsData.list.find((c: any) => c.userId === AI_USER_ID) || null;
  }, [allCommentsData]);

  const { data: commentsData } = useQuery({
    queryKey: ['comments', id, commentPage],
    queryFn: async () => {
      const res = await apiClient.get('/posts/' + id + '/comments', {
        params: { page: commentPage, size: 10 },
      });
      return res.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 30,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/posts/' + id + '/like');
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', id] });
      const previous = queryClient.getQueryData<PostPageVo>(['post', id]);
      if (previous) {
        queryClient.setQueryData<PostPageVo>(['post', id], {
          ...previous,
          likeCount: previous.likeCount + 1,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['post', id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiClient.post('/posts/' + id + '/comments', { content });
    },
    onSuccess: () => {
      setCommentText('');
      setCommentPage(1);
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      if (post) {
        queryClient.setQueryData<PostPageVo>(['post', id], {
          ...post,
          commentCount: post.commentCount + 1,
        });
      }
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="h-64 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">帖子未找到</h2>
        <p className="text-slate-500 text-sm">这个帖子可能已被删除或不存在</p>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Post Header */}
      <header className="mb-10 pb-6 border-b border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight tracking-tight">
            {post.title}
          </h1>
          <AiReviewBadge reviewed={post.aiReviewed} score={post.aiReviewScore} />
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">
          <span className="font-medium text-slate-700">{post.authorName}</span>
          <span className="text-slate-300">·</span>
          <span>{post.categoryName}</span>
          <span className="text-slate-300">·</span>
          <span>{timeAgo(post.createTime)}</span>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {post.likeCount}
          </button>
          <span className="flex items-center gap-1.5 text-sm text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.viewCount} 次查看
          </span>
          <span className="flex items-center gap-1.5 text-sm text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {post.commentCount} 条评论
          </span>
        </div>
      </header>

      {/* Post Content — the visual hero */}
      <div className="prose prose-slate max-w-none mb-12 prose-headings:text-slate-900 prose-a:text-indigo-600 prose-code:text-indigo-700 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-transparent prose-pre:p-0">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const codeStr = String(children).replace(/\n$/, '');
              if (match) {
                return (
                  <div className="relative group my-6">
                    <CopyButton code={codeStr} />
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '0.875rem' }}
                    >
                      {codeStr}
                    </SyntaxHighlighter>
                  </div>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* AI Review Summary Panel */}
      {post.aiReviewed === 1 && (
        <div className="mb-12 border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setAiReviewOpen(!aiReviewOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <RobotIcon className="w-5 h-5 text-slate-500 shrink-0" />
              <span className="text-sm font-semibold text-slate-700">AI 审核结果</span>
              {aiReviewComment && (
                <span className="text-xs text-slate-400 truncate hidden sm:inline">
                  — {aiReviewComment.content}
                </span>
              )}
            </div>
            <svg
              className={'w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ' + (aiReviewOpen ? 'rotate-180' : '')}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {aiReviewOpen && (
            <div className="px-4 py-4 border-t border-slate-200">
              {aiReviewComment ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <RobotIcon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-indigo-600">AiAgent</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">AI</span>
                      <span className="text-xs text-slate-400">{timeAgo(aiReviewComment.createTime)}</span>
                    </div>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {aiReviewComment.content}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-2">暂无 AI 审核评论</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comment Section */}
      <section className="border-t border-slate-200 pt-8">
        <h2 className="text-base font-bold text-slate-900 mb-6">
          评论 ({post.commentCount})
        </h2>

        {/* Comment Form */}
        <div className="mb-8">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
            className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none placeholder-slate-400"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => {
                if (commentText.trim()) {
                  commentMutation.mutate(commentText.trim());
                }
              }}
              disabled={!commentText.trim() || commentMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {commentMutation.isPending ? '发布中...' : '发表评论'}
            </button>
          </div>
        </div>

        {/* Comment List */}
        {commentsData && commentsData.list.length > 0 ? (
          <>
            <div className="space-y-4">
              {commentsData.list.map((comment: any) => {
                const isAiAgent = comment.userId === AI_USER_ID;
                if (isAiAgent) {
                  return (
                    <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-blue-50 border-l-4 border-blue-400">
                      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                        <RobotIcon className="w-4 h-4 text-blue-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-blue-800">{comment.authorName}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-200 text-blue-800 font-semibold">AI</span>
                          <span className="text-xs text-slate-400">{timeAgo(comment.createTime)}</span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-indigo-600">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{comment.authorName}</span>
                        <span className="text-xs text-slate-400">{timeAgo(comment.createTime)}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination
              page={commentsData.page}
              pages={commentsData.pages}
              onPageChange={setCommentPage}
            />
          </>
        ) : (
          <p className="text-center text-slate-500 py-8 text-sm">还没有评论，来分享你的想法吧</p>
        )}
      </section>
    </article>
  );
}
