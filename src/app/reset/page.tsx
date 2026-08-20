"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { AuthShell } from "@/components/AuthForm";

export default function ResetPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    // Supabase lands here with a recovery code in the URL; getSession() resolves it.
    supabase!.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else {
        setStatus("error");
        setMsg("This reset link is invalid or has expired. Request a new one from the sign-in page.");
      }
    });
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    setStatus("loading");
    try {
      const { error } = await supabase!.auth.updateUser({ password });
      if (error) {
        setStatus("error");
        setMsg(error.message);
        return;
      }
      setStatus("done");
      setTimeout(() => router.push("/journal"), 1200);
    } catch {
      setStatus("error");
      setMsg("Something went wrong. Please try again.");
    }
  }

  return (
    <AuthShell title="Reset your password">
      {!ready && status !== "done" ? (
        <p className="text-sm" style={{ color: "#cdc5b1" }}>
          {msg || "Opening your reset link…"}
        </p>
      ) : status === "done" ? (
        <p className="text-sm" style={{ color: "#2ed79f" }}>
          Password updated. Taking you to your journal…
        </p>
      ) : (
        <form onSubmit={onSave} className="space-y-4">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min 6 characters)"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-paper outline-none placeholder:text-paper/40 focus:border-mint/50"
          />
          {status === "error" && <p className="text-sm text-red-400">{msg}</p>}
          <button type="submit" disabled={status === "loading"} className="btn-phosphor w-full">
            {status === "loading" ? "…" : "Set new password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
