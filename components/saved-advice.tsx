"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bookmark, BookmarkCheck, Copy, Trash2, Calendar, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type AdvisorContent = Database["public"]["Tables"]["Advisor"]["Row"]

interface SavedAdviceProps {
  user: any
}

export default function SavedAdvice({ user }: SavedAdviceProps) {
  const [savedContent, setSavedContent] = useState<AdvisorContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copySuccess, setCopySuccess] = useState<number | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchSavedContent()
  }, [])

  const fetchSavedContent = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch("/api/advisor")
      const result = await response.json()

      if (response.ok) {
        setSavedContent(result.data || [])
        console.log("Fetched saved content:", result.data?.length || 0, "items")
      } else {
        setError(result.error || "Failed to fetch saved content")
      }
    } catch (err) {
      console.error("Error fetching saved content:", err)
      setError("Failed to load saved content")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (content: string, id: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopySuccess(id)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const deleteContent = async (id: number) => {
    try {
      console.log("Deleting content with ID:", id)
      const response = await fetch(`/api/advisor?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSavedContent((prev) => prev.filter((item) => item.id !== id))
        console.log("Successfully deleted content with ID:", id)
      } else {
        const result = await response.json()
        console.error("Error deleting content:", result.error)
        setError("Failed to delete content: " + result.error)
      }
    } catch (err) {
      console.error("Error deleting content:", err)
      setError("Failed to delete content")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading saved advice...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchSavedContent}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Saved Legal Advice</h2>
        <Badge variant="secondary">{savedContent.length} items</Badge>
      </div>

      {savedContent.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved advice yet</h3>
            <p className="text-gray-600">Save important legal advice from your conversations to reference later.</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {savedContent.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookmarkCheck className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(item.created_at), "MMM dd, yyyy 'at' h:mm a")}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        ID: {item.id}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(item.content_saved || "", item.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {copySuccess === item.id ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteContent(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{item.content_saved}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
