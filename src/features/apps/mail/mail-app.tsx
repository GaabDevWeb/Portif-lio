"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { loadProfileContent } from "@/features/vfs/content-loader";
import { track } from "@/lib/analytics/track";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export function MailApp() {
  const profile = loadProfileContent();
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    setSubmitError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      track("contact_submit");
      setSent(true);
    } catch {
      setSubmitError("Transmission failed. Try again or email directly.");
    }
  };

  return (
    <div className="p-4">
      <header className="mb-4">
        <h2 className="font-mono text-lg text-[var(--phosphor-primary)]">Contact</h2>
        <p className="text-sm text-[var(--phosphor-dim)]">
          POST /api/contact → {profile.email}
        </p>
      </header>

      {sent ? (
        <p className="font-mono text-sm text-[var(--phosphor-primary)]" role="status">
          Message queued. Thank you, guest.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="contact-name" className="mb-1 block font-mono text-xs text-[var(--phosphor-dim)]">
              name
            </label>
            <input
              id="contact-name"
              {...register("name")}
              className="w-full border border-[var(--ui-border)] bg-[var(--bg-void)] px-3 py-2 font-mono text-sm text-[var(--ui-text)] outline-none focus:ring-2 focus:ring-[var(--phosphor-primary)]"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-[var(--stderr)]" role="alert">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1 block font-mono text-xs text-[var(--phosphor-dim)]">
              email
            </label>
            <input
              id="contact-email"
              type="email"
              {...register("email")}
              className="w-full border border-[var(--ui-border)] bg-[var(--bg-void)] px-3 py-2 font-mono text-sm text-[var(--ui-text)] outline-none focus:ring-2 focus:ring-[var(--phosphor-primary)]"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-[var(--stderr)]" role="alert">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="contact-message" className="mb-1 block font-mono text-xs text-[var(--phosphor-dim)]">
              message
            </label>
            <textarea
              id="contact-message"
              rows={5}
              {...register("message")}
              className="w-full resize-y border border-[var(--ui-border)] bg-[var(--bg-void)] px-3 py-2 font-mono text-sm text-[var(--ui-text)] outline-none focus:ring-2 focus:ring-[var(--phosphor-primary)]"
            />
            {errors.message && (
              <p className="mt-1 text-xs text-[var(--stderr)]" role="alert">{errors.message.message}</p>
            )}
          </div>
          {submitError && (
            <p className="text-xs text-[var(--stderr)]" role="alert">{submitError}</p>
          )}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.98 }}
            className="min-h-11 cursor-pointer rounded-sm border border-[var(--phosphor-primary)] bg-[var(--phosphor-primary)] px-4 py-2 font-mono text-sm text-[var(--bg-void)] hover:brightness-110 disabled:opacity-50"
          >
            {isSubmitting ? "sending..." : "send"}
          </motion.button>
        </form>
      )}
    </div>
  );
}
