"use client"

import { ConnectionProvider, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { LedgerWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import NFT from "@/components/NFT"
import { useEffect, useMemo, useState } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import BuyNFT from "../../../components/BuyNFT"
import { ConnectWalletButton } from "@/components/ConnectWalletButton"
import SimilarOnes from "@/components/SimilarNFTsOfCollection"
require('@solana/wallet-adapter-react-ui/styles.css');

// export const dynamic = 'force-static';

export default function Page({ params }: { params: { nftId: string } }){
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallet = useWallet()
    // const {connection} = useConnection();
    console.log(wallet.connected)
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),new LedgerWalletAdapter()
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    const id = params.nftId;
  
    return(
    <>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ConnectWalletButton/>
          <div className="container mx-auto p-2 my-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
              <NFT id={params.nftId}>
                <BuyNFT id={id}></BuyNFT>
              </NFT>
            </div>
            <div className="w-full md:w-1/2">
              <SimilarOnes id={id} publicKey={wallet.publicKey}/>
            </div>
          </div>
        </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
    </>
    )
}