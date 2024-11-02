import { Metadata } from "next";
import SettingsPage from "./SettingsPage";
import { redirect } from "next/navigation";
import getSession from "@/lib/getSession";

export const metadata: Metadata = {
  title: "Configurações",
};

export default async function Page() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect("/api/auth/signin?callbackUrl=/u/config");
  }

  return <SettingsPage user={user} />;
}
