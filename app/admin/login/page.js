import LoginForm from "@/components/admin/LoginForm";
import AdminNotice from "@/components/admin/AdminNotice";

export const metadata = { title: "Blog admin sign in | Connect My Tours", robots: { index: false, follow: false } };

export default function LoginPage({ searchParams }) {
  return <div className="container-page flex min-h-[70vh] items-center justify-center pb-16 pt-28"><div className="w-full max-w-md space-y-5"><div><p className="text-xs font-bold uppercase tracking-widest text-primary-600">Connect My Tours</p><h1 className="font-display text-3xl font-bold text-primary-900">Blog admin</h1></div>{searchParams?.loggedOut === "1" && <AdminNotice message="You have signed out." tone="success" />}<LoginForm /></div></div>;
}
