import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// Test endpoint to check table structure and permissions
export async function GET() {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Test 1: Try a simple select to check table access
    const { data: selectTest, error: selectError } = await supabase.from("Advisor").select("*").limit(1)

    // Test 2: Check if we can insert (we'll clean up after)
    const testInsert = {
      content_saved: "Test content for auto-increment ID",
      user_id: session.user.id,
      created_at: new Date().toISOString(),
    }

    const { data: insertTest, error: insertError } = await supabase
      .from("Advisor")
      .insert(testInsert)
      .select("*")
      .single()

    // Clean up test insert if successful
    if (insertTest && insertTest.id) {
      console.log("Test insert successful with auto-generated ID:", insertTest.id)
      await supabase.from("Advisor").delete().eq("id", insertTest.id)
      console.log("Test record cleaned up")
    }

    // Test 3: Check table structure by querying information_schema
    const { data: tableStructure, error: structureError } = await supabase.rpc("get_table_columns", {
      table_name: "Advisor",
    })

    return NextResponse.json({
      user_id: session.user.id,
      select_test: selectTest ? "Success" : "Failed",
      select_error: selectError?.message,
      insert_test: insertTest ? "Success - Auto-increment ID working" : "Failed",
      insert_error: insertError?.message,
      auto_generated_id: insertTest?.id || null,
      table_structure: tableStructure || "Could not fetch table structure",
      structure_error: structureError?.message,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in advisor test:", error)
    return NextResponse.json({ error: "Test failed", details: error.message }, { status: 500 })
  }
}
