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

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: 0,
  });

  const token = "seu_token_aqui"; // ou pegue do contexto/auth
  const client = new CouponClient(token);

  const loadCoupons = async () => {
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
      const ok = await client.remove(id);
      if (ok) {
        toast.success("Removido com sucesso");
        loadCoupons();
      } else toast.error("Erro ao remover");
    }
  };

  const handleToggle = async (id: string) => {
    const ok = await client.toggle(id);
    if (ok) {
      toast.success("Status alterado!");
      loadCoupons();
    } else toast.error("Erro ao alterar status");
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  return (
    <section className="w-full flex flex-col">
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
                    <TableHead>Expira em</TableHead>
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
  );
}
