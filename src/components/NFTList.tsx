"use client"

import { useEffect, useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { submitData, getFastNFTList, getRowCount } from "@/app/lib/handle_nft_display";
import useSWR from 'swr'
import { NFT } from "@/lib/types";
import NFTSkeleton from "./NFTSkeleton";
import Pagination from "./Pagination";
import { paginate } from "./Pagination";
import { NFTCard } from "./Card";
import { trunkDescription } from "@/lib/helper";


const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function NFTList({count} : {count?: number}){
    const [nftList, setNftList] = useState<NFT[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const onPageChange = (page: any) => {
      setCurrentPage(page);
    };
    const { publicKey } = useWallet()

    const { data, error, isLoading } = useSWR('/api/fetchlist', fetcher, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 180 * 1000
    })

    useEffect(() => {
        async function fetchNFTs() {
            const rowCount = await getRowCount();
            console.log("row count: ", rowCount)
            if (rowCount === 0) {
              await submitData();
            }
            const dbNFTs = await getFastNFTList();
            setNftList(dbNFTs);
        }

        if(!isLoading) {
          if (data && data.length>0) {
            setNftList(data);
          } else {
            fetchNFTs()
          }
      }
        
    }, [data, isLoading, error]);

    if(!count){
      count = nftList.length;
    }

    const paginatedPosts = paginate(nftList, currentPage, pageSize);

    return (
      <>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nftList.length === 0 ? (
              new Array(20).fill(0).map((_, index) => <NFTSkeleton key={index} />)
            ) : (
              paginatedPosts.map((nft: any) => (
                <NFTCard
                  publicKey={publicKey}
                  key={nft.id}
                  id={nft.id}
                  name={nft.name}
                  imageuri={nft.imageuri}
                  description={nft.description || ''}
                />
              ))
            )}
          </div>
          {nftList.length > 0 && (
            <div className="flex justify-center">
              <Pagination
                items={nftList.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      </>
    );
}