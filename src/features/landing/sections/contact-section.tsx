"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ModulePanel } from "@/features/landing/components/module-panel";
import { registerFocusContact } from "@/features/sync/sync-bus";
import { loadProfileContent } from "@/features/vfs/content-loader";
import { track } from "@/lib/analytics/track";
import { useSessionStore } from "@/providers/session-store";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactSection() {
  const profile = loadProfileContent();
  const emitSync = useSessionStore((s) => s.emitSync);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    return registerFocusContact(() => {
      nameRef.current?.focus();
    });
  }, []);

  const onSubmit = async (data: ContactForm) => {
    setSubmitError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed");
      track("contact_submit");
      setSent(true);
    } catch {
      setSubmitError("Transmission failed. Try again or email directly.");
    }
  };

  const handleFocus = () => {
    emitSync({ type: "contact.compose", origin: "landing" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8" style={{ paddingBlock: "var(--section-padding-y)" }}>
      <div data-reveal>
        <ModulePanel id="contact" code="MOD-CONTACT" title="mail --compose">
          <p className="mb-4 font-mono text-sm text-[var(--phosphor-dim)]">
            POST /api/contact → {profile.email}
          </p>

          {sent ? (
            <p className="font-mono text-sm text-[var(--phosphor-primary)]" role="status">
              Message queued. Thank you.
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
                  ref={(e) => {
                    register("name").ref(e);
                    nameRef.current = e;
                  }}
                  onFocus={handleFocus}
                  className="w-full border border-[var(--ui-border)] bg-[var(--bg-void)] px-3 py-2 font-mono text-sm text-[var(--ui-text)]"
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="mt-1 font-mono text-xs text-[var(--stderr)]" role="alert">
                    {errors.name.message}
                  </p>
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
                  onFocus={handleFocus}
                  className="w-full border border-[var(--ui-border)] bg-[var(--bg-void)] px-3 py-2 font-mono text-sm text-[var(--ui-text)]"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 font-mono text-xs text-[var(--stderr)]" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1 block font-mono text-xs text-[var(--phosphor-dim)]">
                  message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  {...register("message")}
                  onFocus={handleFocus}
                  className="w-full resize-y border border-[var(--ui-border)] bg-[var(--bg-void)] px-3 py-2 font-mono text-sm text-[var(--ui-text)]"
                />
                {errors.message && (
                  <p className="mt-1 font-mono text-xs text-[var(--stderr)]" role="alert">
                    {errors.message.message}
                  </p>
                )}
              </div>
              {submitError && (
                <p className="font-mono text-xs text-[var(--stderr)]" role="alert">
                  {submitError}
                </p>
              )}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="min-h-11 cursor-pointer border border-[var(--phosphor-primary)] bg-[var(--bg-panel)] px-6 font-mono text-sm text-[var(--phosphor-primary)] disabled:opacity-50"
              >
                {isSubmitting ? "transmitting…" : "send →"}
              </motion.button>
            </form>
          )}
        </ModulePanel>
      </div>
    </div>
  );
}
