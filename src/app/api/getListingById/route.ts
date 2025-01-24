import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    try {
        const response = await axios.get(`https://api-mainnet.magiceden.dev/v2/tokens/${id}/listings`, {
            headers: {
                "Accept": "application/json"
            }
        });
        return NextResponse.json(response.data);
    } catch (err) {
        if (err instanceof AxiosError) {
            return NextResponse.json({ error: err.response?.data.errors }, { status: 500 });
        } else {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }
}