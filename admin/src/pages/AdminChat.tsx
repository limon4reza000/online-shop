import { useEffect, useRef, useState } from 'react';
import {
  Search, Send, Check, CheckCheck, Clock, RotateCw, Trash2, CheckCircle2, Inbox, Loader2, MessageCircle,
} from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/context/ToastContext';
import {
  useAdminConversations, useAdminConversationMessages, useSendAdminReply, useUpdateConversationStatus, useDeleteConversation,
} from '@/hooks/useAdminChat';
import type { ChatMessage } from '@/lib/types';

const PAGE_SIZE = 20;
const TABS: { id: 'all' | 'unread' | 'resolved'; label: string }[] = [
  { id: 'all', label: 'সব' },
  { id: 'unread', label: 'অপঠিত' },
  { id: 'resolved', label: 'সমাধান হয়েছে' },
];

export default function AdminChat() {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'all' | 'unread' | 'resolved'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: conversations, isLoading, meta } = useAdminConversations({ page, pageSize: PAGE_SIZE, search: search || undefined, filter: tab });
  const { data: thread, isLoading: threadLoading } = useAdminConversationMessages(selectedId);
  const sendReply = useSendAdminReply(selectedId);
  const updateStatus = useUpdateConversationStatus();
  const deleteConversation = useDeleteConversation();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [thread?.messages.length]);

  const submitReply = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || !selectedId) return;
    sendReply.mutate(value, { onError: () => showToast('বার্তা পাঠানো যায়নি', 'error') });
    setText('');
  };

  const toggleResolve = () => {
    if (!thread) return;
    const next = thread.conversation.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED';
    updateStatus.mutate({ id: thread.conversation.id, status: next }, {
      onSuccess: () => showToast(next === 'RESOLVED' ? 'সমাধান হিসেবে চিহ্নিত করা হয়েছে' : 'পুনরায় চালু করা হয়েছে', 'success'),
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteConversation.mutate(deleteTarget, {
      onSuccess: () => {
        showToast('কথোপকথন মুছে ফেলা হয়েছে', 'info');
        if (selectedId === deleteTarget) setSelectedId(null);
        setDeleteTarget(null);
      },
      onError: () => showToast('মুছে ফেলা যায়নি', 'error'),
    });
  };

  return (
    <div className="space-y-6">
      <Seo title="Customer Chat" />
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5"><MessageCircle size={13} /> Support</p>
        <h2 className="text-2xl font-bold mt-0.5">কাস্টমার চ্যাট</h2>
        <p className="text-sm text-text-secondary mt-1">গ্রাহকদের সাথে রিয়েল-টাইম কথোপকথন দেখুন ও উত্তর দিন।</p>
      </div>

      <div className="card-surface overflow-hidden grid lg:grid-cols-[320px_1fr] h-[70vh] min-h-[520px]">
        {/* Conversation list */}
        <div className="border-r border-border flex flex-col">
          <div className="p-3 border-b border-border space-y-2 shrink-0">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="নাম বা ইমেইল খুঁজুন..."
                className="input-field pl-8 !py-2 text-sm"
              />
            </div>
            <div className="flex gap-1.5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setPage(1); }}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                    tab === t.id ? 'bg-primary text-white' : 'bg-primary-light/50 text-text-secondary hover:text-primary'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="grid place-items-center py-16"><Loader2 size={20} className="animate-spin text-primary/50" /></div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-16 text-text-secondary">
                <Inbox size={28} className="mx-auto text-primary/30 mb-2" />
                <p className="text-sm">কোনো কথোপকথন পাওয়া যায়নি</p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-3.5 border-b border-border hover:bg-primary-light/30 transition-colors ${
                    selectedId === c.id ? 'bg-primary-light/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">{c.user.name}</p>
                    {c.unreadCount > 0 && (
                      <span className="shrink-0 grid place-items-center h-5 min-w-5 px-1 rounded-full bg-primary text-white text-[10px] font-bold">{c.unreadCount}</span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary truncate mt-0.5">{c.lastMessage?.content ?? 'কোনো বার্তা নেই'}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {c.status === 'RESOLVED' && <span className="badge bg-success/10 text-success text-[10px]">সমাধান হয়েছে</span>}
                    <span className="text-[10px] text-text-secondary">{new Date(c.lastMessageAt).toLocaleDateString('bn-BD')}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {meta && (
            <div className="p-2 border-t border-border shrink-0">
              <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />
            </div>
          )}
        </div>

        {/* Thread */}
        <div className="flex flex-col min-w-0">
          {!selectedId ? (
            <div className="flex-1 grid place-items-center text-center text-text-secondary p-8">
              <div>
                <MessageCircle size={36} className="mx-auto text-primary/30 mb-2" />
                <p className="text-sm">উত্তর দিতে বাম পাশ থেকে একটি কথোপকথন নির্বাচন করুন</p>
              </div>
            </div>
          ) : threadLoading || !thread ? (
            <div className="flex-1 grid place-items-center"><Loader2 size={22} className="animate-spin text-primary/50" /></div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 p-3.5 border-b border-border shrink-0">
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{thread.conversation.user.name}</p>
                  <p className="text-xs text-text-secondary truncate">{thread.conversation.user.email}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={toggleResolve}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      thread.conversation.status === 'RESOLVED'
                        ? 'border-border text-text-secondary hover:border-primary hover:text-primary'
                        : 'border-success/30 text-success hover:bg-success/10'
                    }`}
                  >
                    <CheckCircle2 size={13} /> {thread.conversation.status === 'RESOLVED' ? 'পুনরায় চালু করুন' : 'সমাধান হয়েছে'}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(thread.conversation.id)}
                    className="grid place-items-center h-8 w-8 rounded-full hover:bg-error/10 text-text-secondary hover:text-error transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {thread.messages.length === 0 ? (
                  <div className="h-full grid place-items-center text-center text-text-secondary">
                    <p className="text-sm">এখনও কোনো বার্তা নেই</p>
                  </div>
                ) : (
                  thread.messages.map((m) => <AdminMessageBubble key={m.id} message={m} />)
                )}
              </div>

              <form onSubmit={submitReply} className="border-t border-border p-3 flex items-center gap-2.5 shrink-0">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="উত্তর লিখুন..."
                  className="input-field flex-1 !py-2.5 text-sm"
                />
                <button type="submit" disabled={!text.trim() || sendReply.isPending} className="btn-primary !rounded-full !p-3 disabled:opacity-50">
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm bg-surface rounded-3xl shadow-lift p-6 sm:p-8 animate-fade-in text-center">
            <p className="text-sm text-text-secondary mb-1">নিশ্চিত করুন</p>
            <p className="font-semibold mb-6">এই কথোপকথন ও সব বার্তা স্থায়ীভাবে মুছে ফেলতে চান?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-outline flex-1 justify-center">বাতিল</button>
              <button onClick={confirmDelete} disabled={deleteConversation.isPending} className="btn-primary flex-1 justify-center !bg-error hover:!bg-error/90 disabled:opacity-60">
                {deleteConversation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'মুছে ফেলুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminMessageBubble({ message }: { message: ChatMessage }) {
  const isMine = message.senderRole === 'ADMIN';
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-primary text-white' : 'bg-primary-light/50'}`}>
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div className={`mt-1 flex items-center gap-1 justify-end text-[11px] ${isMine ? 'text-white/70' : 'text-text-secondary'}`}>
          <span>{new Date(message.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
          {isMine && <AdminStatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}

function AdminStatusIcon({ status }: { status: ChatMessage['status'] }) {
  if (status === 'SENDING') return <Clock size={12} />;
  if (status === 'FAILED') return <RotateCw size={12} />;
  if (status === 'SEEN') return <CheckCheck size={12} className="text-blue-300" />;
  if (status === 'DELIVERED') return <CheckCheck size={12} />;
  return <Check size={12} />;
}
