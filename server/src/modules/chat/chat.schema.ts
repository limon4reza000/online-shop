import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  attachmentUrl: z.string().url().nullable().optional(),
});

export const listConversationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  filter: z.enum(['all', 'unread', 'resolved']).default('all'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'RESOLVED']),
});
