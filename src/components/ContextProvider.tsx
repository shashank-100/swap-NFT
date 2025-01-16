'use client'

import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { ReactNode, useMemo } from 'react'
import { Cluster, clusterApiUrl } from '@solana/web3.js'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { ConnectWalletButton } from './ConnectWalletButton'

require('@solana/wallet-adapter-react-ui/styles.css')


export function SolanaProvider({ children }: { children: ReactNode }) {
  // const cluster:Cluster  = "mainnet-beta"
  // const endpoint = useMemo(() => clusterApiUrl(cluster), [cluster])
  const endpoint = process.env.NEXT_PUBLIC_RPC_URL!;
  console.log("Connection Endpoint from Context Provider: ",endpoint)
  const wallets = useMemo(() => {
    return [
      new PhantomWalletAdapter(),
    ];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
            <ConnectWalletButton/>
          {children}
          </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}