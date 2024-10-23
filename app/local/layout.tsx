import dynamic from "next/dynamic";
import { ReactNode } from "react";
const DynamicMarkerProvider = dynamic(() => import("@/contexts/MarkerContext").then((m) => m.MarkerProvider), {
  ssr: false,
});

export default function CentroLayout({ children }: { children: ReactNode }) {
  return <DynamicMarkerProvider>{children}</DynamicMarkerProvider>;
}
