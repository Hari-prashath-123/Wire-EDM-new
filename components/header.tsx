import { Circle } from "lucide-react"

export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <img
          src="/logo.png"
          alt="Cutting Process Simulator Logo"
          className="h-16 w-auto"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status</span>
          <Circle className="w-3 h-3 fill-green-500 text-green-500 animate-pulse" />
        </div>
      </div>
    </header>
  )
}
