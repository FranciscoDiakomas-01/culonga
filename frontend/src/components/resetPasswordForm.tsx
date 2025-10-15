"use client";
import { cn, validateInternationalPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useEffect, useState } from "react";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import UserCreater from "@/services/user/create";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
export function ResetPassWordForm({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isLoad, setIsLoad] = useState(false);
  async function handelOnSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formdata = new FormData(e.currentTarget);
    const password = formdata.get("password") as string;
    const confirmPassword = formdata.get("password1") as string;

    if (!password || !confirmPassword) {
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
      setIsLoad(true);
      const createUser = new UserCreater();
      const signIn = await createUser.resetPassword({
        password,
        token,
      });

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
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
  }, []);
  return (
    <>
      <Toaster />
      <form onSubmit={handelOnSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Redefinir senha</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Recupere a senha da sua conta da{" "}
            <strong className="text-orange-500">culonga</strong>
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3 relative">
            <Label htmlFor="password">Nova Senha</Label>
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
          <p className="text-sm text-red-500 -my-3 lg:text-center">{error}</p>
          <Button type="submit" className="w-full  place-self-center">
            {isLoad ? <Loader2 className="animate-spin" /> : "Redefinir senha"}
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
      </form>
    </>
  );
}
