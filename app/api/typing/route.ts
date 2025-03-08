import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import Pusher from "pusher";
import prisma from "@/lib/prisma";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { isTyping, receiverId, groupChatId } = await request.json();

  if (receiverId) {
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (receiver?.email) {
      await pusher.trigger(`presence-user-${receiver.email}`, "typing", {
        userId: session.user.id,
        isTyping,
      });
    }
  } else if (groupChatId) {
    await pusher.trigger(`presence-group-${groupChatId}`, "typing", {
      userId: session.user.id,
      isTyping,
    });
  }

  return NextResponse.json({ success: true });
}
