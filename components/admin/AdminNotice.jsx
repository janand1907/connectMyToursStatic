export default function AdminNotice({ message, tone = "error" }) {
  if (!message) return null;
  const color = tone === "success" ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900";
  return <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${color}`}>{message}</p>;
}
