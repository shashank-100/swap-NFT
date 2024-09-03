import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
  // try {
    const result = await prisma.nFT.count();
    return NextResponse.json(result);
  // } catch (error) {
  //   return NextResponse.error();
  // }
}