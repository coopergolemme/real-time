import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    where: {
      NOT: {
        id: session.user.id,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  })

  return NextResponse.json(users)
}

