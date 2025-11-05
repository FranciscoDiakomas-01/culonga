"use client";

import { TrendingUp, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { decodeToken } from "@/lib/utils";
import ProductConsumer from "@/services/product";

export const description = "A bar chart";

const chartConfig = {
  sales: {
    label: "Vendas",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type IProduct = {
  id: string;
  order: number;
  title: string;
  cover: string;
  createdAt: string;
  status: string;
  link: string;
  price: number;
  user?: any;
  totalPurchase: number;
};

export function BestSales() {
  const [load, setLoad] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myProducts, setMyProducts] = useState<IProduct[]>([]);
  const service = new ProductConsumer();

  // Transforma os produtos em dados para o gráfico
  const chartData = myProducts
    .filter((product) => product.totalPurchase > 0) // Apenas produtos com vendas
    .slice(0, 6) // Limita a 6 produtos para o gráfico
    .map((product, index) => ({
      product:
        product.title.length > 15
          ? product.title.substring(0, 15) + "..."
          : product.title,
      sales: product.totalPurchase,
      fullName: product.title,
      price: product.price,
    }));

  useEffect(() => {
    setLoad(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAdmin(false);
      setLoad(false);
      return;
    }

    const decoded = decodeToken(token);
    const userIsAdmin = decoded?.role === "ADMIN";
    setIsAdmin(userIsAdmin);

    // Se for admin, não carrega os dados
    if (userIsAdmin) {
      setLoad(false);
      return;
    }

    async function get(token: string) {
      try {
        const data1 = await service.get(token, 1);
        setMyProducts(data1.products || []);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        setMyProducts([]);
      } finally {
        setLoad(false);
      }
    }
    get(token);
  }, []);

  // Se estiver carregando, não mostra nada
  if (load) {
    return (
      <Card className="bg-transparent backdrop-blur-2xl mb-8">
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Se for admin, não mostra o gráfico
  if (isAdmin) {
    return null;
  }

  // Se não há dados de vendas
  if (chartData.length === 0) {
    return (
      <Card className="bg-transparent backdrop-blur-2xl mb-8">
        <CardHeader>
          <CardTitle>Vendas por Produto</CardTitle>
          <CardDescription>Seus produtos mais vendidos</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p className="text-muted-foreground text-center">
            Nenhuma venda registrada ainda.
            <br />
            Seus produtos aparecerão aqui quando começarem a vender.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalVendas = chartData.reduce((sum, item) => sum + item.sales, 0);
  const produtoMaisVendido = chartData.reduce((prev, current) =>
    prev.sales > current.sales ? prev : current
  );

  return (
    <Card className="bg-transparent backdrop-blur-2xl mb-8">
      <CardHeader>
        <CardTitle>Vendas por Produto</CardTitle>
        <CardDescription>
          Desempenho dos seus produtos mais vendidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="product"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelKey="fullName"
                  formatter={(value, name, item) => [`${value} vendas`, name]}
                />
              }
            />
            <Bar
              dataKey="sales"
              fill="var(--color-sales)"
              radius={8}
              name="Vendas"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Total: {totalVendas} vendas este mês
          {totalVendas > 0 && <TrendingUp className="h-4 w-4" />}
        </div>
        <div className="text-muted-foreground leading-none">
          Produto mais vendido: {produtoMaisVendido.fullName} (
          {produtoMaisVendido.sales} vendas)
        </div>
      </CardFooter>
    </Card>
  );
}
