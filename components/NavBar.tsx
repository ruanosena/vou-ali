import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { auth } from "@/auth";

export default async function NavBar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-[2000000001] bg-secondary-foreground px-3 shadow-sm">
      <nav className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between gap-3">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-0.5 whitespace-nowrap font-mono text-xl font-semibold text-secondary",
            "bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-55% to-emerald-500 to-90% bg-clip-text text-transparent",
          )}
        >
          <Image src="/logo.png" width={32} height={32} alt="Logo" />
          Vou alí
        </Link>
      </nav>
    </header>
  );
}
