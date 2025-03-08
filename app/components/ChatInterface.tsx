"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserList from "./UserList";
import ActiveUser from "./ActiveUser";
import { User } from "@prisma/client";

interface Message {
  id: string;
  content: string;
  sender: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function ChatInterface() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentChat, setCurrentChat] = useState<{
    id: string;
    type: "user" | "group";
  } | null>(null);
  const [pusherClient, setPusherClient] = useState<Pusher | null>(null);

  // Happens whenever the session changes
  useEffect(() => {
    if (!session?.user?.email) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });

    setPusherClient(pusher);

    return () => {
      pusher.disconnect();
    };
  }, [session]);

  const fetchMessages = useCallback(async () => {
    if (!currentChat) return;
    const response = await fetch(
      `/api/messages?${currentChat.type}Id=${currentChat.id}`
    );
    if (response.ok) {
      const data = await response.json();
      setMessages(data.messages);
    }
  }, [currentChat]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // happens if we switch chats, session changes,
  useEffect(() => {
    if (!pusherClient || !currentChat || !session?.user?.email) return;

    const channelName =
      currentChat.type === "user"
        ? `presence-user-${session.user.id}`
        : `presence-group-${currentChat.id}`;

    const channel = pusherClient.subscribe(channelName);

    // connect to your own channel
    channel.bind("pusher:subscription_succeeded", () => {
      console.log("Successfully subscribed to channel:", channelName);
    });

    channel.bind("pusher:subscription_error", (error: Error) => {
      console.error("Error subscribing to channel:", channelName, error);
    });

    channel.bind("new-message", (data: Message) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [pusherClient, currentChat, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user.id || !currentChat) return;

    const response = await fetch("/api/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: input,
        [currentChat.type === "user" ? "receiverId" : "groupChatId"]:
          currentChat.id,
      }),
    });

    const { success, message } = await response.json();

    if (!success) {
      return;
    }
    setMessages([...messages, message]);
    setInput("");
  };

  return (
    <Card className="w-full md:max-w-full">
      <CardHeader>
        <CardTitle>Chat Platform</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row">
          <UserList
            onSelectUser={(user: User) =>
              setCurrentChat({ id: user.id, type: "user" })
            }
          />
          <div className="flex flex-col w-full md:w-3/4 mt-4 md:mt-0">
            {currentChat && <ActiveUser userId={currentChat.id}></ActiveUser>}
            <div className="flex-1 ml-0 md:ml-4">
              <div
                className="h-[50vh] overflow-y-auto border p-4 mb-4"
                ref={(el) => {
                  if (el) el.scrollTop = el.scrollHeight;
                }}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`mb-2 ${
                      m.sender.email === session?.user?.email
                        ? "text-right"
                        : "text-left"
                    }`}>
                    <span
                      className={`inline-block p-2 rounded-lg ${
                        m.sender.email === session?.user?.email
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}>
                      {m.content}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={handleSubmit}
                className="flex space-x-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-grow"
                />
                <Button
                  type="submit"
                  disabled={!currentChat}>
                  Send
                </Button>
              </form>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
