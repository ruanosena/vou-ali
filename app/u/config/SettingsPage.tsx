"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UpdateProfileValues, updateProfileSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateProfile } from "./actions";
import { User } from "next-auth";
import { useSession } from "next-auth/react";

interface ConfigPageProps {
  user: User;
}

export default function ConfigPage({ user }: ConfigPageProps) {
  const { toast } = useToast();

  const session = useSession();

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name ?? "" },
  });

  async function onSubmit(data: UpdateProfileValues) {
    try {
      await updateProfile(data);
      toast({ description: "Profile updated." });
      session.update();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "An error occurred. Please try again.",
      });
    }
  }

  return (
    <main className="px-3 py-10">
      <section className="mx-auto max-w-7xl space-y-6">
        <h1 className="text-xl font-semibold leading-7 text-gray-900">Configurações</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-sm space-y-2.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Nome</FormLabel>
                  <FormControl>
                    <Input className="text-base" placeholder="Digite um nome de usuário" {...field} />
                  </FormControl>
                  <FormDescription className="text-base">Seu nome público.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button size="lg" type="submit" disabled={form.formState.isSubmitting}>
              Enviar
            </Button>
          </form>
        </Form>
      </section>
    </main>
  );
}
