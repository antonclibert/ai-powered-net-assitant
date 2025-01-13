"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

interface ChatInterfaceProps {
  onNetworkDesignGenerated: () => void
}

export function ChatInterface({ onNetworkDesignGenerated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Improved scrolling effect
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    if (!trimmedInput) return

    // Create user message with unique ID
    const userMessage: Message = { 
      role: 'user', 
      content: trimmedInput,
      id: `user-${Date.now()}`
    }

    // Update messages and clear input
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Prepare the request payload
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Pass entire message history
          messages: [...messages, userMessage],
        }),
      })

      // Handle network or server errors
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Parse the response
      const data = await response.json()
      
      // Validate the response
      if (data.content) {
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: data.content,
          id: `assistant-${Date.now()}`
        }
        
        // Add assistant message
        setMessages(prev => [...prev, assistantMessage])

        // Network design generation trigger
        const designKeywords = [
          'network design', 
          'topology', 
          'infrastructure', 
          'architecture', 
          'network requirements'
        ]
        
        // Check if any keywords are in the response
        if (designKeywords.some(keyword => 
          assistantMessage.content.toLowerCase().includes(keyword)
        )) {
          onNetworkDesignGenerated()
        }
      } else {
        throw new Error('Invalid response from AI')
      }
    } catch (error) {
      console.error('Error generating response:', error)
      
      // Add error message
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.',
        id: `error-${Date.now()}`
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      // Ensure loading state is reset
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea 
        className="flex-grow mb-4 px-2" 
        ref={scrollAreaRef}
      >
        <div className="space-y-2">
          {messages.map((message) => (
            <Card 
              key={message.id} 
              className={`
                ${message.role === 'user' 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'}
              `}
            >
              <CardContent className="p-3">
                <p className={`
                  text-sm 
                  ${message.role === 'user' 
                    ? 'text-blue-800' 
                    : 'text-gray-800'}
                `}>
                  {message.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your network requirements..."
          disabled={isLoading}
          className="flex-grow"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="min-w-[100px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send'
          )}
        </Button>
      </form>
    </div>
  )}