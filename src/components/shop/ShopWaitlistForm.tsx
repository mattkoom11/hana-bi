"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

interface ShopWaitlistFormProps {
  compact?: boolean;
}

export function ShopWaitlistForm({ compact }: ShopWaitlistFormProps) {
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
      <div className="w-full border border-[var(--hb-ink)] px-6 py-4 text-center uppercase tracking-[0.35em] text-xs bg-[var(--hb-paper-muted)] text-[var(--hb-smoke)]">
        You&apos;re on the list
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      {!compact && (
        <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] font-script opacity-70">
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
        className="w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--hb-border)] focus:outline-none focus:border-[var(--hb-ink)] disabled:opacity-50 transition-colors font-serif text-sm placeholder:text-[var(--hb-smoke)]/50"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={formState === "loading"}
        placeholder="your@email.com"
        className="w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--hb-border)] focus:outline-none focus:border-[var(--hb-ink)] disabled:opacity-50 transition-colors font-serif text-sm placeholder:text-[var(--hb-smoke)]/50"
      />
      {formState === "error" && (
        <p className="text-xs text-red-600 font-script">Something went wrong. Please try again.</p>
      )}
      <button
        type="submit"
        disabled={formState === "loading"}
        className={cn(
          "w-full border border-[var(--hb-ink)] px-6 py-4 uppercase tracking-[0.35em] text-xs",
          "transition hover:-translate-y-0.5 bg-[var(--hb-ink)] text-[var(--hb-paper)]",
          formState === "loading" && "opacity-50 cursor-not-allowed"
        )}
      >
        {formState === "loading" ? "Joining..." : compact ? "Notify Me" : "Join the Waitlist"}
      </button>
    </form>
  );
}
