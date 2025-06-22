import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import LandingPage from "@/components/landing-page"

export default async function Home() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/chat")
  }

  return <LandingPage />
}
