"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Password salah");
      return;
    }
    router.push("/admin");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-background">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold text-center mb-4">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border rounded-md px-4 py-2 text-sm outline-none"
          autoFocus
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-black text-white rounded-full px-4 py-2 text-sm font-medium"
        >
          Masuk
        </button>
      </form>
    </main>
  );
}
