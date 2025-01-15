import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { Toaster } from "sonner";
import { Token } from "@/lib/types";

interface BuyNFTProps {
  listingPrice: number;
  selectedToken: Token;
  tokenList: Token[];
  onTokenSelect: (token: Token) => void;
  onBuy: () => void;
  isWalletConnected: boolean;
  id: string;
}

export default function BuyNFT({
  listingPrice,
  selectedToken,
  tokenList,
  onTokenSelect,
  onBuy,
  isWalletConnected,
  id
}: BuyNFTProps) {
  return (
    <>
      <div className="bg-card rounded-lg py-6 w-[18rem] space-y-4 mx-auto">
        <div className="space-y-2">
          <Label htmlFor="amount">Listed At</Label>
          <div className="flex items-center gap-2">
            {listingPrice ? (
              <Input
                disabled
                id="amount"
                className="flex-1 font-semibold"
                value={`${listingPrice}`}
              />
            ) : (
              <Skeleton className='flex-1 w-10 h-[2.5rem]' />
            )}
            <Button variant="outline" size="icon">
              {selectedToken.logoURI ? 
                <img src={selectedToken.logoURI} className="h-5 w-5 rounded-full" alt={selectedToken.symbol} /> : 
                <Skeleton className='w-5 h-5' />
              }
            </Button>
          </div>
        </div>
        <div className="h-full">
          <Label htmlFor="token">Token</Label>
          <Select
            defaultValue="USDC"
            value={selectedToken.address}
            onValueChange={(val) => {
              const token = tokenList.find((t: Token) => t.address === val);
              if (token) {
                onTokenSelect(token);
              }
            }}
          >
            <SelectTrigger className="w-[18rem] text-black">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent className="text-black">
              <SelectGroup>
                <SelectLabel>Token</SelectLabel>
                {tokenList.map((token: Token) => (
                  <SelectItem key={token.address} value={token.address} className="flex flex-row">
                    <div className="flex flex-row">
                      <img src={token.logoURI} alt={token.symbol} width={24} height={24} className="rounded-full flex flex-row" />
                      <span className="mx-2 mt-0.5">{token.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {!isWalletConnected ? (
          <Button disabled className="w-[18rem] mx-auto">Connect Wallet First</Button>
        ) : (
          <>
            <Button className="w-[18rem] mx-auto" onClick={onBuy}>
              Buy Now with {selectedToken.symbol}
            </Button>
            <Button 
              className="w-[18rem] mx-auto bg-sky-400 hover:bg-sky-700" 
              onClick={() => {
                window.open(`https://dial.to/?action=solana-action:http://liquotic.vercel.app/api/actions/swap/${id}&cluster=mainnet`)
              }}
            >
              Unfurl as Blink
            </Button>
          </>
        )}
      </div>
      <Toaster position="top-center" richColors />
    </>
  );
}