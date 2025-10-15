"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
import { Card, CardTitle } from "@/components/ui/card";
import DashBoardHeader from "@/components/ui/headerDashboard";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AlertCircle,
  BadgeCheck,
  FileCheck,
  ImageUp,
  Loader,
  Loader2,
  MoveLeft,
  MoveRight,
  ShieldCheck,
  ShieldOff,
  ShieldX,
  SlidersHorizontal,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import checkoutMocks from "@/mocks/chekout.mock";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SelectTrigger,
  SelectValue,
  Select,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Stats {
  title: string;
  alert: string;
  color: string;
  value: number | string;
}

import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import PaymentService from "@/services/Payments";
import { useRouter } from "next/navigation";
import UserGetter from "@/services/user/get";
import { toast } from "sonner";
import { decodeToken } from "@/lib/utils";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import server from "@/services/server";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import clsx from "clsx";

export default function Bank() {
  const [stats, setStats] = useState<Stats[]>([]);
  const [selected, setSelected] = useState<string | undefined>();
  const [load, setLoad] = useState(true);
  const [amount, setAmount] = useState(0);
  const [iban, setIban] = useState("");
  const [isVeried, setIsVeriried] = useState(false);
  const router = useRouter();
  const service = new PaymentService();
  const [page, setPage] = useState(1);
  const [lastpage, setLastPage] = useState(1);
  const [chekouts, setChekouts] = useState<any[]>([]);
  const [reload, setReload] = useState(false);
  const [spin, setSpin] = useState(false);
  const userService = new UserGetter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [bank, setBabk] = useState<any>({});
  const [activeStatus, setActiveStatus] = useState(0);
  const [myBanks, setMyBanks] = useState<
    {
      title: string;
      id: string;
      iban: string;
      status: string;
    }[]
  >([]);
  const [filtredCheckouts, setfiltredCheckouts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const decoded = decodeToken(token);
    setIsAdmin(decoded?.role == "ADMIN");
    async function get(token: string) {
      const dataStats = await service.getTransictionStats(token);
      const transactions = await service.getMyTransactions(token, page);
      const myAllBanks = await service.getMyBanks(token);

      setMyBanks(myAllBanks ?? []);
      const Userdata = await userService.getMyData(token);
      setIsVeriried(Userdata.data?.status == "APROVED");

      setStats(dataStats);
      setLastPage(transactions.lastPage);
      setChekouts(transactions.data);
      setTimeout(() => {
        setLoad(false);
      }, 500);
    }
    get(token);
    const interval = setInterval(() => {
      get(token);
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [page, reload]);
  useEffect(() => {
    if (search.length === 0) {
      setfiltredCheckouts(chekouts);
      return;
    }

    const searchUpper = search.toUpperCase();

    const newList = chekouts.filter((item) => {
      const status = item.status.toUpperCase();

      if (searchUpper === "PENDING" || searchUpper === "CREATED") {
        return status.includes("PENDING") || status.includes("CREATED");
      }

      return status.includes(searchUpper);
    });

    setfiltredCheckouts(newList);
  }, [chekouts, search]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      toast.info("Precisa estar logado");
      return;
    }

    console.log(bank);

    if (!bank.title || !amount || !bank.iban) {
      toast.info("Prenche os campos");
      return;
    }
    setSpin(true);
    const res = await service.createGetMoney(token, {
      bank: bank.title,
      amount,
      iban: bank.iban,
    });
    toast.info(res.message);
    setSpin(false);
    setReload((prev) => !prev);
  }

  async function AproveStatus(file: File, id: string) {
    setSpin(true);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const body = {
      productId: "photo",
      type: "file",
    };

    const canUpload = await fetch(`${server}products/canupload`, {
      body: JSON.stringify(body),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
    });
    const can = (await canUpload.json()) as {
      status: boolean;
      message: string;
      key: string;
      server: string;
    };
    console.log(can);
    if (!can?.status) {
      toast.error("Erro ao salvar o arquivo");
      return;
    }
    const response = await fetch(can.server, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Uploadthing-Api-Key": can.key,
      },
      body: JSON.stringify({
        files: [
          {
            name: file.name,
            size: file.size,
            type: file.type,
            customId: null,
          },
        ],
        acl: "public-read",
        metadata: null,
        contentDisposition: "inline",
      }),
    });
    const data = await response.json();
    const uploadData = data?.data?.[0];
    if (!uploadData?.fileUrl || !uploadData?.fields) {
      toast.error("Erro ao gerar o link de download");
      setSpin(false);
      console.log(uploadData);
      return;
    }
    const formData = new FormData();
    Object.entries(uploadData.fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append("file", file);
    const uploadRes = await fetch(uploadData.url, {
      method: "POST",
      body: formData,
    });
    if (!uploadRes.ok) {
      console.error("Erro no upload:", await uploadRes.text());
      toast.error("Falha ao enviar para S3");
      setSpin(false);
      return;
    }
    const fileUrl = uploadData.fileUrl;
    const res = await service.updatePaymentStatus({
      token,
      payId: id,
      status: "1",
      file: fileUrl,
    });

    if (res?.sent) {
      toast.success("Arquivo salvo com sucesso");
    } else {
      toast.error("Erro em salvar o arquivo", {
        description: res?.message,
      });
    }
    setSpin(false);
    setFile(null);
    setReload((prev) => !prev);
    return fileUrl;
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
        <div className="flex justify-center items-center h-[50dvh]">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <section className="px-2 pt-5 place-self-center lg:w-[95%] w-full flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4 md:flex-row flex-col">
            <span className="flex items-center justify-between  gap-4 w-full">
              <h1 className="text-xl">Saques</h1>
              <Popover>
                <Button asChild variant={"outline"}>
                  <PopoverTrigger>
                    <SlidersHorizontal className="text-orange-500" />
                    Filtrar
                  </PopoverTrigger>
                </Button>

                <PopoverContent className="bg-transparent backdrop-blur-3xl p-0 border-0 rounded-none">
                  <Card className="bg-transparent backdrop-blur-3xl rounded-sm mt-2 p-2 flex flex-col gap-4">
                    <div>
                      <h1>Status</h1>
                      <span className="grid md:grid-cols-2 gap-4">
                        {["Todos", "Aprovado", "Reprovado", "Pendentes"].map(
                          (status, index) => (
                            <div
                              className={clsx(
                                "border justify-center items-center flex rounded-sm p-2 transition-all cursor-pointer",
                                {
                                  "bg-orange-500 text-white":
                                    activeStatus == index,
                                  "dark:hover:bg-gray-800/10 hover:bg-orange-500/10":
                                    activeStatus != index,
                                }
                              )}
                              onClick={() => {
                                setActiveStatus(index);
                                switch (index) {
                                  case 0:
                                    setSearch("");
                                    break;
                                  case 1:
                                    setSearch("APROVED");
                                    break;
                                  case 2:
                                    setSearch("REJECTED");
                                    break;
                                  case 3:
                                    setSearch("PENDING");
                                    break;
                                }
                              }}
                              key={index}
                            >
                              {status}
                            </div>
                          )
                        )}
                      </span>
                    </div>
                    <div className="border-t dark:border-white/10 w-full rounded-full"></div>
                    {search.length > 0 && (
                      <footer className="grid md:grid-cols-2 gap-4">
                        <Button
                          variant={"outline"}
                          onClick={() => {
                            setActiveStatus(0);
                            setSearch("");
                          }}
                        >
                          Limpar
                        </Button>
                      </footer>
                    )}
                  </Card>
                </PopoverContent>
              </Popover>
            </span>
            {
              <div className="flex gap-3 flex-wrap">
                <Sheet>
                  <Button
                    asChild
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    <SheetTrigger>
                      Solicitar saque <MoveRight />
                    </SheetTrigger>
                  </Button>
                  {isVeried ? (
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Solicitar saque</SheetTitle>
                        <SheetDescription>
                          Adicione o valor que deseja sacar
                        </SheetDescription>
                      </SheetHeader>
                      <form
                        action=""
                        onSubmit={onSubmit}
                        className="px-4 flex flex-col gap-4"
                      >
                        <Label>Montante</Label>
                        <Input
                          required
                          placeholder="Informe o montante"
                          type="number"
                          min={1000}
                          onChange={(e) => {
                            setAmount(+e.target.value);
                          }}
                        />
                        <Label>Carteira</Label>
                        <Select
                          value={selected}
                          onValueChange={(e) => {
                            setSelected(e);
                            const current = myBanks.find((item) => {
                              return item.iban == e;
                            });
                            if (current) {
                              setBabk(current);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione uma carteira" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-transparent backdrop-blur-3xl">
                            {myBanks.map((banco, index) => (
                              <SelectItem key={index} value={banco.iban}>
                                {banco.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <SheetFooter className="grid px-0 grid-cols-2 gap-2">
                          <Button variant="outline" asChild>
                            <Link href={"/dashboard/bank/mybanks"}>
                              Minhas carteira
                            </Link>
                          </Button>
                          <Button
                            type="submit"
                            className="bg-green-600
                hover:bg-green-700 text-white"
                          >
                            {spin ? (
                              <Loader className="animate-spin" />
                            ) : (
                              "Salvar"
                            )}
                          </Button>
                        </SheetFooter>
                      </form>
                    </SheetContent>
                  ) : (
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Solicitar saque</SheetTitle>
                      </SheetHeader>
                      <span className="p-4 flex flex-col gap-8">
                        <Alert variant="destructive" className="bg-red-500/10">
                          <AlertCircleIcon />
                          <AlertTitle>
                            Não foi possível processar sua solicitação de saque.
                          </AlertTitle>
                          <AlertDescription>
                            <p>Verifique suas informações e tente novamente.</p>
                            <ul className="list-inside list-disc text-sm">
                              <li>Confirme os dados da conta bancária</li>
                              <li>Envie seus documentos de indentidade</li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                        <Card className="p-2 bg-transparent rounded-sm lg:bg-red-500/20 lg:text-red-500">
                          <CardTitle className="leading-[1.5] lg:flex hidden font-bold">
                            Faça a verificação da sua conta para começar
                            utilizar 100% da culonga.
                          </CardTitle>
                          <Button
                            asChild
                            variant={"outline"}
                            className=" hover:bg-red-500 bg-red-500 text-white "
                          >
                            <Link href={"/dashboard/verify"} prefetch>
                              <FileCheck />
                              Verificar conta
                            </Link>
                          </Button>
                        </Card>
                        <span className="p-3 gap-5 flex flex-col justify-center items-center">
                          <FileCheck size={25} />
                          <p className="text-center  text-sm">
                            Sua documentação precisa estar aprovada para
                            solicitar saques. Por favor, verifique o status dos
                            seus documentos. Se necessário, complete a
                            verificação para continuar.
                          </p>
                        </span>
                      </span>
                    </SheetContent>
                  )}
                </Sheet>
              </div>
            }
          </div>

          {Array.isArray(stats) && stats.length > 0 && (
            <Card className="grid lg:grid-cols-4 md:grid-cols-2 gap-4 rounded-sm bg-transparent px-2 ">
              {stats.map((item, index) => (
                <span
                  className="p-2 last-of-type:border-none border-r flex flex-col gap-4"
                  key={index}
                >
                  <span
                    className={`${item.color} text-sm flex justify-between items-center`}
                  >
                    <p>{item.title}</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertCircle size={15} />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[160px] ">
                        <p>{item.alert}</p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <h1 className="text-2xl font-bold">
                    {Number(item.value).toLocaleString("pt") ?? 0} kz
                  </h1>
                </span>
              ))}
            </Card>
          )}

          <div className="overflow-x-auto flex flex-col gap-4">
            <h1 className="text-xl">Saques</h1>
            <Card className="rounded-sm bg-transparent px-2 ">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    {isAdmin && <TableHead>Usuário</TableHead>}
                    <TableHead>Valor</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>IBAN</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Criada</TableHead>
                    <TableHead>Respondido aos</TableHead>
                    <TableHead>Comprante</TableHead>
                    {isAdmin && <TableHead>Ação</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(filtredCheckouts) &&
                    filtredCheckouts.length > 0 &&
                    filtredCheckouts.map((checkout, index) => {
                      // Badge por status
                      let statusBadge;
                      switch (checkout.status) {
                        case "APROVED":
                          statusBadge = (
                            <Badge variant={"outline"}>
                              <BadgeCheck
                                size={14}
                                className="text-green-500"
                              />
                              Efectuado
                            </Badge>
                          );
                          break;
                        case "PENDING":
                          statusBadge = (
                            <Badge variant={"outline"}>
                              <Clock size={14} className="text-orange-500" />
                              Pendente
                            </Badge>
                          );
                          break;
                        case "REJECTED":
                          statusBadge = (
                            <Badge variant={"outline"}>
                              <ShieldX size={14} className="text-red-500" />
                              Rejeitado
                            </Badge>
                          );
                          break;
                      }

                      // Formatar datas
                      const createdAtFormatted = new Date(
                        checkout.createdAt
                      ).toLocaleDateString("pt", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });

                      const replayedAtFormatted = checkout.updatedAt
                        ? new Date(checkout.updatedAt).toLocaleDateString(
                            "pt",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "---";

                      return (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          {isAdmin && (
                            <TableCell>
                              <span className="flex items-center gap-2">
                                <Avatar className="rounded-sm">
                                  <AvatarImage
                                    className="h-8 w-8 rounded-sm"
                                    src={checkout.user?.profile}
                                  />
                                  <AvatarFallback>
                                    <ImageUp size={14} />
                                  </AvatarFallback>
                                </Avatar>
                                {checkout?.user?.name +
                                  " " +
                                  checkout?.user?.lastname}
                              </span>
                            </TableCell>
                          )}
                          <TableCell>{checkout.amount.toFixed(2)} kz</TableCell>
                          <TableCell>{checkout.bank}</TableCell>
                          <TableCell>{checkout.iban}</TableCell>
                          <TableCell>
                            {statusBadge ?? (
                              <Badge variant={"outline"}>
                                <ShieldX size={14} className="text-red-500" />
                                Cancelado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{createdAtFormatted}</TableCell>
                          <TableCell>{replayedAtFormatted}</TableCell>

                          <TableCell>
                            {checkout.fileURL && (
                              <Button asChild variant={"outline"}>
                                <Link target="_blank" href={checkout.fileURL}>
                                  Visualizar
                                </Link>
                              </Button>
                            )}
                          </TableCell>
                          {isAdmin && (
                            <>
                              <TableCell className="gap-2 flex">
                                {checkout.status == "PENDING" && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant={"outline"}>
                                        <ShieldCheck className="text-green-500" />
                                      </Button>
                                    </AlertDialogTrigger>

                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Tem certeza ?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Essa ação não pode ser desfeita
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>

                                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500/30  dark:hover:bg-blue-50/10 hover:bg-blue-500/10 transition">
                                        <span className="text-gray-500 text-sm mb-2">
                                          {file
                                            ? file.name
                                            : "Clique ou arraste o arquivo"}
                                        </span>
                                        <input
                                          type="file"
                                          onChange={handleChange}
                                          className="hidden"
                                        />
                                      </label>

                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={async (e) => {
                                            e.preventDefault();
                                            const token =
                                              localStorage.getItem("token");
                                            if (!token) {
                                              router.push("/");
                                              return;
                                            }

                                            if (!file) {
                                              return;
                                            }
                                            await AproveStatus(
                                              file,
                                              checkout.id
                                            );
                                          }}
                                        >
                                          {spin ? (
                                            <Loader2 className="animate-spin" />
                                          ) : (
                                            "Aprovar"
                                          )}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                                {checkout.status == "PENDING" && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant={"outline"}>
                                        <ShieldX
                                          size={14}
                                          className="text-red-500"
                                        />
                                      </Button>
                                    </AlertDialogTrigger>

                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Tem certeza ?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Essa ação não pode ser desfeita
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>

                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancelar
                                        </AlertDialogCancel>

                                        <AlertDialogAction
                                          onClick={async (e) => {
                                            e.preventDefault();
                                            const token =
                                              localStorage.getItem("token");
                                            if (!token) {
                                              router.push("/");
                                              return;
                                            }

                                            setSpin(true);
                                            const data =
                                              await service.updatePaymentStatus(
                                                {
                                                  token,
                                                  payId: checkout.id,
                                                  status: "0",
                                                  file: "",
                                                }
                                              );
                                            toast.info(data.message);
                                            setReload((prev) => !prev);

                                            setSpin(false);
                                          }}
                                        >
                                          {spin ? (
                                            <Loader2 className="animate-spin" />
                                          ) : (
                                            <>
                                              <ShieldOff className="text-red-500" />
                                              Reprovar
                                            </>
                                          )}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </Card>

            <span className="flex flex-wrap justify-center w-full place-self-center text-nowrap py-4 gap-3 items-center">
              <p>
                {page} de {lastpage == 0 ? 1 : lastpage}
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
