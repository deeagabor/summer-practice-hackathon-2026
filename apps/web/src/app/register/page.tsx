import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { AuthForm } from "@/features/auth/AuthForm";

export default function RegisterPage() {
  return (
    <PageShell title="Create account">
      <div className="max-w-md">
        <AuthForm mode="register" />
        <p className="mt-4 text-sm font-semibold text-slate-600">
          Already have an account?{" "}
          <Link className="font-black text-ink underline" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
