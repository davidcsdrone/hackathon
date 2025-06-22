"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Send,
  Paperclip,
  Mic,
  Scale,
  History,
  User,
  LogOut,
  MessageSquare,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Search,
  Zap,
} from "lucide-react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import FileUpload from "@/components/file-upload"
import VoiceChat from "@/components/voice-chat"

interface ChatInterfaceLettaProps {
  user: any
}

export default function ChatInterfaceLetta({ user }: ChatInterfaceLettaProps) {
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showVoiceChat, setShowVoiceChat] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "gemini-letta" | "error">("checking")
  const [testResults, setTestResults] = useState<any>(null)
  const [savedMessages, setSavedMessages] = useState<Set<string>>(new Set())
  const [savingMessages, setSavingMessages] = useState<Set<string>>(new Set())
  const [isEnhancing, setIsEnhancing] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, error } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm your AI legal advisor with **enhanced research capabilities**. I don't just answer questions—I conduct comprehensive legal research and provide action-ready guidance.

🧠 **How I Work:**
• **Intelligent Analysis**: I reconstruct your questions to identify exactly what research is needed
• **Comprehensive Research**: I research current laws, regulations, and requirements
• **Action-Ready Guidance**: I provide step-by-step instructions you can implement immediately
• **Business Context**: I consider your specific business situation and industry

🎯 **I Specialize In:**
• Business formation and structure
• Employment law and HR matters  
• Contract review and drafting
• Intellectual property protection
• Compliance and regulatory issues
• Commercial disputes and resolution

💡 **What Makes Me Different:**
Instead of generic advice, I provide researched, current, actionable guidance with specific steps, timelines, forms, and resources you need.

**Ask me any legal question and I'll conduct the research to give you comprehensive, action-ready advice!**

*Note: I provide general legal information and guidance, but this should not be considered formal legal advice. For complex matters, I recommend consulting with a qualified attorney.*`,
      },
    ],
    onFinish: async (message) => {
      setIsEnhancing(false)
      await saveConversation(message)
    },
    onError: (error) => {
      console.error("Chat error:", error)
      setConnectionStatus("error")
      setIsEnhancing(false)
    },
  })

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    setConnectionStatus("gemini-letta")
  }, [])

  const saveMessageToAdvisor = async (messageId: string, content: string) => {
    if (savingMessages.has(messageId) || savedMessages.has(messageId)) {
      return
    }

    try {
      setSavingMessages((prev) => new Set([...prev, messageId]))

      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content_saved: content,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSavedMessages((prev) => new Set([...prev, messageId]))
      } else {
        console.error("Failed to save message:", result.error, result.details)
      }
    } catch (error) {
      console.error("Error saving message:", error)
    } finally {
      setSavingMessages((prev) => {
        const newSet = new Set(prev)
        newSet.delete(messageId)
        return newSet
      })
    }
  }

  const saveConversation = async (lastMessage: any) => {
    try {
      let conversationId = currentConversationId

      if (!conversationId && messages.length > 1) {
        const firstUserMessage = messages.find((m) => m.role === "user")
        if (!firstUserMessage) return

        const title = firstUserMessage.content.substring(0, 50) + "..." || "New Conversation"

        const { data: conversation, error: convError } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            title: title,
          })
          .select()
          .single()

        if (convError) {
          console.error("Error creating conversation:", convError)
          return
        }

        conversationId = conversation.id
        setCurrentConversationId(conversationId)
      }

      if (conversationId) {
        const messagesToSave = messages.slice(-2)

        for (const message of messagesToSave) {
          if (message.id !== "welcome") {
            try {
              const { error: messageError } = await supabase.from("messages").insert({
                conversation_id: conversationId,
                role: message.role,
                content: message.content,
              })

              if (messageError) {
                console.error("Error saving message:", messageError)
              }
            } catch (error) {
              console.error("Error inserting message:", error)
            }
          }
        }

        try {
          await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId)
        } catch (error) {
          console.error("Error updating conversation:", error)
        }
      }
    } catch (error) {
      console.error("Error saving conversation:", error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
    setShowFileUpload(false)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEnhancing(true) // Show that we're enhancing the prompt

    if (uploadedFiles.length > 0) {
      const fileInfo = uploadedFiles.map((f) => f.name).join(", ")
      const messageWithFiles = `${input}\n\n[I have attached the following files for your review: ${fileInfo}]`
      handleSubmit(e, { data: { message: messageWithFiles } })
      setUploadedFiles([])
    } else {
      handleSubmit(e)
    }
  }

  const startNewConversation = () => {
    setCurrentConversationId(null)
    setSavedMessages(new Set())
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm your AI legal advisor with **enhanced research capabilities**. I don't just answer questions—I conduct comprehensive legal research and provide action-ready guidance.

🧠 **How I Work:**
• **Intelligent Analysis**: I reconstruct your questions to identify exactly what research is needed
• **Comprehensive Research**: I research current laws, regulations, and requirements
• **Action-Ready Guidance**: I provide step-by-step instructions you can implement immediately
• **Business Context**: I consider your specific business situation and industry

🎯 **I Specialize In:**
• Business formation and structure
• Employment law and HR matters  
• Contract review and drafting
• Intellectual property protection
• Compliance and regulatory issues
• Commercial disputes and resolution

💡 **What Makes Me Different:**
Instead of generic advice, I provide researched, current, actionable guidance with specific steps, timelines, forms, and resources you need.

**Ask me any legal question and I'll conduct the research to give you comprehensive, action-ready advice!**

*Note: I provide general legal information and guidance, but this should not be considered formal legal advice. For complex matters, I recommend consulting with a qualified attorney.*`,
      },
    ])
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "gemini-letta":
        return "text-green-600"
      case "checking":
        return "text-blue-600"
      default:
        return "text-red-600"
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "gemini-letta":
        return "Enhanced Research Active"
      case "checking":
        return "Checking Connection..."
      default:
        return "Connection Error"
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "gemini-letta":
        return <Zap className="h-3 w-3 mr-2 text-green-600" />
      case "checking":
        return <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
      default:
        return <AlertCircle className="h-3 w-3 mr-2" />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <Scale className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-lg font-semibold">LawAdvisor</h1>
          </div>
          <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded mb-2">
            <Search className="h-3 w-3 mr-1" />
            Enhanced Research AI
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2" />
            {user.user_metadata?.full_name || user.email}
          </div>
        </div>

        <div className="flex-1 p-4">
          <Button variant="outline" className="w-full justify-start mb-2" onClick={startNewConversation}>
            <MessageSquare className="h-4 w-4 mr-2" />
            New Conversation
          </Button>

          <Link href="/history">
            <Button variant="ghost" className="w-full justify-start mb-2">
              <History className="h-4 w-4 mr-2" />
              Chat History
            </Button>
          </Link>

          <Link href="/saved">
            <Button variant="ghost" className="w-full justify-start mb-2">
              <Bookmark className="h-4 w-4 mr-2" />
              Saved Advice
            </Button>
          </Link>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">🧠 Enhanced Features</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Intelligent prompt analysis</li>
              <li>• Comprehensive legal research</li>
              <li>• Action-ready guidance</li>
              <li>• Business context awareness</li>
              <li>• Current law & regulations</li>
            </ul>
          </div>

          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <h4 className="text-sm font-medium text-green-900 mb-2">📋 Response Format</h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Immediate action items</li>
              <li>• Step-by-step process</li>
              <li>• Legal requirements</li>
              <li>• Risk assessment</li>
              <li>• Resources & forms</li>
              <li>• Timeline & costs</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Enhanced Legal Research</h2>
              <p className="text-sm text-gray-600">AI-powered research with action-ready guidance</p>
            </div>
            <div className={`flex items-center text-sm ${getStatusColor()}`}>
              {getStatusIcon()}
              {getStatusText()}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback>
                      {message.role === "user" ? "U" : <Scale className="h-4 w-4 text-blue-600" />}
                    </AvatarFallback>
                  </Avatar>
                  <Card
                    className={`mx-2 ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-white border-gray-200"
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      {message.role === "assistant" && message.id !== "welcome" && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => saveMessageToAdvisor(message.id, message.content)}
                            className="text-xs text-gray-500 hover:text-blue-600"
                            disabled={savedMessages.has(message.id) || savingMessages.has(message.id)}
                          >
                            {savingMessages.has(message.id) ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Saving...
                              </>
                            ) : savedMessages.has(message.id) ? (
                              <>
                                <BookmarkCheck className="h-3 w-3 mr-1" />
                                Saved
                              </>
                            ) : (
                              <>
                                <Bookmark className="h-3 w-3 mr-1" />
                                Save Advice
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
            {(isLoading || isEnhancing) && (
              <div className="flex justify-start">
                <div className="flex">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback>
                      <Scale className="h-4 w-4 text-blue-600" />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="mx-2 bg-white border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {isEnhancing ? "Analyzing & researching..." : "Generating response..."}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="flex">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="mx-2 bg-red-50 border-red-200">
                    <CardContent className="p-3">
                      <div className="text-sm text-red-600">
                        Error: {error.message || "Failed to get response. Please check your API configuration."}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* File Upload Area */}
        {uploadedFiles.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{file.name}</span>
                    <button onClick={() => removeFile(index)} className="ml-2 text-blue-600 hover:text-blue-800">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={onSubmit} className="flex items-end space-x-2">
              <div className="flex-1">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask any legal question - I'll research and provide action-ready guidance..."
                  className="min-h-[44px] resize-none"
                  disabled={isLoading || isEnhancing}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowFileUpload(true)}
                className="bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowVoiceChat(true)}
                className="bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button type="submit" disabled={isLoading || isEnhancing || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && <FileUpload onUpload={handleFileUpload} onClose={() => setShowFileUpload(false)} />}

      {/* Voice Chat Modal */}
      {showVoiceChat && <VoiceChat onClose={() => setShowVoiceChat(false)} />}
    </div>
  )
}
