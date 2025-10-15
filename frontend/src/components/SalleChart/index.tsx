"use client";

import { ptBR } from "date-fns/locale";
import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartTooltip } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatNumber } from "@/lib/utils";
import { Filter, ShoppingCart, TrendingUp } from "lucide-react";
import clsx from "clsx";
export function SalesChart({ data, isAdmin }: { data: any; isAdmin: boolean }) {
  const [stats, setStats] = React.useState(data?.stats ?? []);
  const [total, setTotal] = React.useState(stats[0]); // valor atual
  const [products, setProducts] = React.useState<any[]>(data.sells);
  const [selectedProduct, setSelectedProduct] = React.useState("all");

  const computedValue = React.useMemo(() => {
    if (selectedProduct === "all") {
      return total.value;
    }
    const product = products.find((p) => p.name === selectedProduct);

    if (!product) return 0;
    return product.total ?? 0;
  }, [selectedProduct, total, products]);

  const resetFilters = () => {
    setSelectedProduct("all");
    setTotal(stats[0]);
  };

  return (
    <Card className="bg-transparent backdrop-blur-2xl mb-8">
      {isAdmin ? (
        <CardHeader className="flex lg:flex-row flex-col justify-between gap-5 items-center">
          <div className="flex  gap-4 items-center justify-between  flex-col w-full lg:min-w-[20%] lg:items-start">
            <CardTitle>Vendas realizadas</CardTitle>
            <small className="text-green-500 flex gap-3">
              Valor líquido{" "}
              {Number((computedValue * 7) / 100).toLocaleString("pt")} kz{" "}
            </small>
            <CardDescription className="md:text-3xl text-xl dark:text-white text-black font-extrabold">
              {computedValue.toLocaleString("pt")} kz
            </CardDescription>
          </div>

          <form
            action=""
            className="flex lg:gap-2 gap-4 lg:flex-nowrap flex-wrap items-center"
          >
            {Array.isArray(stats) &&
              stats.map((item, index) => (
                <span
                  key={index}
                  className={clsx(
                    "flex justify-center items-center text-sm border rounded-sm px-3 min-w-20 cursor-pointer h-9 transition-all active:scale-95",
                    {
                      "dark:bg-gray-800/40 bg-orange-500 text-white":
                        total.label == item.label,
                    }
                  )}
                  onClick={() => {
                    setTotal(item);
                  }}
                >
                  {item.label}
                </span>
              ))}

            {/* filtro por produto */}
            <Select
              onValueChange={(value) => setSelectedProduct(value)}
              value={selectedProduct}
            >
              <SelectTrigger className="w-[220px]">
                <ShoppingCart className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                {products.map((p, index) => (
                  <SelectItem key={index} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* botão reset */}
            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
              className="lg:ml-2"
            >
              <Filter className="text-orange-500" />
              Limpar Filtros
            </Button>
          </form>
        </CardHeader>
      ) : (
        <CardHeader className="flex lg:flex-row flex-col justify-between gap-5 items-center">
          <div className="flex lg:flex-col gap-4 items-center justify-between  w-full lg:min-w-[20%] lg:items-start">
            <CardTitle>Vendas realizadas</CardTitle>

            <CardDescription className="md:text-3xl text-xl dark:text-white text-black font-extrabold">
              {Number(computedValue).toLocaleString("pt")} kz{" "}
            </CardDescription>
          </div>

          <form
            action=""
            className="flex lg:gap-2 gap-4 lg:flex-nowrap flex-wrap items-center"
          >
            {Array.isArray(stats) &&
              stats.map((item, index) => (
                <span
                  key={index}
                  className={clsx(
                    "flex justify-center items-center text-sm border rounded-sm px-3 min-w-20 cursor-pointer h-9 transition-all active:scale-95",
                    {
                      "dark:bg-gray-800/40 bg-orange-500 text-white":
                        total.label == item.label,
                    }
                  )}
                  onClick={() => {
                    setTotal(item);
                  }}
                >
                  {item.label}
                </span>
              ))}

            {/* filtro por produto */}
            <Select
              onValueChange={(value) => setSelectedProduct(value)}
              value={selectedProduct}
            >
              <SelectTrigger className="w-[220px]">
                <ShoppingCart className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                {products.map((p, index) => (
                  <SelectItem key={index} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* botão reset */}
            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
              className="lg:ml-2"
            >
              <Filter className="text-orange-500" />
              Limpar Filtros
            </Button>
          </form>
        </CardHeader>
      )}

      {/* gráfico fica igual */}
      <CardContent className="p-2">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.data}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleTimeString("pt-BR", {
                  month: "2-digit",
                })
              }
              className="capitalize"
              tick={{ fontSize: 12 }}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatNumber}
              axisLine={false}
              tickLine={true}
              width={30}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.85)",
                border: "none",
                borderRadius: "0.5rem",
                color: "#fff",
                fontSize: "0.85rem",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeWidth={1}
              fillOpacity={1}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
