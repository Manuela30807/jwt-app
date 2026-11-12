"use client";

import { useState } from "react";
import { Badge, Feedback, Loading } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { fmtCpf, fmtDate, fmtMoney } from "@/lib/format";
import type { Book, Loan, Reader } from "@/lib/types";

export default function EmprestimosPage() {
  const [status, setStatus] = useState("");
  const loans = useApi<Loan[]>(`loans${status ? `?status=${status}` : ""}`);

  const [readerQuery, setReaderQuery] = useState("");
  const [bookQuery, setBookQuery] = useState("");
  const readers = useApi<Reader[]>(`readers?name=${encodeURIComponent(readerQuery)}`);
  const books = useApi<Book[]>(`books?available=true&title=${encodeURIComponent(bookQuery)}`);
  const [readerId, setReaderId] = useState("");
  const [bookId, setBookId] = useState("");

  const [msg, setMsg] = useState<{ error?: string; success?: string }>({});

  async function createLoan(e: React.FormEvent) {
    e.preventDefault();
    try {
      const loan = await api<Loan>("loans", {
        method: "POST",
        body: { readerId: Number(readerId), bookId: Number(bookId) },
      });
      setMsg({ success: `Empréstimo registrado. Devolver até ${fmtDate(loan.dueDate)}.` });
      setBookId("");
      loans.reload();
      books.reload();
    } catch (err) {
      setMsg({ error: (err as Error).message });
    }
  }

  async function giveBack(loan: Loan) {
    try {
      const done = await api<Loan>(`loans/${loan.id}/return`, { method: "PATCH" });
      setMsg({
        success: done.fine > 0
          ? `Devolução registrada. Multa a cobrar: ${fmtMoney(done.fine)}.`
          : "Devolução registrada sem multa.",
      });
      loans.reload();
      books.reload();
    } catch (err) {
      setMsg({ error: (err as Error).message });
    }
  }

  return (
    <section>
      <h1>Empréstimos</h1>
      <Feedback {...msg} />

      <form className="card form" onSubmit={createLoan}>
        <h2>Novo empréstimo</h2>
        <div className="row">
          <div className="form" style={{ flex: 1 }}>
            <input placeholder="Buscar leitor por nome…" value={readerQuery} onChange={(e) => setReaderQuery(e.target.value)} />
            <select required size={4} value={readerId} onChange={(e) => setReaderId(e.target.value)}>
              {readers.data?.map((r) => <option key={r.id} value={r.id}>{r.name} — {fmtCpf(r.cpf)}</option>)}
            </select>
          </div>
          <div className="form" style={{ flex: 1 }}>
            <input placeholder="Buscar livro disponível por título…" value={bookQuery} onChange={(e) => setBookQuery(e.target.value)} />
            <select required size={4} value={bookId} onChange={(e) => setBookId(e.target.value)}>
              {books.data?.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} disp.)</option>)}
            </select>
          </div>
        </div>
        <div><button className="btn-unipar" type="submit" disabled={!readerId || !bookId}>Registrar empréstimo</button></div>
      </form>

      <div className="page-head">
        <h2>Lista</h2>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="ATIVO">Ativos</option>
          <option value="ATRASADO">Atrasados</option>
          <option value="DEVOLVIDO">Devolvidos</option>
        </select>
      </div>

      <Loading loading={loans.loading} />
      <Feedback error={loans.error} />
      {loans.data && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Livro</th><th>Leitor</th><th>Retirada</th><th>Prazo</th><th>Devolução</th><th>Status</th><th>Multa</th><th></th></tr>
            </thead>
            <tbody>
              {loans.data.length === 0 && <tr><td colSpan={8} className="muted">Nenhum empréstimo.</td></tr>}
              {loans.data.map((l) => (
                <tr key={l.id}>
                  <td>{l.book?.title}</td>
                  <td>{l.reader?.name}</td>
                  <td>{fmtDate(l.loanDate)}</td>
                  <td>{fmtDate(l.dueDate)}</td>
                  <td>{fmtDate(l.returnDate)}</td>
                  <td><Badge status={l.status} /></td>
                  <td>{fmtMoney(l.currentFine ?? l.fine)}</td>
                  <td>{!l.returnDate && <button className="btn-link" onClick={() => giveBack(l)}>Devolver</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
