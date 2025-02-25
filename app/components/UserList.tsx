"use client"

import { useState, useEffect } from "react"
import type { User } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserList({ onSelectUser }) {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
  }, [])

  return (
    <div className="w-1/3 border-r pr-4">
      <h3 className="font-bold mb-2">Users</h3>
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
          onClick={() => onSelectUser(user)}
        >
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{user.name}</span>
          <span className="ml-auto w-3 h-3 bg-green-500 rounded-full"></span>
        </div>
      ))}
    </div>
  )
}

