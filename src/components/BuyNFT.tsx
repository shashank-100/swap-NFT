import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "sonner";
import { motion } from "framer-motion";
import { Token,BuyNFTProps } from "@/lib/types";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6 mt-6"
    >
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-[1rem] font-semibold">Listed Price</Label>
        <div className="flex items-center gap-2">
          {listingPrice ? (
            <Input
              disabled
              id="amount"
              className="flex-1 text-black font-semibold text-[1rem] font-mono"
              value={`${listingPrice.toFixed(2)}`}
            />
          ) : (
            <Skeleton className='flex-1 h-[2.5rem]' />
          )}
          <Button variant="outline" size="icon" className="w-12 h-12">
            {selectedToken.logoURI ? 
              <img src={selectedToken.logoURI || "/placeholder.svg"} className="h-8 w-8 rounded-full" alt={selectedToken.symbol} /> : 
              <Skeleton className='w-8 h-8 rounded-full' />
            }
          </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="token" className="text-[1rem] font-semibold">Select Token</Label>
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
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Available Tokens</SelectLabel>
              {tokenList.map((token: Token) => (
                <SelectItem key={token.address} value={token.address}>
                  <div className="flex items-center">
                    <img src={token.logoURI || "/placeholder.svg"} alt={token.symbol} width={24} height={24} className="rounded-full mr-2" />
                    <span>{token.symbol}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {!isWalletConnected ? (
        <Button disabled className="w-full py-6 text-[1rem]">Connect Wallet First</Button>
      ) : (
        <>
          <Button className="w-full py-6 text-[1rem] bg-gradient-to-r text-white" onClick={onBuy}>
            Buy Now with {selectedToken.symbol}
          </Button>
          <Button 
            className="w-full py-6 text-[1rem] bg-sky-400 text-white" 
            onClick={() => {
              window.open(`https://dial.to/?action=solana-action:http://liquotic.vercel.app/api/actions/swap/${id}&cluster=mainnet`)
            }}
          >
            Unfurl as Blink
          </Button>
        </>
      )}
      <Toaster position="top-center" richColors />
    </motion.div>
  );
}
