import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

/** Uploads a single image file to the backend (Cloudinary if configured, else local /uploads). */
export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('image', file);
      const res = await api.post<{ data: { url: string } }>('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data.url;
    },
  });
}
