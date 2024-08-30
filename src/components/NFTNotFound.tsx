import { FileX2 } from 'lucide-react'

export default function NFTNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4 text-center text-white">
      <FileX2 className="mb-6 h-24 w-24 animate-pulse text-violet-500" />
      <h1 className="mb-3 text-4xl font-bold text-violet-400">Not Found</h1>
      <p className="mb-8 max-w-md text-xl text-gray-300">
        The NFT with the given Id was Not Found or Listed.
      </p>
      <a
        href="/main"
        className="rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-600"
      >
        Return Home
      </a>
    </div>
  )
}