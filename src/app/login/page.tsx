import { Suspense } from "react";
import { AuthForm, AuthShell } from "@/components/AuthForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back.">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}
