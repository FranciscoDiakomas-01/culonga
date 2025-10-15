"use client";

import { SignForm } from "@/components/signinform";
import img from "@/assets/images/login.jpeg";
import img1 from "@/assets/images/logo.png";
import img2 from "@/assets/images/logo.jpeg";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
export default function LoginPage() {
  const { theme } = useTheme();
  const [logo, setLogo] = useState(img1);
  useEffect(() => {
    if (theme == "dark") {
      setLogo(img2);
    }
    localStorage.clear();
    sessionStorage.clear();
  }, []);
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-gradient-to-br from-blue-600 to-orange-700 relative hidden lg:block">
        <img
          src={img.src}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
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
          <div className="w-full max-w-xl">
            <SignForm />
          </div>
        </div>
      </div>
    </div>
  );
}
