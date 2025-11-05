"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

import DashBoardHeader from "@/components/ui/headerDashboard";
import { SalesChart } from "@/components/SalleChart";
import MetaVendasCard from "@/components/metas";
import PaymentService from "@/services/Payments";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import UserGetter from "@/services/user/get";
import { decodeToken } from "@/lib/utils";
const service = new PaymentService();
const usrservice = new UserGetter();
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BestSales } from "@/components/BestSales";
export default function DashBoard() {
  const router = useRouter();
  const [load, setLoad] = useState(true);
  const [data, setData] = useState<any>();
  const [value, setValue] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState("");
  const [showPopUp, setShowPopUp] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const decodedToken = decodeToken(token);
    if (decodedToken?.role == "ADMIN") {
      setIsAdmin(true);
    }
    async function get(token: string) {
      const res = await service.getMyPayments(token, 1);
      const userData = await usrservice.getMyData(token);
      if (
        !userData?.data ||
        userData.data.status == "BANED" ||
        userData.data.status == "REJECTED" ||
        userData.data.status == "CANCELED"
      ) {
        localStorage.clear();
        router.push("/");
        setShowPopUp(true);
        return;
      }
      if (userData.data) {
        setValue(userData?.data?.totalEarned ?? 0);
      }
      setLoad(false);
      setData(res);
      setShowPopUp(userData?.data?.status != "APROVED");
      setStatus(userData?.data?.status);
    }
    get(token);
    const interval = setInterval(() => {
      get(token);
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <main>
      <DashBoardHeader
        data={{
          isAdmin: false,
          canShowInput: false,
          pageTitle: "Visão geral",
          inputPlaceHolder: "",
        }}
      />
      {load ? (
        <div className="flex justify-center items-center mt-12">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <section className="flex flex-col place-self-center lg:w-[95%] mt-5 w-full lg:px-2 px-4">
          {showPopUp && (
            <Alert
              variant={status == "PENDING" ? "default" : "destructive"}
              className={`rounded-sm ${
                status == "PENDING"
                  ? "bg-orange-500/10 border-orange-500"
                  : "bg-red-500/10 border-red-500"
              }`}
            >
              <AlertCircleIcon />
              {status == "PENDING" ? (
                <>
                  <AlertTitle>Atenção </AlertTitle>
                  <AlertDescription>
                    O seu pedido de verificação esta pendente por favor aguarde
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertTitle>Atenção : </AlertTitle>
                  <AlertDescription>
                    Você precisa verificar sua identidade para realizar vendas e
                    processar saques!
                  </AlertDescription>
                  <Button asChild variant={"outline"} className="w-[150px]">
                    <Link href={"/dashboard/verify"}>Verificar</Link>
                  </Button>
                </>
              )}
            </Alert>
          )}
          {data?.stats?.stats && (
            <>
              <aside
                className={`grid w-full lg:grid-cols-${
                  isAdmin ? 2 : 2
                }  gap-8 py-5`}
              >
                <Card className="p-3 rounded-sm bg-transparent backdrop-blur-3xl shadow-orange-500/10 border-orange-500/20 shadow-2xl">
                  <CardTitle className="text-sm dark:bg-orange-900 dark:border-orange-500 w-[50%] text-center  p-1 rounded-sm md:w-[24%] border font-inter ">
                    Saldo Total
                  </CardTitle>
                  <h1 className="font-inter text-4xl font-bold">
                    {Number(value).toLocaleString("pt")} kz
                  </h1>
                  <CardDescription>Total feito na plataforma</CardDescription>
                </Card>
                {isAdmin && (
                  <Card className="p-3 rounded-sm bg-transparent backdrop-blur-3xl shadow-orange-500/10 border-orange-500/20 shadow-2xl">
                    <CardTitle className="text-sm dark:bg-orange-900 dark:border-orange-500 w-[50%] text-center  p-1 rounded-sm md:w-[24%] border font-inter ">
                      Comissão recebida
                    </CardTitle>
                    <h1 className="font-inter text-4xl font-bold">
                      {Number((Number(value) * 8) / 100).toLocaleString("pt")}{" "}
                      kz
                    </h1>
                    <CardDescription>
                      Valor líquido (8% do total de vendas na plataforma)
                    </CardDescription>
                  </Card>
                )}

                {!isAdmin && <MetaVendasCard vendas={value ?? 0} />}
              </aside>

              <article>
                {data?.stats && (
                  <SalesChart data={data?.stats} isAdmin={isAdmin} />
                )}
              </article>
              <article>
                <BestSales />
              </article>
            </>
          )}
        </section>
      )}
    </main>
  );
}
