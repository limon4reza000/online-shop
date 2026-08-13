import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Check, CheckCheck, Clock, RotateCw, WifiOff, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageLoader } from '@/components/ui/PageLoader';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { useMyChat } from '@/hooks/useChat';
import type { ChatMessage } from '@/lib/types';

export default function Chat() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) return <PageLoader />;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="p-4">
          <button
            onClick={() => navigate(-1)}
            aria-label="পেছনে যান"
            className="grid place-items-center h-9 w-9 rounded-full bg-white shadow-soft hover:bg-primary-light text-text-primary transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
        <div className="flex-1 grid place-items-center px-4 pb-20">
          <div className="text-center max-w-sm">
            <Logo variant="dark" size={72} />
            <h1 className="mt-6 text-2xl font-bold">নিত্যঘরের সাথে চ্যাট করুন</h1>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              আমাদের সাপোর্ট টিমের সাথে চ্যাট শুরু করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে সাইন ইন করুন।
            </p>
            <button
              onClick={() => navigate('/login', { state: { from: '/chat' } })}
              className="btn-primary w-full mt-6 justify-center"
            >
              সাইন ইন করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ChatWindow />;
}

function ChatWindow() {
  const { conversation, messages, isLoading, socketConnected, sendMessage, isSending } = useMyChat();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    sendMessage(value);
    setText('');
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] bg-bg">
      <PageHeader title="সাপোর্ট চ্যাট" crumbs={[{ label: 'চ্যাট' }]} showBack />

      {!socketConnected && (
        <div className="bg-warning/10 text-warning text-xs font-medium text-center py-1.5 flex items-center justify-center gap-1.5 shrink-0">
          <WifiOff size={13} /> সংযোগ পুনঃস্থাপন করা হচ্ছে…
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto container-app py-6 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-12 max-w-[70%] rounded-2xl skeleton ${i % 2 ? 'ml-auto' : ''}`} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full grid place-items-center text-center py-20">
            <div>
              <MessageCircle size={40} className="mx-auto text-primary/30" />
              <p className="mt-3 text-sm text-text-secondary">এখনও কোনো বার্তা নেই — আমাদের একটি হ্যালো বলুন!</p>
            </div>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      {conversation?.status === 'RESOLVED' && (
        <p className="text-center text-xs text-text-secondary bg-white border-t border-border py-2">
          এই কথোপকথনটি সমাধান হয়ে গেছে — নতুন বার্তা পাঠালে এটি আবার চালু হবে।
        </p>
      )}

      <form onSubmit={submit} className="sticky bottom-0 border-t border-border bg-white p-3 sm:p-4 flex items-center gap-2.5 shrink-0">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="আপনার বার্তা লিখুন…"
          className="input-field flex-1"
        />
        <button type="submit" disabled={!text.trim() || isSending} className="btn-primary !rounded-full !p-3.5 disabled:opacity-50">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isMine = message.senderRole === 'CUSTOMER';
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-primary text-white' : 'bg-white border border-border'}`}>
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div className={`mt-1 flex items-center gap-1 justify-end text-[11px] ${isMine ? 'text-white/70' : 'text-text-secondary'}`}>
          <span>{new Date(message.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
          {isMine && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: ChatMessage['status'] }) {
  if (status === 'SENDING') return <Clock size={12} />;
  if (status === 'FAILED') return <RotateCw size={12} />;
  if (status === 'SEEN') return <CheckCheck size={12} className="text-blue-300" />;
  if (status === 'DELIVERED') return <CheckCheck size={12} />;
  return <Check size={12} />;
}
