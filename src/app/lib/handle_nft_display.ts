"use server"

import axios from "axios";
import { getMetadataByMint } from "@/app/lib/fetchNFTbyId";
import { Decimal } from "@prisma/client/runtime/library";
import { Collection, Listing, NFT } from "@/lib/types";
import { shuffle } from "@/lib/helper";

export async function getRelatedNFTs(id: string){
  try{
      const metadata = await axios.get(`https://api-mainnet.magiceden.dev/v2/tokens/${id}/activities`, {
        headers: {
            "Accept": "application/json"
        }
      })
      const collectionSymbol = metadata.data[0].collectionSymbol;
      const list = await getListingsOfCollection(collectionSymbol);
      let nfts = (await Promise.all(list.map(async ({ id, price, symbol }: { id: string, price: Decimal, symbol: string }) => {
        const meta = (await getMetadataByMint(id))!;
        return {
            id: id,
            slug: symbol,
            price: price,
            name: meta.name,
            description: meta.description,
            imageuri: meta.imageuri,
            listed: true
        };
      })));
      nfts = nfts.slice(0,nfts.length/3)
      return nfts;
  } catch(err){
    console.error(err)
    throw Error("No NFTs found of given collection!")
  }

}

export async function getCollections(): Promise<Collection[]>{
  try{
    const get_collections = await axios.get(`https://api-mainnet.magiceden.dev/v2/collections?limit=60`, {
        headers: {
            "Accept" : "application/json"
        }
    });
    const collections = get_collections.data.map((collection: any) => { return {symbol: collection.symbol || ''}});
    return collections;
  } catch(err){
      let default_collections = [{symbol : 'mad_lads'},{symbol : 'giga_buds'},{symbol : 'solana_monkey_business'},{symbol : 'mimany'},{symbol : 'rune_pkers'},{symbol : 'wifhoodies'},{symbol : 'claynosaurz'}];
      console.error(err);
      return default_collections;
  }
}

export async function getNFTSFromCollections(collections: Collection[]): Promise<NFT[]> {
  let arr: NFT[] = [];
  
  for (let collection of collections) {
      const nftsOfCollection = await getListingsOfCollection(collection.symbol);
      
      const nfts = await Promise.all(nftsOfCollection.map(async ({ id, price, symbol }: { id: string, price: Decimal, symbol: string }) => {
          const meta = (await getMetadataByMint(id))!;
          return {
              id: id,
              slug: symbol,
              price: price,
              name: meta.name,
              description: meta.description,
              imageuri: meta.imageuri,
              listed: true
          };
      }));
      
      arr.push(...nfts);
  }

  shuffle(arr);
  return arr.slice(0,Math.floor(arr.length/3));
}


export async function getListingsOfCollection(symbol: string): Promise<Listing[]>{
  try{
    const get_listings = await axios.get(`https://api-mainnet.magiceden.dev/v2/collections/${symbol}/listings`, {
        headers: {
            "Accept" : "application/json"
        }
    });

    const listings = get_listings.data
        .filter((nft: any) => nft.auctionHouse)
        .map((nft: any) => ({
          id: nft.tokenMint,
          price: nft.price,
          symbol,
        }));
    return listings;

    } catch(err){
      console.error(err);
      throw Error("unable to fetch listings of the given collection!")
    } 
}

export async function submitData(): Promise<void>{
    const collections = await getCollections();
    const nft_list = await getNFTSFromCollections(collections);
    for(let nft of nft_list){
        try {
            const body = nft;
            await fetch('http://localhost:3000/api/post', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            console.log("POST SUCCESS")
          } catch (error) {
            console.error(error);
          }
    }
   }

 export async function getFastNFTList() {
    try {
      const res = await fetch('http://localhost:3000/api/fetchlist', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const list = (await res.json())
      console.log("list is here")
      return list;
    } catch (error) {
      console.error(error);
      throw Error("Unable to fetch list from /api/fetchlist")
    }
  }

 export async function getRowCount() {
    try {
      const res = await fetch('http://localhost:3000/api/count', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const count = (await res.json())
      return count;
    } catch (error) {
      console.error(error);
    }
}
