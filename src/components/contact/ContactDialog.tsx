"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Request failed");
      setFormState("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setFormState("error");
    }
  };

  const inputClass =
    "w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--hb-border)] focus:outline-none focus:border-[var(--hb-ink)] disabled:opacity-50 transition-colors font-serif text-sm placeholder:text-[var(--hb-smoke)]/50";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--hb-paper)] border border-dashed border-[var(--hb-border)] rounded-none shadow-none max-w-md p-8">
        <DialogTitle className="font-serif text-2xl font-normal">
          Get in touch
        </DialogTitle>

        {formState === "success" ? (
          <div className="pt-4 space-y-2">
            <p className="text-sm text-[var(--hb-smoke)] leading-relaxed">
              Message received. We&apos;ll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
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
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={formState === "loading"}
              placeholder="Your message"
              rows={4}
              className={cn(inputClass, "resize-none")}
            />
            {formState === "error" && (
              <p className="text-xs text-red-600 font-script">
                Something went wrong. Please try again.
              </p>
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
              {formState === "loading" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
