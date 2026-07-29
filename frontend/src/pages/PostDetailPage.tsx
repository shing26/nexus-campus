import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Heart, Share2, MessageCircle, Eye, Copy, Check } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import Pagination from '../components/Pagination';
import Avatar from '../components/Avatar';
import { AiReviewTerminal } from '../components/AiReviewTerminal';

import type { PostPageVo } from '../types/post';

const AI_USER_ID = 999;

function MacDots() {
  return (
    <div className="flex items-center gap-1.5 px-3">
      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
    </div>
  );
}

function TerminalWindow({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={'bg-vibe-surface border border-vibe-border rounded-xl overflow-hidden ' + className}>
      <div className="flex items-center h-9 bg-vibe-card border-b border-vibe-border select-none">
        <MacDots />
        <span className="flex-1 text-center text-[11px] font-mono text-slate-500 truncate px-2">{title}</span>
        <div className="w-16" />
      </div>
      {children}
    </div>
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
    <button onClick={handleCopy} className="absolute top-2 right-2 px-2 py-1 text-xs font-mono bg-vibe-card/80 text-slate-400 hover:text-white hover:bg-vibe-card transition-colors rounded-md border border-vibe-border">
      {copied ? <><Check className="w-3 h-3 inline" /> Copied</> : <><Copy className="w-3 h-3 inline" /> Copy</>}
    </button>
  );
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  if (d < 30) return d + 'd ago';
  return new Date(dateStr).toLocaleDateString();
};

function estimateTokens(text: string): number {
  if (!text.trim()) return 0;
  const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length;
  const asciiText = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, ' ');
  const asciiWords = asciiText.split(/\s+/).filter(Boolean).length;
  return Math.round(chineseChars * 2 + asciiWords * 1.3);
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  
  const [commentPage, setCommentPage] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

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
      const res = await apiClient.get('/posts/' + id + '/comments', { params: { page: 1, size: 100 } });
      return res.data.data;
    },
    enabled: !!id && !!post && post.aiReviewed === 1,
    staleTime: 1000 * 30,
  });

  const aiReviewComment = useMemo(() => {
    if (!allCommentsData) return null;
    return allCommentsData.list?.find((c: any) => c.userId === AI_USER_ID) || null;
  }, [allCommentsData]);

  const { data: commentsData } = useQuery({
    queryKey: ['comments', id, commentPage],
    queryFn: async () => {
      const res = await apiClient.get('/posts/' + id + '/comments', { params: { page: commentPage, size: 10 } });
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
        queryClient.setQueryData<PostPageVo>(['post', id], { ...post, commentCount: post.commentCount + 1 });
      }
    },
  });

  const handleLike = async () => {
    try {
      const res = await apiClient.post('/posts/' + id + '/like');
      setLiked(!liked);
      setLikeCount(res.data.data?.currentLikes ?? likeCount + (liked ? -1 : 1));
    } catch { /* ignore */ }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    if (!user) { window.location.href = '/login'; return; }
    commentMutation.mutate(commentText.trim());
  };

  // Prompt Playground state
  const promptMeta = useMemo(() => {
    if (!post?.promptMetadata) return null;
    try { return JSON.parse(post.promptMetadata); } catch { return null; }
  }, [post]);

  const variables: string[] = promptMeta?.variables ?? [];

  const [varValues, setVarValues] = useState<Record<string, string>>({});


  const varsKey = variables.join(',');
  useEffect(() => {
    setVarValues((prev) => {
      const next: Record<string, string> = {};
      variables.forEach((v) => { next[v] = prev[v] ?? ''; });
      return next;
    });
  }, [varsKey]);

  const renderedPrompt = useMemo(() => {
    let text = post?.content ?? '';
    variables.forEach((v) => {
      text = text.replace(new RegExp('\\{\\{' + v + '\\}\\}', 'g'), varValues[v] || '{{' + v + '}}');
    });
    return text;
  }, [post?.content, variables, varValues]);

  const playgroundTokens = useMemo(() => estimateTokens(renderedPrompt), [renderedPrompt]);

  const [playgroundCopied, setPlaygroundCopied] = useState(false);
  const handleCopyRendered = async () => {
    await navigator.clipboard.writeText(renderedPrompt);
    setPlaygroundCopied(true);
    setTimeout(() => setPlaygroundCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-vibe-card rounded w-3/4" />
          <div className="h-4 bg-vibe-card/50 rounded w-1/2" />
          <div className="h-64 bg-vibe-card/30 rounded" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold font-mono text-slate-100 mb-2">404 — Post Not Found</h2>
        <p className="text-sm font-mono text-slate-500">This post may have been deleted or never existed.</p>
      </div>
    );
  }

  const comments = commentsData?.list ?? [];
  const totalComments = post.commentCount;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* HEADER ROW */}
      <div className="flex items-center gap-3 mb-6">
        <Avatar name={post.authorName} size="md" />
        <div>
          <h1 className="text-base font-semibold font-mono text-slate-100 leading-snug">{post.title}</h1>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-0.5">
            <span>{post.authorName}</span>
            <span className="text-slate-700">·</span>
            <span className="bg-vibe-cyan/10 border border-vibe-cyan/30 text-vibe-cyan rounded-md px-1.5 py-0.5">{post.categoryName}</span>
            {post.postType === 'prompt' && (
              <span className="bg-vibe-purple/10 border border-vibe-purple/30 text-vibe-purple rounded-md px-1.5 py-0.5">🤖 Template</span>
            )}
            <span className="text-slate-700">·</span>
            <span>{timeAgo(post.createTime)}</span>
          </div>
          {/* Stats badges */}
          <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.viewCount}</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likeCount}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {totalComments}</span>
          </div>
        </div>
      </div>

      {/* POST CONTENT — macOS Terminal Wrapper */}
      <TerminalWindow title={post.title.slice(0, 30) + (post.title.length > 30 ? '...' : '') + '.md'} className="mb-6">
        <div className="p-4 bg-vibe-bg prose prose-invert prose-sm max-w-none prose-headings:text-slate-100 prose-a:text-vibe-cyan prose-code:text-vibe-cyan prose-code:bg-vibe-card prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-pre:bg-transparent prose-pre:p-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeStr = String(children).replace(/\n$/, '');
                if (match) {
                  return (
                    <div className="relative group my-4 -mx-4 sm:-mx-6">
                      <CopyButton code={codeStr} />
                      <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.8rem' }}>{codeStr}</SyntaxHighlighter>
                    </div>
                  );
                }
                return <code className={className} {...props}>{children}</code>;
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </TerminalWindow>

      {/* INTERACTIVE DOCK */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-red-400 transition-colors">
            <Heart className={'w-4 h-4 ' + (liked ? 'fill-red-500 text-red-500' : '')} />
            {likeCount || post.likeCount}
          </button>
          <button onClick={handleCopyLink} className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-vibe-cyan transition-colors">
            {copiedLink ? <Check className="w-4 h-4 text-vibe-cyan" /> : <Share2 className="w-4 h-4" />}
            {copiedLink ? 'Copied!' : 'Share'}
          </button>
        </div>
        {post.aiReviewed === 1 && post.aiReviewScore > 0 && (
          <span className="text-[11px] font-mono text-vibe-emerald">AI Score: {post.aiReviewScore}/100</span>
        )}
      </div>

      {/* PROMPT PLAYGROUND */}
      {post.postType === 'prompt' && promptMeta && variables.length > 0 && (
        <div className="max-w-3xl mx-auto mb-8">
          <TerminalWindow title="prompt_playground — Template Variables">
            <div className="p-4 space-y-4">
              {/* Variable Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {variables.map((v) => (
                  <div key={v} className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">{v}</label>
                    <input
                      value={varValues[v] ?? ''}
                      onChange={(e) => setVarValues((prev) => ({ ...prev, [v]: e.target.value }))}
                      placeholder={'Enter ' + v + '...'}
                      className="w-full px-3 py-2 bg-vibe-bg border border-vibe-border rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-vibe-cyan/50 focus:border-vibe-cyan/50 transition-colors"
                    />
                  </div>
                ))}
              </div>

              {/* Live Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-500">// Live Preview</span>
                  <span className="text-[10px] font-mono text-slate-600">~{playgroundTokens} tokens</span>
                </div>
                <pre className="w-full max-h-48 overflow-y-auto p-3 bg-vibe-bg border border-vibe-border rounded-lg text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {renderedPrompt || <span className="text-slate-600">// Fill in variables above to preview...</span>}
                </pre>
              </div>

              {/* Copy Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleCopyRendered}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-vibe-cyan/20 border border-vibe-cyan/30 text-vibe-cyan text-xs font-mono hover:bg-vibe-cyan/30 transition-colors"
                >
                  {playgroundCopied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Prompt</>}
                </button>
              </div>
            </div>
          </TerminalWindow>
        </div>
      )}

      {/* AI REVIEW TERMINAL */}
      {post.aiReviewed === 1 && (
        <div className="max-w-3xl mx-auto mb-8">
          <AiReviewTerminal
            summary={aiReviewComment?.content || 'Prompt structure complete, input constraints satisfied, generated code has no high-risk logic vulnerabilities.'}
            score={Math.round((post.aiReviewScore || 0) * 10)}
          />
        </div>
      )}

      {/* COMMENTS SECTION */}
      <section className="max-w-3xl mx-auto border-t border-vibe-border pt-6 pb-12">
        <h2 className="text-xs font-mono font-semibold text-slate-400 mb-5">
          // Comments ({totalComments})
        </h2>

        {/* Comment Form — Terminal style */}
        <div className="bg-vibe-surface border border-vibe-border rounded-xl overflow-hidden mb-6">
          <div className="flex items-center h-8 bg-vibe-card border-b border-vibe-border px-3">
            <MacDots />
            <span className="text-[10px] font-mono text-slate-600 ml-3">new_comment.md</span>
          </div>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="// Write your comment..."
            rows={3}
            className="w-full px-4 py-3 text-sm font-mono bg-vibe-bg text-slate-200 resize-none focus:outline-none border-0 placeholder-slate-600 leading-relaxed"
          />
          <div className="flex items-center justify-between px-3 py-2 bg-vibe-card/50 border-t border-vibe-border">
            <span className="text-[10px] font-mono text-slate-600">{commentText.length > 0 ? 'Ready' : 'Type to comment'}</span>
            <button
              onClick={handleCommentSubmit}
              disabled={!commentText.trim() || commentMutation.isPending}
              className="px-4 py-1.5 rounded-lg bg-vibe-cyan/20 border border-vibe-cyan/30 text-vibe-cyan text-xs font-mono hover:bg-vibe-cyan/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>

        {/* Comment List */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment: any, i: number) => {
              const isAi = comment.userId === AI_USER_ID;
              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                  className="border-b border-vibe-border pb-3 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={comment.authorName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono font-medium text-slate-200">{comment.authorName}</span>
                        {isAi && <span className="text-[10px] font-mono text-vibe-purple bg-vibe-purple/10 border border-vibe-purple/30 rounded px-1">AI</span>}
                        <span className="text-[10px] font-mono text-slate-600">{timeAgo(comment.createTime)}</span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-xs font-mono text-slate-600 py-8">// No comments yet. Share your thoughts.</p>
        )}

        {commentsData && commentsData.pages > 1 && (
          <Pagination page={commentsData.page} pages={commentsData.pages} onPageChange={setCommentPage} />
        )}
      </section>
    </div>
  );
}


