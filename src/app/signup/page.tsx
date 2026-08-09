import { Suspense } from "react";
import { AuthForm, AuthShell } from "@/components/AuthForm";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <AuthShell title="Begin your journal.">
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthShell>
  );
}
