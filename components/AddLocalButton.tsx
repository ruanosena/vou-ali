"use client";
import { useMarker } from "@/contexts/MarkerContext";
import { useSession } from "next-auth/react";
import { useFormStatus } from "react-dom";

export function AddLocalButton() {
  const { pending } = useFormStatus();
  const { requesting } = useMarker();
  const session = useSession();

  return (
    <button
      type="submit"
      className="inline-block w-72 rounded-md bg-indigo-600 px-3 py-2 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:hover:bg-gray-600"
      disabled={requesting || pending || session.status === "loading"}
    >
      {pending ? "Enviando..." : "Enviar"}
    </button>
  );
}
