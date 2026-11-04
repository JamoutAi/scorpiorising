"use client";

import { useState, type CSSProperties } from "react";

/**
 * A password field with a Show/Hide toggle. A typo at sign-up locks people out
 * (seen in testing), so every password field lets you check what you typed.
 */
export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  className = "",
  minLength,
  autoComplete = "current-password",
  tone = "dark",
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  minLength?: number;
  autoComplete?: string;
  tone?: "dark" | "light";
  style?: CSSProperties;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} pr-16`}
        style={style}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-[0.12em]"
        style={{ color: tone === "dark" ? "#2ed79f" : "#1aa37c" }}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
