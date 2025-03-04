import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, receiverId, groupChatId } = await request.json();

  console.log(receiverId);

  const newMessage = await prisma.message.create({
    data: {
      content: message,
      senderId: session.user.id,
      receiverId: receiverId,
      groupChatId: groupChatId,
    },
    include: {
      sender: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (receiverId) {
    await pusher.trigger(`presence-user-${receiverId}`, "new-message", {
      id: newMessage.id,
      content: newMessage.content,
      sender: newMessage.sender,
      createdAt: newMessage.createdAt,
    });
  } else if (groupChatId) {
    await pusher.trigger(`presence-group-${groupChatId}`, "new-message", {
      id: newMessage.id,
      content: newMessage.content,
      sender: newMessage.sender,
      createdAt: newMessage.createdAt,
    });
  }

  return NextResponse.json({ success: true, message: newMessage });
}
