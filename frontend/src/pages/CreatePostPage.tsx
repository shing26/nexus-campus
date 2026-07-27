import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiClient } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { useChannels, type Channel } from '../api/useChannels';
import { Code2, Eye, EyeOff } from 'lucide-react';

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
  const isAdmin = user?.role === "ADMIN";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(true);

  const displayChannels = useMemo(() => {
    if (!channels) return [];
    return isAdmin ? channels : channels.filter((ch: Channel) => ch.slug !== "announcements");
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
    let insertion: string, cursorOffset: number;
    if (selected) {
      insertion = "```\n" + selected + "\n```";
      cursorOffset = start + insertion.length;
    } else {
      insertion = "```\n\n```";
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
      const selectedIsAnnouncements = channels?.find((ch: Channel) => ch.id === categoryId)?.slug === "announcements";
      if (categoryId === null || (!isAdmin && selectedIsAnnouncements)) {
        setCategoryId(displayChannels[0].id);
      }
    }
  }, [displayChannels, channels, categoryId, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    if (!isAuthenticated) { navigate("/login"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await apiClient.post("/posts", { title: title.trim(), categoryId, content });
      navigate("/post/" + res.data.data.id);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-lg font-mono font-semibold text-slate-100 mb-6">
        <span className="text-vibe-cyan">$</span> New Post
      </h1>

      {isAdmin && (
        <div className="mb-4 text-xs font-mono text-vibe-cyan bg-vibe-cyan/10 border border-vibe-cyan/30 rounded-lg px-4 py-2">
          # Announcements channel — admin only
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-900/30 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg text-xs font-mono">
            ! {error}
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="# Post title..."
              className="w-full px-4 py-2.5 bg-vibe-surface border border-vibe-border rounded-lg text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-vibe-cyan/50 focus:border-vibe-cyan/50 transition-colors"
            />
          </div>
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="px-4 py-2.5 bg-vibe-surface border border-vibe-border rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-vibe-cyan/50 focus:border-vibe-cyan/50 transition-colors"
            disabled={channelsLoading}
          >
            {channelsLoading ? (
              <option value="" className="bg-vibe-bg">Loading...</option>
            ) : (
              displayChannels.map((ch: Channel) => (
                <option key={ch.id} value={ch.id} className="bg-vibe-bg">
                  {ch.slug === "announcements" ? ch.name + " (Admin)" : ch.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 bg-vibe-surface border border-vibe-border rounded-t-lg px-3 py-2">
          <button
            type="button"
            onClick={insertCodeBlock}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-slate-400 bg-vibe-card border border-vibe-border rounded-md hover:text-vibe-cyan hover:border-vibe-cyan/40 transition-colors"
            title="Insert code block"
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-slate-400 bg-vibe-card border border-vibe-border rounded-md hover:text-vibe-cyan hover:border-vibe-cyan/40 transition-colors"
          >
            {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {preview ? "Hide" : "Show"}
          </button>
          <span className="text-[10px] font-mono text-slate-500 ml-auto">~{tokens} tokens</span>
        </div>

        {/* Editor + Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-vibe-border rounded-b-lg overflow-hidden">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="// Write your post in Markdown..."
            className="w-full h-96 p-4 bg-vibe-bg text-slate-200 font-mono text-sm resize-none focus:outline-none border-0 border-r border-vibe-border placeholder-slate-600"
          />
          {preview && (
            <div className="h-96 overflow-y-auto p-4 bg-vibe-surface prose prose-invert prose-sm max-w-none border-0">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                <p className="text-slate-600 italic font-mono text-xs">{/* Preview */}</p>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="relative overflow-hidden rounded-lg bg-gradient-to-r from-vibe-cyan to-vibe-purple p-[1px] font-mono text-xs font-medium text-white transition-transform active:scale-95 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent,25%,rgba(255,255,255,0.3),45%,transparent)] bg-[length:200%_100%] animate-shimmer" />
            <span className="relative flex items-center gap-1.5 rounded-[7px] bg-vibe-bg/90 px-5 py-2 backdrop-blur-sm hover:bg-transparent transition-colors">
              {submitting ? "Publishing..." : "Publish Post"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
