import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

if (env.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

/**
 * Uploads a local file buffer to Cloudinary and returns its secure URL.
 * Falls back to `null` (caller should keep the local /uploads path instead)
 * when Cloudinary credentials haven't been configured yet — see .env.example.
 */
export async function uploadImage(filePath: string, folder = 'nityaghor'): Promise<string | null> {
  if (!env.cloudinary.enabled) {
    console.warn('[cloudinary] Not configured — skipping remote upload, using local file path instead.');
    return null;
  }
  const result = await cloudinary.uploader.upload(filePath, { folder });
  return result.secure_url;
}

export { cloudinary };
