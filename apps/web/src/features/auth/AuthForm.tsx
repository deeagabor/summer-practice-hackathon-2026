"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function AuthForm({ mode }: Readonly<{ mode: "login" | "register" }>) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError("");
    const payload =
      mode === "register"
        ? {
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? "")
          }
        : {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? "")
          };

    startTransition(async () => {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        router.push("/");
        router.refresh();
      } else {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? "Authentication failed.");
      }
    });
  }

  return (
    <form
      action={submit}
      className="mt-8 grid gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-nav"
    >
      {mode === "register" ? (
        <label className="grid gap-2 text-sm font-black">
          Name
          <input
            className="rounded-lg border border-black/10 bg-field px-4 py-3 font-semibold"
            defaultValue="Mara Ionescu"
            name="name"
            required
          />
        </label>
      ) : null}
      <label className="grid gap-2 text-sm font-black">
        Email
        <input
          className="rounded-lg border border-black/10 bg-field px-4 py-3 font-semibold"
          defaultValue={mode === "login" ? "mara@example.com" : ""}
          name="email"
          required
          type="email"
        />
      </label>
      <label className="grid gap-2 text-sm font-black">
        Password
        <input
          className="rounded-lg border border-black/10 bg-field px-4 py-3 font-semibold"
          defaultValue={mode === "login" ? "Showup2026!" : ""}
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      {error ? (
        <p className="rounded-lg bg-coral/10 p-3 text-sm font-bold text-red-800">{error}</p>
      ) : null}
      <button
        className="rounded-full bg-ink px-5 py-3 text-sm font-black text-white disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Working..." : mode === "login" ? "Log in" : "Create account"}
      </button>
    </form>
  );
}
