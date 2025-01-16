"use client"

import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { trunkDescription } from "@/lib/helper";
import { motion } from "framer-motion";
import { Eye } from 'lucide-react';

export function NFTCard({id, name, imageuri, description, publicKey, priceInGivenToken, token, hasButton = true} : {id : string, name: string, imageuri: string, description: string, publicKey: PublicKey | null, priceInGivenToken?: number, token?: string, hasButton?: boolean}){
    const router = useRouter()

    return(
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-72"
        >
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out bg-white text-gray-800 border border-gray-200 rounded-xl">
                <div className="relative group">
                    {imageuri ? (
                        <img
                            src={`${imageuri}`}
                            alt={`NFT: ${name}`}
                            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
                            width="400"
                            height="400"
                        />
                    ) : (
                        <Skeleton className="w-full aspect-square"/>
                    )}
                    <div className="absolute inset-0 bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button 
                            variant="secondary"
                            size="sm"
                            className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/buy/${id}`);
                            }}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                        </Button>
                    </div>
                </div>
                
                <CardContent className="p-4 space-y-3">
                    {name ? (
                        <CardTitle className="text-lg font-bold truncate">
                            {name}
                        </CardTitle>
                    ) : (
                        <Skeleton className="h-6 w-3/4"/>
                    )}
                    {description ? (
                        <CardDescription className="text-sm text-gray-600 line-clamp-2">
                            {trunkDescription(description)}
                        </CardDescription>
                    ) : (
                        <Skeleton className="h-4 w-full"/>
                    )}
                    {hasButton && (
                        (!publicKey) ? (
                            <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                                Connect Wallet
                            </Button>
                        ) : (
                            <Button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/buy/${id}`);
                                }} 
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            >
                                Buy Now
                            </Button>
                        )
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}