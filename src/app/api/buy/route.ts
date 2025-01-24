import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { Helius } from "helius-sdk";
import { 
  Transaction, 
  VersionedTransaction, 
  PublicKey, 
  Connection,
  TransactionInstruction,
  TransactionMessage, 
  AddressLookupTableAccount, 
  ComputeBudgetProgram
} from "@solana/web3.js";
import { unstable_noStore as noStore } from "next/cache";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    noStore();
    const { buyerAddress, mint, priceInUserToken, token } = await req.json();

    if (!buyerAddress || !mint || !priceInUserToken || !token) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const buyer = new PublicKey(buyerAddress);
    const endpoint = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
    const connection = new Connection(endpoint, "confirmed");
    const bearerToken = process.env.MAGIC_EDEN_API_KEY || '';
    const helius = new Helius(process.env.HELIUS_API_KEY || '');

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

    let auctionHouseAddress, seller, price, sellerReferral, tokenATA, sellerExpiry, tokenData: any, decimals: number, amount;

    try {
      const getNFTListingData = await axios.get(
        `https://api-mainnet.magiceden.dev/v2/tokens/${mint}/listings`,
        {
          headers: {
            "Accept": "application/json"
          }
        }
      );

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

    } catch (error: any) {
      return NextResponse.json(
        { error: "Failed to fetch NFT listing data: " + error.message },
        { status: 500 }
      );
    }

    const quoteResponse = await (
      await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${token}&outputMint=So11111111111111111111111111111111111111112&amount=${amount}&slippageBps=100`)
    ).json();

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
          dynamicComputeUnitLimit: true,
          dynamicSlippage: {"minBps": 50, "maxBps": 300},
          prioritizationFeeLamports: {
            priorityLevelWithMaxLamports: {
              maxLamports: 4000000,
              global: false,
              priorityLevel: "high"
            }
          }
        })
      })
    ).json();

    console.log("SWAP Instructions: ", instructions)

    if (instructions.error) {
      throw new Error("Failed to get swap instructions: " + instructions.error);
    }

    const {
      computeBudgetInstructions,
      setupInstructions,
      swapInstruction: swapInstructionPayload,
      cleanupInstruction,
      addressLookupTableAddresses,
    } = instructions;

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

    const swap_ix = deserializeInstruction(swapInstructionPayload);
    const addressLookupTableAccounts = await getAddressLookupTableAccounts(addressLookupTableAddresses);

    const tx1_instructions = [
      ...computeBudgetInstructions.map(deserializeInstruction),
      ...setupInstructions.map(deserializeInstruction),
      swap_ix,
      deserializeInstruction(cleanupInstruction)
    ];

    const newBlockhash1 = (await connection.getLatestBlockhash()).blockhash;
    const m1 = new TransactionMessage({
      payerKey: buyer,
      recentBlockhash: newBlockhash1,
      instructions: tx1_instructions,
    }).compileToV0Message([...addressLookupTableAccounts]);

    const finalTX1 = new VersionedTransaction(m1);


    let buy_now_signed_tx_data, serializedTxData, deserializedIns, sample_nft_buy_tx, lookup_tables;
    try {
      const getBuyIx = await axios.get(
        `https://api-mainnet.magiceden.dev/v2/instructions/buy_now`,
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
        }
      );

      buy_now_signed_tx_data = getBuyIx.data.v0.txSigned.data;
      serializedTxData = buy_now_signed_tx_data;

      try {
        deserializedIns = VersionedTransaction.deserialize(serializedTxData).message;
        sample_nft_buy_tx = new VersionedTransaction(deserializedIns);
      } catch (err) {
        throw new Error("Failed to deserialize transaction data");
      }

      lookup_tables = sample_nft_buy_tx.message.addressTableLookups.map((acc) => acc.accountKey.toBase58());

    } catch (error: any) {
      return NextResponse.json(
        { error: "Failed to get buy instructions: " + error.message },
        { status: 500 }
      );
    }

    const lookup_tables_nft = await getAddressLookupTableAccounts(lookup_tables);
    const buy_now_ixn = TransactionMessage.decompile(
      sample_nft_buy_tx.message,
      { addressLookupTableAccounts: lookup_tables_nft }
    ).instructions;
    console.log("BUY NOW IXN: ",buy_now_ixn)

    const tx2_instructions = [...buy_now_ixn];

    const newBlockhash2 = (await connection.getLatestBlockhash()).blockhash;
    const m2 = new TransactionMessage({
      payerKey: buyer,
      recentBlockhash: newBlockhash2,
      instructions: tx2_instructions,
    }).compileToV0Message([...lookup_tables_nft]);
    console.log("TXN2 MESSAGE: ",m2)

    const finalTX2 = new VersionedTransaction(m2);

    return NextResponse.json({
      transactions: [
        Buffer.from(finalTX1.serialize()).toString('base64'),
        Buffer.from(finalTX2.serialize()).toString('base64')
      ]
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}