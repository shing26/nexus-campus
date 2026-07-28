import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../stores/authStore';

interface Message {
  id: number;
  sender: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const res = await apiClient.get('/messages');
        setMessages(res.data.data || []);
      } catch {
        setError('Failed to load messages.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  const markAsRead = async (messageId: number) => {
    // Optimistically update UI
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && !m.readAt
          ? { ...m, readAt: new Date().toISOString() }
          : m
      )
    );
    try {
      await apiClient.put(`/messages/${messageId}`, { read: true });
    } catch {
      // Revert on failure
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, readAt: null } : m
        )
      );
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No messages yet.</p>
          <p className="text-sm text-gray-400 mt-1">System notifications will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => {
            const isUnread = !msg.readAt;
            const time = new Date(msg.createdAt).toLocaleString();
            return (
              <button
                key={msg.id}
                onClick={() => isUnread && markAsRead(msg.id)}
                className={`w-full text-left bg-white border rounded-lg p-4 transition-colors ${
                  isUnread
                    ? 'border-indigo-200 hover:border-indigo-300 cursor-pointer'
                    : 'border-gray-200 cursor-default'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Read/unread indicator */}
                  <div className="mt-1.5 shrink-0">
                    {isUnread ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
                        {msg.sender}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">{time}</span>
                    </div>
                    <p className={`mt-1 text-sm ${isUnread ? 'text-gray-800' : 'text-gray-500'}`}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
