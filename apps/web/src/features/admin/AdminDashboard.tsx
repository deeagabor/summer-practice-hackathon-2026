import { ShieldCheck, Siren, UsersRound } from "lucide-react";
import type { AuditRecord } from "@/server/data/store";

export function AdminDashboard({
  stats
}: Readonly<{
  stats: {
    users: number;
    organizers: number;
    admins: number;
    openEvents: number;
    suggestedEvents: number;
    conversations: number;
    auditLogs: AuditRecord[];
  };
}>) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminMetric icon={<UsersRound className="h-7 w-7" />} label="Users" value={stats.users} />
        <AdminMetric
          icon={<ShieldCheck className="h-7 w-7" />}
          label="Organizers"
          value={stats.organizers}
        />
        <AdminMetric
          icon={<ShieldCheck className="h-7 w-7" />}
          label="Admins"
          value={stats.admins}
        />
        <AdminMetric
          icon={<Siren className="h-7 w-7" />}
          label="Open events"
          value={stats.openEvents}
        />
        <AdminMetric
          icon={<Siren className="h-7 w-7" />}
          label="Suggested"
          value={stats.suggestedEvents}
        />
        <AdminMetric
          icon={<UsersRound className="h-7 w-7" />}
          label="Chats"
          value={stats.conversations}
        />
      </section>
      <aside className="rounded-lg border border-black/10 bg-white p-5 shadow-nav">
        <h2 className="text-xl font-black">Audit log</h2>
        <div className="mt-4 grid gap-3">
          {stats.auditLogs.map((record) => (
            <article className="rounded-lg bg-field p-3" key={record.id}>
              <p className="text-sm font-black">{record.action.replaceAll("_", " ")}</p>
              <p className="mt-1 text-xs font-bold text-slate-600">
                {record.entityType} · {record.entityId}
              </p>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}

function AdminMetric({
  icon,
  label,
  value
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: number;
}>) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-5 shadow-nav">
      <div className="flex items-center justify-between text-court">
        {icon}
        <span className="text-4xl font-black text-ink">{value}</span>
      </div>
      <p className="mt-5 text-sm font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
    </article>
  );
}
