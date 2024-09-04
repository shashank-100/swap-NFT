"use client"

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Buy } from "../app/lib/buy";
import { Connection, LAMPORTS_PER_SOL, Transaction, clusterApiUrl, VersionedTransaction } from "@solana/web3.js";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from './ui/skeleton';
import { Button } from "../components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectLabel, SelectGroup, SelectItem } from "@/components/ui/select"
import { Toaster, toast } from 'sonner'
import { useState, useEffect } from "react";
import { getFloorPrice, getListingPrice, getPriceInSol } from "@/app/lib/rate";
import { getSlug } from "@/app/lib/fetchNFTbyId";
import { getPriceInUserToken } from "@/app/lib/rate";
import { Token,NFTMetadata } from '@/lib/types';
require('@solana/wallet-adapter-react-ui/styles.css');
import "react-toastify/dist/ReactToastify.css";

async function isBlockhashExpired(connection: Connection, lastValidBlockHeight: number) {
  let currentBlockHeight = (await connection.getBlockHeight('finalized'));
  return (currentBlockHeight > lastValidBlockHeight - 150);
}

const useExternalConnection = (url :any) => {
  const [data, setData] = useState<Connection>(new Connection(clusterApiUrl("mainnet-beta"), "confirmed"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        const result:Connection = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);
  return { data, loading, error };
}


export default function BuyNFT({ id } : {id: string}){
    const [selectedToken, setSelectedToken] = useState<Token>({
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      decimals: 6,
      symbol: "USDC",
      logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
    });
    const [slug, setSlug] = useState<string>("");
    const [listingPrice, setListingPrice] = useState<number>(0);
    const [tokenList,setTokenList] = useState<Token[]>([])
    const [defaultPriceValue, setDefaultPriceValue] = useState<number>(0);
  
    // const res = await fetch('http://localhost:3000/api/fetchlist', {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' }
    // });
    // const list = (await res.json())
    const connection = new Connection(
      `https://mainnet.helius-rpc.com/?api-key=23e04ac8-5d92-4ea2-b5c6-f93d3314bf07`, "confirmed"
    );
    const { publicKey, sendTransaction } = useWallet();

    useEffect(() => {
      async function fetchNFTData() {
        try {
          const fetchedSlug = await getSlug(id) || '';
          setSlug(fetchedSlug);
  
          const fetchedListingPrice = await getListingPrice(id) || 0;
          const defaultPriceValue = (await getPriceInUserToken(
            fetchedListingPrice,
            selectedToken.address
          ))!;
          setListingPrice(defaultPriceValue);
          setDefaultPriceValue(defaultPriceValue);
  
        } catch (err) {
          console.error(err);
        }
      }
      fetchNFTData();
    }, [id, selectedToken]);
  
    console.log(publicKey);
  
    const handleSubmitOnMarketBuy = async (e: any) => {
      toast.info('Initiating Txn...', {
        duration: 7000,
        
      })
      const priceInUserToken = listingPrice;
      const token = selectedToken.address;
      const priceInSol = (await getPriceInSol(priceInUserToken, token)) || 0;
      try {
        const [swaptx_serialized, buynfttx_serialized] = await Buy(publicKey?.toBase58() || '', id, priceInUserToken, selectedToken.address);
        const [swaptx, buynfttx] = [VersionedTransaction.deserialize(swaptx_serialized),VersionedTransaction.deserialize(Buffer.from(buynfttx_serialized))]
        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        const signature1 = await sendTransaction(swaptx, connection, {minContextSlot})
        toast.info(
          'Waiting for the Swap to complete before Buying...'
        );
        try {
          await connection.confirmTransaction(
            { blockhash, lastValidBlockHeight, signature: signature1 },
            "confirmed"
          );
          console.log("Swap transaction confirmed");
        
          const {
            context: { slot: newMinContextSlot },
            value: { blockhash: newBlockhash, lastValidBlockHeight: newLastValidBlockHeight },
          } = await connection.getLatestBlockhashAndContext();
        
          const signature2 = await sendTransaction(buynfttx, connection, { minContextSlot: newMinContextSlot });
          console.log("NFT BUY TXN: ", signature2);

          toast.info("Buying the NFT...", {
            duration: 5000,
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
                  toast('Transaction Confirmed', {
                    action: {
                      label: 'View on Solscan',
                      onClick: () => {window.open(`https://solscan.io/tx/${signature2}`)},
                    },
                  })
                  break;
              }
              hashExpired = await isBlockhashExpired(connection, lastValidBlockHeight);
              if (hashExpired) {
                  break;
              }
              const sleep = (ms: number) => {
                return new Promise(resolve => setTimeout(resolve, ms));
              }
              // Check again after 2.5 sec
              await sleep(2500);
          }
        } catch (error) {
          console.error("Transaction failed:", error);
          toast.error('Transaction Failed!');
        }
      } catch (err) {
        toast.error('Transaction Failed!')
        console.error(err);
      }
    };

    useEffect(() => {
      const getTokens = async() => {
        const resp = await fetch("https://token.jup.ag/strict", {
          method: "GET",
          cache: "force-cache",
          next: {revalidate: 86400},
        })
        const tokens = await resp.json();
        console.log(tokens.slice(0,10));
        const tokenList = tokens.slice(0, 100).map((token: any) => ({
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          logoURI: token.logoURI,
        }));
        setTokenList(tokenList)
      }
      getTokens();
    }, [])

    return(
      <>
        <div className="bg-card rounded-lg py-6 w-[18rem] space-y-4 mx-auto">
                  <div className="space-y-2">
                  <Label htmlFor="amount">Listed At</Label>
                  <div className="flex items-center gap-2">
                    {(listingPrice) ? (
                      <Input
                      disabled
                      id="amount"
                      className="flex-1 font-semibold"
                      defaultValue={`${listingPrice}`}
                      value={`${listingPrice}`}
                    />
                    ) : ( 
                      <Skeleton className='flex-1 w-10 h-[2.5rem]'/> 
                    )}
                    <Button variant="outline" size="icon">
                      {selectedToken.logoURI ? <img src={`${selectedToken.logoURI}`} className="h-5 w-5 rounded-full" /> : (<Skeleton className='w-5 h-5'/>)}
                    </Button>
                  </div>
                </div>
                <div className="h-full">
                  <Label htmlFor="token">Token</Label>
                  <Select
                    defaultValue="USDC"
                    value={selectedToken.address}
                    onValueChange={(val) => {
                      const requiredToken = tokenList.find((token: Token) => token.address === val);
                      setSelectedToken({address: val, decimals: requiredToken?.decimals || 6, symbol: requiredToken?.symbol || 'USDC', logoURI: requiredToken?.logoURI || 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'})
                    }}
                  >
                    <SelectTrigger className="w-[18rem] text-black">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent className="text-black">
                      <SelectGroup>
                      <SelectLabel>Token</SelectLabel>
                        {tokenList.map((token: Token) => (
                          <SelectItem key={token.address} value={`${token.address}`} className="flex flex-row">
                          <div className="flex flex-row">
                          <img src={`${token.logoURI}`} alt="" width={24} height={24} className="rounded-full flex flex-row"/> 
                          <a className="mx-2 mt-0.5">{token.symbol}</a>
                          </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {(!publicKey) ? <Button disabled className="w-[18rem] mx-auto">Connect Wallet First</Button>:( 
                <>
                <Button className="w-[18rem] mx-auto" onClick={handleSubmitOnMarketBuy}>
                  Buy Now with {selectedToken.symbol}
                </Button>
                    <Button className="w-[18rem] mx-auto bg-sky-400 hover:bg-sky-700" onClick={() => {window.open(`https://dial.to/?action=solana-action:http://liquotic.vercel.app/api/actions/swap/${id}&cluster=mainnet`)}}>Unfurl as Blink</Button>         
                </>
                )
                }
              </div>
              <Toaster position="top-center" richColors/>
              </>
    );
}