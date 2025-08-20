"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace('/jr-admin/login');
    }
  }, [status, router]);

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {session?.user?.email}</p>
      <button onClick={() => signOut({ callbackUrl: '/jr-admin/login' })} className="bg-white text-black py-2 px-4 rounded-md">Logout</button>
    </div>
  );
}

