"use client"

import { useEffect, useState } from "react";
import { NFT } from "@/lib/types";
import { NFTCard } from "@/components/Card";
import { PublicKey } from "@solana/web3.js";
import NFTSkeleton from "./NFTSkeleton";
import { getRelatedNFTs } from "@/app/lib/handleNFTDisplay";
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-10"
      >
        <div className="p-6 space-y-6">
          <h2 className="font-bold text-center text-3xl text-gray-800">
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
      </motion.div>
    );
}