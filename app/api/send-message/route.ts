import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import Pusher from "pusher"

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { message, receiverId, groupChatId } = await request.json()

  const newMessage = await prisma.message.create({
    data: {
      content: message,
      senderId: session.user.id,
      receiverId: receiverId,
      groupChatId: groupChatId,
    },
  })

  if (receiverId) {
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } })
    await pusher.trigger(`presence-user-${receiver.email}`, "new-message", {
      message: newMessage.content,
      sender: session.user.email,
    })
  } else if (groupChatId) {
    await pusher.trigger(`presence-group-${groupChatId}`, "new-message", {
      message: newMessage.content,
      sender: session.user.email,
    })
  }

  return NextResponse.json({ success: true })
}

