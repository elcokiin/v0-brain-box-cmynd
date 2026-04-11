import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <WifiOff className="size-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">You are offline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please check your internet connection and try again.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
