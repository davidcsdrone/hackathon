import { NextResponse } from "next/server"
import { getAgentInfo } from "@/lib/letta-client"

export async function GET() {
  try {
    const agentInfo = await getAgentInfo()
    return NextResponse.json({
      status: "connected",
      agent: agentInfo,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching agent status:", error)
    return NextResponse.json(
      {
        status: "error",
        error: "Failed to connect to Letta agent",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
