import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { emitToUser, emitToAdmins, isUserOnline, isAdminOnline } from '../../sockets/index.js';
import { sendMessageSchema, listConversationsQuerySchema, updateStatusSchema } from './chat.schema.js';

export const chatRouter = Router();
export const chatAdminRouter = Router();

async function getOrCreateConversation(userId: string) {
  return prisma.conversation.upsert({ where: { userId }, update: {}, create: { userId } });
}

// ---- Customer-facing (any logged-in user) ----

chatRouter.use(protect);

// GET /api/chat — restore the current user's own conversation + full history.
// Viewing marks any unread admin replies as seen.
chatRouter.get('/', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const conversation = await getOrCreateConversation(userId);
  const messages = await prisma.message.findMany({ where: { conversationId: conversation.id }, orderBy: { createdAt: 'asc' } });

  const unseenIds = messages.filter((m) => m.senderRole === 'ADMIN' && m.status !== 'SEEN').map((m) => m.id);
  if (unseenIds.length > 0) {
    await prisma.message.updateMany({ where: { id: { in: unseenIds } }, data: { status: 'SEEN' } });
    emitToAdmins('chat:seen', { conversationId: conversation.id, messageIds: unseenIds });
  }

  sendSuccess(res, {
    conversation,
    messages: messages.map((m) => (unseenIds.includes(m.id) ? { ...m, status: 'SEEN' as const } : m)),
  });
}));

// POST /api/chat — send a message as the customer.
chatRouter.post('/', validateBody(sendMessageSchema), asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { content, attachmentUrl } = req.body as { content: string; attachmentUrl?: string | null };
  const conversation = await getOrCreateConversation(userId);

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderRole: 'CUSTOMER',
      senderId: userId,
      content,
      attachmentUrl,
      status: isAdminOnline() ? 'DELIVERED' : 'SENT',
    },
  });
  await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date(), status: 'OPEN' } });

  emitToAdmins('chat:new-message', { conversationId: conversation.id, message });
  emitToUser(userId, 'chat:new-message', { conversationId: conversation.id, message });

  sendSuccess(res, message, 'Message sent', 201);
}));

// ---- Admin panel ----

const adminGuard = [protect, authorize('ADMIN', 'MANAGER')];
chatAdminRouter.use(...adminGuard);

// GET /api/admin/chat/conversations?page=&pageSize=&search=&filter=all|unread|resolved
chatAdminRouter.get('/conversations', asyncHandler(async (req, res) => {
  const query = listConversationsQuerySchema.parse(req.query);
  const where: Prisma.ConversationWhereInput = {};

  if (query.search) {
    where.user = { OR: [{ name: { contains: query.search } }, { email: { contains: query.search } }] };
  }
  if (query.filter === 'unread') {
    where.messages = { some: { senderRole: 'CUSTOMER', status: { not: 'SEEN' } } };
  } else if (query.filter === 'resolved') {
    where.status = 'RESOLVED';
  }

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { messages: { where: { senderRole: 'CUSTOMER', status: { not: 'SEEN' } } } } },
      },
      orderBy: { lastMessageAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.conversation.count({ where }),
  ]);

  const data = conversations.map((c) => ({
    ...c,
    lastMessage: c.messages[0] ?? null,
    unreadCount: c._count.messages,
    messages: undefined,
    _count: undefined,
  }));

  sendPaginated(res, data, { page: query.page, pageSize: query.pageSize, total });
}));

// GET /api/admin/chat/conversations/:id/messages — opening a thread marks customer messages seen.
chatAdminRouter.get('/conversations/:id/messages', asyncHandler(async (req, res) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  });
  if (!conversation) throw ApiError.notFound('Conversation not found');

  const messages = await prisma.message.findMany({ where: { conversationId: conversation.id }, orderBy: { createdAt: 'asc' } });

  const unseenIds = messages.filter((m) => m.senderRole === 'CUSTOMER' && m.status !== 'SEEN').map((m) => m.id);
  if (unseenIds.length > 0) {
    await prisma.message.updateMany({ where: { id: { in: unseenIds } }, data: { status: 'SEEN' } });
    emitToUser(conversation.userId, 'chat:seen', { conversationId: conversation.id, messageIds: unseenIds });
  }

  sendSuccess(res, {
    conversation,
    messages: messages.map((m) => (unseenIds.includes(m.id) ? { ...m, status: 'SEEN' as const } : m)),
  });
}));

// POST /api/admin/chat/conversations/:id/messages — admin reply.
chatAdminRouter.post('/conversations/:id/messages', validateBody(sendMessageSchema), asyncHandler(async (req, res) => {
  const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!conversation) throw ApiError.notFound('Conversation not found');

  const { content, attachmentUrl } = req.body as { content: string; attachmentUrl?: string | null };
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderRole: 'ADMIN',
      senderId: req.user!.id,
      content,
      attachmentUrl,
      status: isUserOnline(conversation.userId) ? 'DELIVERED' : 'SENT',
    },
  });
  await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } });

  emitToUser(conversation.userId, 'chat:new-message', { conversationId: conversation.id, message });
  emitToAdmins('chat:new-message', { conversationId: conversation.id, message });

  sendSuccess(res, message, 'Message sent', 201);
}));

// PATCH /api/admin/chat/conversations/:id/status — resolve or reopen.
chatAdminRouter.patch('/conversations/:id/status', validateBody(updateStatusSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Conversation not found');

  const { status } = req.body as { status: 'OPEN' | 'RESOLVED' };
  const conversation = await prisma.conversation.update({ where: { id: existing.id }, data: { status } });
  emitToUser(conversation.userId, 'chat:status', { conversationId: conversation.id, status });
  sendSuccess(res, conversation, 'Status updated');
}));

// DELETE /api/admin/chat/conversations/:id
chatAdminRouter.delete('/conversations/:id', authorize('ADMIN'), asyncHandler(async (req, res) => {
  const existing = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Conversation not found');

  await prisma.conversation.delete({ where: { id: existing.id } });
  sendSuccess(res, null, 'Conversation deleted');
}));
