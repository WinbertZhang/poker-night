"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const params = useSearchParams();
  const error = params.get("error");
  const callbackUrl = params.get("callbackUrl") ?? "/";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 space-y-6"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div className="text-center space-y-2">
          <div className="text-4xl" style={{ color: "var(--accent-blue)" }}>♠</div>
          <h1
            className="text-lg font-semibold tracking-widest"
            style={{ color: "var(--foreground)", letterSpacing: "0.12em" }}
          >
            POKER NIGHTS
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Sign in to continue
          </p>
        </div>

        {error === "AccessDenied" && (
          <p
            className="text-xs text-center rounded-lg px-3 py-2"
            style={{
              color: "#fca5a5",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            Your account isn't on the guest list.
          </p>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2.5"
          style={{
            background: "linear-gradient(135deg, rgba(94,106,210,0.8), rgba(168,85,247,0.7))",
            border: "1px solid rgba(94,106,210,0.4)",
            color: "#fff",
            boxShadow: "0 0 24px rgba(94,106,210,0.25)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" opacity=".9"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".8"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff" opacity=".8"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity=".9"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
