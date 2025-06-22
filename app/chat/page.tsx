import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import ChatInterfaceLetta from "@/components/chat-interface-letta"

export default async function ChatPage() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin")
  }

  return <ChatInterfaceLetta user={session.user} />
}
