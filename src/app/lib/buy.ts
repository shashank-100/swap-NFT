"use server"

import axios from "axios";
import { Transaction, VersionedTransaction, PublicKey, Connection,TransactionInstruction,TransactionMessage, ComputeBudgetProgram, AddressLookupTableAccount, VersionedMessage } from "@solana/web3.js";
import fetch from 'cross-fetch';
import bs58 from 'bs58';

export async function Buy(buyerAddress: string, mint: string, priceInUserToken: number, token: string){
    const buyer = new PublicKey(buyerAddress);
    const HELIUS_API_KEY = process.env.HELIUS_API_KEY || ''
    const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, "confirmed");
    const bearerToken = process.env.MAGIC_EDEN_API_KEY || '';

    // 2 types of buy
    // 1. BID(MAKE AN OFFER) -bid/make offer instruction
    // 2. BUY NOW(IMMEDIATE) -market buy occurs at the last listing price(for which someone listed the nft)[SELLER ADDRESS REQUIRED]
    // FOR 2, MAKE SURE NFT IS ALREADY LISTED

    // first we execute the buy now, for which we need the seller address and ATA
    // GET https://api-mainnet.magiceden.dev/v2/tokens/{id}/activities

    let auctionHouseAddress, seller, price, sellerReferral, tokenATA, sellerExpiry, tokenData:any, decimals:number, amount;

    try {
        const getNFTListingData = await axios.get(`https://api-mainnet.magiceden.dev/v2/tokens/${mint}/listings`, {
            headers: {
                "Accept": "application/json"
            }
        });

        const listingData = getNFTListingData.data[0];

        auctionHouseAddress = listingData.auctionHouse || '';
        seller = listingData.seller || '';
        price = parseFloat(listingData.price) || 0;
        sellerReferral = listingData.sellerReferral || '';
        tokenATA = listingData.tokenAddress || '';
        sellerExpiry = parseInt(listingData.expiry) || 0;

        if (!auctionHouseAddress || !seller || !price || !tokenATA) {
            throw new Error("Missing critical NFT listing data");
        }

        tokenData = await connection.getParsedAccountInfo(new PublicKey(token));
        decimals = tokenData.value?.data?.parsed.info.decimals || 2;
        
        if (typeof priceInUserToken !== 'number' || isNaN(priceInUserToken)) {
            throw new Error("Invalid priceInUserToken");
        }

        amount = Math.floor(priceInUserToken * (10 ** decimals));

    } catch (error :any) {
        console.error("An error occurred:", error.message);
        if (error.response) {
            console.error("API response error:", error.response.data);
        }
        // Here you might want to set default values or handle the error in a way 
        // that makes sense for your application
        auctionHouseAddress = '';
        seller = '';
        price = 0;
        sellerReferral = '';
        tokenATA = '';
        sellerExpiry = 0;
        decimals = 2;
        amount = 0;
    }
      //-SOL+NFT component(MOST IMPORTANT PART)

      // add additional query params
      // check the if the versioned transaction is being serialized/deserialized properly
      // finally combine instructions into a single versioned transaction
    let getBuyIx, buy_now_signed_tx_data, serializedTxData, deserializedIns, sample_nft_buy_tx, lookup_tables;
    try {
        getBuyIx = await axios.get(`https://api-mainnet.magiceden.dev/v2/instructions/buy_now`, 
            {
                headers: {
                    "Authorization": `Bearer ${bearerToken}`,
                    "Accept": "application/json"
                },
                params: {
                  buyer: buyer.toString(),
                  seller: seller.toString(),
                  auctionHouseAddress: auctionHouseAddress,
                  tokenMint: mint,
                  tokenATA: tokenATA,
                  price: price,
                  sellerReferral: sellerReferral,
                  sellerExpiry: sellerExpiry,
                }
        });
        console.log("BUY INSTRUCTION: ", getBuyIx);

        buy_now_signed_tx_data = getBuyIx.data.v0.txSigned.data;
        serializedTxData = buy_now_signed_tx_data;

        try {
            deserializedIns = VersionedTransaction.deserialize(serializedTxData).message;
            sample_nft_buy_tx = new VersionedTransaction(deserializedIns);
        } catch (err) {
            console.error("Error deserializing transaction:", err);
            throw new Error("Failed to deserialize transaction data");
        }

        console.log("buy_now_ixn: ", deserializedIns);

        lookup_tables = sample_nft_buy_tx.message.addressTableLookups.map((acc) => acc.accountKey.toBase58());

    } catch (error: any) {
        console.error("An error occurred:", error.message);
        if (error.response) {
            console.error("API response error:", error.response.data);
        }
        throw error;
    }

    //ALTs(Address Lookup Tables)
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
            state: AddressLookupTableAccount.deserialize(accountInfo.data as Uint8Array),
          });
          acc.push(addressLookupTableAccount);
        }
    
        return acc;
      }, new Array<AddressLookupTableAccount>());

      
    };

    const quoteResponse = await (await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${token}&outputMint=So11111111111111111111111111111111111111112&amount=${amount}&slippageBps=100`)).json();
    const instructions = await (
        await fetch('https://quote-api.jup.ag/v6/swap-instructions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            quoteResponse,
            userPublicKey: buyer.toBase58(),
            wrapUnwrapSOL: false,
            dynamicComputeUnitLimit: false,
            prioritizationFeeLamports: 'auto'
          })
        })
      ).json();

       if (instructions.error) {
        throw new Error("Failed to get swap instructions: " + instructions.error);
      }

      const {
        tokenLedgerInstruction, // If you are using `useTokenLedger = true`.
        computeBudgetInstructions, // The necessary instructions to setup the compute budget.
        setupInstructions, // Setup missing ATA for the users.
        swapInstruction: swapInstructionPayload, // The actual swap instruction.
        cleanupInstruction, // Unwrap the SOL if `wrapAndUnwrapSol = true`.
        addressLookupTableAddresses, // The lookup table addresses that you can use if you are using versioned transaction.
      } = instructions;

      const swapInstruction = new TransactionInstruction({
        programId: new PublicKey(swapInstructionPayload.programId),
        keys: swapInstructionPayload.accounts.map((key :any) => ({
          pubkey: new PublicKey(key.pubkey),
            isSigner: key.isSigner,
            isWritable: key.isWritable,
          })),
        data: Buffer.from(swapInstructionPayload.data, "base64"),
      });

      console.log("SWAP INSTRUCTION", instructions.swapInstruction)
      
      const deserializeInstruction = (instruction: any) => {
        return new TransactionInstruction({
          programId: new PublicKey(instruction.programId),
          keys: instruction.accounts.map((key: any) => ({
            pubkey: new PublicKey(key.pubkey),
            isSigner: key.isSigner,
            isWritable: key.isWritable,
          })),
          data: Buffer.from(instruction.data, "base64"),
        });
      };
      const swap_ix = deserializeInstruction(swapInstructionPayload)
      console.log("Swap Ixn: ", swap_ix)
    
    const lookup_tables_nft = (await getAddressLookupTableAccounts(lookup_tables));
    const buy_now_ixn = TransactionMessage.decompile(sample_nft_buy_tx.message, {addressLookupTableAccounts: lookup_tables_nft}).instructions;

    const addressLookupTableAccounts: AddressLookupTableAccount[] = [];
    addressLookupTableAccounts.push(
      ...(await getAddressLookupTableAccounts(addressLookupTableAddresses))
    );
    console.log("ALTS: ", addressLookupTableAccounts);

    const tx1_instructions = [...computeBudgetInstructions.map(deserializeInstruction),...setupInstructions.map(deserializeInstruction), swap_ix, deserializeInstruction(cleanupInstruction)]
    const newBlockhash1 = (await connection.getLatestBlockhash()).blockhash;
    const m1 = new TransactionMessage({
      payerKey: buyer,
      recentBlockhash: newBlockhash1,
      instructions: tx1_instructions,
      }).compileToV0Message([...addressLookupTableAccounts]);

      const tx2_instructions = [...buy_now_ixn ];
      const newBlockhash2 = (await connection.getLatestBlockhash()).blockhash;
      const m2 = new TransactionMessage({
        payerKey: buyer,
        recentBlockhash: newBlockhash2,
        instructions: tx2_instructions, //also add the buy_now NFT instruction
        }).compileToV0Message([...lookup_tables_nft]);

    const finalTX1 = new VersionedTransaction(m1);
    // const rpcResponse = await connection.simulateTransaction(tx1, {
    //   replaceRecentBlockhash: true,
    //   sigVerify: false,
    // });
    // const unitsConsumed = rpcResponse.value.unitsConsumed;

    const finalTX2 = new VersionedTransaction(m2);
    return [finalTX1.serialize(), finalTX2.serialize()];
}