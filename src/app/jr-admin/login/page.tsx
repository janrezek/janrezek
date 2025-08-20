"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const handleLogin = async () => {
    const result = await signIn('credentials', {
      email: 'janrezek14@icloud.com',
      password: 'Lempl100',
      redirect: false,
      callbackUrl: '/jr-admin/dashboard',
    });

    if (result?.error) {
      console.log(result.error);
    } else {
      const callbackUrl = '/jr-admin/dashboard'
      router.push(callbackUrl)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Login</h1>
      <button onClick={handleLogin}
      className="bg-blue-500 text-white p-2 rounded-md"
      >Login</button>
    </div>
  );
}