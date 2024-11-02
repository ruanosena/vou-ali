import { Metadata } from "next";
import SettingsPage from "./SettingsPage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Configurações",
};

export default async function Page() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/api/auth/signin?callbackUrl=/u/config");
  }

  return <SettingsPage user={user} />;
}
