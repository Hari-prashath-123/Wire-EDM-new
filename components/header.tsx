import { Circle } from "lucide-react"

export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-balance">Cutting Process Simulator</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status</span>
          <Circle className="w-3 h-3 fill-green-500 text-green-500 animate-pulse" />
        </div>
      </div>
    </header>
  )
}
