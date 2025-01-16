import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

export async function GET(req: NextRequest, res: NextResponse){
  try{
  const nftList = await prisma.nFT.findMany();
  return NextResponse.json(nftList);
  } catch(error){
    return NextResponse.error()
  }
}