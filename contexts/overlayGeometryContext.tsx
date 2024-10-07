"use client";
import { Overlay, Snapshot } from "@/types/maps";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type OverlayGeometryProviderProps = {
  children: ReactNode;
  storageKey?: string;
};

interface OverlayGeometryProviderState {
  snapshots: Snapshot[];
  overlays: Overlay[];
  setOverlays: (overlays: Overlay[]) => void;
}

const initialState: OverlayGeometryProviderState = {
  snapshots: [],
  overlays: [],
  setOverlays: () => null,
};

const OverlayGeometryProviderContext = createContext<OverlayGeometryProviderState>(initialState);

export function OverlayGeometryProvider({
  children,
  storageKey = "@ruanosena:areas-state-0.1.0",
  ...props
}: OverlayGeometryProviderProps) {
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) ?? "");
      return data;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (overlays.length) {
      const snapshots = overlays.map((o) => o.snapshot);
      localStorage.setItem(storageKey, JSON.stringify(snapshots, null, 2));
      setSnapshots(snapshots);
    }
  }, [overlays]);

  const value = {
    snapshots,
    overlays,
    setOverlays,
  };

  return (
    <OverlayGeometryProviderContext.Provider {...props} value={value}>
      {children}
    </OverlayGeometryProviderContext.Provider>
  );
}

export const useOverlayGeometry = () => {
  const context = useContext(OverlayGeometryProviderContext);

  if (context === undefined) throw new Error("useOverlayGeometry must be used within a OverlayGeometryProvider");

  return context;
};
