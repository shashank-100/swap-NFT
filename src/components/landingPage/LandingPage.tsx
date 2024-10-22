import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import NFTList from "../NFTList"
import { NFTCard } from "@/components/Card"
import { NFT } from "@/lib/types"

export async function LandingPage() {

  const sample_nfts = [
    {"id":"C5mVaz1KAw6PDHaYTQy7TKu3XT6XiK66n2YGB4YD7TsW","price":10.6,"name":"BrokenART💔 #49","description":"BrokenART💔 #49 ILY","imageuri":"https://ap-assets.pinit.io/3ri1CjJhCmDmp5feoXPtCmaJc2hARprm3MW63KBkuJ12/8139d0c0-ec3c-484e-ae01-92234653db5c/26"}
    ,{id: "GYEqNwjPiakgbdVb4FGj6Lfvd1ZnDK57CHCWtV34SHvH", price:51.90, name:"Mad Lads #1521", description: "Lads FTW", imageuri: "https://madlads.s3.us-west-2.amazonaws.com/images/1521.png",},
    ,{id: "6nsVoiqgo8CWNv9Ufqe44QvqFdRLhEEXSDECUsJRJJby", price:58.47, name:"Mad Lads #1629", description: "Swap any token for a Lad!", imageuri: "https://madlads.s3.us-west-2.amazonaws.com/images/1629.png",},
    {"id":"44YQP5gC3DLpE3HUFRUntrkygwmUEaq5jTW84j146hhD","price":0.0324,"name":"Bear1628","description":"Bears Making NFTS Great Again!","imageuri":"https://we-assets.pinit.io/ApfTr1LvTdi1G1KjPfjsCrBqhva7y8vPPHDr9T7DzxXh/455b4321-b126-4a4c-b251-905e18aa0168/1026"},
  ]
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0f0f0f] text-white">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <span className="sr-only">Liquotic</span>
        </Link>
        <nav className="hidden lg:flex gap-4 sm:gap-6">
          <Link href="#" className="text-sm font-medium hover:text-[#00d8ff] transition-colors" prefetch={false}>
            Explore
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-[#00d8ff] transition-colors" prefetch={false}>
            My NFTs
          </Link>
        </nav>
        <Button variant="outline" className="hidden lg:inline-flex">
          Connect Wallet
        </Button>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-[#00d8ff]/20 to-[#9b59b6]/20">
          <div className="container px-4 md:px-6 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter">Liquotic</h1>
              <p className="max-w-[700px] text-lg md:text-xl lg:text-2xl">Swap your favourite NFT for any token!</p>
            </div>
            <Button className="mt-4"><Link href={`/main`}>Get Started</Link></Button>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter">Browse and Buy NFTs</h2>
                <p className="max-w-[700px] text-lg md:text-xl lg:text-2xl text-muted-foreground">
                  Discover a wide range of unique and valuable NFTs on Liquotic.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
              {sample_nfts.map((nft: any) => {
                return(
                <NFTCard id={nft.id} key={nft.id} name={nft.name} description={nft.description || ''} publicKey={null} imageuri={nft.imageuri}/>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-[#1f1f1f] py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <div className="container flex flex-col gap-2 sm:flex-row justify-between">
          <p className="text-xs text-muted-foreground">&copy; 2024 Liquotic. All rights reserved.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:text-[#00d8ff] transition-colors" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="#" className="text-xs hover:text-[#00d8ff] transition-colors" prefetch={false}>
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

function EclipseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a7 7 0 1 0 10 10" />
    </svg>
  )
}
