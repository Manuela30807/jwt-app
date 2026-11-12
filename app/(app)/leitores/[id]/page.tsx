"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Feedback, Loading } from "@/components/ui";
import { useApi } from "@/lib/client";
import { fmtDate, fmtMoney } from "@/lib/format";
import type { Loan, Reader } from "@/lib/types";

export default function LeitorHistoricoPage() {
  const { id } = useParams<{ id: string }>();
  const reader = useApi<Reader>(`readers/${id}`);
  const loans = useApi<Loan[]>(`readers/${id}/loans`);

  return (
    <section>
      <p><Link href="/leitores" className="btn-link">← Leitores</Link></p>
      <h1>Histórico de {reader.data?.name ?? "leitor"}</h1>
      <Feedback error={reader.error || loans.error} />
      <Loading loading={loans.loading} />
      {loans.data && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Livro</th><th>Retirada</th><th>Prazo</th><th>Devolução</th><th>Status</th><th>Multa</th></tr>
            </thead>
            <tbody>
              {loans.data.length === 0 && <tr><td colSpan={6} className="muted">Nenhum empréstimo.</td></tr>}
              {loans.data.map((l) => (
                <tr key={l.id}>
                  <td>{l.book?.title}</td>
                  <td>{fmtDate(l.loanDate)}</td>
                  <td>{fmtDate(l.dueDate)}</td>
                  <td>{fmtDate(l.returnDate)}</td>
                  <td><Badge status={l.status} /></td>
                  <td>{fmtMoney(l.currentFine ?? l.fine)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
