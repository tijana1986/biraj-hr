import * as Sentry from "@sentry/react";

export function initializeSentry() {
  if (typeof window === "undefined") return;

  const environment = import.meta.env.MODE;
  const isDevelopment = environment === "development";

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment,
    enabled: !isDevelopment && !!import.meta.env.VITE_SENTRY_DSN,
    tracesSampleRate: isDevelopment ? 1.0 : 0.1,
    release: import.meta.env.VITE_APP_VERSION || "unknown",
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    replaySessionSampleRate: 0.1,
    replayOnErrorSampleRate: 1.0,
  });
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  Sentry.captureException(error, { contexts: { custom: context } });
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (typeof window === "undefined") return;
  Sentry.captureMessage(message, level);
}

export function setUserContext(userId?: string, email?: string) {
  if (typeof window === "undefined") return;
  if (userId) {
    Sentry.setUser({ id: userId, email });
  } else {
    Sentry.setUser(null);
  }
}
