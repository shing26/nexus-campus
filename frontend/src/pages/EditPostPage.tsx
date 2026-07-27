import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiClient } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { useChannels, type Channel } from '../api/useChannels';

function estimateTokens(text: string): number {
  if (!text.trim()) return 0;
  const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length;
  const asciiText = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, ' ');
  const asciiWords = asciiText.split(/\s+/).filter(Boolean).length;
  return Math.round(chineseChars * 2 + asciiWords * 1.3);
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { data: channels, isLoading: channelsLoading } = useChannels();

  const tokens = useMemo(() => estimateTokens(content), [content]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await apiClient.get(`/posts/${id}`);
        const post = res.data.data;
        setTitle(post.title || '');
        setCategoryId(post.categoryId ?? null);
        setContent(post.content || '');
      } catch (err: any) {
        setError('Failed to load post.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const insertCodeBlock = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const before = content.slice(0, start);
    const after = content.slice(end);
    let insertion: string;
    let cursorOffset: number;
    if (selected) {
      insertion = '```\n' + selected + '\n```';
      cursorOffset = start + insertion.length;
    } else {
      insertion = '```\n\n```';
      cursorOffset = start + 4;
    }
    setContent(before + insertion + after);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorOffset, cursorOffset);
    });
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiClient.put(`/posts/${id}`, { title: title.trim(), categoryId, content });
      navigate(`/post/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update post.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-3 bg-vibe-card rounded w-1/3" />
          <div className="h-96 bg-vibe-card/50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-200 mb-8"><span className="text-vibe-cyan">$</span> Edit Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full px-4 py-3 border border-vibe-border rounded-lg text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-vibe-cyan/50 focus:border-vibe-cyan/50 focus:border-transparent"
            />
          </div>
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="px-4 py-3 border border-vibe-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibe-cyan/50 focus:border-vibe-cyan/50 focus:border-transparent bg-vibe-surface"
            disabled={channelsLoading}
          >
            {channelsLoading ? (
                <option value="">Loading channels...</option>
              ) : (
                channels?.map((ch: Channel) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name}
                  </option>
                ))
              )}
          </select>
        </div>

        <div className="flex items-center gap-2 border border-vibe-border rounded-t-lg bg-vibe-surface px-4 py-2">
          <button
            type="button"
            onClick={insertCodeBlock}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 bg-vibe-surface border border-vibe-border rounded-md hover:bg-vibe-card/50 transition-colors"
            title="Insert code block"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Code Block
          </button>
          <span className="text-xs text-gray-400 ml-auto">
            ~{tokens} tokens
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-x border-vibe-border rounded-b-lg overflow-hidden">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content in Markdown..."
            className="w-full h-96 p-4 border-r border-vibe-border font-mono text-sm resize-none focus:outline-none focus:ring-0 border-0"
          />
          <div className="h-96 overflow-y-auto p-4 bg-vibe-surface prose prose-sm max-w-none">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Preview will appear here...</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/post/${id}`)}
            className="px-6 py-3 border border-vibe-border text-slate-300 font-medium rounded-lg hover:bg-vibe-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-gradient-to-r from-vibe-cyan to-vibe-purple text-xs font-mono text-white hover:bg-gradient-to-r from-vibe-cyan to-vibe-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

