"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Copy, ShoppingBag, TrendingUp, CalendarDays } from "lucide-react";
import { useState } from "react";

type Afilition = {
  id: number;
  userId: string;
  totalSells: number;
  totalPurchase: number;
  productId: string;
  link: string;
  status: boolean;
  createdAt: Date;
  product: {
    user: {
      email: string;
      id: string;
      name: string;
      profile: string;
    };
    title: string;
    description: string;
    price: number;
    percentShare: string;
    banner: string;
    cover: string;
    id: string;
  };
};

export function AfilitionCard({ afilition }: { afilition: Afilition }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(afilition.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="relative overflow-hidden rounded-2xl shadow-lg border border-muted bg-card transition-all hover:shadow-xl">
      {/* Banner do produto */}
      <div className="relative">
        <img
          src={afilition.product.banner}
          alt={afilition.product.title}
          className="w-full h-48 object-cover"
        />

        {/* Avatar do criador sobreposto */}
        <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2">
          <Avatar className="w-20 h-20 ring-4 ring-background shadow-md">
            <AvatarImage
              src={afilition.product.user.profile}
              alt={afilition.product.user.name}
            />
            <AvatarFallback>
              {afilition.product.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Cabeçalho */}
      <CardHeader className="mt-12 text-center space-y-1">
        <h3 className="text-xl font-semibold">{afilition.product.title}</h3>
        <p className="text-sm text-muted-foreground">
          por {afilition.product.user.name}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 px-6">
        {/* Badges */}
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge
            className={`${
              afilition.status
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-500 hover:bg-gray-600"
            } text-white`}
          >
            {afilition.status ? "Ativo" : "Inativo"}
          </Badge>
          <Badge variant="outline">
            Comissão {afilition.product.percentShare}
          </Badge>
          <Badge variant="secondary">${afilition.product.price}</Badge>
        </div>

        {/* Descrição */}
        <p className="text-sm text-center text-muted-foreground line-clamp-3">
          {afilition.product.description}
        </p>

        <Separator />

        {/* Estatísticas */}
        <div className="grid grid-cols-3 text-center">
          <div className="flex flex-col items-center">
            <ShoppingBag className="w-5 h-5 mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">Vendas</span>
            <p className="font-semibold">{afilition.totalSells}</p>
          </div>

          <div className="flex flex-col items-center">
            <TrendingUp className="w-5 h-5 mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">Ganhos</span>
            <p className="font-semibold">
              ${afilition.totalPurchase.toFixed(2)}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <CalendarDays className="w-5 h-5 mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">Criado em</span>
            <p className="font-semibold">
              {new Date(afilition.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Avatares sobrepostos de afiliados hipotéticos */}
        <div className="flex justify-center -space-x-3 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Avatar key={i} className="w-8 h-8 border-2 border-background">
              <AvatarImage src={`https://i.pravatar.cc/150?img=${i + 5}`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          ))}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium border-2 border-background">
            +3
          </div>
        </div>
      </CardContent>

      {/* Rodapé */}
      <CardFooter className="flex justify-between px-6 pb-4 pt-2 border-t">
        <Button
          variant="outline"
          onClick={handleCopy}
          className="flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          {copied ? "Link copiado!" : "Copiar link"}
        </Button>
        <Button className="bg-primary text-white hover:bg-primary/90">
          Ver detalhes
        </Button>
      </CardFooter>
    </Card>
  );
}

import { Percent, Loader2 } from "lucide-react";
import server from "@/services/server";
import { toast } from "sonner";

interface ProductDisponibleToJoin {
  user: {
    email: string;
    id: string;
    name: string;
    profile: string;
  };
  title: string;
  description: string;
  price: number;
  percentShare: string;
  banner: string;
  cover: string;
  id: string;
}

export function ProductToJoinCard({
  product,
}: {
  product: ProductDisponibleToJoin;
}) {
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    console.log("Afiliando ao produto:", product.id);
    const token = localStorage.getItem("token") as string;
    const res = await fetch(`${server}affiliates/${product.id}`, {
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
    });
    const data = await res.json();
    toast.info(data?.message);
    setLoading(false);
  };

  return (
    <Card className="relative overflow-hidden rounded-2xl shadow-lg border border-muted bg-card transition-all hover:shadow-xl">
      {/* Banner */}
      <div className="relative">
        <img
          src={product.banner}
          alt={product.title}
          className="w-full h-48 object-cover"
        />

        {/* Avatar do criador sobreposto */}
        <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2">
          <Avatar className="w-20 h-20 ring-4 ring-background shadow-md">
            <AvatarImage src={product.user.profile} alt={product.user.name} />
            <AvatarFallback>
              {product.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Cabeçalho */}
      <CardHeader className="mt-12 text-center space-y-1">
        <h3 className="text-xl font-semibold">{product.title}</h3>
        <p className="text-sm text-muted-foreground">por {product.user.name}</p>
      </CardHeader>

      {/* Conteúdo */}
      <CardContent className="space-y-4 px-6">
        {/* Badges */}
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" />${product.price}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Percent className="w-3 h-3" />
            {product.percentShare}
          </Badge>
        </div>

        {/* Descrição */}
        <p className="text-sm text-center text-muted-foreground line-clamp-3">
          {product.description}
        </p>

        <Separator />

        {/* Criador */}
        <div className="flex justify-center items-center gap-2 mt-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={product.user.profile} />
            <AvatarFallback>
              {product.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-semibold text-sm">{product.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {product.user.email}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Rodapé */}
      <CardFooter className="flex justify-center border-t pt-4 pb-4">
        <Button
          disabled={loading}
          onClick={handleJoin}
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processando...
            </>
          ) : (
            "Tornar-se afiliado"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
