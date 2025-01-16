import { Decimal } from "@prisma/client/runtime/library"
import { RpcInterface } from "@metaplex-foundation/umi"
import { PublicKey } from "@metaplex-foundation/umi"

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

export type RpcInterfaceWithAsset = RpcInterface & {
  getAsset: (assetId: PublicKey<string>) => any
}
  
export type Token = {
    address: string,
    decimals: number,
    symbol: string,
    logoURI: string
}

export interface BuyNFTProps {
  listingPrice: number;
  selectedToken: Token;
  tokenList: Token[];
  onTokenSelect: (token: Token) => void;
  onBuy: () => void;
  isWalletConnected: boolean;
  id: string;
}

export type Listing = {
  id: string,
  price: Decimal;
  symbol: string
}