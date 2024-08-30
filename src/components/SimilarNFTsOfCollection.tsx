"use client"

import { useEffect, useState } from "react";
import {  NFT } from "@/lib/types";
import { NFTCard } from "@/components/Card";
import { Decimal } from "@prisma/client/runtime/library";
import { PublicKey } from "@solana/web3.js";
import NFTSkeleton from "./NFTSkeleton";
import { getRelatedNFTs } from "@/app/lib/handle_nft_display";
import { ScrollArea } from "@/components/ui/scroll-area"

export default function SimilarOnes({id, publicKey}: {id: string, publicKey: PublicKey|null}){
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function moreCollectionNFTs(){
        setLoading(true)
        const nfts = await getRelatedNFTs(id);
        if(nfts){
          setNfts(nfts);
          setLoading(false);
        }
      }
      moreCollectionNFTs();
  }, [id])

  return (
    <div className="w-full max-w-3xl mx-auto bg-background rounded-lg shadow-lg overflow-hidden mt-10">
      <div className="p-6 space-y-6">
        <h2 className="font-medium tracking-tight text-center text-2xl md:text-3xl">
          Similar NFTs
        </h2>
        <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loading
              ? Array(8).fill(0).map((_, index) => <NFTSkeleton key={index} />)
              : nfts.map((nft) => (
                  <NFTCard
                    key={nft.id}
                    id={nft.id}
                    name={nft.name}
                    description={nft.description || ''}
                    imageuri={nft.imageuri}
                    publicKey={publicKey}
                    hasButton={false}
                  />
                ))
            }
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}