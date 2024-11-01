import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MapsAPI } from "../components/MapsAPI";
import { GeoProvider } from "@/contexts/GeoContext";
import { SessionProvider } from "next-auth/react";
import NavBar from "@/components/NavBar";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Vou alí",
  description:
    "Vou alí é a sua comunidade para descobrir lugares incríveis, indicados por pessoas que você conhece e confia. Encontre os lugares mais originais e autênticos da sua cidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <MapsAPI>
        <GeoProvider>
          <SessionProvider>
            <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
              <NavBar />
              <main className="min-h-screen">{children}</main>
              <footer className="p-2 text-center">
                Feito com &#x2763; por{" "}
                <a className="underline underline-offset-2" target="_blank" href="https://github.com/ruanosena">
                  ruanosena
                </a>
              </footer>
              <Toaster />
            </body>
          </SessionProvider>
        </GeoProvider>
      </MapsAPI>
    </html>
  );
}
