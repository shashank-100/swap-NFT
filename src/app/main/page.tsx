"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Search, Zap } from 'lucide-react';

require('@solana/wallet-adapter-react-ui/styles.css');

export default function MainPage(){
    const [nftUrl, setNftUrl] = useState('');
    const { toast } = useToast()

    const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://liquotic.vercel.app'
    : 'http://localhost:3000';

    const extractId = (input: string): string | null => {
        if (input.includes('tensor.trade/item/')) {
            const parts = input.split('/item/');
            return parts[1] ? parts[1].split('?')[0] : null;
        }

        if (input.includes('magiceden.io/item-details/')) {
            const parts = input.split('/item-details/');
            return parts[1] ? parts[1].split('?')[0] : null;
        }

        const nftIdRegex = /^[A-HJ-NP-Za-km-z1-9]*$/;
        if (nftIdRegex.test(input)) {
            return input;
        }

        return null;
    }

    const handleClick = (e : React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const nft_id = extractId(nftUrl);
        
        if(nft_id){
            window.open(`${baseUrl}/buy/${nft_id}`)
        }
        else{
            toast({
                title: "Please enter a valid NFT Id/Tensor URL.",
                variant: "destructive",
            })
        }
    }

    const handleBlink = (e : React.MouseEvent<HTMLButtonElement>) => {
        const nft_id = extractId(nftUrl);
        
        if(nft_id){
            const endpoint = `https://dial.to/?action=solana-action:http://liquotic.vercel.app/api/actions/swap/${nft_id}&cluster=mainnet`
            window.open(endpoint);
        }
        else{
            toast({
                title: "Please enter a valid NFT Id/Tensor URL.",
                variant: "destructive",
            })
        }
    }

    return(
        <div className="min-h-screen bg-gradient-to-br bg-black text-white px-4 py-8">
            <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        w-[60rem] h-[40rem] rounded-full 
                        bg-gradient-to-r from-blue-500/50 via-cyan-400/40 to-teal-300/30 
                        blur-[8rem] opacity-70 z--20"
            ></div>
            <div className="container mx-auto mt-32">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center my-16"
                >
                    <div className="text-center w-full">
                        <h1 className="text-5xl md:text-7xl font-extrabold glow-text tracking-tight mb-2">
                            Liquotic
                        </h1>
                        
                        <p className="text-xl md:text-2xl tracking-tighter font-mono font-semibold text-gray-400 max-w-2xl mx-auto mb-12">
                            Buy any listed NFT, with any token!
                        </p>
                    </div>
                    <div className="w-full max-w-2xl">
                        <div className="relative">
                            <Input 
                                className="w-full px-6 h-20 mb-8 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50 placeholder:text-lg rounded-full"
                                placeholder="NFT Mint Address, Magiceden or Tensor URL"
                                spellCheck={false}
                                onChange={(e) => {setNftUrl(e.target.value)}} 
                            />
                            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button 
                                type="submit" 
                                className="w-full h-12 sm:w-auto tracking-tight bg-pink-400 text-white text-xl font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:bg-pink-500 hover:bg-opacity-80"
                                onClick={handleClick}
                            >
                                Buy with Any Token
                            </Button>
                            <Button 
                                type="submit" 
                                className="w-full h-12 sm:w-auto tracking-tight bg-cyan-400 text-white text-xl font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:bg-cyan-500 hover:bg-opacity-80"
                                onClick={handleBlink}
                            >
                                <Zap className="mr-2 h-5 w-5" />
                                Turn into a Blink
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}