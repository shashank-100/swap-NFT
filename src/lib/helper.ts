import { NFT } from "@/lib/types";
import { Connection,clusterApiUrl } from "@solana/web3.js";

export const trunkDescription = (description: string) => {
    if(description.length < 200){
      return description;
    }
    return description.slice(0, 200) + "....";
  };

  export const shuffle = (array: NFT[]) => {
    let currentIndex = array.length;
    while (currentIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  }
