import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';

// Maps a broadcast `resource` to every react-query key root it can affect. 'products' hits both
// the plural list-query root and the singular detail/related-query root used by useProduct(s).
const RESOURCE_QUERY_KEYS: Record<string, string[]> = {
  products: ['products', 'product'],
  categories: ['categories'],
  brands: ['brands'],
  settings: ['settings'],
  popup: ['popup'],
  'search-placeholders': ['search-placeholders'],
  banners: ['banners'],
};

/**
 * Mounted once at the app root. Keeps the shared socket connection alive (for guests too)
 * and, whenever the backend broadcasts that an admin changed some CMS-managed resource,
 * invalidates just the matching react-query cache entries so every open tab refetches and
 * re-renders that slice of the UI automatically — no page reload, no polling.
 */
export function useContentSync() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const onContentUpdate = ({ resource }: { resource: string; at: number }) => {
      const roots = RESOURCE_QUERY_KEYS[resource];
      if (!roots) return;
      for (const root of roots) {
        queryClient.invalidateQueries({ queryKey: [root] });
      }
    };

    socket.on('content:update', onContentUpdate);
    return () => {
      socket.off('content:update', onContentUpdate);
    };
  }, [socket, queryClient]);
}
