"use client";

import { Card } from "@/components/ui/card";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  ArrowLeft,
  CreditCard,
  Edit,
  Loader2,
  Search,
  Trash,
} from "lucide-react";

import {
  SelectTrigger,
  SelectValue,
  Select,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isValidUrl, validarIbanAngola } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import PaymentService from "@/services/Payments";

export default function MyIntegrations() {
  const [load, setLoad] = useState(true);
  const [myInterations, setMyIntegrations] = useState<any[]>([]);
  const service = new PaymentService();
  const [spin, setSpin] = useState(false);
  const [iban, setIban] = useState("");
  const router = useRouter();
  const [selected, setSelected] = useState<string | undefined>();
  const [active, setActive] = useState<any>({
    id: 0,
    image: "",
    title: "",
    iban: "",
  });
  const [reload, setReload] = useState(false);
  const bancos = [
    { nome: "Banco Angolano de Investimentos S.A. (BAI)", sigla: "BAI" },
    { nome: "Banco de Comércio e Indústria S.A. (BCI)", sigla: "BCI" },

    { nome: "Banco de Negócios Internacional S.A. (BancoBNI)", sigla: "BNI" },
    { nome: "Banco BIC S.A.", sigla: "BIC" },
    { nome: "Banco Comercial Angolano S.A. (BCA)", sigla: "BCA" },

    { nome: "Banco de Desenvolvimento de Angola S.A. (BDA)", sigla: "BDA" },
    { nome: "Banco de Fomento Angola S.A. (BFA)", sigla: "BFA" },
    { nome: "Banco de Poupança e Crédito S.A. (BPC)", sigla: "BPC" },
    { nome: "Banco Millenium Atlântico S.A.", sigla: "Atlântico" },
    { nome: "Banco Keve S.A.", sigla: "KEVE" },
    { nome: "Banco Sol S.A.", sigla: "SOL" },
    { nome: "Banco Yetu, S.A.", sigla: "YETU" },
    { nome: "Standard Bank de Angola S.A.", sigla: "Standard Bank" },
  ];
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    async function get() {
      const data = await service.getMyBanks(token ?? "");
      setMyIntegrations(data);
      setTimeout(() => {
        setLoad(false);
      }, 500);
    }
    get();
  }, [reload]);

  async function handelOnUbMit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    if (!iban || !selected) {
      toast.info("Alerta", {
        description: "Preenche todos os dados",
      });
      return;
    }
    if (!iban.startsWith("AO06") || iban.length < 25) {
      toast.info("Alerta", {
        description: "IBAN inválido",
      });
      return;
    }
    setSpin(true);
    const data = await service.createBank(token, {
      title: selected,
      iban,
      image: "",
    });
    toast.info(data?.message);
    setReload((prev) => !prev);
    setSpin(false);
  }
  async function edit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    if (!active.iban || !active.title) {
      toast.info("Alerta", {
        description: "Preenche todos os dados",
      });
      return;
    }
    if (active.iban.length < 25 || active.iban.length > 25) {
      toast.info("Alerta", {
        description: "IBAN inválido",
      });
      return;
    }
    setSpin(true);
    const data = await service.editBank(
      token,
      {
        title: active.title,
        iban: active.iban,
        image: "",
      },
      active.id
    );
    toast.info(data?.message);
    setReload((prev) => !prev);
    setSpin(false);
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
        <h1 className="text-xl">Minhas Carteiras</h1>
        <span className="flex lg:w-[30%] gap-4">
          <Button
            variant={"outline"}
            onClick={() => {
              router.back();
            }}
          >
            <ArrowLeft />
            Voltar
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <CreditCard />
                Registrar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form
                action=""
                onSubmit={handelOnUbMit}
                className="flex flex-col gap-4"
              >
                <DialogHeader>
                  <DialogTitle>Registrar carteira</DialogTitle>
                  <DialogDescription>Preencha as informações</DialogDescription>
                </DialogHeader>
                <Label>Banco</Label>
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma carteira" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-transparent backdrop-blur-3xl">
                    {bancos.map((banco, index) => (
                      <SelectItem key={index} value={banco.sigla}>
                        {banco.sigla}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label>IBAN</Label>
                <Input
                  required
                  placeholder="IBAN"
                  type="text"
                  minLength={25}
                  maxLength={25}
                  onChange={(e) => {
                    setIban(e.target.value);
                  }}
                />
                <DialogFooter>
                  <Button variant="outline" asChild>
                    <DialogClose>Cancelar</DialogClose>
                  </Button>
                  <Button type="submit">
                    {spin ? <Loader2 className="animate-spin" /> : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </span>

        {load ? (
          <aside className="flex justify-center items-center min-h-[50dvh]">
            <Loader2 className="animate-spin" />
          </aside>
        ) : (
          <aside>
            {Array.isArray(myInterations) && myInterations.length > 0 ? (
              <Card className="bg-transparent backdrop-blur-2xl rounded-sm p-4 mb-4">
                <Table>
                  <TableCaption>Lista das minhas carteiras</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Banco</TableHead>
                      <TableHead>IBAN</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myInterations.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.iban}</TableCell>
                        <TableCell>
                          <span className="bg-green-500/10 text-green-500 rounded-sm border-green-500 p-1 text-[12px] flex justify-center items-center w-20">
                            Activa
                          </span>
                        </TableCell>
                        <TableCell className="gap-4 grid grid-cols-2 w-50">
                          <Dialog>
                            <DialogTrigger
                              onClick={() => {
                                setActive(item);
                              }}
                              asChild
                            >
                              <Button>
                                <CreditCard />
                                Editar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <form
                                action=""
                                onSubmit={edit}
                                className="flex flex-col gap-4"
                              >
                                <DialogHeader>
                                  <DialogTitle>Editar carteira</DialogTitle>
                                  <DialogDescription>
                                    Preencha as informações
                                  </DialogDescription>
                                </DialogHeader>
                                <Label>Banco</Label>
                                <Select
                                  value={active.title}
                                  onValueChange={(e) => {
                                    setActive((prev: any) => ({
                                      ...prev,
                                      title: e,
                                    }));
                                  }}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione uma carteira" />
                                  </SelectTrigger>
                                  <SelectContent className="dark:bg-transparent backdrop-blur-3xl">
                                    {bancos.map((banco, index) => (
                                      <SelectItem
                                        key={index}
                                        value={banco.sigla}
                                      >
                                        {banco.sigla}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Label>IBAN</Label>
                                <Input
                                  required
                                  placeholder="IBAN"
                                  type="text"
                                  minLength={25}
                                  maxLength={27}
                                  value={active.iban}
                                  onChange={(e) => {
                                    setActive((prev: any) => ({
                                      ...prev,
                                      iban: e.target.value,
                                    }));
                                  }}
                                />
                                <DialogFooter>
                                  <Button variant="outline" asChild>
                                    <DialogClose>Cancelar</DialogClose>
                                  </Button>
                                  <Button type="submit">
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
                          <Button
                            onClick={async () => {
                              const token = localStorage.getItem("token");
                              if (!token) {
                                router.push("/");
                                return;
                              }
                              const data = await service.delete(token, item.id);
                              toast.info(
                                data.deleted
                                  ? "Deletado com sucesso "
                                  : data.message
                              );
                              setReload((prev) => !prev);
                            }}
                            variant={"outline"}
                          >
                            Remover
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              <div className="flex justify-center items-center gap-6 w-full flex-col">
                <h1 className="flex justify-center items-center text-center text-sm">
                  Sem carteira registrada
                </h1>
              </div>
            )}
          </aside>
        )}
      </section>
    </main>
  );
}
