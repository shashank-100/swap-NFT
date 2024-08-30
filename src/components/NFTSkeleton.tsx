import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";

export default function NFTSkeleton(){
    return (
    <Card className="w-64 max-h-[40rem] m-4 hover:cursor-pointer">
        <Skeleton className="w-full rounded-t-lg object-cover aspect-[4/3]"/>
        <CardContent className="p-6 space-y-2">
        <Skeleton className="h-6 w-10"/>
        <Skeleton className="h-6 w-52 mb-4"/>
        <Button disabled className="w-[12rem] mx-auto">Connect Wallet</Button>
        </CardContent>
    </Card>
    )
}