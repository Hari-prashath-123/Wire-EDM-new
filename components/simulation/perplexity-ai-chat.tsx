"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2, Eye, Check } from "lucide-react"
import type { Point2D } from "./types"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface PerplexityAIChatProps {
  onShapeGenerated: (points: Point2D[]) => void
  onPreviewShape: (points: Point2D[]) => void
}

export default function PerplexityAIChat({ onShapeGenerated, onPreviewShape }: PerplexityAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome! Describe the 3D shape you want to cut. For example: 'Create a 10x10 square with a circular hole in the center' or 'Draw a star shape'. I'll provide the cutting coordinates using Perplexity AI's reasoning.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedPoints, setGeneratedPoints] = useState<Point2D[] | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const parseCoordinatesFromText = (text: string): Point2D[] | null => {
    const coordinatePattern = /$$\s*([-\d.]+)\s*,\s*([-\d.]+)\s*$$/g
    const matches = Array.from(text.matchAll(coordinatePattern))

    if (matches.length < 2) {
      // Try alternative format: "x:value, y:value" or "x=value y=value"
      const altPattern = /[xy]\s*[:=]\s*([-\d.]+)/gi
      const altMatches = Array.from(text.matchAll(altPattern))
      if (altMatches.length >= 2) {
        const points: Point2D[] = []
        for (let i = 0; i < altMatches.length; i += 2) {
          if (i + 1 < altMatches.length) {
            points.push({
              x: Number.parseFloat(altMatches[i][1]),
              y: Number.parseFloat(altMatches[i + 1][1]),
            })
          }
        }
        return points.length > 0 ? points : null
      }
      return null
    }

    const points: Point2D[] = matches.map((match) => ({
      x: Number.parseFloat(match[1]),
      y: Number.parseFloat(match[2]),
    }))

    // Validate points
    if (points.some((p) => isNaN(p.x) || isNaN(p.y))) {
      return null
    }

    return points
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      // Only send actual conversation messages (user/assistant alternating pairs)
      const apiMessages = messages
        .filter((msg) => !(messages.indexOf(msg) === 0 && msg.role === "assistant"))
        .concat({ role: "user", content: userMessage })

      const response = await fetch("/api/perplexity-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          model: "sonar-reasoning-pro",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Perplexity API error response:", errorText)
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (!data?.response) {
        throw new Error("No response content from Perplexity AI")
      }

      const assistantMessage = data.response

      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }])

      // Parse coordinates from the response
      const points = parseCoordinatesFromText(assistantMessage)
      if (points && points.length >= 2) {
        setGeneratedPoints(points)
      }
    } catch (error) {
      console.error("[v0] Error communicating with Perplexity AI:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${errorMessage}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="space-y-4">
        <h3 className="text-xl font-bold">AI Shape Generator (Perplexity)</h3>

        {/* Chat Messages */}
        <ScrollArea className="h-80 border border-border rounded-lg p-4 bg-background">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-700 text-slate-100 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-100 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking with Perplexity AI...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !loading && handleSendMessage()}
            placeholder="Describe the shape you want to cut..."
            disabled={loading}
            className="flex-1 bg-input border-border"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Generated Points Display & Actions */}
        {generatedPoints && generatedPoints.length > 0 && (
          <div className="border border-border rounded-lg p-4 bg-slate-900/50 space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-2">Generated Coordinates ({generatedPoints.length} points)</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {generatedPoints.map((point, idx) => (
                  <div key={idx} className="text-slate-300">
                    P{idx + 1}: ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => onPreviewShape(generatedPoints)}
                variant="outline"
                className="flex items-center gap-2 flex-1"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button
                onClick={() => {
                  onShapeGenerated(generatedPoints)
                  setInput("")
                  setGeneratedPoints(null)
                }}
                className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 flex-1"
              >
                <Check className="w-4 h-4" />
                Use Shape
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
