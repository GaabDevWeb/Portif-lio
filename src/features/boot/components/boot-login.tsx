"use client";

import { useEffect, useRef, useState } from "react";

import { SYSTEM } from "@/constants/system";
import { animateLoginFade } from "@/animations/boot/boot-timeline";
import { MOTION_IDS } from "@/animations/motion-ids";

interface BootLoginProps {
  onLogin: (username: string) => void;
}

export function BootLogin({ onLogin }: BootLoginProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      animateLoginFade(containerRef.current);
    }
  }, []);

  const submit = () => {
    const username = input.trim().toLowerCase();
    if (!username) {
      setError("login: username required");
      return;
    }
    if (username !== SYSTEM.defaultUser) {
      setError(`login: unknown user '${username}' — try 'guest'`);
      return;
    }
    onLogin(username);
  };

  return (
    <div
      className="fixed inset-0 z-[50] flex items-center justify-center bg-[var(--bg-void)] p-6"
      data-motion-id={MOTION_IDS.bootLoginFade}
    >
      <div
        ref={containerRef}
        className="w-full max-w-xl rounded-sm border border-[var(--ui-border)] bg-[var(--bg-terminal)] p-6 font-mono text-[var(--phosphor-primary)]"
      >
        <p className="text-[var(--phosphor-dim)]">{SYSTEM.hostname} login:</p>
        <label className="mt-4 block">
          <span className="sr-only">Username</span>
          <input
            autoFocus
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
            placeholder="guest"
            className="mt-2 w-full border border-[var(--ui-border)] bg-[var(--bg-void)] px-3 py-2 text-[var(--phosphor-primary)] outline-none focus:ring-2 focus:ring-[var(--phosphor-primary)]"
            aria-describedby={error ? "login-error" : undefined}
          />
        </label>
        {error && (
          <p id="login-error" className="mt-2 text-sm text-[var(--stderr)]" role="alert">
            {error}
          </p>
        )}
        <p className="mt-4 text-xs text-[var(--phosphor-dim)]">
          Press Enter to continue as guest.
        </p>
      </div>
    </div>
  );
}
