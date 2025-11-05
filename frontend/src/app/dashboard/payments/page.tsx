"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import paymentsMocks from "@/mocks/payment.mock";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DashBoardHeader from "@/components/ui/headerDashboard";
import {
  BadgeCheck,
  Check,
  Clock,
  Loader2,
  MoveLeft,
  MoveRight,
  Search,
  ShieldX,
  SlidersHorizontal,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import PaymentService from "@/services/Payments";
import { decodeToken } from "@/lib/utils";
import { toast } from "sonner";

export default function Payments() {
  const [load, setLoad] = useState(true);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [lastpage, setLastPage] = useState(1);
  const [filter, setFilter] = useState("ALL");
  const [Payments, setPaymenst] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processing, setProcessing] = useState<{
    id: string;
    loading: boolean;
    operation: any;
  }>({
    id: "",
    loading: false,
    operation: null,
  });
  const router = useRouter();
  const service = new PaymentService();
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
    if (!token) {
      router.push("/");
      return;
    }
    async function get(token: string) {
      const res = await service.getMyPayments(token, page);
      setLoad(false);
      setData(res);
      setLastPage(res.data.lastpage ?? 1);
      setPaymenst(res.data.data ?? []);
      setFilteredPayments(res.data.data ?? []);
    }
    get(token);
    const interval = setInterval(() => {
      get(token);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [page]);

  useEffect(() => {
    if (filter === "ALL") {
      setFilteredPayments(Payments);
      return;
    }
    const newList = Payments.filter((item) => {
      return item.status.toUpperCase() === filter.toUpperCase();
    });

    setFilteredPayments(newList);
  }, [filter, Payments]);

  async function updateManualyStatus(status: "1" | "2", id: string) {
    const token = localStorage.getItem("token") as string;
    setProcessing({
      id,
      loading: true,
      operation: status,
    });
    const data = (await service.updateMnualyPaymentStatus({
      token,
      payid: id,
      status,
    })) as any;
    toast.info(data?.message ?? "Erro ao actualizar", {
      description: data?.description,
    });
    setTimeout(() => {
      setProcessing({
        id: "",
        loading: false,
        operation: null,
      });
    }, 1000);
  }

  return (
    <main>
      <DashBoardHeader
        data={{
          canShowInput: false,
          isAdmin: false,
          pageTitle: "",
        }}
      />

      {load ? (
        <div className="flex justify-center items-center mt-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <section className="px-2 pt-5 place-self-center lg:w-[95%] w-full flex flex-col gap-6">
          <h1 className="text-xl">Minhas vendas</h1>
          <span className="place-self-end flex  gap-4 items-center">
            <Sheet>
              <Button asChild variant={"outline"}>
                <SheetTrigger>
                  <SlidersHorizontal className="text-orange-500" />
                  Filtrar
                </SheetTrigger>
              </Button>

              <SheetContent className="px-5">
                <SheetHeader className="px-0">
                  <SheetTitle className="text-xl">Filtrar</SheetTitle>
                </SheetHeader>
                <div className="border-t place-self-center  w-full dark:border-white/10"></div>
                <div className="grid flex-1 auto-rows-min gap-6 ">
                  <div className="grid gap-3">
                    <p>Filtrar por Estados</p>
                    <Select
                      defaultValue="ALL"
                      onValueChange={(e) => {
                        setFilter(e);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-transparent backdrop-blur-3xl">
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="APROVED">Efectuados</SelectItem>
                        <SelectItem value="REJECTED">Rejeitado</SelectItem>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="CANCELED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="border-t place-self-center  w-full dark:border-white/10"></div>
                  <SheetFooter className="grid grid-cols-2 gap-2 px-0">
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFilter("ALL");
                        }}
                      >
                        Limpar
                      </Button>
                    </SheetClose>
                    <Button
                      type="submit"
                      className="bg-green-600
                hover:bg-green-700 text-white"
                    >
                      Filtrar
                    </Button>
                  </SheetFooter>
                </div>
              </SheetContent>
            </Sheet>
          </span>

          <article className="grid lg:grid-cols-4 my-6  gap-3 md:grid-cols-2 ">
            {Array.isArray(data?.stats?.stats) &&
              data?.stats?.stats.length > 0 &&
              data?.stats?.stats.map((item: any, index: number) => (
                <Card
                  key={index}
                  className="p-2 rounded-sm gap-3 lg:text-start bg-transparent backdrop-blur-3xl font-bold"
                >
                  <small
                    className={
                      index == 1
                        ? "text-orange-500 text-center lg:text-start"
                        : "text-green-500 text-center lg:text-start"
                    }
                  >
                    {item.title}
                  </small>
                  <CardTitle className="text-2xl text-center lg:text-start">
                    {Number(item.value).toLocaleString("pt")} kz
                  </CardTitle>
                  <CardDescription className="text-center lg:text-start">
                    {" "}
                    {item?.total ?? 0} vendas
                  </CardDescription>
                </Card>
              ))}
          </article>

          <div className="mb-4">
            <Card className="rounded-sm bg-transparent  py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    {isAdmin && <TableHead>Acção</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(filteredPayments) &&
                    filteredPayments.length > 0 &&
                    filteredPayments.map((payment: any, index: number) => {
                      // converter a string JSON em objeto
                      const user = JSON.parse(payment.user);

                      // pegar iniciais (apenas primeira letra do nome)
                      const initials = user.name
                        ? user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                        : "U";

                      return (
                        <TableRow key={payment.uuid}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex  gap-2">
                                  <Avatar>
                                    <AvatarFallback>{initials}</AvatarFallback>
                                  </Avatar>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="flex flex-col gap-2">
                                <h1>{user.name}</h1>
                                <p>{user.email}</p>
                                <p>{user.telefone}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          <TableCell>
                            <p>{user?.name}</p>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell>
                            {(() => {
                              try {
                                const product = JSON.parse(
                                  payment?.product
                                ) as {
                                  title: string;
                                  description: string;
                                };
                                return (
                                  <span>
                                    <p>{product?.title}</p>
                                    <small>
                                      {product?.description?.slice(0, 50)} ...
                                    </small>
                                  </span>
                                );
                              } catch (error) {
                                return <p>Sem informação</p>;
                              }
                            })()}
                          </TableCell>
                          <TableCell>
                            {payment.status === "APROVED" ? (
                              <Badge variant="outline">
                                <BadgeCheck
                                  size={14}
                                  className="text-green-500"
                                />
                                Efectuado
                              </Badge>
                            ) : payment.status === "REJECTED" ||
                              payment.status === "CANCELED" ? (
                              <Badge variant="outline">
                                <ShieldX size={14} className="text-red-500" />
                                Cancelado
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Clock size={14} className="text-orange-500" />
                                {payment.status}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{payment.amount.toFixed(2)} kz</TableCell>
                          <TableCell>
                            {new Date(payment.createdAt).toLocaleDateString(
                              "pt",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              }
                            )}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="w-50 space-x-3">
                              {" "}
                              <Button
                                className="lg:w-full w-20"
                                onClick={async () => {
                                  await updateManualyStatus("1", payment.uuid);
                                }}
                              >
                                {processing?.id == payment?.uuid &&
                                processing?.loading &&
                                processing?.operation == 1 ? (
                                  <Loader2 className="animate-spin" />
                                ) : (
                                  "Aprovar"
                                )}
                              </Button>
                              <Button
                                className="lg:w-full w-20 border border-white/10"
                                variant={"ghost"}
                                onClick={async () => {
                                  await updateManualyStatus("2", payment.uuid);
                                }}
                              >
                                {processing?.id == payment?.uuid &&
                                processing?.loading &&
                                processing?.operation == 2 ? (
                                  <Loader2 className="animate-spin" />
                                ) : (
                                  "Reprovar"
                                )}
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </Card>

            <span className="flex flex-wrap justify-center w-full place-self-center text-nowrap py-4 gap-3 items-center">
              <p>
                {page} de {lastpage}
              </p>
              <span className="flex gap-2 mx-4">
                <Button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  variant="outline"
                  disabled={page <= 1}
                >
                  <MoveLeft />
                </Button>
                <Button
                  onClick={() => setPage(Math.min(lastpage, page + 1))}
                  variant="outline"
                  disabled={page >= lastpage}
                >
                  <MoveRight />
                </Button>
              </span>
            </span>
          </div>
        </section>
      )}
    </main>
  );
}
