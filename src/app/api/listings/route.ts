import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    try {
        const response = await axios.get(`https://api-mainnet.magiceden.dev/v2/tokens/${id}/listings`, {
            headers: {
                "Accept": "application/json"
            }
        });

        return NextResponse.json(response);
    } catch (error: any) {
        return NextResponse.error()
    }
}
