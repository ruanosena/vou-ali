import dynamic from "next/dynamic";
import { ReactNode } from "react";
const DynamicOGContextProvider = dynamic(
  () => import("@/contexts/overlayGeometryContext").then((m) => m.OverlayGeometryProvider),
  { ssr: false },
);

export default function CentroLayout({ children }: { children: ReactNode }) {
  return <DynamicOGContextProvider>{children}</DynamicOGContextProvider>;
}
