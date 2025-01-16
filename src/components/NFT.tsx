"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useMemo } from "react";
import NFTNotFound from "./NFTNotFound";
import { NFTMetadata } from "@/lib/types";
import useSWR from "swr";
import { motion } from "framer-motion";

export const dynamic = 'force-static';

export function NFTComponent({ id, children }: { id: string; children?: React.ReactNode }) {
  const fetcher = (url: string) => fetch(url).then(res => res.json());

  const { data: nftMeta, error: nftError, isLoading: isNFTLoading } = useSWR<NFTMetadata>(`/api/getMetadataByMint?id=${id}`, fetcher);
  
  const { data: listings, error: listingError, isLoading: isListingLoading } = useSWR(() => `/api/getListingById?id=${id}`, fetcher);

  const isLoading = isNFTLoading || isListingLoading;
  const isValidNFT = !nftError && nftMeta !== undefined;
  const isListed = listings ? listings.length > 0 : true;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isValidNFT || !isListed) {
    return <NFTNotFound />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="overflow-hidden bg-white shadow-xl rounded-2xl">
        {!nftMeta?.imageuri ? (
          <Skeleton className="w-full h-[300px] rounded-t-2xl"/>
        ) : (
          <img src={nftMeta.imageuri || "/placeholder.svg"} width="400" height="300" alt={nftMeta.name} className="w-full h-[300px] object-cover rounded-t-2xl" />
        )}
        <CardContent className="p-6">
          <div className="space-y-4">
            {!nftMeta?.name ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <CardTitle className="text-2xl font-bold">{nftMeta.name}</CardTitle>
            )}
            {!nftMeta?.description ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <p className="text-gray-600">{nftMeta.description}</p>
            )}
          </div>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="overflow-hidden bg-white shadow-xl rounded-2xl">
        <Skeleton className="w-full h-[300px] rounded-t-2xl"/>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function NFT({ id, children }: { id: string; children?: React.ReactNode }) {
  return useMemo(() => 
    <NFTComponent id={id}>
      {children}
    </NFTComponent>, [id, children]);
}