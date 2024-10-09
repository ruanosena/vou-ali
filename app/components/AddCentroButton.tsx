"use client";
import { useFormStatus } from "react-dom";

export function AddCentroButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="flex w-36 justify-center bg-blue-600 px-3 py-1.5 text-lg font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      {pending ? "Salvando..." : "Salvar"}
    </button>
  );
}
