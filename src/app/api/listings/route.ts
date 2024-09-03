import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    try {
        const response = await axios.get(`https://api-mainnet.magiceden.dev/v2/tokens/${id}/listings`, {
            headers: {
                "Accept": "application/json"
            }
        });

        res.status(200).json(response.data);
    } catch (error: any) {
        res.status(error.response?.status || 500).json({ message: error.message });
    }
}
