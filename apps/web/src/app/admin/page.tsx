import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { getCurrentUser } from "@/server/auth/session";
import { getAdminDashboard } from "@/server/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user?.roles.includes("admin")) {
    return (
      <PageShell title="Admin">
        <div className="max-w-md rounded-lg border border-black/10 bg-white p-5 shadow-nav">
          <p className="text-sm font-semibold text-slate-700">Admin access is protected.</p>
          <Link
            className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-black text-white"
            href="/login"
          >
            Log in
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Admin">
      <AdminDashboard stats={getAdminDashboard()} />
    </PageShell>
  );
}
