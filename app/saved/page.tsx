import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import SavedAdvice from "@/components/saved-advice"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Scale } from "lucide-react"

export default async function SavedPage() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/chat">
              <Button variant="outline" size="icon" className="bg-white text-gray-600 border-gray-300 hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Scale className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Saved Legal Advice</h1>
                <p className="text-gray-600">Your bookmarked legal guidance and insights</p>
              </div>
            </div>
          </div>
        </div>

        <SavedAdvice user={session.user} />
      </div>
    </div>
  )
}
