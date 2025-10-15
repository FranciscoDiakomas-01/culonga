"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import UserCreater from "@/services/user/create";
import Link from "next/link";

export default function RecoveryForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [error, setError] = useState("");
  const router = useRouter();
  const [isLoad, setIsLoad] = useState(false);

  async function handelOnSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formdata = new FormData(e.currentTarget);
    const email = formdata.get("email") as string;
    if (!email) {
      setError("Preencha todos o email");
      setTimeout(() => {
        setError("");
      }, 2000);
    } else {
      setIsLoad(true);
      const createUser = new UserCreater();
      const signIn = await createUser.resetPassRequest(email);
      setTimeout(() => {
        setIsLoad(false);
      }, 1500);
      toast.info(
        Array.isArray(signIn.message)
          ? signIn.message[0]
          : signIn.message ?? "Erro ao criar conta"
      );
    }
  }
  return (
    <>
      <Toaster />
      <form
        onSubmit={handelOnSubmit}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Recuperação de conta</h1>
          <p className="text-muted-foreground text-sm ">
            Enviaremos para este email o link de redefinição de senha
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <footer className="grid md:grid-cols-2 gap-2">
            <Button type="submit" className="w-full">
              {isLoad ? <Loader2 className="animate-spin" /> : "Enviar"}
            </Button>

            <Button
              asChild
              variant={"outline"}
              type="button"
              className="w-full"
            >
              <Link href={"/"}>Voltar</Link>
            </Button>
          </footer>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              culonga
            </span>
          </div>
        </div>
        <div className="text-center text-sm">
          Ainda não possui uma conta ?{" "}
          <a href="/sigin" className="underline underline-offset-4">
            Criar conta
          </a>
        </div>
      </form>
    </>
  );
}
