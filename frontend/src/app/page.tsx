"use client";

import { LoginForm } from "@/components/loginforn";
import img from "@/assets/images/login.jpeg";
import img1 from "@/assets/images/logo.png";
import img2 from "@/assets/images/logo.jpeg";;
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/utils";
import UserGetter from "@/services/user/get";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const usrservice = new UserGetter();
  const [logo, setLogo] = useState(img1);
  const [load, stLoad] = useState(true);

  useEffect(() => {
    if (theme == "dark") {
      setLogo(img2);
    }
    const token = localStorage.getItem("token");
    async function Init(token: string) {
      const decodedToken = decodeToken(token);
      if (
        (decodedToken && decodedToken?.role.toUpperCase() == "ADMIN") ||
        decodedToken?.role.toUpperCase() == "SELLER"
      ) {
        const res = await usrservice.getMyData(token);
        console.log(res);
        if (!res.data) {
        }
        router.push("/dashboard");
        return;
      } else {
        localStorage.clear();
        sessionStorage.clear();
      }

      setTimeout(() => {
        stLoad(false);
      }, 1000);
    }
    if (!token) {
      localStorage.clear();
      sessionStorage.clear();
      stLoad(false);
      return;
    } else {
      Init(token);
    }
  }, []);
  return (
    <>
      {load ? (
        <main className="w-full h-screen flex justify-center items-center">
          <Loader2 className="animate-spin" />
        </main>
      ) : (
        <div className="grid min-h-svh lg:grid-cols-2">
          <div className="flex flex-col gap-4 p-6 md:p-10">
            <div className="flex justify-center gap-2  md:justify-start">
              <a href="#" className="flex items-center gap-2 font-medium">
                <img
                  src={logo.src}
                  alt="Logo"
                  className="h-8 w-8 object-contain rounded-sm"
                />
                culonga
              </a>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-xs">
                <LoginForm />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-orange-700 relative hidden lg:block">
            <img
              src={img.src}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </div>
      )}
    </>
  );
}
