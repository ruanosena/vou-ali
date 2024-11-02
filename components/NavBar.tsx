"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import UserButton from "./UserButton";
import { signIn, useSession } from "next-auth/react";

export default function NavBar() {
  const session = useSession();
  const user = session.data?.user;

  return (
    <header className="sticky top-0 z-[2000000001] bg-secondary-foreground px-3 shadow-sm">
      <nav className="container mx-auto flex h-12 items-center justify-between gap-3">
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

        {user && <UserButton user={user} />}
        {!user && session.status !== "loading" && <SignInButton />}
      </nav>
    </header>
  );
}

function SignInButton() {
  return (
    <Button className="text-base" size="lg" onClick={() => signIn()}>
      Entrar
    </Button>
  );
}
