"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Paperclip, Mic, Scale, History, User, LogOut, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import FileUpload from "@/components/file-upload"
import VoiceChat from "@/components/voice-chat"

interface ChatInterfaceRealProps {
  user: any
}

export default function ChatInterfaceReal({ user }: ChatInterfaceRealProps) {
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showVoiceChat, setShowVoiceChat] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm your AI legal advisor. I'm here to help you with legal questions and concerns for your small business. You can ask me about contracts, employment law, business formation, compliance, and more. 

Please note that I provide general legal information and guidance, but this should not be considered as formal legal advice. For complex matters, I recommend consulting with a qualified attorney.

How can I assist you today?`,
      },
    ],
    onFinish: async (message) => {
      // Save the conversation and messages to Supabase
      await saveConversation(message)
    },
  })

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const saveConversation = async (lastMessage: any) => {
    try {
      let conversationId = currentConversationId

      // Create conversation if it doesn't exist
      if (!conversationId && messages.length > 1) {
        const firstUserMessage = messages.find((m) => m.role === "user")
        const title = firstUserMessage?.content.substring(0, 50) + "..." || "New Conversation"

        const { data: conversation, error: convError } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            title: title,
          })
          .select()
          .single()

        if (convError) throw convError

        conversationId = conversation.id
        setCurrentConversationId(conversationId)
      }

      // Save the latest messages
      if (conversationId) {
        const messagesToSave = messages.slice(-2) // Save last user message and AI response

        for (const message of messagesToSave) {
          if (message.id !== "welcome") {
            await supabase.from("messages").upsert({
              id: message.id,
              conversation_id: conversationId,
              role: message.role,
              content: message.content,
            })
          }
        }

        // Update conversation timestamp
        await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId)
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
    if (uploadedFiles.length > 0) {
      // In a real implementation, you'd upload files and include their content/references
      const fileInfo = uploadedFiles.map((f) => f.name).join(", ")
      const messageWithFiles = `${input}\n\n[Attached files: ${fileInfo}]`
      handleSubmit(e, { data: { message: messageWithFiles } })
      setUploadedFiles([])
    } else {
      handleSubmit(e)
    }
  }

  const startNewConversation = () => {
    setCurrentConversationId(null)
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm your AI legal advisor. I'm here to help you with legal questions and concerns for your small business. You can ask me about contracts, employment law, business formation, compliance, and more. 

Please note that I provide general legal information and guidance, but this should not be considered as formal legal advice. For complex matters, I recommend consulting with a qualified attorney.

How can I assist you today?`,
      },
    ])
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
        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback>{message.role === "user" ? "U" : <Scale className="h-4 w-4" />}</AvatarFallback>
                  </Avatar>
                  <Card
                    className={`mx-2 ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-white border-gray-200"
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback>
                      <Scale className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="mx-2 bg-white border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
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
                  placeholder="Ask your legal question..."
                  className="min-h-[44px] resize-none"
                  disabled={isLoading}
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
              <Button type="submit" disabled={isLoading || !input.trim()}>
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
