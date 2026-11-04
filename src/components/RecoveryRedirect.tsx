"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Supabase password-reset links can land on the home page instead of /reset
 * (when the link's redirect isn't on the allow list, or when the one-time
 * token was already used — email scanners pre-open links). The outcome is in
 * the URL hash either way, so send it to /reset, which explains what to do.
 */
export function RecoveryRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === "/reset") return;
    const hash = window.location.hash || "";
    const query = window.location.search || "";
    const recovery = /type=recovery/.test(hash) || /type=recovery/.test(query);
    const authError = /error_code=|error=access_denied/.test(hash);
    if (recovery || authError) router.replace(`/reset${query}${hash}`);
  }, [pathname, router]);
  return null;
}
