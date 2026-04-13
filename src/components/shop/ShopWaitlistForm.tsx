"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

interface ShopWaitlistFormProps {
  compact?: boolean;
  dark?: boolean;
}

export function ShopWaitlistForm({ compact, dark }: ShopWaitlistFormProps) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error("Request failed");
      setFormState("success");
      setName("");
      setEmail("");
    } catch {
      setFormState("error");
    }
  };

  if (formState === "success") {
    return (
      <div className={cn(
        "w-full border px-6 py-4 text-center uppercase tracking-[0.35em] text-xs",
        dark
          ? "border-[rgba(250,248,244,0.3)] text-[rgba(250,248,244,0.7)] bg-[rgba(250,248,244,0.05)]"
          : "border-[var(--hb-ink)] bg-[var(--hb-paper-muted)] text-[var(--hb-smoke)]"
      )}>
        You&apos;re on the list
      </div>
    );
  }

  const inputClass = cn(
    "w-full px-0 py-2 bg-transparent border-0 border-b focus:outline-none disabled:opacity-50 transition-colors font-serif text-sm",
    dark
      ? "border-[rgba(250,248,244,0.25)] focus:border-[rgba(250,248,244,0.7)] text-[#faf8f4] placeholder:text-[rgba(250,248,244,0.35)]"
      : "border-[var(--hb-border)] focus:border-[var(--hb-ink)] placeholder:text-[var(--hb-smoke)]/50"
  );

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      {!compact && (
        <p className={cn(
          "uppercase text-xs tracking-[0.3em] font-script",
          dark ? "text-[rgba(250,248,244,0.55)]" : "text-[var(--hb-smoke)] opacity-70"
        )}>
          Notify me when available
        </p>
      )}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={formState === "loading"}
        placeholder="Your name"
        className={inputClass}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={formState === "loading"}
        placeholder="your@email.com"
        className={inputClass}
      />
      {formState === "error" && (
        <p className={cn("text-xs font-script", dark ? "text-red-400" : "text-red-600")}>
          Something went wrong. Please try again.
        </p>
      )}
      <button
        type="submit"
        disabled={formState === "loading"}
        className={cn(
          "w-full border px-6 py-4 uppercase tracking-[0.35em] text-xs transition hover:-translate-y-0.5",
          dark
            ? "border-[rgba(250,248,244,0.85)] text-[#faf8f4] hover:bg-[rgba(250,248,244,0.1)]"
            : "border-[var(--hb-ink)] bg-[var(--hb-ink)] text-[var(--hb-paper)]",
          formState === "loading" && "opacity-50 cursor-not-allowed"
        )}
      >
        {formState === "loading" ? "Joining..." : compact ? "Notify Me" : "Join the Waitlist"}
      </button>
    </form>
  );
}
