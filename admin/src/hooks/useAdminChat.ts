import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useSocket } from './useSocket';
import type { ChatConversationSummary, ChatConversation, ChatMessage } from '@/lib/types';

interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface AdminChatFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: 'all' | 'unread' | 'resolved';
}

/** Toasts + invalidates the conversation list whenever a new customer message arrives anywhere. */
export function useAdminChatSocket() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
    const handler = ({ message }: { conversationId: string; message: ChatMessage }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat', 'conversations'] });
      if (message.senderRole === 'CUSTOMER') {
        showToast(`নতুন বার্তা: ${message.content.slice(0, 60)}`, 'info');
      }
    };
    socket.on('chat:new-message', handler);
    return () => { socket.off('chat:new-message', handler); };
  }, [socket, queryClient, showToast]);
}

export function useAdminConversations(filters: AdminChatFilters = {}) {
  useAdminChatSocket();

  const query = useQuery({
    queryKey: ['admin-chat', 'conversations', filters],
    queryFn: async () => {
      const res = await api.get<Paginated<ChatConversationSummary>>('/admin/chat/conversations', { params: filters });
      return res.data;
    },
    placeholderData: (prev) => prev,
  });

  return { ...query, data: query.data?.data ?? [], meta: query.data?.meta };
}

interface ConversationThread {
  conversation: ChatConversation & { user: { id: string; name: string; email: string; avatarUrl: string | null } };
  messages: ChatMessage[];
}

export function useAdminConversationMessages(conversationId: string | null) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-chat', 'thread', conversationId],
    queryFn: async () => {
      const res = await api.get<{ data: ConversationThread }>(`/admin/chat/conversations/${conversationId}/messages`);
      return res.data.data;
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!conversationId) return;
    const onNewMessage = ({ conversationId: cid, message }: { conversationId: string; message: ChatMessage }) => {
      if (cid !== conversationId) return;
      queryClient.setQueryData<ConversationThread | undefined>(['admin-chat', 'thread', conversationId], (prev) =>
        prev && !prev.messages.some((m) => m.id === message.id) ? { ...prev, messages: [...prev.messages, message] } : prev
      );
    };
    socket.on('chat:new-message', onNewMessage);
    return () => { socket.off('chat:new-message', onNewMessage); };
  }, [socket, conversationId, queryClient]);

  return query;
}

export function useSendAdminReply(conversationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api.post<{ data: ChatMessage }>(`/admin/chat/conversations/${conversationId}/messages`, { content }).then((r) => r.data.data),
    onSuccess: (message) => {
      queryClient.setQueryData<ConversationThread | undefined>(['admin-chat', 'thread', conversationId], (prev) =>
        prev && !prev.messages.some((m) => m.id === message.id) ? { ...prev, messages: [...prev.messages, message] } : prev
      );
      queryClient.invalidateQueries({ queryKey: ['admin-chat', 'conversations'] });
    },
  });
}

export function useUpdateConversationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'OPEN' | 'RESOLVED' }) =>
      api.patch(`/admin/chat/conversations/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-chat'] }),
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/chat/conversations/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-chat'] }),
  });
}
