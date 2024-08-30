// In a new file, e.g., hooks/useNFTMetadata.ts
import { useQuery } from 'react-query';
import { getMetadataByMint } from '@/app/lib/fetchNFTbyId';

export function useNFTMetadata(id: string) {
  return useQuery(['nftMetadata', id], () => getMetadataByMint(id), {
    staleTime: 5 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  });
}