import Link from "next/link";
import AdminCard from "@/components/admin/AdminCard";
import LogoutPanel from "@/components/admin/LogoutPanel";

export const metadata = { title: "Sign out | Connect My Tours", robots: { index: false, follow: false } };

export default function LogoutPage() {
  return <div className="container-page flex min-h-[70vh] items-center justify-center pb-16 pt-28"><div className="w-full max-w-md"><AdminCard title="Sign out" description="End this admin session on this device."><div className="space-y-4"><LogoutPanel /><Link href="/admin/blog" className="inline-block text-sm text-primary-700 underline">Back to blog admin</Link></div></AdminCard></div></div>;
}
