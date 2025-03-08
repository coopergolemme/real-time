"use client";

import { useState, useEffect } from "react";
import type { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader } from "lucide-react";

export default function UserList({ onSelectUser }) {
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User>();

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .then(() => setLoadingUsers(false));
  }, []);
  return (
    <div className="border-r pr-4 md:w-1/4 w-full">
      <h3 className="font-bold mb-2">Users</h3>
      {loadingUsers ? (
        <Loader className="animate-spin" />
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded ${
              activeUser?.id === user.id ? "bg-blue-100" : ""
            }`}
            onClick={() => {
              setActiveUser(user);
              onSelectUser(user);
            }}>
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage
                src={user.image}
                alt={user.name}
              />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
            <span className="ml-auto w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
        ))
      )}
    </div>
  );
}
