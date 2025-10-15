"use client";

import SideBar from "@/components/ui/sidebar";
import UserGetter from "@/services/user/get";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Toaster } from "sonner";

export default function DashBoard({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const router = useRouter();
  useEffect(() => {
    async function checkStorage() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      const service = new UserGetter();
      const data = await service.getMyData(token);
      if (data?.data) {
        return;
      } else {
        localStorage.clear();
        router.push("/");
        return;
      }
    }
    checkStorage();
    const interval = setInterval(checkStorage, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex justify-end font-inter lg:pb-0 pb-30">
      <Toaster
        theme={theme === "dark" ? "dark" : "light"}
        className="z-[99999]"
      />
      <SideBar />
      <aside className="lg:w-[95%] w-full min-h-screen">{children}</aside>
    </main>
  );
}
