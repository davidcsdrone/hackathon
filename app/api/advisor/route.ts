import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET - Fetch saved advisor content for the current user
export async function GET(req: Request) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching advisor content for user:", session.user.id)

    const { data: advisorContent, error } = await supabase
      .from("Advisor")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching advisor content:", error)
      return NextResponse.json({ error: "Failed to fetch content", details: error.message }, { status: 500 })
    }

    console.log("Fetched advisor content:", advisorContent?.length || 0, "items")
    return NextResponse.json({ data: advisorContent || [] })
  } catch (error) {
    console.error("Error in advisor GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Save new advisor content for the current user
export async function POST(req: Request) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content_saved } = await req.json()

    if (!content_saved || typeof content_saved !== "string") {
      return NextResponse.json({ error: "Valid content is required" }, { status: 400 })
    }

    console.log("Saving advisor content for user:", session.user.id)
    console.log("Content length:", content_saved.length)

    // Insert data - id will auto-increment
    const insertData = {
      content_saved: content_saved.trim(),
      user_id: session.user.id,
      created_at: new Date().toISOString(),
    }

    console.log("Insert data:", { ...insertData, content_saved: `${insertData.content_saved.substring(0, 50)}...` })

    const { data: newContent, error } = await supabase.from("Advisor").insert(insertData).select("*").single()

    if (error) {
      console.error("Error saving advisor content:", error)
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        {
          error: "Failed to save content",
          details: error.message,
          code: error.code,
        },
        { status: 500 },
      )
    }

    console.log("Successfully saved advisor content with auto-generated ID:", newContent?.id)
    return NextResponse.json({ data: newContent })
  } catch (error) {
    console.error("Error in advisor POST:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

// DELETE - Delete saved advisor content for the current user
export async function DELETE(req: Request) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Convert to number since id is now an auto-incrementing integer
    const numericId = Number.parseInt(id, 10)
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    console.log("Deleting advisor content:", numericId, "for user:", session.user.id)

    const { error } = await supabase.from("Advisor").delete().eq("id", numericId).eq("user_id", session.user.id)

    if (error) {
      console.error("Error deleting advisor content:", error)
      return NextResponse.json({ error: "Failed to delete content", details: error.message }, { status: 500 })
    }

    console.log("Successfully deleted advisor content:", numericId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in advisor DELETE:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
