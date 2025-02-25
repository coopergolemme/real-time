"use client"

import { useState, useEffect } from "react"
import type { GroupChat } from "@prisma/client"

export default function GroupList({ onSelectGroup }) {
  const [groups, setGroups] = useState<GroupChat[]>([])

  useEffect(() => {
    fetch("/api/groups")
      .then((res) => res.json())
      .then((data) => setGroups(data))
  }, [])

  return (
    <div className="w-1/3 border-r pr-4">
      <h3 className="font-bold mb-2">Groups</h3>
      {groups.map((group) => (
        <div
          key={group.id}
          className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
          onClick={() => onSelectGroup(group)}
        >
          <span>{group.name}</span>
        </div>
      ))}
    </div>
  )
}

