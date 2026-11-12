"use client";

export function Feedback({ error, success }: { error?: string | null; success?: string | null }) {
  if (error) return <p className="alert error" role="alert">{error}</p>;
  if (success) return <p className="alert success">{success}</p>;
  return null;
}

export function Badge({ status }: { status: string }) {
  return <span className={`badge ${status.toLowerCase()}`}>{status}</span>;
}

export function Loading({ loading }: { loading: boolean }) {
  return loading ? <p className="muted">Carregando…</p> : null;
}
