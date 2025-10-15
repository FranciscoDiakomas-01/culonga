"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import UserCreater from "@/services/user/create";
import UserGetter from "@/services/user/get";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isLoad, setIsLoad] = useState(false);

  async function handelOnSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formdata = new FormData(e.currentTarget);
    const email = formdata.get("email") as string;
    const password = formdata.get("password") as string;
    if (!password || !email) {
      setError("Preencha todos os campos");
      setTimeout(() => {
        setError("");
      }, 2000);
    } else {
      setIsLoad(true);
      const createUser = new UserCreater();
      const signIn = (await createUser.login({
        email,
        password,
      })) as {
        message: string;
        token: string;
        status: boolean;
        description: string;
      };
      setTimeout(() => {
        setIsLoad(false);
      }, 1500);
      if (signIn.token.length > 0) {
        localStorage.setItem("token", signIn.token);
        router.push("/dashboard");
        return;
      }
      toast.info(
        Array.isArray(signIn.message)
          ? signIn.message[0]
          : signIn.message ?? "Erro ao acessar conta"
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
          <h1 className="text-2xl font-bold">Entre na sua conta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Adicione seus dados abaixo para acessar sua conta
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
          <div className="grid gap-3 relative">
            <div className="flex items-center">
              <Label htmlFor="password">Senha</Label>
              <a
                href="/recovery"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Esqueceu a senha ?
              </a>
            </div>
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
          <p className="text-sm text-red-500 -my-3 lg:text-center">{error}</p>
          <Button type="submit" className="w-full">
            {isLoad ? <Loader2 className="animate-spin" /> : "Acessar conta"}
          </Button>
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
