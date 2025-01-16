import { NextResponse } from 'next/server';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { publicKey } from '@metaplex-foundation/umi';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { RpcInterfaceWithAsset } from '@/lib/types';
import { AxiosError } from 'axios';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    try {
        const endpoint = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
        const umi = createUmi(endpoint).use(dasApi());
        const assetId = publicKey(id);
        const asset = await (umi.rpc as RpcInterfaceWithAsset).getAsset(assetId);

        const name = asset.content.metadata.name;
        const description = asset.content.metadata.description;
        const imageuri = asset.content.links.image;

        return NextResponse.json({ name, description, imageuri });
    } catch (err) {
        if (err instanceof AxiosError) {
            console.error(err.response?.data.errors);
            return NextResponse.json({ error: err.response?.data.errors }, { status: 500 });
        } else {
            console.error(err);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }
}
