import { FileX2 } from 'lucide-react'
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function NFTNotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="overflow-hidden bg-white shadow-xl rounded-2xl">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <FileX2 className="mb-6 h-24 w-24 text-violet-500" />
          <CardTitle className="text-2xl font-bold mb-3 text-violet-400">NFT Not Found</CardTitle>
          <p className="mb-8 text-gray-600">
            The NFT with the given ID was not found or is not currently listed.
          </p>
          <a
            href="/main"
            className="rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-600"
          >
            Return Home
          </a>
        </CardContent>
      </Card>
    </motion.div>
  )
}