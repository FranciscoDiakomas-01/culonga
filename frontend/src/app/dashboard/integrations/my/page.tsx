"use client";

import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashBoardHeader from "@/components/ui/headerDashboard";
import { Input } from "@/components/ui/input";
import Integration from "@/types/integrations";
import { ArrowLeft, Edit, Loader2, Search, Trash } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import IntegrationConsumer from "@/services/integration";
import Link from "next/link";
import { toast } from "sonner";
import { isValidUrl } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export default function MyIntegrations() {
  const [load, setLoad] = useState(true);
  const [myInterations, setMyIntegrations] = useState<Integration[]>([]);
  const [search, setSearch] = useState("");
  const service = new IntegrationConsumer();
  const [spin, setSpin] = useState(false);
  const router = useRouter();
  const [active, setActive] = useState<Integration>({
    createdAT: new Date(),
    id: 0,
    imageURL: "",
    title: "",
    link: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    async function get() {
      const data = await service.get(token ?? "");
      setMyIntegrations(data.data);
      setTimeout(() => {
        setLoad(false);
      }, 500);
    }
    get();
  }, []);

  const filtered = myInterations.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.id?.toString().toLowerCase().includes(term) ||
      item?.link?.toLowerCase().includes(term)
    );
  });

  async function handelOnsubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const isValid = isValidUrl(active.link ?? "");
    if (isValid) {
      setSpin(true);
      const platform = JSON.stringify({
        imageURL: active.imageURL,
        title: active.title,
      });
      const updated = await service.update(
        token,
        {
          platform,
          url: active.link as string,
        },
        active.id.toLocaleString()
      );
      toast.info(updated.message);
      if (updated.updated) {
        const list = myInterations.map((item) =>
          item.id === active.id ? { ...item, link: active.link } : item
        );
        setMyIntegrations(list);
      }
      setActive({
        createdAT: new Date(),
        id: 0,
        imageURL: "",
        title: "",
        link: "",
      });
      setTimeout(() => {
        setSpin(false);
      }, 1000);
      return;
    }
    toast.info("URL inválida");
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

      <section className="px-2 pt-5 place-self-center lg:w-[90%] w-full flex flex-col gap-6">
        <h1 className="text-xl">Integrações</h1>
        <span className="flex lg:w-[30%] gap-4">
          <form action="" className="flex w-full relative">
            <Input
              className=""
              placeholder="Buscar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search
              className="absolute text-orange-500 right-2 top-2"
              size={16}
            />
          </form>
          <Button
            variant={"outline"}
            onClick={() => {
              router.back();
            }}
          >
            <ArrowLeft />
            Voltar
          </Button>
        </span>

        {load ? (
          <aside className="flex justify-center items-center min-h-[50dvh]">
            <Loader2 className="animate-spin" />
          </aside>
        ) : (
          <aside>
            {Array.isArray(filtered) && filtered.length > 0 ? ( // 👈 usa filtered
              <Card className="bg-transparent backdrop-blur-2xl rounded-sm p-4 mb-4">
                <Table>
                  <TableCaption>Lista das Integrações</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome da integração</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>

                      <TableHead>Editar</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item, index) => (
                      <TableRow className="cursor-pointer my-2" key={index}>
                        <TableCell className="font-medium flex gap-4">
                          <img
                            className="h-10 w-10 rounded-sm object-contain"
                            src={item.imageURL}
                            alt={item.title}
                          />
                          <span>
                            <h1 className="text-[11pt] font-semibold">
                              {item.title}
                            </h1>
                            <small className="dark:opacity-50">
                              ID : {item.id}
                            </small>
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(item.createdAT).toLocaleDateString("pt", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <span className="bg-green-500/10 text-green-500 rounded-sm border-green-500 p-1 text-[12px] flex justify-center items-center w-20">
                            Activa
                          </span>
                        </TableCell>
                        <TableCell className="w-[80px]">
                          <Sheet>
                            <Button
                              className="w-full dark:bg-gray-800/30 dark:text-white"
                              asChild
                            >
                              <SheetTrigger
                                onClick={() => {
                                  setActive(item);
                                }}
                              >
                                <Edit /> Editar
                              </SheetTrigger>
                            </Button>

                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>{item.title}</SheetTitle>
                                <SheetDescription>
                                  Cadastre o link de notificação do seu webhook
                                </SheetDescription>
                              </SheetHeader>

                              <form
                                onSubmit={handelOnsubmit}
                                action=""
                                className="flex flex-col gap-2 px-3"
                              >
                                <Label htmlFor="url">URL</Label>
                                <Input
                                  type="url"
                                  required
                                  placeholder="https://"
                                  name="url"
                                  id="url"
                                  value={active.link}
                                  onChange={(e) => {
                                    setActive((prev) => ({
                                      ...prev,
                                      link: e.target.value,
                                    }));
                                  }}
                                />
                                <Button variant={"outline"}>
                                  {spin ? (
                                    <Loader2 className="animate-spin" />
                                  ) : (
                                    "Cadastrar"
                                  )}
                                </Button>
                              </form>
                            </SheetContent>
                          </Sheet>
                        </TableCell>
                        <TableCell className="w-[80px]">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant={"outline"} className="w-full">
                                <Trash />
                                Remover
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Tem certeza que deseja remover esta
                                  integração?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa ação não pode ser desfeita. A integração{" "}
                                  <b>{item.title}</b> será permanentemente
                                  desconectada e você não poderá mais enviar ou
                                  receber dados através dela.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Fechar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    setSpin(true);

                                    const token =
                                      localStorage.getItem("token") ?? "";

                                    const res = await service.delete(
                                      token,
                                      item.id.toString()
                                    );

                                    if (res.deleted) {
                                      setMyIntegrations(
                                        myInterations.filter(
                                          (data) => data.id !== item.id
                                        ) // ✅ aqui retorna boolean
                                      );
                                    }

                                    setTimeout(() => {
                                      setSpin(false);
                                    }, 1000);

                                    toast.info(res.message);
                                  }}
                                >
                                  {spin ? (
                                    <Loader2 className="animate-spin" />
                                  ) : (
                                    "Continue"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              <div className="flex justify-center items-center gap-6 w-full flex-col">
                {search ? (
                  <>
                    <h1 className="flex justify-center items-center text-center text-sm">
                      Nenhuma integração encontrado
                    </h1>
                  </>
                ) : (
                  <>
                    {" "}
                    <h1 className="flex justify-center items-center text-center text-sm">
                      Sem integração disponível
                    </h1>
                  </>
                )}
              </div>
            )}
          </aside>
        )}
      </section>
    </main>
  );
}
