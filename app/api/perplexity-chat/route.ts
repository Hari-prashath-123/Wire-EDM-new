import { type NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.PERPLEXITY_API_KEY
const BASE_URL = "https://api.perplexity.ai"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface PerplexityRequest {
  messages: Message[]
  model: string
}

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "Perplexity API key is not configured" }, { status: 500 })
  }

  try {
    const body: PerplexityRequest = await req.json()

    const systemPrompt = `You are an expert in converting shape descriptions to 2D coordinates.
When a user describes a shape:
1. Analyze the shape requirements
2. Generate precise cutting coordinates as a series of (x, y) points
3. Format coordinates clearly as: (x, y) on separate lines or comma-separated
4. Close the shape by returning to the starting point
5. Ensure coordinates form a valid cutting path

Example format:
(0, 0)
(10, 0)
(10, 10)
(0, 10)
(0, 0)

Be concise and focus on coordinate generation.`

    // Perplexity API expects: first user message without prior assistant messages
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: body.model || "sonar-reasoning-pro",
        messages: [
          {
            role: "user",
            content: `${systemPrompt}\n\nUser request: ${body.messages[body.messages.length - 1]?.content || ""}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Perplexity API error:", error)
      return NextResponse.json({ error: "Failed to communicate with Perplexity AI" }, { status: response.status })
    }

    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.message?.content || "No response from AI"

    return NextResponse.json({
      response: assistantMessage,
    })
  } catch (error) {
    console.error("[v0] Error in Perplexity chat API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
