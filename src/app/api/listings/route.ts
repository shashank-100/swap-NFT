import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
    try {
        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }
        const response = await axios.get(`https://api-mainnet.magiceden.dev/v2/tokens/${id}/listings`, {
            headers: {
                "Accept": "application/json"
            }
        });

        return NextResponse.json(response.data, {status: 200});
    } catch (error: any) {
        console.log("ERROR FETCHING TOKEN LISTINGS SERVER SIDE: ", error)
        return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }
}
