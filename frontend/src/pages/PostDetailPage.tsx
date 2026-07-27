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
      className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-colors"
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
          <div className="h-8 bg-gray-200 w-3/4" />
          <div className="h-4 bg-gray-100 w-1/2" />
          <div className="h-64 bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">帖子未找到</h2>
        <p className="text-gray-500 text-sm">这个帖子可能已被删除或不存在</p>
      </div>
    );
  }

  return (
    <article>
      {/* Post Header */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 border-b border-gray-200 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight tracking-tight mb-2">
          {post.title}
        </h1>
        <div className="text-xs text-gray-400">
          {post.authorName} · {post.categoryName} · {timeAgo(post.createTime)}
          {post.aiReviewed === 1 && post.aiReviewScore > 0 && (
            <> · AI 评分 {post.aiReviewScore}/10</>
          )}
        </div>
      </div>

      {/* Post Content — text constrained, code full-bleed */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-indigo-600 prose-code:text-indigo-700 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-pre:bg-transparent prose-pre:p-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeStr = String(children).replace(/\n$/, '');
                if (match) {
                  return (
                    <div className="relative group my-6 -mx-4 sm:-mx-6 lg:-mx-8">
                      <CopyButton code={codeStr} />
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.875rem' }}
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
      </div>

      {/* AI Review Panel */}
      {post.aiReviewed === 1 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <button
            onClick={() => setAiReviewOpen(!aiReviewOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left border-b border-gray-200"
          >
            <span className="text-sm font-semibold text-gray-700">AI 审核结果</span>
            <svg
              className={'w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ' + (aiReviewOpen ? 'rotate-180' : '')}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {aiReviewOpen && (
            <div className="px-4 py-4 border-b border-gray-200">
              {aiReviewComment ? (
                <div className="flex items-start gap-3">
                  <div className="text-sm font-medium text-gray-900 shrink-0">{aiReviewComment.authorName}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 mb-1">{timeAgo(aiReviewComment.createTime)}</div>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {aiReviewComment.content}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">暂无 AI 审核评论</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comments Section */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-200 pt-8 pb-12">
        <h2 className="text-base font-bold text-gray-900 mb-6">
          评论 ({post.commentCount})
        </h2>

        {/* Comment Form */}
        <div className="mb-8">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
            className="w-full px-4 py-3 text-sm border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder-gray-400 rounded-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => {
                if (commentText.trim()) {
                  commentMutation.mutate(commentText.trim());
                }
              }}
              disabled={!commentText.trim() || commentMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-none hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {commentMutation.isPending ? '发布中...' : '发表评论'}
            </button>
          </div>
        </div>

        {/* Comment List — thread style with border-l */}
        {commentsData && commentsData.list.length > 0 ? (
          <>
            <div>
              {commentsData.list.map((comment: any, idx: number) => {
                const isAiAgent = comment.userId === AI_USER_ID;
                return (
                  <div key={comment.id} className={'border-b border-gray-100 py-4 ' + (idx > 0 ? 'border-l border-gray-100 pl-4 ml-4' : '')}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                      {isAiAgent && <span className="text-xs text-gray-400 font-semibold">AI</span>}
                      <span className="text-xs text-gray-400">{timeAgo(comment.createTime)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
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
          <p className="text-center text-gray-500 py-8 text-sm">还没有评论，来分享你的想法吧</p>
        )}
      </section>
    </article>
  );
}
