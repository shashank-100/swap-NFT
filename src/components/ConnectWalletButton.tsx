"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import React from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu"

const trunkAddress = (address: string) => {
    return address.slice(0, 4) + "...." + address.slice(-4);
  };

export const ConnectWalletButton = () => {
  const { setVisible } = useWalletModal();
  const { connected, publicKey, disconnect } = useWallet();
  return (
    <>
    <div className="fixed top-4 z-20 m-4">
      {connected ? (
        <>
        <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="border-black border-2 border-opacity-80 mx-4">{trunkAddress(publicKey?.toBase58() as string)}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 m-4">
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer h-10" onClick={() => {window.open(`https://solscan.io/address/${publicKey?.toBase58()}`)}}>View On Explorer</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer h-10" onClick={disconnect}>Disconnect</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
        </>
      ) : (
        <Button className="mx-4" onClick={() => setVisible(true)}>
          Connect
        </Button>
      )}
      </div>
    </>
  );
};