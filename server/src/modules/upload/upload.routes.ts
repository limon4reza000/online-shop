import { Router } from 'express';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';
import { uploadImage } from '../../config/cloudinary.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export const uploadRouter = Router();

// Accepts a single `image` field, stores it locally via multer, then
// mirrors it to Cloudinary when credentials are configured. The response
// always includes a usable URL either way.
uploadRouter.post('/', protect, authorize('ADMIN', 'MANAGER'), upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const remoteUrl = await uploadImage(req.file.path);
  const url = remoteUrl || `/uploads/${req.file.filename}`;

  sendSuccess(res, { url }, 'File uploaded', 201);
}));
