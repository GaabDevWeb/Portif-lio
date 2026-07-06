/**
 * ROOT OS analytics — lightweight event bus.
 * Events follow masterplan §7 naming: boot_complete, cmd_*, app_open_*, etc.
 */

export type AnalyticsEventName =
  | "boot_complete"
  | "login_guest"
  | "fastboot_skip"
  | "shutdown_complete"
  | "contact_submit"
  | `cmd_${string}`
  | `app_open_${string}`
  | `easter_egg_${string}`;

export interface AnalyticsPayload {
  event: AnalyticsEventName;
  timestamp: number;
  sessionId?: string;
  props?: Record<string, string | number | boolean>;
}

const SESSION_KEY = "rootos:analytics-session";

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

function getEndpoint(): string | undefined {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
}

export function track(
  event: AnalyticsEventName,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;

  const payload: AnalyticsPayload = {
    event,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    props,
  };

  if (process.env.NODE_ENV === "development") {
    console.debug("[rootos:analytics]", payload);
  }

  window.dispatchEvent(
    new CustomEvent("rootos:analytics", { detail: payload }),
  );

  const endpoint = getEndpoint();
  if (endpoint) {
    try {
      navigator.sendBeacon(
        endpoint,
        JSON.stringify(payload),
      );
    } catch {
      // fail silently — analytics must not break UX
    }
  }
}

export function trackCommand(commandName: string): void {
  track(`cmd_${commandName}` as AnalyticsEventName);
}

export function trackAppOpen(appId: string): void {
  track(`app_open_${appId}` as AnalyticsEventName);
}

export function trackEasterEgg(id: string): void {
  track(`easter_egg_${id}` as AnalyticsEventName);
}
