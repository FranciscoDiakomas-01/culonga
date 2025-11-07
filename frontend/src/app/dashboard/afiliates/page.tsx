"use client";

import DashBoardHeader from "@/components/ui/headerDashboard";
import { Tabs } from "@/components/ui/tabs";
import server from "@/services/server";
import { TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Afiliations() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [reload, setReload] = useState(false);
  const [data, setData] = useState<{
    afiliations: any[];
    notAfiliations: {
      page: number;
      data: any[];
      lastPage: number;
    };
  }>();
  const router = useRouter();

  useEffect(() => {
    get().then().catch();
  }, [router, page, reload]);

  async function get() {
    const token = localStorage.getItem("token") as string;
    try {
      const res = await fetch(`${server}affiliates?page=${page}`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const content = await res.json();
      if (content) {
        toast.info(content?.message);
      } else {
        const value = content as typeof data;
        setData(value);
        setPage(value?.notAfiliations?.page ?? 1);
        setLastPage(value?.notAfiliations?.lastPage ?? 1);
      }
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  }
  return (
    <main className="font-inter">
      <DashBoardHeader
        data={{
          canShowInput: true,
          isAdmin: false,
          pageTitle: "",
          inputPlaceHolder: "Buscar por produto",
        }}
      />

      <section className="px-2 pt-5 place-self-center lg:w-[95%] w-full flex flex-col gap-6">
        {loading ? (
          <div className="flex justify-center items-center mt-8">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <Tabs
            defaultValue="my"
            className="w-full flex flex-col gap-8 px-4 py-5 flex-wrap"
          >
            <header className="grid md:grid-cols-2 grid-cols-1 gap-2">
              <TabsList className="bg-transparent rounded-sm border sm:flex-wrap">
                <TabsTrigger
                  value="my"
                  onClick={() => {
                    setReload((prev) => !prev);
                  }}
                >
                  Minhas afiliações
                </TabsTrigger>
                <TabsTrigger
                  value="news"
                  onClick={() => {
                    setReload((prev) => !prev);
                  }}
                >
                  Afiliações diponíveis
                </TabsTrigger>
              </TabsList>
            </header>
          </Tabs>
        )}
      </section>
    </main>
  );
}
