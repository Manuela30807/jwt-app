import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { SessionProvider } from "@/components/SessionProvider";
import { getSessionUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/");

  return (
    <SessionProvider user={user}>
      <Nav />
      <main className="container">{children}</main>
    </SessionProvider>
  );
}
