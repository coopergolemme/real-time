"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Pusher from "pusher-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserList from "./UserList"
import GroupList from "./GroupList"

export default function ChatInterface() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [currentChat, setCurrentChat] = useState(null)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!session?.user?.email) return

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe(`presence-user-${session.user.email}`)
    channel.bind("new-message", (data: { message: string; sender: string }) => {
      setMessages((prevMessages) => [...prevMessages, data])
    })

    return () => {
      pusher.unsubscribe(`presence-user-${session.user.email}`)
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsTyping(true)

    const response = await fetch("/api/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input, receiverId: currentChat?.id, groupChatId: currentChat?.groupId }),
    })

    if (response.ok) {
      setInput("")
      setMessages((prevMessages) => [...prevMessages, { message: input, sender: session?.user?.email }])
    }

    setIsTyping(false)
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Chat Platform</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="private">
          <TabsList>
            <TabsTrigger value="private">Private Chats</TabsTrigger>
            <TabsTrigger value="group">Group Chats</TabsTrigger>
          </TabsList>
          <TabsContent value="private">
            <div className="flex">
              <UserList onSelectUser={setCurrentChat} />
              <div className="flex-1 ml-4">
                <div className="h-[50vh] overflow-y-auto border p-4 mb-4">
                  {messages.map((m, index) => (
                    <div
                      key={index}
                      className={`mb-2 ${m.sender === session?.user?.email ? "text-right" : "text-left"}`}
                    >
                      <span
                        className={`inline-block p-2 rounded-lg ${m.sender === session?.user?.email ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                      >
                        {m.message}
                      </span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow"
                  />
                  <Button type="submit" disabled={isTyping || !currentChat}>
                    Send
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="group">
            <div className="flex">
              <GroupList onSelectGroup={setCurrentChat} />
              <div className="flex-1 ml-4">
                <div className="h-[50vh] overflow-y-auto border p-4 mb-4">
                  {messages.map((m, index) => (
                    <div
                      key={index}
                      className={`mb-2 ${m.sender === session?.user?.email ? "text-right" : "text-left"}`}
                    >
                      <span
                        className={`inline-block p-2 rounded-lg ${m.sender === session?.user?.email ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                      >
                        {m.message}
                      </span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow"
                  />
                  <Button type="submit" disabled={isTyping || !currentChat}>
                    Send
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

