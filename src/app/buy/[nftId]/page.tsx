"use client"

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, VersionedTransaction } from "@solana/web3.js";
import { useState, useEffect, useMemo } from 'react';
import NFT from "@/components/NFT";
import BuyNFT from "@/components/BuyNFT";
import SimilarOnes from "@/components/SimilarNFTsOfCollection";
import { getListingPrice, getPriceInUserToken } from "@/app/lib/rate";
import { getSlug } from "@/app/lib/fetchNFTbyId";
import { Token } from '@/lib/types';
import { toast } from 'sonner';
require('@solana/wallet-adapter-react-ui/styles.css');

async function isBlockhashExpired(connection: Connection, lastValidBlockHeight: number) {
  let currentBlockHeight = await connection.getBlockHeight('finalized');
  return (currentBlockHeight > lastValidBlockHeight - 150);
}

export default function Page({ params }: { params: { nftId: string } }) {
  const wallet = useWallet();
  const [tokenList, setTokenList] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token>({
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    symbol: "USDC",
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
  });
  const [slug, setSlug] = useState<string>("");
  const [listingPrice, setListingPrice] = useState<number>(0);

  const { connection } = useConnection()

  const id = params.nftId;

  useEffect(() => {
    async function fetchNFTData() {
      try {
        const fetchedSlug = await getSlug(id) || '';
        setSlug(fetchedSlug);

        const fetchedListingPrice = await getListingPrice(id) || 0;
        console.log("Listing Price in SOL: ",fetchedListingPrice)
        console.log(selectedToken.address)
        const defaultPriceValue = (await getPriceInUserToken(
          fetchedListingPrice,
          selectedToken.address
        ))!;
        setListingPrice(defaultPriceValue);

      } catch (err) {
        console.error(err);
      }
    }
    fetchNFTData();
  }, [id, selectedToken]);

  useEffect(() => {
    const getTokens = async () => {
      const resp = await fetch("https://token.jup.ag/strict", {
        method: "GET",
        cache: "force-cache",
        next: { revalidate: 86400 },
      });
      const tokens = await resp.json();
      const tokenList = tokens.slice(0, 100).map((token: any) => ({
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        logoURI: token.logoURI,
      }));
      setTokenList(tokenList);
    };
    getTokens();
  }, []);

  console.log("Listing Price in user token: ",listingPrice)

  const handleBuyNFT = async () => {
    toast.info('Initiating Txn...', {
      id: 'transaction-init',
      duration: Infinity,
    });
    const priceInUserToken = listingPrice;
    
    try {
      const response = await fetch('/api/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerAddress: wallet.publicKey?.toBase58() || '',
          mint: id,
          priceInUserToken,
          token: selectedToken.address
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get transaction data');
      }

      const [swaptx, buynfttx] = data.transactions.map(
        (tx: string) => VersionedTransaction.deserialize(
          Buffer.from(tx, 'base64') as Uint8Array
        )
      );

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      toast.dismiss('transaction-init');
      toast.info('Processing Swap Transaction before the NFT Buying Txn...', {
        id: 'swap-transaction',
        duration: Infinity,
      });
      const signature1 = await wallet.sendTransaction(swaptx, connection, { minContextSlot });

      try {
        await connection.confirmTransaction(
          { blockhash, lastValidBlockHeight, signature: signature1 },
          "confirmed"
        );
        console.log("Swap transaction confirmed");
        toast.dismiss('swap-transaction');
        toast.info('Swap Successful. Proceeding to Buy NFT...', {
          id: 'swap-complete',
          duration: 2000,
        });

        const {
          context: { slot: newMinContextSlot },
          value: { blockhash: newBlockhash, lastValidBlockHeight: newLastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        

        const signature2 = await wallet.sendTransaction(buynfttx, connection, { minContextSlot: newMinContextSlot });
        console.log("NFT BUY TXN SIG: ",signature2)

        toast.info('Buying the NFT...', {
          id: 'nft-purchase',
          duration: Infinity,
        });

        await connection.confirmTransaction(
          { blockhash: newBlockhash, lastValidBlockHeight: newLastValidBlockHeight, signature: signature2 },
          "confirmed"
        );

        let hashExpired = false;
        let txSuccess = false;
        while (!hashExpired && !txSuccess) {
          const { value: status } = await connection.getSignatureStatus(signature2);
          if (status && ((status.confirmationStatus === 'confirmed' || status.confirmationStatus === 'finalized'))) {
            txSuccess = true;
            toast.dismiss('nft-purchase');
            toast('Transaction Confirmed', {
              id: 'transaction-success',
              action: {
                label: 'View on Solscan',
                onClick: () => { window.open(`https://solscan.io/tx/${signature2}`) },
              },
            });
            break;
          }
          hashExpired = await isBlockhashExpired(connection, lastValidBlockHeight);
          if (hashExpired) break;
          
          await new Promise(resolve => setTimeout(resolve, 2500));
        }
      } catch (error) {
          toast.dismiss('nft-purchase');
          toast.error('NFT Purchase Failed', {
            id: 'nft-purchase-error',
          });
          console.error("Transaction failed:", error);
      }
    } catch (err) {
        toast.dismiss('transaction-init');
        toast.dismiss('swap-transaction');
        toast.error('Transaction Failed', {
          id: 'transaction-error',
        });
        console.error(err);
    }
  };


  return (
    <div className="container mx-auto p-4 my-8">
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/2">
        <NFT id={id}>
          <BuyNFT
            listingPrice={listingPrice}
            selectedToken={selectedToken}
            tokenList={tokenList}
            onTokenSelect={(token) => setSelectedToken(token)}
            onBuy={handleBuyNFT}
            isWalletConnected={!!wallet.publicKey}
            id={id}
          />
        </NFT>
      </div>
      <div className="w-full lg:w-1/2">
        <SimilarOnes id={id} publicKey={wallet.publicKey} />
      </div>
    </div>
  </div>
  );
}