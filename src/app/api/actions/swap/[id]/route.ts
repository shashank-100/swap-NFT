// blink for nft->x-token swap
import { Buy } from "@/app/lib/buy";
import { getMetadataByMint } from "@/app/lib/fetchNFTbyId";
import { getPriceInUserToken } from "@/app/lib/rate";
import {
    ActionPostResponse,
    ACTIONS_CORS_HEADERS,
    createPostResponse,
    ActionGetResponse,
    ActionPostRequest,
  } from "@solana/actions";
  import {
    clusterApiUrl,
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionMessage,
    VersionedTransaction,
    AddressLookupTableAccount,
    VersionedMessage
  } from "@solana/web3.js";
  import axios from "axios";

  async function getVersionedSwapAndBuyTransaction(buyerAccount: PublicKey, nftId: string, tokenMint:string){
    let priceInUserToken: number;
      const getNFTListingData = await axios.get(`https://api-mainnet.magiceden.dev/v2/tokens/${nftId}/listings`, {
        headers: {
            "Accept": "application/json"
        }
        });
        const listingData = getNFTListingData.data[0];
        const price: number = parseFloat(listingData.price) || 0;
        priceInUserToken = await getPriceInUserToken(price, tokenMint || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') || 0;

      const [txBuffer1, txBuffer2] = await Buy(buyerAccount.toString(), nftId, priceInUserToken, tokenMint || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

      const [tx1, tx2] = [VersionedTransaction.deserialize(txBuffer1), VersionedTransaction.deserialize(txBuffer2)]
      return [tx1, tx2]
  }

  let nftId: string;
  export const GET = async(req: Request,
    { params }: { params: { id: string } }
  )  => {
    try {
        
      const requestUrl = new URL(req.url);
      nftId = params.id;

      const {name, description, imageuri} = (await getMetadataByMint(nftId))!;

      const baseHref = new URL(
        `/api/actions/swap/${nftId}`,
        requestUrl.origin
      ).toString();

      const getTokens = async(): Promise<{label: string, value: string}[]|undefined> => {
        try{
        const resp = await fetch("https://token.jup.ag/strict", {
          method: "GET",
          cache: "force-cache",
          next: {revalidate: 86400},
        })
        const tokens = await resp.json();
        const tokenList = tokens.slice(0, 100).map((token: any) => ({
          label: token.symbol,
          value: token.address
        }));
        return tokenList;
      }
      catch(err){
        console.error(err);
      }
      }

      const tokenList = (await getTokens())!;

      const payload: ActionGetResponse = {
        title: name,
        type: "action",
        icon: new URL(`${imageuri}`, requestUrl.origin).toString(),
        description: description,
        label: "",
        links: {
          actions: [
            {
              label: `Buy with Token`,
              href: `${baseHref}?token={tokenMint}`,
              parameters: [
                {
                  type: "select",
                  name: "tokenMint",
                  label: "Select Token",
                  options: tokenList,
                }
              ]
            }
          ],
        },
      };
  
      return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      });
    } catch (err) {
      console.log(err);
      let message = "An unknown error occurred";
      if (typeof err == "string") message = err;
      return new Response(JSON.stringify(message), {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }
  };

  export const OPTIONS = async (req: Request) => {
    return new Response(null, {
      status: 204,
      headers: ACTIONS_CORS_HEADERS,
    });
  };

  export const POST = async (req: Request) => {
    try {
      const requestUrl = new URL(req.url);
      const { tokenMint } = validatedQueryParams(requestUrl); //decoding query params

      const body: ActionPostRequest = await req.json(); //the POST request body
      let buyerAccount: PublicKey;
      try {
        buyerAccount = new PublicKey(body.account);
        console.log("buyer account: ", buyerAccount)
      } catch (err) {
        return new Response(JSON.stringify('Invalid "account" provided'), {
          status: 400,
          headers: ACTIONS_CORS_HEADERS,
        });
      }
      const connection = new Connection(
        `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY || ''}` || clusterApiUrl("mainnet-beta"), "confirmed"
      );

      const [tx1, tx2] = await getVersionedSwapAndBuyTransaction(buyerAccount, nftId, tokenMint || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

      const getAddressLookupTableAccounts = async (
        keys: string[]
      ): Promise<AddressLookupTableAccount[]> => {
        const addressLookupTableAccountInfos =
          await connection.getMultipleAccountsInfo(
            keys.map((key) => new PublicKey(key))
          );
      
        return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
          const addressLookupTableAddress = keys[index];
          if (accountInfo) {
            const addressLookupTableAccount = new AddressLookupTableAccount({
              key: new PublicKey(addressLookupTableAddress),
              state: AddressLookupTableAccount.deserialize(accountInfo.data),
            });
            acc.push(addressLookupTableAccount);
          }
      
          return acc;
        }, new Array<AddressLookupTableAccount>());
      }
      const lookup_tables = tx1.message.addressTableLookups.map((acc) => acc.accountKey.toBase58());
      const lookup_tables_tx1 = (await getAddressLookupTableAccounts(lookup_tables));

      console.log("ADDRESS LOOKUP TABLES: ", lookup_tables_tx1);
      const tx1_ixns = TransactionMessage.decompile(tx1.message, {addressLookupTableAccounts: lookup_tables_tx1}).instructions;

      console.log("TX1 IXNS: ", tx1_ixns)

      console.log(tx1)

      const swap_transaction_message = new TransactionMessage({
        payerKey: buyerAccount,
        recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
        instructions: [...tx1_ixns]
      }).compileToV0Message([...lookup_tables_tx1])
      const swap_transaction = new VersionedTransaction(swap_transaction_message)
      
      const payload: ActionPostResponse = await createPostResponse({
        fields: {
          transaction: swap_transaction,
          message: `Swap Txn successful`,
        },
      }); 

    //   let payload2: ActionPostResponse|null = null;
    //   if(payload){
    //   payload2 = await createPostResponse({
    //     fields: {
    //       transaction: tx2,
    //       message: `Buy Txn successful`,
    //     },
    //   }); 
    // }
  
      return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      });
    } catch (err) {
        console.log(err);
        let message = "An unknown error occurred";
        if (typeof err == "string") message = err;
        return new Response(JSON.stringify(message), {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
        });
    }
  };

  function validatedQueryParams(requestUrl: URL) {
    let tokenMint;
    try {
      if (requestUrl.searchParams.get("token")) {
        tokenMint = requestUrl.searchParams.get("token") || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      }
    } catch (err) {
      throw "Invalid input query parameters";
    }
  
    return { tokenMint };
  }