"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function ReadingPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      router.replace("/pricing");
      return;
    }
    supabase!.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/pricing");
    });
  }, [router]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-ink-deep px-5">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-mint">One moment…</p>
        <p className="mt-3 text-paper/70">
          Your journal opens after you start your free trial.{" "}
          <Link href="/pricing" className="text-mint underline">
            See plans
          </Link>
        </p>
      </div>
    </main>
  );
}
