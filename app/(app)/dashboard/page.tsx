"use client";

import { useSession } from "@/components/SessionProvider";
import { Feedback, Loading } from "@/components/ui";
import { useApi } from "@/lib/client";
import { fmtMoney } from "@/lib/format";
import type { Book, DashboardData, Loan } from "@/lib/types";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card stat">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}

function AdminDashboard() {
  const { data, error, loading } = useApi<DashboardData>("reports/dashboard");
  return (
    <>
      <Loading loading={loading} />
      <Feedback error={error} />
      {data && (
        <div className="grid">
          <Stat label="Livros (títulos)" value={data.totalBooks} />
          <Stat label="Exemplares disponíveis" value={`${data.availableCopies} / ${data.totalCopies}`} />
          <Stat label="Empréstimos ativos" value={data.activeLoans} />
          <Stat label="Empréstimos atrasados" value={data.overdueLoans} />
          <Stat label="Multas cobradas" value={fmtMoney(data.totalFines)} />
          <Stat label="Multas a receber (atrasados)" value={fmtMoney(data.pendingFines)} />
        </div>
      )}
    </>
  );
}

function AttendantDashboard() {
  const books = useApi<Book[]>("books");
  const active = useApi<Loan[]>("loans?status=ATIVO");
  const late = useApi<Loan[]>("loans?status=ATRASADO");
  const error = books.error || active.error || late.error;
  return (
    <>
      <Feedback error={error} />
      <div className="grid">
        <Stat label="Livros (títulos)" value={books.data?.length ?? "…"} />
        <Stat label="Empréstimos ativos" value={active.data?.length ?? "…"} />
        <Stat label="Empréstimos atrasados" value={late.data?.length ?? "…"} />
      </div>
    </>
  );
}

export default function DashboardPage() {
  const user = useSession();
  return (
    <section>
      <h1>Olá, {user.name}</h1>
      {user.isAdmin ? <AdminDashboard /> : <AttendantDashboard />}
    </section>
  );
}
