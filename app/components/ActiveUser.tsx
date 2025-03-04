import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useEffect, useState } from "react";

export default function ActiveUser({ userId }: { userId: string }) {
  const [user, setUser] = useState<{ name: string; image: string } | null>(
    null
  );

  useEffect(() => {
    getUser(userId).then((res) => setUser(res));
  }, [userId]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={user?.image}
            alt={user?.name}
            className="rounded-full h-8 w-8"
          />
          <AvatarFallback className="rounded-full">
            {user?.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <h3 className="font-bold mb-2">{user?.name.split(" ")[0]}</h3>
    </div>
  );
}

async function getUser(userId: string) {
  const response = await fetch("/api/user?userId=" + userId);
  const data = await response.json();
  return data;
}
