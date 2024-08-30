import NFTList from "./NFTList";

export default function DisplayNFTs(){
    //first fetch a list by known collection slugs
    return(
        <div className="mx-auto items-center justify-between p-2 flex flex-row">
            <NFTList/>
        </div>
    )
}