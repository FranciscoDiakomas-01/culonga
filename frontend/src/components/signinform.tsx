"use client";
import { cn, validateInternationalPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState } from "react";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import UserCreater from "@/services/user/create";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import UserGetter from "@/services/user/get";
export function SignForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [showPutCode, setShowPutCode] = useState(false);
  const [isLoad, setIsLoad] = useState(false);
  async function handelOnSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formdata = new FormData(e.currentTarget);
    const name = formdata.get("name") as string;
    const lastname = formdata.get("lastname") as string;
    const code = formdata.get("code") as string;
    const email = formdata.get("email") as string;
    let telefone = formdata.get("telefone") as string;
    const password = formdata.get("password") as string;
    const confirmPassword = formdata.get("password1") as string;
    if (showPutCode) {
      if (!code) {
        toast.warning("Preenche os dados");
        return;
      }
      setIsLoad(true);
      const getter = new UserGetter();
      const res = await getter.getMyToken(code);
      if (res?.found && res?.token?.length > 0) {
        localStorage.setItem("token", res?.token);
        router.push("/dashboard");
      } else {
        toast.warning(res.message);
      }
      setIsLoad(false);
      return;
    } else {
      if (!telefone.startsWith("+244")) {
        telefone = `+244${telefone}`;
      }
      if (
        !name ||
        !lastname ||
        !telefone ||
        !password ||
        !confirmPassword ||
        !email
      ) {
        setError("Preencha todos os campos");
        setTimeout(() => {
          setError("");
        }, 2000);
      } else if (password != confirmPassword) {
        setError("As senhas não combinam");
        setTimeout(() => {
          setError("");
        }, 2000);
      } else {
      }
      setIsLoad(true);
      const createUser = new UserCreater();
      const signIn = await createUser.sigIn({
        email,
        lastname,
        name,
        password,
        telefone,
      });
      setTimeout(() => {
        setIsLoad(false);
      }, 1500);
      console.log(signIn);
      if (signIn?.token.length > 0) {
        localStorage.setItem("token", signIn?.token);
        router.push("/dashboard");
        return;
      } else {
        toast.info("Erro ao criar conta", {
          description: "Email e telefone podem estar em uso",
        });
      }
    }
  }
  return (
    <form
      onSubmit={handelOnSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <Toaster />
      <>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Entre na sua conta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Adicione seu e-mail abaixo para criar sua conta
          </p>
        </div>
        <div className="grid gap-6">
          <span className="grid gap-6 w-full lg:grid-cols-2">
            <div className="grid gap-3">
              <Label htmlFor="text">Nome</Label>
              <Input
                id="text"
                name="name"
                type="text"
                placeholder="seu nome"
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="text">Sobrenome</Label>
              <Input
                id="text"
                name="lastname"
                type="text"
                placeholder="seu sobrenome"
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="tel">Telefone</Label>
              <Input
                id="tel"
                name="telefone"
                type="tel"
                placeholder="xxxxxxx"
                required
                maxLength={9}
              />
            </div>
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
            <div className="grid gap-3 relative">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                placeholder="*******"
                type={showPassword ? "text" : "password"}
                required
                name="password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute  bottom-2 right-2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="grid gap-3 relative">
              <Label htmlFor="password1">Confirma senha</Label>
              <Input
                id="password1"
                onPaste={(e) => {
                  e.preventDefault();
                }}
                placeholder="*******"
                type={showPassword ? "text" : "password"}
                required
                name="password1"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute bottom-2 right-2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </span>
          <p className="text-sm text-red-500 -my-3 lg:text-center">{error}</p>
          <Button type="submit" className="w-full lg:w-[50%] place-self-center">
            {isLoad ? <Loader2 className="animate-spin" /> : "Criar conta"}
          </Button>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              culonga
            </span>
          </div>
        </div>
        <div className="text-center text-sm">
          Ja tem uma conta ?{" "}
          <a href="/" className="underline underline-offset-4">
            Acessar conta
          </a>
        </div>
      </>
    </form>
  );
}
