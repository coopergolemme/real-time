import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const groups = await prisma.groupChat.findMany({
    where: {
      members: {
        some: {
          id: session.user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  return NextResponse.json(groups)
}

