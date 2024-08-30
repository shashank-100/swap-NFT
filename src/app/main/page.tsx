// main app page
"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter, LedgerWalletAdapter } from "@solana/wallet-adapter-wallets";
import DisplayNFTs from "@/components/DisplayNFTs";
import { ConnectWalletButton } from "@/components/ConnectWalletButton"

require('@solana/wallet-adapter-react-ui/styles.css');

export default function MainPage(){
    const [nftUrl, setNftUrl] = useState('');
    const router = useRouter();
    const { toast } = useToast()

    const extractId = (input: string): string | null => {
        if (input.includes('tensor.trade/item/')) {
            const parts = input.split('/item/');
            return parts[1] ? parts[1].split('?')[0] : null;
        }

        if (input.includes('magiceden.io/item-details/')) {
            const parts = input.split('/item-details/');
            return parts[1] ? parts[1].split('?')[0] : null;
        }
        //check for base58 encoded id
        const nftIdRegex = /^[A-HJ-NP-Za-km-z1-9]*$/;
        if (nftIdRegex.test(input)) {
            return input;
        }

        return null;
    }


    const handleClick = (e : any) => {
        const nft_id = extractId(nftUrl);
        console.log(nft_id)
        
        if(nft_id){
            const endpoint = `/buy/${nft_id}`;
            router.push(endpoint);
        }
        else{
            toast({
                title: "Please enter a valid NFT Id/Tensor URL."
            })
        }
    }

    const handleBlink = (e :any) => {
        const nft_id = extractId(nftUrl);
        
        if(nft_id){
            const endpoint = `https://dial.to/?action=solana-action:http://localhost:3000/api/actions/swap/${nft_id}&cluster=mainnet`
            window.open(endpoint);
        }
        else{
            toast({
                title: "Please enter a valid NFT Id/Tensor URL."
            })
        }
    }

    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallet = useWallet()
    console.log(wallet.connected)
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),new LedgerWalletAdapter()
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    return(
        <>
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <ConnectWalletButton/>
                {/* <WalletMultiButton className="m-8"/> */}
                <div className="flex flex-col items-center my-8 mt-40">
                    <h1 className="font-extrabold rounded-sm text-2xl md:text-3xl lg:text-4xl mb-4">Find Any Listed NFT</h1>
                    <Input 
                    className="w-full max-w-[48rem] mb-4 mx-4 px-4 h-12" 
                    placeholder="Tensor/Magiceden URL or NFT Id"
                    spellCheck={false}
                    onChange={(e) => {setNftUrl(e.target.value)}} 
                    />
                    <div className="flex flex-row">
                    <Button type="submit" className="mx-2" onClick={handleClick}>Buy with any Token</Button>
                    <Button type="submit" className="mx-2 bg-blue-500 hover:bg-teal-700 text-white" onClick={handleBlink}>Turn into a Blink</Button>
                    </div>
                    <div className="mx-auto items-center mt-2 pt-32">
                        <h3 className="font-medium ml-6 text-1xl sm:text-2xl md:text-2xl lg:text-3xl m-2 tracking-[-0.07rem] opacity-80">Some NFTs from available collections</h3>
                        <DisplayNFTs/>
                    </div>
                </div>
                </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </>
    )
}