export const inputClass = "w-full rounded-xl border border-neutral-100 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 aria-invalid:border-red-500";
export const selectClass = inputClass;
export const textareaClass = `${inputClass} min-h-24 resize-y`;

export function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 160);
}

export async function requestJson(url, method, data) {
  const response = await fetch(url, { method, credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), cache: "no-store" });
  let body;
  try { body = await response.json(); } catch { throw new Error("The server returned an unexpected response."); }
  if (!response.ok) {
    const error = new Error(body.error || "The request failed.");
    error.fields = body.fields || {};
    error.status = response.status;
    throw error;
  }
  return body;
}
