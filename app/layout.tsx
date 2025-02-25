import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import Provider from "./components/Provider"

const inter = Inter({ subsets: ["latin"] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider session={session}>{children}</Provider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
