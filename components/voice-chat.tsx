"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, X, PhoneOff } from "lucide-react"

interface VoiceChatProps {
  onClose: () => void
}

export default function VoiceChat({ onClose }: VoiceChatProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [status, setStatus] = useState("Click to start voice conversation")

  // Simulated VAPI integration
  const startVoiceCall = () => {
    setIsConnected(true)
    setStatus("Connecting to AI advisor...")

    // Simulate connection
    setTimeout(() => {
      setStatus("Connected - You can speak now")
      setIsRecording(true)
    }, 2000)
  }

  const endVoiceCall = () => {
    setIsConnected(false)
    setIsRecording(false)
    setStatus("Call ended")
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  const toggleRecording = () => {
    if (!isConnected) {
      startVoiceCall()
    } else {
      setIsRecording(!isRecording)
      setStatus(isRecording ? "Paused - Click to resume" : "Listening...")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Voice Conversation</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {/* Status */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{status}</p>
            {isConnected && (
              <div className="flex items-center justify-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-gray-400"}`}
                ></div>
                <span className="text-xs text-gray-500">{isRecording ? "Recording" : "Paused"}</span>
              </div>
            )}
          </div>

          {/* Voice Visualization */}
          <div className="flex justify-center items-center h-24">
            {isRecording && (
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-500 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 40 + 10}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="bg-gray-50 p-3 rounded-lg text-left">
              <p className="text-xs text-gray-500 mb-1">Transcript:</p>
              <p className="text-sm">{transcript}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className={`rounded-full w-16 h-16 ${
                isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={toggleRecording}
            >
              {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            {isConnected && (
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16 bg-white text-red-600 border-red-600 hover:bg-red-50"
                onClick={endVoiceCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Click the microphone to start/pause recording</p>
            <p>• Speak clearly about your legal questions</p>
            <p>• The AI will respond with voice and text</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
