import { NextResponse } from "next/server"
import { testLettaConnection } from "@/lib/letta-client"

export async function GET() {
  try {
    const result = await testLettaConnection()
    return NextResponse.json(result, { status: result.success ? 200 : 500 })
  } catch (error) {
    console.error("Error testing Letta connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
