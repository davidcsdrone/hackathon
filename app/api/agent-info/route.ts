import { NextResponse } from "next/server"
import { getAgentInfo } from "@/lib/letta-client"

export async function GET() {
  try {
    const agentInfo = await getAgentInfo()
    return NextResponse.json(agentInfo)
  } catch (error) {
    console.error("Error fetching agent info:", error)
    return NextResponse.json({ error: "Failed to fetch agent info" }, { status: 500 })
  }
}
