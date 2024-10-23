import { cn } from "@/lib/utils";
import { PesquisaTipo } from "@/types";
import { LucideProps, MapPin, Pin } from "lucide-react";

interface Props extends LucideProps {
  tipo: PesquisaTipo;
}

export default function SearchResultIcon({ tipo, className, ...props }: Props) {
  if (tipo === "Local") {
    return <MapPin className={cn("size-5 text-input group-hover:text-primary/80", className)} {...props} />;
  } else if (tipo === "Endereco") {
    return <Pin className={cn("size-5 text-input group-hover:text-primary/80", className)} {...props} />;
  } else return null;
}
