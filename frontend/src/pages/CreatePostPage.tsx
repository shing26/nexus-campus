import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { apiClient } from "../api/client";
import { useAuthStore } from "../stores/authStore";
import { useChannels, type Channel } from "../api/useChannels";
import {
  Terminal, Sparkles, Tag, Code2, Save, Send,
} from "lucide-react";

function estimateTokens(text: string): number {
  if (!text.trim()) return 0;
  const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length;
  const asciiText = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, " ");
  const asciiWords = asciiText.split(/\s+/).filter(Boolean).length;
  return Math.round(chineseChars * 2 + asciiWords * 1.3);
}

/** macOS traffic-light dots */
function MacDots() {
  return (
    <div className="flex items-center gap-1.5 px-3">
      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
    </div>
  );
}

/** Terminal-styled window wrapper */
function TerminalWindow({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={"bg-vibe-surface border border-vibe-border rounded-xl overflow-hidden " + className}>
      {/* Title bar */}
      <div className="flex items-center h-9 bg-vibe-card border-b border-vibe-border select-none">
        <MacDots />
        <span className="flex-1 text-center text-[11px] font-mono text-slate-500 truncate px-2">{title}</span>
        <div className="w-16" /> {/* balance */}
      </div>
      {children}
    </div>
  );
}

const PROMPT_TEMPLATE = `## System Prompt
You are an expert coding assistant. Follow these guidelines:
- Write clean, well-documented code
- Prioritize readability over brevity
- Include error handling

## User Request
`;

export default function CreatePostPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

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

  const handleAiPolish = () => {
    setContent((prev) => (prev.trim() ? prev + "\n\n" + PROMPT_TEMPLATE : PROMPT_TEMPLATE));
  };

  useEffect(() => {
    if (displayChannels.length > 0) {
      const selectedIsAnnouncements =
        channels?.find((ch: Channel) => ch.id === categoryId)?.slug === "announcements";
      if (categoryId === null || (!isAdmin && selectedIsAnnouncements)) {
        setCategoryId(displayChannels[0].id);
      }
    }
  }, [displayChannels, channels, categoryId, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("// Error: Title and content are required");
      return;
    }
    if (!isAuthenticated) { navigate("/login"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await apiClient.post("/posts", { title: title.trim(), categoryId, content });
      navigate("/post/" + res.data.data.id);
    } catch (err: any) {
      setError("// Error: " + (err.response?.data?.message || "Failed to create post"));
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-dismiss error after 4s
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-vibe-cyan/20 border border-vibe-cyan/30 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-vibe-cyan" />
          </div>
          <div>
            <h1 className="text-base font-semibold font-mono text-slate-100">Vibe Prompt Studio</h1>
            <p className="text-[11px] font-mono text-slate-500">Compose & publish your AI prompt / code snippet</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAiPolish}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vibe-purple/20 border border-vibe-purple/30 text-vibe-purple text-xs font-mono hover:bg-vibe-purple/30 transition-colors"
          title="Insert AI prompt template"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Polish Prompt
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* METADATA WINDOW */}
        <TerminalWindow title="config.json — Metadata">
          <div className="p-4 space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="# Post title..."
                  className="w-full px-3 py-2 bg-vibe-bg border border-vibe-border rounded-lg text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-vibe-cyan/50 focus:border-vibe-cyan/50 transition-colors"
                />
              </div>
              <select
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-1/4 px-3 py-2 bg-vibe-bg border border-vibe-border rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-vibe-cyan/50 focus:border-vibe-cyan/50 transition-colors"
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
            {/* Tags */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (comma separated) — e.g. react, tailwind, animation"
                className="w-full pl-9 pr-3 py-2 bg-vibe-bg border border-vibe-border rounded-lg text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-vibe-cyan/50 focus:border-vibe-cyan/50 transition-colors"
              />
            </div>
          </div>
        </TerminalWindow>

        {/* ADMIN NOTICE */}
        {isAdmin && (
          <div className="text-[10px] font-mono text-vibe-cyan bg-vibe-cyan/10 border border-vibe-cyan/30 rounded-lg px-3 py-1.5">
            # Announcements channel — admin only
          </div>
        )}

        {/* EDITOR WINDOW */}
        <TerminalWindow title="prompt_editor.md — Markdown Editor">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-vibe-border bg-vibe-card/50">
            {/* Left tabs */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className={
                  "px-3 py-1 rounded-md text-[11px] font-mono transition-colors " +
                  (activeTab === "editor"
                    ? "bg-vibe-cyan/20 text-vibe-cyan"
                    : "text-slate-500 hover:text-slate-300")
                }
              >
                📝 Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={
                  "px-3 py-1 rounded-md text-[11px] font-mono transition-colors " +
                  (activeTab === "preview"
                    ? "bg-vibe-cyan/20 text-vibe-cyan"
                    : "text-slate-500 hover:text-slate-300")
                }
              >
                👁️ Preview
              </button>
            </div>
            {/* Right status */}
            <div className="ml-auto flex items-center gap-3 text-[10px] font-mono text-slate-600">
              <span>~{tokens} Tokens</span>
              <span className="hidden sm:inline">Markdown / Code Supported</span>
            </div>
          </div>

          {/* Editor body */}
          {activeTab === "editor" ? (
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="// Write your prompt or code in Markdown..."
                className="w-full h-80 p-4 bg-vibe-bg text-slate-200 font-mono text-sm leading-relaxed resize-none focus:outline-none border-0 placeholder-slate-700"
              />
              {/* Code block FAB */}
              <button
                type="button"
                onClick={insertCodeBlock}
                className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-vibe-card border border-vibe-border text-[10px] font-mono text-slate-400 hover:text-vibe-cyan hover:border-vibe-cyan/40 transition-colors"
                title="Insert code block"
              >
                <Code2 className="w-3 h-3" />
                Code
              </button>
            </div>
          ) : (
            <div className="h-80 overflow-y-auto p-4 bg-vibe-bg prose prose-invert prose-sm max-w-none">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                <p className="text-slate-700 italic font-mono text-xs">// Preview will appear here...</p>
              )}
            </div>
          )}

          {/* Footer Dock */}
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-vibe-border bg-vibe-card/50">
            {/* Error toast (inline) */}
            {error && (
              <span className="text-[11px] font-mono text-red-400 animate-pulse">{error}</span>
            )}
            {!error && <span />}
            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-vibe-border text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Draft
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="relative overflow-hidden rounded-lg bg-gradient-to-r from-vibe-cyan to-vibe-purple p-[1px] font-mono text-xs font-medium text-white transition-transform active:scale-95 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent,25%,rgba(255,255,255,0.3),45%,transparent)] bg-[length:200%_100%] animate-shimmer" />
                <span className="relative flex items-center gap-1.5 rounded-[7px] bg-vibe-bg/90 px-4 py-1.5 backdrop-blur-sm hover:bg-transparent transition-colors">
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? "Publishing..." : "Publish Vibe Post"}
                </span>
              </button>
            </div>
          </div>
        </TerminalWindow>
      </form>
    </div>
  );
}
