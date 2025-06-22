"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, CalendarIcon, ArrowLeft, MessageSquare, Filter } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface ChatHistoryProps {
  user: any
}

// Mock data - in real app, this would come from your database
const mockChatHistory = [
  {
    id: "1",
    title: "Employment Contract Review",
    preview: "I need help reviewing an employment contract for my small business...",
    date: new Date("2024-01-15"),
    tags: ["Employment", "Contracts"],
    messageCount: 12,
  },
  {
    id: "2",
    title: "Business Formation Questions",
    preview: "What are the differences between LLC and Corporation for my startup?",
    date: new Date("2024-01-14"),
    tags: ["Business Formation", "LLC", "Corporation"],
    messageCount: 8,
  },
  {
    id: "3",
    title: "Intellectual Property Concerns",
    preview: "How do I protect my business name and logo?",
    date: new Date("2024-01-12"),
    tags: ["IP", "Trademarks"],
    messageCount: 15,
  },
  {
    id: "4",
    title: "Vendor Agreement Issues",
    preview: "My vendor is not meeting contract terms. What are my options?",
    date: new Date("2024-01-10"),
    tags: ["Contracts", "Disputes"],
    messageCount: 6,
  },
  {
    id: "5",
    title: "Privacy Policy Requirements",
    preview: "Do I need a privacy policy for my e-commerce website?",
    date: new Date("2024-01-08"),
    tags: ["Privacy", "E-commerce", "Compliance"],
    messageCount: 9,
  },
]

export default function ChatHistory({ user }: ChatHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [filteredChats, setFilteredChats] = useState(mockChatHistory)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = mockChatHistory.filter(
      (chat) =>
        chat.title.toLowerCase().includes(query.toLowerCase()) ||
        chat.preview.toLowerCase().includes(query.toLowerCase()) ||
        chat.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
    )
    setFilteredChats(filtered)
  }

  const handleDateFilter = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const filtered = mockChatHistory.filter((chat) => format(chat.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
      setFilteredChats(filtered)
    } else {
      setFilteredChats(mockChatHistory)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedDate(undefined)
    setFilteredChats(mockChatHistory)
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
          {filteredChats.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
                <p className="text-gray-600">
                  {searchQuery || selectedDate
                    ? "Try adjusting your search or date filter"
                    : "Start a new conversation to see your chat history here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredChats.map((chat) => (
              <Card key={chat.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">{chat.title}</h3>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {chat.messageCount}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{chat.preview}</p>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      {chat.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{format(chat.date, "MMM dd, yyyy")}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredChats.length > 0 && (
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
