"use client";

import { useState } from "react";
import AdminCard from "./AdminCard";
import AdminButton from "./AdminButton";
import AdminFormGroup from "./AdminFormGroup";
import AdminNotice from "./AdminNotice";
import { inputClass, requestJson } from "./admin-fields";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await requestJson("/api/admin/auth/login", "POST", { email, password });
      window.location.assign("/admin/blog");
    } catch (failure) {
      setPassword("");
      setError(failure.message);
      setBusy(false);
    }
  }

  return (
    <AdminCard title="Sign in" description="Use your individual Connect My Tours blog account.">
      <form onSubmit={submit} className="space-y-5">
        <AdminNotice message={error} />
        <AdminFormGroup label="Email" htmlFor="admin-email" required>
          <input id="admin-email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
        </AdminFormGroup>
        <AdminFormGroup label="Password" htmlFor="admin-password" required>
          <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
        </AdminFormGroup>
        <AdminButton type="submit" disabled={busy} className="w-full">{busy ? "Signing in…" : "Sign in"}</AdminButton>
      </form>
    </AdminCard>
  );
}
