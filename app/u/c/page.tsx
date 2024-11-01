import { Metadata } from "next";
import SettingsPage from "./SettingsPage";

export const metadata: Metadata = {
  title: "Configurações",
};

export default async function Page() {
  // TODO: Protect this page via authentication

  return <SettingsPage />;
}
