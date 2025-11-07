"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import DashBoardHeader from "@/components/ui/headerDashboard";
import { Tabs } from "@/components/ui/tabs";
import server from "@/services/server";
import { TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Afilition = {
  id: number;
  userId: string;
  totalSells: number;
  totalPurchase: number;
  productId: string;
  link: string;
  status: boolean;
  createdAt: Date;
};
export default function Afiliations() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [reload, setReload] = useState(false);
  const [isMarketPlace, setIsMarkplace] = useState(false);
  const [data, setData] = useState<{
    afiliations: Afilition[];
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
        console.log(content);
      } else {
        const value = content as typeof data;
        setData(value);
        setPage(value?.notAfiliations?.page ?? 1);
        setLastPage(value?.notAfiliations?.lastPage ?? 1);
        console.log(value);
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
          <article>
            <Button
              onClick={() => {
                setReload(true);
                setIsMarkplace((prev) => !prev);
              }}
            >
              {isMarketPlace ? "Ver minhas afiliações" : "Tornar-se afiliado"}
            </Button>

            {!isMarketPlace && (
              <Card>
                {Array.isArray(data?.afiliations) &&
                data?.afiliations.length > 0 ? (
                  <Table>
                    <TableCaption>Produtos afiliados</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Código</TableHead>
                        <TableHead>Facturado</TableHead>
                        <TableHead>Vendas</TableHead>
                        <TableHead>Percentagem</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Criador</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.afiliations.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {item.id}
                          </TableCell>
                          <TableCell>
                            {Number(item.totalPurchase ?? 0).toLocaleString(
                              "pt"
                            )}{" "}
                            kz
                          </TableCell>
                          <TableCell>{item.totalSells}</TableCell>
                          <TableCell>
                            {item.status ? (
                              <Badge
                                className="border-green-500 text-green-500 bg-green-500/10 border"
                                variant={"outline"}
                              >
                                <TrendingUp />
                                Activo
                              </Badge>
                            ) : (
                              <Badge
                                className="border-red-500 text-red-500 bg-red-500/10 border"
                                variant={"outline"}
                              >
                                <TrendingDown />
                                Inativo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>$250.00</TableCell>
                          <TableCell>$250.00</TableCell>
                          <TableCell className="text-right">
                            <Button>
                              {item.status ? "Desactivar" : "Activar"}
                            </Button>
                            <Button>Eliminar</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <span></span>
                )}
              </Card>
            )}
          </article>
        )}
      </section>
    </main>
  );
}
