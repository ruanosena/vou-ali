"use client";
import { ControlPanel } from "@/app/components/ControlPanel";
import { DrawingMap } from "@/app/components/DrawingMap";
import { useOverlayGeometry } from "@/contexts/overlayGeometryContext";
import { notFound } from "next/navigation";
import { Fragment, useState } from "react";

export default function AddCentro() {
  if (process.env.NODE_ENV === "production") {
    return notFound();
  }
  const { snapshots: areas } = useOverlayGeometry();
  const [isEditing, setIsEditing] = useState(!areas.length);

  return isEditing ? (
    <Fragment>
      <DrawingMap className="max-h-[calc(100vh_-_6rem)]" />
      <ControlPanel />
    </Fragment>
  ) : (
    <div>
      <span>Check areas before creating</span>
      <button onClick={() => setIsEditing(true)}>Edit Areas</button>
    </div>
  );
}
