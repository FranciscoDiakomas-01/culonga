"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import DashBoardHeader from "@/components/ui/headerDashboard";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  BadgeCheck,
  Filter,
  Image,
  Loader2,
  MoveLeft,
  MoveRight,
  Plus,
  Search,
  SlidersHorizontal,
  Trash,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormEvent, useEffect, useState } from "react";
import clsx from "clsx";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";
import Link from "next/link";
import Stats from "@/components/ui/stats";
import ProductConsumer from "@/services/product";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { decodeToken } from "@/lib/utils";
export default function Products() {
  const [activeStatus, setActiveStatus] = useState(0);

  const service = new ProductConsumer();
  const [load, setLoad] = useState(true);
  const [stats, setStats] = useState([
    {
      value: 0,
      label: "Meus Produtos",
      isCoin: false,
      description: "total de produtos criados",
    },
  ]);

  type Prouct = {
    id: string;
    order: number;
    title: string;
    cover: string;
    createdAt: string;
    status: string;
    link: string;
    price: number;
    user?: any;
  };
  const [statsLoad, setStatsLoad] = useState(true);
  const router = useRouter();
  const [myProducts, setMyProducts] = useState<Prouct[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [spin, setSpin] = useState(false);
  const [reload, setReload] = useState(false);
  const [lastpage, setLastPage] = useState(1);
  const [filtredProducts, setFiltredProducts] = useState<Prouct[]>([]);

  const [isAdmin, setIsAdmin] = useState(false);
  // Buscar dados da API (só aqui)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const decoded = decodeToken(token);
    setIsAdmin(decoded?.role === "ADMIN");
    async function get(token: string) {
      const data = (await service.getPoductStat(token)) as any;
      if (!data?.message) {
        setStats(data);
      }
      const data1 = await service.get(token, page);
      setLastPage(data1.lastPage);
      setMyProducts(data1.products);
      setFiltredProducts(data1.products);
      setTimeout(() => {
        setStatsLoad(false);
        setLoad(false);
      }, 500);
    }

    get(token);
  }, [reload, page]);

  useEffect(() => {
    if (query === "") {
      setFiltredProducts(myProducts);
      return;
    }
    const q = query.toLowerCase();
    const filtred = myProducts.filter((item) => {
      return (
        item.order.toString().toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.price.toString().toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    });
    setFiltredProducts(filtred);
  }, [query, myProducts]);

  async function handelOnSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    setSpin(true);
    const creater = await service.create(token, {
      description,
      price: +price,
      title,
      type,
    });
    toast.info(creater.message);
    setReload((prev) => !prev);
    setSpin(false);
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

      <section className="px-2 py-5 flex flex-col gap-8 place-self-center lg:w-[97%] w-full">
        {statsLoad ? null : (
          <>
            {Array.isArray(stats) && stats.length > 0 && (
              <aside className="grid  lg:grid-cols-4 md:grid-cols-2 gap-4">
                {stats.map((item, index) => (
                  <Stats stats={item} key={index} />
                ))}
              </aside>
            )}
            <div className="grid md:grid-cols-2 gap-4 items-end">
              <span className="flex flex-col gap-4">
                <h1 className="text-xl">Meus produtos</h1>
                <span className="lg:w-[55%] gap-4 flex items-center">
                  <form action="" className="flex w-full  relative">
                    <Input
                      placeholder="Buscar"
                      onChange={(e) => {
                        setQuery(e.target.value);
                      }}
                    />
                    <Search
                      className="absolute text-orange-500  right-2 top-2"
                      size={16}
                    />
                  </form>
                  <Popover>
                    <Button asChild variant={"outline"}>
                      <PopoverTrigger>
                        <SlidersHorizontal className="text-orange-500" />
                        Filtrar
                      </PopoverTrigger>
                    </Button>

                    <PopoverContent className="bg-transparent backdrop-blur-3xl p-0 border-0 rounded-none">
                      <Card className="bg-transparent backdrop-blur-3xl rounded-sm mt-2 p-2 flex flex-col gap-4">
                        <h1>Status</h1>
                        <span className="grid md:grid-cols-2 gap-4">
                          {["Todos", "Aprovado", "Reprovado", "Pendente"].map(
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
                                      setQuery("");
                                      break;
                                    case 1:
                                      setQuery("APROVED");
                                      break;
                                    case 2:
                                      setQuery("REJECTED");
                                      break;
                                    case 3:
                                      setQuery("PENDING");
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
                        <div className="border-t dark:border-white/10 w-full rounded-full"></div>
                        {query.length > 0 && (
                          <footer className="grid md:grid-cols-2 gap-4">
                            <Button
                              variant={"outline"}
                              onClick={() => {
                                setActiveStatus(0);
                                setQuery("");
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
              </span>
              {!isAdmin && (
                <div className="flex justify-end items-center">
                  <Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus />
                          Criar produto
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Cadastrar Produto</DialogTitle>
                          <DialogDescription>
                            Faça as alterações nas informações do produto aqui.
                            Clique em salvar quando terminar , adicione as
                            informações do seu produto e clique em salvar.
                          </DialogDescription>
                        </DialogHeader>

                        {/* Aqui sim o form funciona */}
                        <form onSubmit={handelOnSubmit} className="grid gap-4">
                          <div className="grid gap-3">
                            <Label htmlFor="name-1">Nome do produto</Label>
                            <Input
                              id="name-1"
                              name="title"
                              required
                              placeholder="Nome do produto"
                            />
                          </div>

                          <div className="grid gap-3">
                            <Label htmlFor="price">Preço do produto</Label>
                            <Input
                              id="price"
                              name="price"
                              min={100}
                              type="number"
                              placeholder="Preço do produto"
                              required
                            />
                          </div>

                          <div className="grid gap-3">
                            <Label htmlFor="description">
                              Descrição do Produto
                            </Label>
                            <Input
                              id="description"
                              name="description"
                              placeholder="Descrição do Produto"
                              required
                            />
                          </div>

                          <div className="grid gap-3">
                            <Label htmlFor="type">Tipo do produto</Label>
                            <Select name="type">
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Escolha uma opção" />
                              </SelectTrigger>
                              <SelectContent className="bg-transparent backdrop-blur-3xl">
                                <SelectItem value="curso online">
                                  Cursos Online
                                </SelectItem>
                                <SelectItem value="link">
                                  App / Software
                                </SelectItem>
                                <SelectItem value="ebook">Ebook</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" disabled={spin}>
                              {spin ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                "Salvar"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </Dialog>
                </div>
              )}
            </div>
          </>
        )}

        <>
          {load ? (
            <div className="flex  justify-center items-center mt-6">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <>
              {Array.isArray(filtredProducts) && filtredProducts.length > 0 ? (
                <aside>
                  <Card className="bg-transparent rounded-sm p-2">
                    <Table>
                      <TableCaption>lista dos meus produtos</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">ID</TableHead>
                          <TableHead>Produto</TableHead>
                          {isAdmin && <TableHead>Criador</TableHead>}
                          <TableHead>Data de Criação</TableHead>
                          <TableHead className="">Status</TableHead>
                          <TableHead className="">Preço</TableHead>
                          <TableHead className="w-20">LINK</TableHead>
                          <TableHead className="w-20">
                            {!isAdmin ? "Detalhes" : "Aprovação"}
                          </TableHead>
                          <TableHead className="w-10">Exluir</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtredProducts.map((item, key) => (
                          <TableRow key={key}>
                            <TableCell className="font-medium">
                              {item.order}
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-2">
                                <Avatar className="rounded-sm">
                                  <AvatarImage src={item.cover} />
                                  <AvatarFallback>
                                    <Image size={14} />
                                  </AvatarFallback>
                                </Avatar>
                                {item.title}
                              </span>
                            </TableCell>
                            {isAdmin && (
                              <TableCell>
                                <span className="flex items-center gap-2">
                                  <Avatar className="rounded-sm">
                                    <AvatarImage src={item.user?.profile} />
                                    <AvatarFallback>
                                      <Image size={14} />
                                    </AvatarFallback>
                                  </Avatar>
                                  {item.user?.name + " " + item.user?.lastname}
                                </span>
                              </TableCell>
                            )}
                            <TableCell>
                              {new Date(item.createdAt).toLocaleDateString(
                                "pt",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </TableCell>
                            <TableCell>
                              {item.status == "APROVED" ? (
                                <Badge variant={"outline"}>
                                  <BadgeCheck className="text-green-500" />{" "}
                                  Aprovado
                                </Badge>
                              ) : item.status == "REJECTED" ? (
                                <Badge variant={"outline"}>
                                  <AlertCircle className="text-red-500" />{" "}
                                  Reprovado
                                </Badge>
                              ) : (
                                <Badge variant={"outline"}>
                                  <Loader2 className="text-orange-500 animate-spin" />{" "}
                                  Editando
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {Number(item.price).toLocaleString("pt")}kz
                            </TableCell>
                            <TableCell>
                              <Button
                                className="dark:text-blue-500 underline"
                                variant={"link"}
                                asChild
                              >
                                {item.status == "APROVED" ? (
                                  <Link href={item.link ?? ""} target="_blank">
                                    Acessar link
                                  </Link>
                                ) : (
                                  <p>....</p>
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              {isAdmin ? (
                                <Button
                                  variant={"outline"}
                                  onClick={async () => {
                                    const token = localStorage.getItem("token");
                                    if (!token) {
                                      router.push("/");
                                      return;
                                    }

                                    setSpin(true);

                                    const data =
                                      await service.updateProductstatus(token, {
                                        id: item.id,
                                        status:
                                          item.status == "APROVED"
                                            ? "REJECTED"
                                            : "APROVED",
                                      });
                                    toast.info(data.message);
                                    setReload((prev) => !prev);

                                    setSpin(false);
                                  }}
                                >
                                  {spin ? (
                                    <Loader2 className="animate-spin" />
                                  ) : (
                                    <>
                                      {item.status == "APROVED"
                                        ? "Reprovar"
                                        : "Aprovar"}
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <>
                                  <>
                                    {(item.status === "APROVED" ||
                                      item.status === "PENDING") && (
                                      <Button variant="outline" asChild>
                                        <Link
                                          href={`/dashboard/products/edit/${item.id}`}
                                        >
                                          Editar
                                        </Link>
                                      </Button>
                                    )}
                                  </>
                                </>
                              )}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <Button variant={"outline"} asChild>
                                  <AlertDialogTrigger>
                                    <Trash size={17} className="text-red-500" />
                                  </AlertDialogTrigger>
                                </Button>

                                <AlertDialogContent className="dark:bg-transparent backdrop-blur-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Tem certeza que deseja excluir este
                                      produto?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Essa ação não poderá ser desfeita. O
                                      produto será removido permanentemente da
                                      sua lista, incluindo todas as informações
                                      relacionadas. Deseja continuar?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Fechar
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
                                        const dellelter = await service.delete(
                                          token,
                                          item.id
                                        );
                                        toast.info(dellelter.message);
                                        setReload((prev) => !prev);
                                        setTimeout(() => {
                                          setSpin(false);
                                        }, 1000);
                                      }}
                                      className="bg-red-500/7 text-red-500 border-red-500 dark:bg-red-500/7 dark:text-red-500 dark:border-red-500 border hover:bg-red-500/7 hover:text-red-500 hover:border-red-500"
                                    >
                                      {spin ? (
                                        <Loader2 className="animate-spin" />
                                      ) : (
                                        "Deletar"
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
                  </Card>
                </aside>
              ) : (
                <div className="flex justify-center items-center ">
                  <h1>Não foi encontrado produto</h1>
                </div>
              )}
            </>
          )}
        </>
      </section>
    </main>
  );
}
