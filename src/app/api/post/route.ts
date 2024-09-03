import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'

// POST /api/post
export async function POST(req: NextRequest) {
      const body = await req.json();
      const { id, slug, price, name, description, imageuri, listed } = body;
  
      const result = await prisma.nFT.create({
        data: {
          id: id,
          slug: slug,
          price: price,
          name: name,
          description: description,
          imageuri: imageuri,
          listed: listed,
        },
      });
      return NextResponse.json(result);
  }