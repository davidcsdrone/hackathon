"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, MessageSquare, FileText, Mic, Search, Clock } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Scale className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">LawAdvisor</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Free AI-powered legal guidance for small businesses. Get instant answers to your legal questions and
            concerns.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>AI Chat Assistant</CardTitle>
              <CardDescription>Get instant legal advice through our intelligent chat interface</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Document Analysis</CardTitle>
              <CardDescription>Upload and analyze legal documents with drag-and-drop support</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <Mic className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Voice Conversations</CardTitle>
              <CardDescription>Speak naturally with our AI advisor for hands-free consultations</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <Clock className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Chat History</CardTitle>
              <CardDescription>Access your previous conversations with date filtering</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <Search className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Smart Search</CardTitle>
              <CardDescription>Find specific legal advice from your conversation history</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <Scale className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Business Focused</CardTitle>
              <CardDescription>Specialized guidance for small business legal matters</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-blue-600 text-white max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Legal Guidance?</h2>
              <p className="mb-6">Join thousands of small businesses getting free legal advice</p>
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Your Free Consultation
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
