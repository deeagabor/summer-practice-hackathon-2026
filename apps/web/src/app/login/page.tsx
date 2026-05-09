import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { AuthForm } from "@/features/auth/AuthForm";

export default function LoginPage() {
  return (
    <PageShell title="Log in">
      <div className="max-w-md">
        <AuthForm mode="login" />
        <p className="mt-4 text-sm font-semibold text-slate-600">
          New here?{" "}
          <Link className="font-black text-ink underline" href="/register">
            Create an account
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
