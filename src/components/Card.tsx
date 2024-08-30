"use client"

import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { trunkDescription } from "@/lib/helper";

export function NFTCard({id, name, imageuri, description, publicKey, priceInGivenToken, token, hasButton} : {id : string, name: string, imageuri: string, description: string, publicKey: PublicKey | null, priceInGivenToken?: number, token?: string, hasButton?: boolean}){
    const router = useRouter()
    if(typeof hasButton === 'undefined'){
      hasButton = true;
    }
      return(
          <Card className="w-64 max-h-[40rem] m-4 hover:cursor-pointer" onClick={() => {router.push(`/buy/${id}`)}}>
            {imageuri ? (
              <img
              src={`${imageuri}`}
              alt="NFT Image"
              className="rounded-t-lg object-cover w-full aspect-[4/3]"
              width="400"
              height="300"
            />
            ) : (<Skeleton className="w-full rounded-t-lg object-cover aspect-[4/3]"/>)}
        
        <CardContent className="p-6 space-y-2">
          {name ? (
            <CardTitle className="text-xl font-semibold">
            {name}
            </CardTitle>
          ) : (<Skeleton className="h-6 w-10"/>)}
          {description ? (
          <CardDescription className="text-muted-foreground">
            {trunkDescription(description)}
          </CardDescription>
          ) : (<Skeleton className="h-6 w-52 mb-4"/>)}
          {hasButton && (
              (!publicKey) ? (
                <Button disabled className="w-[12rem] mx-auto">
                  Connect Wallet
                </Button>
              ) : (
                <Button onClick={() => {router.push(`/buy/${id}`)}} className="w-[12rem] mx-auto">
                  Buy Now
                </Button>
              )
            )}
        </CardContent>
      </Card>
      )
    }