"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useMemo } from "react";
import NFTNotFound from "./NFTNotFound";
import { NFTMetadata } from "@/lib/types";
import useSWR from "swr";

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
    <div className="relative w-full max-w-sm mx-auto">
      <div className="absolute inset-0 rounded-lg glow-effect"></div>
      <Card className="relative w-full max-w-sm mx-auto justify-center bg-card z-10 shadow-lg shadow-black/20">
        {!nftMeta?.imageuri ? (
          <Skeleton className="w-full h-[300px] aspect-[400/300] object-cover rounded-t-lg"/>
        ) : (
          <img src={nftMeta.imageuri || "/placeholder.svg"} width="400" height="300" alt={nftMeta.name} className="w-full rounded-t-lg" style={{ aspectRatio: "400/300", objectFit: "cover" }} />
        )}
        <CardContent className="p-6">
          <div>
            {!nftMeta?.name ? (
              <CardTitle>
                <Skeleton className="my-2 h-6 w-[150px]" />
              </CardTitle>
            ) : (
              <CardTitle>{nftMeta.name}</CardTitle>
            )}
            {!nftMeta?.description ? (
              <Skeleton className="my-2 h-6 w-[250px]" />
            ) : (
              <p className="text-muted-foreground">{nftMeta.description}</p>
            )}
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="absolute inset-0 rounded-lg glow-effect"></div>
      <Card className="relative w-full max-w-sm mx-auto justify-center bg-card z-10 shadow-lg shadow-black/20">
        <Skeleton className="w-full h-[300px] aspect-[400/300] object-cover rounded-t-lg"/>
        <CardContent className="p-6">
          <div>
            <CardTitle>
              <Skeleton className="my-2 h-6 w-[150px]" />
            </CardTitle>
            <Skeleton className="my-2 h-6 w-[250px]" />
          </div>
          <Skeleton className="my-2 h-10 w-full" />
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