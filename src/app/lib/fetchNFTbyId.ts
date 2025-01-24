"use server"

import axios, {AxiosError} from "axios";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { PublicKey, publicKey } from '@metaplex-foundation/umi';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { RpcInterface } from "@metaplex-foundation/umi";

type RpcInterfaceWithAsset = RpcInterface & {
  getAsset: (assetId: PublicKey<string>) => any
}

export const getMetadataByMint = async (id :string) : Promise<{name: string, description: string, imageuri: string}|undefined> => {
    try {
        const endpoint = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
        const umi = createUmi(endpoint).use(dasApi())
        const assetId = publicKey(id);
        const asset = await (umi.rpc as RpcInterfaceWithAsset).getAsset(assetId);

        const name = asset.content.metadata.name;
        const description = asset.content.metadata.description;
        const imageuri = asset.content.links.image;

        return {name, description, imageuri};
      } 
      catch (err) {
        if (err instanceof AxiosError) throw Error("Axios Error");
        else throw Error("Invalid")
      }
}

// WEEKEND - COMPLETE PORTFOLIO(UPTIL NOW)[ADD MISSING DEMOS, PORTFOLIO WEBSITE] + PICK A BOUNTY & GO ALL IN
// FROM MONDAY(NEXT WEEK AND AFTER) - COMPLETE WORK ON BELZIN + PICK UP ATLEAST 2 OSS CONTRIB BOUNTIES + START APPLYING FOR INTERNSHIPS

export async function getSlug(id: string): Promise<string|undefined>{
  try {
    const { data } = await axios.post(
      "https://api.tensor.so/graphql",
      {
        query: `query Mint($mint: String!, $bestSellNowOnly: Boolean) {
  mint(mint: $mint) {
    slug
    tswapOrders(bestSellNowOnly: $bestSellNowOnly) {
      address
      buyNowPrice
      sellNowPrice # Pass this to tswapSellNftTx!
      sellNowPriceNetFees
      feeInfos {
        bps
        kind
      }
      nftsForSale {
        onchainId
      }
    }
    tensorBids(bestSellNowOnly: $bestSellNowOnly) {
      bidder
      expiry
      price
    }
    hswapOrders {
      address
      assetReceiver
      baseSpotPrice
      boxes {
        mint {
          onchainId
        }
      }
      buyOrdersQuantity
      createdAt
      curveType
      delta
      feeBps
      fundsSolOrTokenBalance
      lastTransactedAt
      mathCounter
      pairType
    }
    activeListings {
      mint {
        onchainId
      }
      tx {
        sellerId
        grossAmount
        grossAmountUnit
      }
    }
  }
}`,
        variables: {
          mint: id,
          bestSellNowOnly: true,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-TENSOR-API-KEY": process.env.X_TENSOR_API_KEY || '',
        },
      }
    );
    const slug:string = data.data.mint.slug;
    return slug;
  }
  catch(err){
    if (err instanceof AxiosError) throw Error("Axios Error");
      else throw Error("Error occured while getting the slug");
  }
}