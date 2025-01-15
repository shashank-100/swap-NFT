"use server"

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const getFloorPrice = async (slug: string): Promise<number|undefined> => {
  try{
    const endpoint = `https://api-mainnet.magiceden.dev/v2/collections/${slug}/stats`
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "accept": "application/json",
      },
    });
    const resp = await response.json();
    const floorPriceInSol = resp.floorPrice/LAMPORTS_PER_SOL;
    return floorPriceInSol;
  }
  catch{
    throw Error("Invalid Response")
  }
  }

  export const getListingPrice = async (id: string): Promise<number|undefined> =>{
    try{
      const endpoint = `https://api-mainnet.magiceden.dev/v2/tokens/${id}/listings`
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "accept": "application/json",
        },
      });
      const resp = await response.json();
      const priceOfListingInSol = resp[0].price;
      console.log("Current Listing Price Of NFT In SOL: ",priceOfListingInSol)
      return priceOfListingInSol;
    }
    catch(err){
      console.error(err)
      throw Error("Invalid Response")
    }
    }

    export const getPriceInUserToken = async (floorPrice: number, mint: string): Promise<number|undefined> => {
      try{
        const res = await fetch(`https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112&vsToken=${mint}`);
        const data = await res.json();
        const price = ((data.data["So11111111111111111111111111111111111111112"]?.price * floorPrice)) || 0;
        return price;
        }
        catch(err){
          console.log(err)
        }
      }

      export const getPriceInSol = async (amount: number, mint: string): Promise<number|undefined> => {
        try{
            const res = await fetch(`https://price.jup.ag/v6/price?ids=${mint}&vsToken=So11111111111111111111111111111111111111112`)
            const data = await res.json();
            const price = ((data.data[mint]?.price * amount)) || 0;
            return price;
          }
          catch(err){
            console.log(err)
          }
        }
