"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, CalendarIcon, ArrowLeft, MessageSquare, Filter, Loader2, Database } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase"
import type { Database as SupabaseDatabase } from "@/lib/supabase"

type Conversation = SupabaseDatabase["public"]["Tables"]["conversations"]["Row"] & {
  message_count: number
  preview: string
  tags: string[]
}

interface ChatHistoryRealProps {
  user: any
}

export default function ChatHistoryReal({ user }: ChatHistoryRealProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tablesExist, setTablesExist] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    checkTablesAndFetchConversations()
  }, [])

  const checkTablesAndFetchConversations = async () => {
    try {
      setLoading(true)
      setError("")

      // First check if tables exist
      const { data: tables, error: tablesError } = await supabase.from("conversations").select("id").limit(1)

      if (tablesError) {
        if (tablesError.message.includes("does not exist")) {
          setTablesExist(false)
          setError("Database tables not found. Please run the database setup script.")
          return
        } else {
          throw tablesError
        }
      }

      setTablesExist(true)
      await fetchConversations()
    } catch (err) {
      console.error("Error checking tables:", err)
      setError("Failed to connect to database. Please check your configuration.")
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async () => {
    try {
      // First, fetch all conversations for the user
      const { data: conversationsData, error: conversationsError } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError)
        throw conversationsError
      }

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([])
        setFilteredConversations([])
        return
      }

      // Then, for each conversation, get the message count and preview
      const transformedConversations: Conversation[] = await Promise.all(
        conversationsData.map(async (conv) => {
          try {
            // Get message count for this conversation
            const { count: messageCount, error: countError } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("conversation_id", conv.id)

            if (countError) {
              console.error("Error counting messages:", countError)
            }

            // Get the first user message as preview
            const { data: firstMessage, error: messageError } = await supabase
              .from("messages")
              .select("content")
              .eq("conversation_id", conv.id)
              .eq("role", "user")
              .order("created_at", { ascending: true })
              .limit(1)
              .maybeSingle()

            if (messageError) {
              console.error("Error fetching first message:", messageError)
            }

            // Extract tags from title (simple implementation)
            const tags = extractTagsFromTitle(conv.title)

            return {
              ...conv,
              message_count: messageCount || 0,
              preview: firstMessage?.content?.substring(0, 150) + "..." || "No preview available",
              tags,
            }
          } catch (error) {
            console.error("Error processing conversation:", conv.id, error)
            return {
              ...conv,
              message_count: 0,
              preview: "Error loading preview",
              tags: [],
            }
          }
        }),
      )

      setConversations(transformedConversations)
      setFilteredConversations(transformedConversations)
    } catch (err) {
      console.error("Error fetching conversations:", err)
      throw err
    }
  }

  const extractTagsFromTitle = (title: string): string[] => {
    // Simple tag extraction based on common legal terms
    const legalTerms = [
      "Contract",
      "Employment",
      "Business Formation",
      "LLC",
      "Corporation",
      "IP",
      "Trademark",
      "Copyright",
      "Privacy",
      "Compliance",
      "Dispute",
      "Real Estate",
      "Tax",
      "Partnership",
      "Agreement",
    ]

    return legalTerms.filter((term) => title.toLowerCase().includes(term.toLowerCase()))
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterConversations(query, selectedDate)
  }

  const handleDateFilter = (date: Date | undefined) => {
    setSelectedDate(date)
    filterConversations(searchQuery, date)
  }

  const filterConversations = (query: string, date: Date | undefined) => {
    let filtered = conversations

    if (query) {
      filtered = filtered.filter(
        (conv) =>
          conv.title.toLowerCase().includes(query.toLowerCase()) ||
          conv.preview.toLowerCase().includes(query.toLowerCase()) ||
          conv.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
      )
    }

    if (date) {
      filtered = filtered.filter(
        (conv) => format(new Date(conv.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
      )
    }

    setFilteredConversations(filtered)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedDate(undefined)
    setFilteredConversations(conversations)
  }

  const handleConversationClick = async (conversationId: string) => {
    // Navigate to chat with this conversation loaded
    // For now, just go to chat - you could implement conversation loading later
    window.location.href = "/chat"
  }

  const runDatabaseSetup = async () => {
    setError("Please run the database setup script in your Supabase SQL editor.")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading chat history...</p>
        </div>
      </div>
    )
  }

  if (!tablesExist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Database className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Database Setup Required</h3>
            <p className="text-gray-600 mb-4">
              The database tables haven't been created yet. Please run the setup script in your Supabase project.
            </p>
            <div className="space-y-2">
              <Button onClick={checkTablesAndFetchConversations} className="w-full">
                Check Again
              </Button>
              <Link href="/chat">
                <Button variant="outline" className="w-full">
                  Go to Chat
                </Button>
              </Link>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
              <p className="text-xs text-blue-800 font-medium mb-1">Setup Instructions:</p>
              <ol className="text-xs text-blue-700 space-y-1">
                <li>1. Go to your Supabase project</li>
                <li>2. Open the SQL Editor</li>
                <li>3. Run the script from scripts/create-tables.sql</li>
                <li>4. Come back and click "Check Again"</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && tablesExist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={checkTablesAndFetchConversations} className="mr-2">
              Try Again
            </Button>
            <Link href="/chat">
              <Button variant="outline">Go to Chat</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat History</h1>
              <p className="text-gray-600">Review your previous legal consultations</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-white text-gray-600 border-gray-300 hover:bg-gray-50">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Filter by date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={handleDateFilter} initialFocus />
                </PopoverContent>
              </Popover>
              {(searchQuery || selectedDate) && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat List */}
        <div className="space-y-4">
          {filteredConversations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedDate
                    ? "Try adjusting your search or date filter"
                    : "Start a new conversation to see your chat history here"}
                </p>
                <Link href="/chat">
                  <Button>Start New Conversation</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">{conversation.title}</h3>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {conversation.message_count}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{conversation.preview}</p>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      {conversation.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(conversation.created_at), "MMM dd, yyyy")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredConversations.length > 0 && conversations.length >= 10 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="bg-white text-gray-600 border-gray-300 hover:bg-gray-50">
              Load More Conversations
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
