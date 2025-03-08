"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaGithub, FaGoogle } from "react-icons/fa";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-5xl font-bold mb-10">Real-Time Chat App</h1>
      <div>
        <h2 className="text-2xl mb-7 font-semibold">
          Built by{" "}
          <span className="font-bold text-blue-700">Cooper Golemme</span>
          <span className="inline-flex items-baseline align-bottom mb-1">
            <a
              href="https://github.com/coopergolemme"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-gray-700 hover:text-gray-500 align-bottom">
              <FaGithub
                className="align-bottom items-baseline"
                style={{ verticalAlign: "bottom" }}
              />
            </a>
          </span>
        </h2>
      </div>
      <Button
        onClick={() => signIn("google")}
        className="flex items-center space-x-2 mb-4 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 text-lg py-3 px-6">
        <FaGoogle size={24} />
        <span>Sign in with Google</span>
      </Button>
    </div>
  );
}
