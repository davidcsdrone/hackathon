import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import ChatHistoryReal from "@/components/chat-history-real"

export default async function HistoryPage() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin")
  }

  return <ChatHistoryReal user={session.user} />
}
