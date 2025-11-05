"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import clsx from "clsx";
import {
  AlertCircle,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  MoveLeft,
  MoveRight,
  ShieldOff,
  SlidersHorizontal,
} from "lucide-react";
import { User } from "@/types/user";
import DashBoardHeader from "@/components/ui/headerDashboard";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Stats from "@/components/ui/stats";

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

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserGetter from "@/services/user/get";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
const service = new UserGetter();
export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState(0);
  const [page, setPage] = useState(1);
  const [load, setLoad] = useState(true);
  const [reload, setReload] = useState(false);
  const router = useRouter();
  const [filteredUsers, setFiltred] = useState<User[]>([]);
  const [stats, setstats] = useState<any[]>([]);
  const [loadFiles, setLoadFiles] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userFiles, setUserFiles] = useState({
    front: "",
    back: "",
    selfie: "",
  });

  const [status, setStatus] = useState("");
  const [lastPage, setLasPage] = useState(0);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    async function getUsers(token: string) {
      try {
        const data = await service.getAllUser(token, page);
        if (data?.data) {
          setUsers(data.data);
          setLasPage(data.lastpage || 0);
          // Corrigindo o problema do stats undefined
          setstats(data.stats || []); // Fallback para array vazio
        } else {
          setUsers([]);
          setstats([]);
        }
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        setUsers([]);
        setstats([]);
        toast.error("Erro ao carregar usuários");
      } finally {
        setLoad(false);
      }
    }
    getUsers(token);
  }, [page, reload, router]);

  useEffect(() => {
    if (!Array.isArray(users)) {
      setFiltred([]);
      return;
    }
    if (search.length === 0) {
      setFiltred(users);
      return;
    }
    const statuses = ["PENDING", "CREATED", "REJECTED", "APROVED", "BANED"];
    const searchUpper = search.toUpperCase();
    const newList = users.filter((item) => {
      const status = item.status.toUpperCase();
      if (statuses.includes(searchUpper)) {
        if (searchUpper === "PENDING" || searchUpper === "CREATED") {
          return status.includes("PENDING") || status.includes("CREATED");
        }
        return status.includes(searchUpper);
      }
      return (
        item.name.toUpperCase().includes(searchUpper) ||
        item.lastname.toUpperCase().includes(searchUpper) ||
        item.email.toUpperCase().includes(searchUpper) ||
        status.includes(searchUpper)
      );
    });

    setFiltred(newList);
  }, [users, search]);
  async function getUserFiles(userid: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    setLoadFiles(true);
    try {
      const data = (await service.getUserVerificationFiles(
        token,
        userid
      )) as any;

      if (!data?.found) {
        toast.info("Imagens não encontradas");
        setUserFiles({
          front: "",
          back: "",
          selfie: "",
        });
      } else {
        // Valida se as URLs são válidas
        const validatedFiles = {
          front: data.front || "",
          back: data.back || "",
          selfie: data.selfie || "",
        };
        setUserFiles(validatedFiles);
      }
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
      toast.error("Erro ao carregar imagens");
      setUserFiles({
        front: "",
        back: "",
        selfie: "",
      });
    } finally {
      setLoadFiles(false);
    }
  }
  return (
    <main className="space-y-4">
      <DashBoardHeader
        data={{
          canShowInput: true,
          isAdmin: false,
          pageTitle: "",
          inputPlaceHolder: "",
        }}
      />

      {load ? (
        <div className="flex justify-center items-center min-h-[40dvh]">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          {" "}
          <div className="flex flex-col gap-4 px-2 w-full mt-8">
            {Array.isArray(users) && (
              <aside className="grid mb-6 lg:grid-cols-4 md:grid-cols-2 gap-4">
                {Array.isArray(stats) && stats.length > 0 ? (
                  stats.map((item, index) => <Stats stats={item} key={index} />)
                ) : (
                  <div className="col-span-full text-center py-4 text-gray-500"></div>
                )}
              </aside>
            )}
            <div className="flex justify-between items-center">
              <Input
                placeholder="Filtrar por nome ou email..."
                className="max-w-xs"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
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
                                  setSearch("BANED");
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
            </div>
            <Card className="flex mb-20 flex-col gap-3 bg-transparent rounded-sm p-2">
              <Table>
                <TableCaption>Lista de usuários cadastrados</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Facturado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(filteredUsers) &&
                    filteredUsers.length > 0 &&
                    filteredUsers.map((user, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.profile} alt={user.name} />
                            <AvatarFallback>
                              {user.name[0]}
                              {user.lastname[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.name} {user.lastname}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.telefone}</TableCell>
                        <TableCell>
                          {Number(user.availableBalance ?? 0).toLocaleString(
                            "pt"
                          )}{" "}
                          kz
                        </TableCell>
                        <TableCell>
                          {Number(user.totalEarned ?? 0).toLocaleString("pt")}{" "}
                          kz
                        </TableCell>

                        <TableCell>
                          {user.status == "APROVED" ? (
                            <Badge variant={"outline"}>
                              <BadgeCheck className="text-green-500" />
                              Verificado
                            </Badge>
                          ) : user.status == "PENDING" ||
                            user.status == "CREATED" ? (
                            <Badge variant={"outline"}>
                              <Loader2 className="text-orange-500 animate-spin" />
                              Pendente
                            </Badge>
                          ) : (
                            <Badge variant={"outline"}>
                              <AlertCircle className="text-red-500" />
                              Rejeitado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString("pt", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })}{" "}
                        </TableCell>
                        <TableCell className="text-right gap-5 grid grid-cols-2 items-center w-50">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <ShieldOff className="text-red-500" />
                                Banir
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="">
                              <DialogHeader>
                                <DialogTitle>
                                  Deseja banir este vendedor ?
                                </DialogTitle>
                                <DialogDescription>
                                  Esta acção não pode ser desfeita
                                </DialogDescription>
                              </DialogHeader>
                              <Button
                                onClick={async () => {
                                  setProcessing(true);
                                  const token = localStorage.getItem("token");
                                  if (!token) {
                                    router.push("/");
                                    return;
                                  }
                                  const updated = await service.updteUserStatus(
                                    token,
                                    {
                                      status: "2",
                                      userid: user.id,
                                    }
                                  );
                                  toast.info(updated.message);
                                  setReload((prev) => !prev);
                                  setProcessing(false);
                                }}
                              >
                                {processing ? (
                                  <Loader2 className="animate-spin" />
                                ) : (
                                  "Banir"
                                )}
                              </Button>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger
                              onClick={async () => {
                                await getUserFiles(user.id);
                              }}
                              asChild
                            >
                              <Button size="sm">Verificar</Button>
                            </DialogTrigger>
                            <DialogContent className="">
                              <DialogHeader>
                                <DialogTitle>
                                  Verificação do Vendedor
                                </DialogTitle>
                              </DialogHeader>

                              {loadFiles ? (
                                <div className="flex justify-center items-center mt-5">
                                  <Loader2 className="animate-spin" />
                                </div>
                              ) : (
                                <div className="grid mt-4 w-ful  md:grid-cols-3 gap-4">
                                  {userFiles.back && (
                                    <div
                                      key={userFiles.back}
                                      className="flex flex-col items-center space-y-2 "
                                    >
                                      <img
                                        src={userFiles.back}
                                        alt={"Trasiro"}
                                        width={150}
                                        height={150}
                                        className="rounded-lg border"
                                        onError={(e) => {
                                          e.currentTarget.src = "/gil.jpg";
                                          e.currentTarget.alt =
                                            "Imagem não disponível";
                                        }}
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const link =
                                            document.createElement("a");
                                          link.href = userFiles.back;
                                          link.download = "Verso";
                                          link.click();
                                        }}
                                      >
                                        Baixar
                                      </Button>
                                    </div>
                                  )}
                                  {userFiles.selfie && (
                                    <div
                                      key={userFiles.selfie}
                                      className="flex flex-col items-center space-y-2 "
                                    >
                                      <img
                                        src={userFiles.selfie}
                                        alt={"Selfie"}
                                        width={150}
                                        height={150}
                                        className="rounded-lg border"
                                        onError={(e) => {
                                          e.currentTarget.src = "/gil.jpg";
                                          e.currentTarget.alt =
                                            "Imagem não disponível";
                                        }}
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const link =
                                            document.createElement("a");
                                          link.href = userFiles.selfie;
                                          link.download = "Selfie";
                                          link.click();
                                        }}
                                      >
                                        Baixar
                                      </Button>
                                    </div>
                                  )}
                                  {userFiles.front && (
                                    <div
                                      key={userFiles.front}
                                      className="flex flex-col items-center space-y-2 "
                                    >
                                      <img
                                        src={userFiles.front}
                                        alt={"Frontal"}
                                        width={150}
                                        height={150}
                                        className="rounded-lg border"
                                        onError={(e) => {
                                          e.currentTarget.src = "/gil.jpg";
                                          e.currentTarget.alt =
                                            "Imagem não disponível";
                                        }}
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const link =
                                            document.createElement("a");
                                          link.href = userFiles.front;
                                          link.download = "Frontal";
                                          link.click();
                                        }}
                                      >
                                        Baixar
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="mt-6">
                                <Select onValueChange={setStatus}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione uma opção" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">Aprovar</SelectItem>
                                    <SelectItem value="0">Reprovar</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                onClick={async () => {
                                  setProcessing(true);
                                  const token = localStorage.getItem("token");
                                  if (!token) {
                                    router.push("/");
                                    return;
                                  }
                                  const updated = await service.updteUserStatus(
                                    token,
                                    {
                                      status: status as "1" | "0",
                                      userid: user.id,
                                    }
                                  );
                                  toast.info(updated.message);
                                  setReload((prev) => !prev);
                                  setProcessing(false);
                                }}
                              >
                                {processing ? (
                                  <Loader2 className="animate-spin" />
                                ) : (
                                  "Salvar"
                                )}
                              </Button>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <span className="flex flex-wrap justify-center w-full place-self-center text-nowrap py-4 gap-3 items-center">
                <p>
                  {page} de {lastPage}
                </p>
                <span className="flex gap-2 mx-4">
                  <Button
                    onClick={() => {
                      setPage(Math.max(1, page - 1));
                    }}
                    variant="outline"
                    disabled={page <= 1}
                  >
                    <MoveLeft />
                  </Button>
                  <Button
                    onClick={() => {
                      setPage(Math.min(lastPage, page + 1));
                    }}
                    variant="outline"
                    disabled={page >= lastPage}
                  >
                    <MoveRight />
                  </Button>
                </span>
              </span>
            </Card>
          </div>
        </>
      )}
    </main>
  );
}
