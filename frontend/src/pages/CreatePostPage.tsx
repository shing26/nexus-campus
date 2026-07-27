import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function CreatePostPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const [submitting, setSubmitting] = useState(false);

  const displayChannels = useMemo(() => {
    if (!channels) return [];
    return isAdmin
      ? channels
      : channels.filter((ch: Channel) => ch.slug !== 'announcements');
  }, [channels, isAdmin]);

  const tokens = useMemo(() => estimateTokens(content), [content]);

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

 useEffect(() => {
    if (displayChannels.length > 0) {
      const selectedIsAnnouncements =
        channels?.find((ch: Channel) => ch.id === categoryId)?.slug === 'announcements';
      if (categoryId === null || (!isAdmin && selectedIsAnnouncements)) {
        setCategoryId(displayChannels[0].id);
      }
    }
  }, [displayChannels, channels, categoryId, isAdmin]);

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
      const res = await apiClient.post('/posts', { title: title.trim(), categoryId, content });
      navigate(`/post/${res.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setSubmitting(false);
    }
  };

 return (
   <div className="max-w-5xl mx-auto px-4 py-8">
     <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Post</h1>

     {isAdmin && (
       <div className="mb-4 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          公告频道仅管理员可发帖
        </div>
     )}

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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white"
            disabled={channelsLoading}
          >
            {channelsLoading ? (
                <option value="">Loading channels...</option>
              ) : (
                displayChannels.map((ch: Channel) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.slug === 'announcements' ? `${ch.name} 🔒 (Admin only)` : ch.name}
                  </option>
                ))
              )}
          </select>
        </div>

        <div className="flex items-center gap-2 border border-gray-300 rounded-t-lg bg-gray-50 px-4 py-2">
          <button
            type="button"
            onClick={insertCodeBlock}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-x border-gray-300 rounded-b-lg overflow-hidden">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content in Markdown..."
            className="w-full h-96 p-4 border-r border-gray-200 font-mono text-sm resize-none focus:outline-none focus:ring-0 border-0"
          />
          <div className="h-96 overflow-y-auto p-4 bg-white prose prose-sm max-w-none">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Preview will appear here...</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
}



