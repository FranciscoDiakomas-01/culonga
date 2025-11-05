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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      const data = await service.getAllUser(token, page);
      if (data.data) {
        setUsers(data.data);
        setLasPage(data.lastpage);
        setstats(data.stats ?? []); // ✅ fallback caso stats venha undefined
      }
      setLoad(false);
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
    const data = (await service.getUserVerificationFiles(token, userid)) as any;

    if (!data?.found) {
      toast.info("Imagens não encontradas");
    } else {
      setUserFiles(data);
    }
    setLoadFiles(false);
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
        <div className="flex flex-col gap-4 px-2 w-full mt-8">
          {Array.isArray(stats) && stats.length > 0 && (
            <aside className="grid mb-6 lg:grid-cols-4 md:grid-cols-2 gap-4">
              {stats.map((item, index) => (
                <Stats stats={item} key={index} />
              ))}
            </aside>
          )}

          <div className="flex justify-between items-center">
            <Input
              placeholder="Filtrar por nome ou email..."
              className="max-w-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                              "bg-orange-500 text-white": activeStatus == index,
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
                        {user.status === "APROVED" ? (
                          <Badge variant={"outline"}>
                            <BadgeCheck className="text-green-500" />
                            Verificado
                          </Badge>
                        ) : user.status === "PENDING" ||
                          user.status === "CREATED" ? (
                          <Badge variant={"outline"}>
                            <Loader2 className="
