import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

// try {
//   redis = new Redis({
//     url: 'https://viable-puma-57434.upstash.io',
//     token: process.env.REDIS_SECRET || ''
//     // port: 6379,
//     // maxRetriesPerRequest: 1,
//     // retryStrategy: () => null, // Disable retries
//   });
// } catch (error) {
//   console.error('Failed to initialize Redis:', error);
// }

//UPDATE IT TO RESPOND TO CHANGES IN THE DB, IDK MAYBE COMPARE THE NEW CACHE WITH THE PREV ONE WE SHALL FIGURE IT OUT

// export async function GET(req: NextRequest, res: NextResponse) {
//   const cacheKey = 'nftList';
//   try {
//     let nftList;
//     let cacheExpirationTime = 200;
//     if (redis) {
//       const cachedResult = await redis.get(cacheKey);
//       if (cachedResult) {
//         nftList = cachedResult;
//         console.log("we are showing cached data here")
//       } else {
//         //get from db and store in cache
//         nftList = await prisma.nFT.findMany();
//         await redis.set(cacheKey, JSON.stringify(nftList), {ex: cacheExpirationTime});
//       }
//     } else {
//       // if redis isn't up we fetch directly from database
//       nftList = await prisma.nFT.findMany();
//     }

//     const response = NextResponse.json(nftList);
//     response.headers.set('Cache-Control', `s-maxage=${cacheExpirationTime}, stale-while-revalidate`);
//     return response;
//   } catch (error) {
//     const nftList = await prisma.nFT.findMany();
//     console.error('Error fetching NFT list:', error);
//     return NextResponse.json(nftList, { status: 500 });
//   }
// }

export async function GET(req: NextRequest, res: NextResponse){
  const nftList = await prisma.nFT.findMany();
  return NextResponse.json(nftList);
}