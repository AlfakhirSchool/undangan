"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError(res.status === 401 ? "Password salah" : `Gagal masuk (kode ${res.status})`);
        return;
      }
      router.push("/admin");
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-ui flex min-h-dvh items-center justify-center bg-linear-to-br from-[#fbe9d8] via-[#f8f1e7] to-[#f1d9c2] px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-3xl border border-gold/15 bg-white p-7 shadow-xl"
      >
        <div className="text-center">
          <p className="text-3xl">💍</p>
          <h1 className="mt-2 text-xl font-semibold text-gold-light">Dashboard Undangan</h1>
          <p className="text-sm text-foreground/60">Feri &amp; Ayu · khusus pengelola</p>
        </div>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            className="w-full rounded-xl border border-gold/25 px-4 py-3 pr-16 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-3 text-xs font-medium text-gold-light"
          >
            {show ? "Sembunyi" : "Lihat"}
          </button>
        </div>
        {error && (
          <p role="alert" className="text-center text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || password === ""}
          className="w-full rounded-full bg-gold py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
        >
          {loading ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
    </main>
  );
}
