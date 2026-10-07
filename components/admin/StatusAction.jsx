"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminButton from "./AdminButton";
import { requestJson } from "./admin-fields";

export default function StatusAction({ kind, id, status, label, variant = "secondary" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function change() {
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/admin/blog/${kind}/${id}`, "PATCH", { status });
      router.refresh();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <span className="inline-flex flex-col gap-1"><AdminButton variant={variant} onClick={change} disabled={busy}>{busy ? "Saving…" : label}</AdminButton>{error && <span role="alert" className="text-xs text-red-700">{error}</span>}</span>;
}
