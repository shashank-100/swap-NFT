
import { NextRequest, NextResponse } from 'next/server';
import { Connection,clusterApiUrl } from '@solana/web3.js';

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const HELIUS_API_KEY = process.env.HELIUS_API_KEY || ''
    const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}` || clusterApiUrl("mainnet-beta"), "confirmed");
    return NextResponse.json(connection);
  } catch (error) {
    return NextResponse.error();
  }
}