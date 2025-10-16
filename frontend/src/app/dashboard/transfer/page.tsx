"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import {
  Loader,
  MoveLeft,
  MoveRight,
  SlidersHorizontal,
  Plus,
  Loader2,
} from "lucide-react";
import DashBoardHeader from "@/components/ui/headerDashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TransferService, { Transfer } from "@/services/trasnfer";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Transfers() {
  const [load, setLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filter, setFilter] = useState("ALL");
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([]);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState({
    recived: 0,
    transfered: 0,
    avaliable: 0,
  });

  const service = new TransferService();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function get() {
      setLoad(true);
      const res = await service.get(token as string, page);
      setTransfers(res.data ?? []);
      setFilteredTransfers(res.data ?? []);
      setLastPage(res.lastPage ?? 1);
      setStats(res.stats);
      setLoad(false);
      console.log(res);
    }

    get();
  }, [page]);

  useEffect(() => {
    if (filter === "ALL") {
      setFilteredTransfers(transfers);
    } else {
      const list = transfers.filter((t) => t.type === filter);
      setFilteredTransfers(list);
    }
  }, [filter, transfers]);

  async function handleCreate() {
    if (!email || !amount) return toast.info("Preencha todos os campos!");
    const token = localStorage.getItem("token");
    if (!token) return;

    setCreating(true);
    const res = await service.create(token as string, {
      to: email,
      amount: Number(amount),
    });
    setCreating(false);
    console.log(res);
    if (res.created) {
      toast.info("Transferência feita com sucesso!");
      setOpenDialog(false);
      setEmail("");
      setAmount("");
      const updated = await service.get(token, page);
      setTransfers(updated.data ?? []);
      setFilteredTransfers(updated.data ?? []);
    } else {
      toast.info(res.message || "Erro ao criar transferência");
    }
  }

  return (
    <main>
      <DashBoardHeader
        data={{
          canShowInput: false,
          isAdmin: false,
          pageTitle: "Transferências",
        }}
      />

      <section className="px-2 pt-5 place-self-center lg:w-[95%] w-full flex flex-col gap-6">
        {load ? (
          <div className="flex min-h-[30dvh] justify-center items-center mt-8">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <span className="flex flex-col gap-6">
            <aside className="grid w-full lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 py-5">
              <Card className="p-3 rounded-sm bg-transparent backdrop-blur-3xl shadow-orange-500/10 border-orange-500/20 shadow-2xl">
                <CardTitle className="text-sm dark:bg-orange-900 dark:border-orange-500 w-[60%] text-center p-1 rounded-sm md:w-[40%] border font-inter">
                  Total Recebido
                </CardTitle>
                <h1 className="font-inter text-4xl font-bold">
                  {Number(stats?.recived || 0).toLocaleString()} kz
                </h1>
                <CardDescription>
                  Valor total recebido em transferências
                </CardDescription>
              </Card>
              <Card className="p-3 rounded-sm bg-transparent backdrop-blur-3xl shadow-orange-500/10 border-orange-500/20 shadow-2xl">
                <CardTitle className="text-sm dark:bg-orange-900 dark:border-orange-500 w-[60%] text-center p-1 rounded-sm md:w-[40%] border font-inter">
                  Total Enviado
                </CardTitle>
                <h1 className="font-inter text-4xl font-bold">
                  {Number(stats?.transfered || 0).toLocaleString()} kz
                </h1>
                <CardDescription>
                  Valor total enviado em transferências
                </CardDescription>
              </Card>{" "}
              <Card className="p-3 rounded-sm bg-transparent backdrop-blur-3xl shadow-orange-500/10 border-orange-500/20 shadow-2xl">
                <CardTitle className="text-sm dark:bg-orange-900 dark:border-orange-500 w-[60%] text-center p-1 rounded-sm md:w-[40%] border font-inter">
                  Saldo total
                </CardTitle>
                <h1 className="font-inter text-4xl font-bold">
                  {Number(stats?.avaliable || 0).toLocaleString()} kz
                </h1>
                <CardDescription>
                  Valor total disponível para transferências
                </CardDescription>
              </Card>
            </aside>

            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Minhas Transferências</h1>

              <div className="flex gap-2">
                <Select defaultValue="ALL" onValueChange={setFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas</SelectItem>
                    <SelectItem value="INTERNAL">Internas</SelectItem>
                    <SelectItem value="EXTERNAL">Externas</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus size={16} />
                      Nova
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Transferência</DialogTitle>
                      <DialogDescription>
                        Envie dinheiro para outro usuário
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                      <Input
                        placeholder="Email do destinatário"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Input
                        placeholder="Montante (kz)"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreate} disabled={creating}>
                        {creating ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : null}
                        Enviar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>De</TableHead>
                    <TableHead>Para</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((t, i) => (
                    <TableRow key={t.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{t.fromUser?.email ?? "-"}</TableCell>
                      <TableCell>{t.toUser?.email ?? "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            t.type === "EXTERNAL"
                              ? "text-orange-500"
                              : "text-blue-500"
                          }
                        >
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            t.status === "APROVED"
                              ? "text-green-500"
                              : t.status === "PENDING"
                              ? "text-orange-500"
                              : "text-red-500"
                          }
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.amount.toLocaleString("pt")} kz</TableCell>
                      <TableCell>
                        {new Date(t.createdAt).toLocaleString("pt")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <span className="flex justify-center w-full py-4 gap-3 items-center">
                <p>
                  {page} de {lastPage}
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
                    onClick={() => setPage(Math.min(lastPage, page + 1))}
                    variant="outline"
                    disabled={page >= lastPage}
                  >
                    <MoveRight />
                  </Button>
                </span>
              </span>
            </div>
          </span>
        )}
      </section>
    </main>
  );
}
