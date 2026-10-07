"use client";

import { useState } from "react";
import AdminButton from "./AdminButton";
import AdminNotice from "./AdminNotice";

export default function LogoutPanel() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/auth/logout", { method: "POST", credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error("Could not sign out. Please try again.");
      window.location.assign("/admin/login?loggedOut=1");
    } catch (failure) {
      setError(failure.message);
      setBusy(false);
    }
  }

  return <div className="space-y-4"><AdminNotice message={error} /><AdminButton onClick={signOut} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</AdminButton></div>;
}
