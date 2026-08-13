import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from './useSocket';
import type { ChatConversation, ChatMessage } from '@/lib/types';

interface ChatResponse {
  conversation: ChatConversation;
  messages: ChatMessage[];
}

const QUERY_KEY = ['chat', 'mine'];

/** Restores the current user's support conversation, keeps it live via socket.io,
 * and exposes an optimistic send with Sending → Sent/Delivered → Seen status tracking. */
export function useMyChat() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await api.get<{ data: ChatResponse }>('/chat');
      return res.data.data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const onNewMessage = ({ conversationId, message }: { conversationId: string; message: ChatMessage }) => {
      queryClient.setQueryData<ChatResponse | undefined>(QUERY_KEY, (prev) => {
        if (!prev || prev.conversation.id !== conversationId) return prev;
        if (prev.messages.some((m) => m.id === message.id)) return prev;
        return { ...prev, messages: [...prev.messages, message] };
      });
    };

    const onSeen = ({ conversationId, messageIds }: { conversationId: string; messageIds: string[] }) => {
      queryClient.setQueryData<ChatResponse | undefined>(QUERY_KEY, (prev) => {
        if (!prev || prev.conversation.id !== conversationId) return prev;
        return { ...prev, messages: prev.messages.map((m) => (messageIds.includes(m.id) ? { ...m, status: 'SEEN' } : m)) };
      });
    };

    const onStatus = ({ conversationId, status }: { conversationId: string; status: ChatConversation['status'] }) => {
      queryClient.setQueryData<ChatResponse | undefined>(QUERY_KEY, (prev) => {
        if (!prev || prev.conversation.id !== conversationId) return prev;
        return { ...prev, conversation: { ...prev.conversation, status } };
      });
    };

    socket.on('chat:new-message', onNewMessage);
    socket.on('chat:seen', onSeen);
    socket.on('chat:status', onStatus);
    return () => {
      socket.off('chat:new-message', onNewMessage);
      socket.off('chat:seen', onSeen);
      socket.off('chat:status', onStatus);
    };
  }, [socket, user, queryClient]);

  const sendMessage = useMutation({
    mutationFn: (content: string) => api.post<{ data: ChatMessage }>('/chat', { content }).then((r) => r.data.data),
    onMutate: (content) => {
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueryData<ChatResponse | undefined>(QUERY_KEY, (prev) => {
        if (!prev) return prev;
        const optimistic: ChatMessage = {
          id: tempId,
          conversationId: prev.conversation.id,
          senderRole: 'CUSTOMER',
          senderId: user?.id ?? '',
          content,
          attachmentUrl: null,
          status: 'SENDING',
          createdAt: new Date().toISOString(),
        };
        return { ...prev, messages: [...prev.messages, optimistic] };
      });
      return { tempId };
    },
    onSuccess: (message, _content, ctx) => {
      queryClient.setQueryData<ChatResponse | undefined>(QUERY_KEY, (prev) => {
        if (!prev) return prev;
        const withoutTemp = prev.messages.filter((m) => m.id !== ctx.tempId);
        if (withoutTemp.some((m) => m.id === message.id)) return { ...prev, messages: withoutTemp };
        return { ...prev, messages: [...withoutTemp, message] };
      });
    },
    onError: (_err, _content, ctx) => {
      queryClient.setQueryData<ChatResponse | undefined>(QUERY_KEY, (prev) =>
        prev ? { ...prev, messages: prev.messages.map((m) => (m.id === ctx?.tempId ? { ...m, status: 'FAILED' } : m)) } : prev
      );
    },
  });

  return {
    conversation: query.data?.conversation,
    messages: query.data?.messages ?? [],
    isLoading: query.isLoading,
    socketConnected: connected,
    sendMessage: (content: string) => sendMessage.mutate(content),
    isSending: sendMessage.isPending,
  };
}
