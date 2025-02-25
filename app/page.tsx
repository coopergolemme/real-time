import ChatInterface from "./components/ChatInterface"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ChatInterface />
    </main>
  )
}

