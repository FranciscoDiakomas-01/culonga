"use client";

import { useEffect, useState } from "react";
import CouponClient, { Coupon } from "@/services/Cupon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashBoardHeader from "@/components/ui/headerDashboard";
import { useRouter } from "next/navigation";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: 0,
  });

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/");
      localStorage.clear();
    }
  }, [router]);

  const loadCoupons = async () => {
    const client = new CouponClient(localStorage.getItem("token") as string);
    setLoading(true);

    const list = await client.list();
    if (list) setCoupons(list);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newCoupon.code || !newCoupon.discount) {
      toast.error("Preencha todos os campos");
      return;
    }

    const client = new CouponClient(localStorage.getItem("token") as string);

    const created = await client.create(newCoupon);
    if (created) {
      toast.success("Cupom criado!");
      setNewCoupon({ code: "", discount: 0 });
      loadCoupons();
    } else {
      toast.error("Erro ao criar cupom");
    }
  };

  const handleRemove = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cupom?")) {
      const client = new CouponClient(localStorage.getItem("token") as string);
      const ok = await client.remove(id);
      if (ok) {
        toast.success("Removido com sucesso");
        loadCoupons();
      } else toast.error("Erro ao remover");
    }
  };

  const handleToggle = async (id: string) => {
    const client = new CouponClient(localStorage.getItem("token") as string);
    const ok = await client.toggle(id);
    if (ok) {
      toast.success("Status alterado!");
      loadCoupons();
    } else toast.error("Erro ao alterar status");
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // --- 📊 Estatísticas derivadas da lista ---
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.active).length;
  const inactiveCoupons = totalCoupons - activeCoupons;

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
        {/* --- Cards de Estatísticas --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border border-gray-200 shadow-sm">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-sm text-gray-500">Total</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-2xl font-semibold">
              {totalCoupons}
            </CardContent>
          </Card>

          <Card className="p-4 border border-green-200 shadow-sm">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-sm text-green-600">Ativos</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-2xl font-semibold text-green-600">
              {activeCoupons}
            </CardContent>
          </Card>

          <Card className="p-4 border border-red-200 shadow-sm">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-sm text-red-600">Inativos</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-2xl font-semibold text-red-600">
              {inactiveCoupons}
            </CardContent>
          </Card>
        </div>

        {/* --- Formulário de Criação --- */}
        <Card className="p-4 mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Criar Cupom</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3 flex-col sm:flex-row">
            <Input
              placeholder="Código"
              value={newCoupon.code}
              onChange={(e) =>
                setNewCoupon({ ...newCoupon, code: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Desconto (%)"
              value={newCoupon.discount}
              onChange={(e) =>
                setNewCoupon({
                  ...newCoupon,
                  discount: Number(e.target.value),
                })
              }
            />
            <Button onClick={handleCreate}>Criar</Button>
          </CardContent>
        </Card>

        {/* --- Tabela de Cupons --- */}
        <Card>
          <CardHeader>
            <CardTitle>Seus Cupons</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando...</p>
            ) : coupons.length === 0 ? (
              <p className="text-gray-500">Nenhum cupom encontrado.</p>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.code}</TableCell>
                        <TableCell>{c.discount}%</TableCell>
                        <TableCell>
                          {c.active ? (
                            <span className="text-green-600 font-semibold">
                              Ativo
                            </span>
                          ) : (
                            <span className="text-gray-500 font-semibold">
                              Inativo
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant={c.active ? "secondary" : "default"}
                            size="sm"
                            onClick={() => handleToggle(c.id)}
                          >
                            {c.active ? "Desativar" : "Ativar"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemove(c.id)}
                          >
                            Remover
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
