"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";

interface Profile {
  id: string;
  name?: string | null;
  email?: string | null;
  birth_date?: string | null;
  birth_place?: string | null;
  chart?: any;
  plan?: string;
  plan_status?: string;
  trial_ends_at?: string | null;
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redir=/settings");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase!
        .from("profiles")
        .select("id, name, email, birth_date, birth_place, chart, plan, plan_status, trial_ends_at")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(data);
      setName(data?.name || "");
    })();
  }, [user]);

  if (!user) return null;

  const isPaid = profile?.plan_status === "active" || profile?.plan_status === "trialing";
  const trialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;

  async function saveName() {
    if (!user) return;
    setSavingName(true);
    await supabase!.from("profiles").update({ name }).eq("id", user.id);
    setSavingName(false);
  }

  async function openPortal() {
    setPortalLoading(true);
    setPortalError("");
    try {
      const { data: sessionData } = await supabase!.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: token ? { authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else setPortalError("Billing management is unavailable right now — email support@scorpiorising.ai.");
    } catch {
      setPortalError("Something went wrong. Please try again or contact support.");
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const { data: sessionData } = await supabase!.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: token ? { authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("delete failed");
      await supabase!.auth.signOut();
      router.replace("/");
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
      alert("Something went wrong deleting your account. Please contact support.");
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f3ea" }}>
      <Nav />
      <Sidebar
        email={user.email ?? undefined}
        name={profile?.name ?? undefined}
        onSignOut={() => { supabase!.auth.signOut().then(() => router.replace("/")); }}
        active="Settings"
      />

      <main className="flex-1 lg:ml-60" style={{ background: "#f7f3ea" }}>
        <div className="mx-auto max-w-3xl px-5 py-12">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "#1aa37c" }}>Settings</p>
            <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: "clamp(2rem,4.5vw,2.8rem)", fontWeight: 300, color: "#17251f", lineHeight: 1.05 }}>
              Your account
            </h1>
          </div>

          {/* Membership */}
          <section className="card-cream mb-6 p-6">
            <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.6rem", fontWeight: 300, color: "#17251f" }}>Membership</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "rgba(31,200,150,0.08)" }}>
                <span style={{ color: "#17251f" }}>Plan</span>
                <span className="font-medium" style={{ color: "#1aa37c" }}>{isPaid ? "Member" : "Free"}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "rgba(31,200,150,0.08)" }}>
                <span style={{ color: "#17251f" }}>Status</span>
                <span className="font-medium" style={{ color: "#1aa37c" }}>
                  {profile?.plan_status === "trialing" && trialEnd
                    ? `Trial — ends ${trialEnd.toLocaleDateString()}`
                    : profile?.plan_status === "active"
                    ? "Active"
                    : "Not a member"}
                </span>
              </div>
            </div>
            <div className="mt-5">
              {isPaid ? (
                <button onClick={openPortal} disabled={portalLoading} className="btn-phosphor disabled:opacity-60">
                  {portalLoading ? "Opening…" : "Manage billing"}
                </button>
              ) : (
                <Link href="/pricing" className="btn-phosphor inline-block">
                  Upgrade to Member
                </Link>
              )}
              {portalError && <p className="mt-3 text-sm" style={{ color: "#b23a3a" }}>{portalError}</p>}
            </div>
          </section>

          {/* Account details */}
          <section className="card-cream mb-6 p-6">
            <h2 style={{ fontFamily: "var(--font-display), serif", fontSize: "1.6rem", fontWeight: 300, color: "#17251f" }}>Profile</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.14em]" style={{ color: "#9a948b" }}>Name</label>
                <div className="flex items-center gap-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 rounded-xl border px-4 py-2.5 text-sm"
                    style={{ borderColor: "rgba(23,37,31,0.15)", color: "#17251f", background: "#fffdf8" }}
                    placeholder="Your name"
                  />
                  <button onClick={saveName} disabled={savingName} className="rounded-full border px-4 py-2.5 text-sm font-medium transition hover:bg-black/5" style={{ borderColor: "rgba(23,37,31,0.15)", color: "#1aa37c" }}>
                    {savingName ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.14em]" style={{ color: "#9a948b" }}>Email</label>
                <p className="text-sm" style={{ color: "#3a4a43" }}>{user.email}</p>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.14em]" style={{ color: "#9a948b" }}>Birth chart</label>
                {profile?.chart ? (
                  <p className="text-sm" style={{ color: "#3a4a43" }}>
                    Sun in {profile.chart.sun}, Moon in {profile.chart.moon}, Rising {profile.chart.rising}.
                  </p>
                ) : (
                  <Link href="/journal" className="text-sm underline" style={{ color: "#1aa37c" }}>Set your chart</Link>
                )}
              </div>
            </div>
          </section>

          {/* Danger zone — tucked at the bottom, muted */}
          <section className="rounded-2xl p-6" style={{ border: "1px solid rgba(178,58,58,0.2)" }}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: "#b23a3a" }}>Close account</h2>
            <p className="mt-1 text-sm" style={{ color: "#7a756e" }}>
              Permanently delete your account and all your entries, reflections, and chart. This cannot be undone.
            </p>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="mt-4 rounded-full border px-5 py-2 text-sm font-medium transition hover:bg-black/5"
                style={{ borderColor: "rgba(178,58,58,0.4)", color: "#b23a3a" }}
              >
                Delete my account
              </button>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-sm" style={{ color: "#b23a3a" }}>Are you sure?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-full px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
                  style={{ background: "#b23a3a" }}
                >
                  {deleting ? "Deleting…" : "Yes, delete everything"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-full border px-5 py-2 text-sm font-medium transition hover:bg-black/5"
                  style={{ borderColor: "rgba(23,37,31,0.15)", color: "#17251f" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
