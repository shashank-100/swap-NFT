import { Decimal } from "@prisma/client/runtime/library"

export type Collection = {
    symbol: string
}

export type NFT = {
    id: string, 
    slug: string, 
    price: Decimal,
    name: string,
    description: string | null,
    imageuri: string, 
    listed: boolean
}

export type NFTMetadata = {
    name: string,
    description: string,
    imageuri: string
  }
  
export type Token = {
    address: string,
    decimals: number,
    symbol: string,
    logoURI: string
  }

export type Listing = {
  id: string,
  price: Decimal;
  symbol: string
}