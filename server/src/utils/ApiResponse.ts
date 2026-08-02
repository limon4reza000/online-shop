import type { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  meta: { page: number; pageSize: number; total: number }
) {
  return res.status(200).json({
    success: true,
    data: items,
    meta: { ...meta, totalPages: Math.max(1, Math.ceil(meta.total / meta.pageSize)) },
  });
}
