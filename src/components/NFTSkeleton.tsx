import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";

export default function NFTSkeleton(){
    return (
        <Card className="w-full max-w-sm mx-auto overflow-hidden rounded-xl shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
            <Skeleton className="w-full h-64"/>
            <CardContent className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4 bg-gray-700"/>
                <Skeleton className="h-4 w-full bg-gray-700"/>
                <Skeleton className="h-4 w-2/3 bg-gray-700"/>
                <Skeleton className="h-10 w-full bg-gray-700 rounded-full"/>
            </CardContent>
        </Card>
    )
}