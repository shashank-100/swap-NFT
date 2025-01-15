"use client"


import { getListingByID, getMetadataByMint } from "@/app/lib/fetchNFTbyId";
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import NFTNotFound from "./NFTNotFound";
import { NFTMetadata } from "@/lib/types";

export const dynamic = 'force-static';

export function NFTComponent({ id, children }: { id: string, children?: React.ReactNode }) {
  const [nftMeta, setNftMeta] = useState<NFTMetadata>({
    name: "",
    description: "",
    imageuri: "",
  });
  const [isValidNFT, setIsValidNFT] = useState(true);
  const [isListed, setIsListed] = useState(true);



  const fetchNFTMetadata = useCallback(async () => {
    const meta = await getMetadataByMint(id);
    if (meta) {
      setNftMeta(meta);
    }
    setTimeout(async () => {
      try{
        const response = await getListingByID(id);
              const listings = response;
              if(listings.length == 0){
                setIsListed(false);
              }
              else{
              setIsListed(true);
              }
        }
        catch(err){
          setIsValidNFT(false);
          console.log(err);
        }
    
    }, 1)
  }, [id]);

  useEffect(() => {
    fetchNFTMetadata();
  }, [fetchNFTMetadata]);

  return (
    <>
      {(isValidNFT && isListed) ? (
        <div className="relative w-full max-w-sm mx-auto">
          <div className="absolute inset-0 rounded-lg glow-effect"></div>
          <Card className="relative w-full max-w-sm mx-auto justify-center bg-card z-10 shadow-lg shadow-black/20">
            {!nftMeta.imageuri ? (
              <Skeleton className="w-full h-[300px] aspect-[400/300] object-cover rounded-t-lg"/>
            ) : (
              <img src={nftMeta.imageuri} width="400" height="300" alt={nftMeta.name} className="w-full rounded-t-lg" style={{ aspectRatio: "400/300", objectFit: "cover" }} />
            )}
            <CardContent className="p-6">
              <div>
                {!nftMeta.name ? (
                  <CardTitle>
                    <Skeleton className="my-2 h-6 w-[150px]" />
                  </CardTitle>
                ) : (
                  <CardTitle>{nftMeta.name}</CardTitle>
                )}
                {!nftMeta.description ? (
                  <Skeleton className="my-2 h-6 w-[250px]" />
                ) : (
                  <p className="text-muted-foreground">{nftMeta.description}</p>
                )}
              </div>
              {children}
            </CardContent>
          </Card>
        </div>
      ) : (
        <NFTNotFound />
      )}
    </>
  )
}

export default function NFT({ id, children }: { id: string, children?: React.ReactNode }) {
  return useMemo(() => 
    <NFTComponent id={id}>
      {children}
    </NFTComponent>, [id, children]);
}
