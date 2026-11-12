"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/logout";
import { useSession } from "@/components/SessionProvider";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/livros", label: "Livros" },
  { href: "/categorias", label: "Categorias" },
  { href: "/autores", label: "Autores" },
  { href: "/leitores", label: "Leitores" },
  { href: "/emprestimos", label: "Empréstimos" },
];

export default function Nav() {
  const user = useSession();
  const pathname = usePathname();
  const items = user.isAdmin ? [...links, { href: "/atendentes", label: "Atendentes" }] : links;

  return (
    <header className="topbar">
      <strong className="brand">Biblioteca</strong>
      <nav>
        {items.map((l) => (
          <Link key={l.href} href={l.href} className={pathname.startsWith(l.href) ? "active" : ""}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="user">
        <span>
          {user.name} <small>({user.isAdmin ? "administrador" : "atendente"})</small>
        </span>
        <form action={logout}>
          <button type="submit" className="btn-light">Sair</button>
        </form>
      </div>
    </header>
  );
}
