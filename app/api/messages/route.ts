import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const groupId = searchParams.get("groupId");

  let messages;

  if (userId) {
    messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: userId },
          { senderId: userId, receiverId: session.user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  } else if (groupId) {
    messages = await prisma.message.findMany({
      where: {
        groupChatId: groupId,
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  } else {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  return NextResponse.json({ messages });
}
