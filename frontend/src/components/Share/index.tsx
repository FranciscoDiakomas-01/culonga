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
import {
  Copy,
  ShoppingBag,
  TrendingUp,
  CalendarDays,
  Handbag,
} from "lucide-react";
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
    <Card className="relative overflow-hidden rounded-md border-white/10 shadow-lg border  bg-transparent transition-all hover:shadow-xl p-0">
      <div className="relative">
        <img
          src={afilition.product.banner}
          alt={afilition.product.title}
          className="w-full h-48 object-cover"
        />

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

      <CardHeader className="mt-12 text-center space-y-1">
        <h3 className="text-xl font-semibold">{afilition.product.title}</h3>
        <p className="text-sm text-muted-foreground">
          por {afilition.product.user.name}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 px-6">
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

          <Badge variant="secondary" className="flex items-center gap-1">
            <Handbag className="w-3 h-3" />
            {(() => {
              const gain =
                (afilition.product.price - afilition.product.price * 0.08) *
                (parseFloat(afilition.product.percentShare) / 100);
              return `+${gain.toFixed(2)} KZ`;
            })()}{" "}
            ganho
          </Badge>
        </div>

        <p className="text-sm text-center text-muted-foreground line-clamp-3">
          {afilition.product.description}
        </p>

        <Separator />

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
      </CardContent>
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
      method: "POST",
    });
    const data = await res.json();
    toast.info(data?.message);
    setLoading(false);
  };

  return (
    <Card className="relative overflow-hidden rounded-md border-white/10 shadow-lg border  bg-transparent transition-all hover:shadow-xl p-0">
      <div className="relative">
        <img
          src={product.banner}
          alt={product.title}
          className="w-full h-48 object-cover rounded-t-2xl"
        />

        {/* Avatar sobreposto */}
        <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2">
          <Avatar className="w-20 h-20 ring-4 ring-background shadow-md">
            <AvatarImage src={product.user.profile} alt={product.user.name} />
            <AvatarFallback>
              {product.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardHeader className="mt-12 text-center space-y-1 p-0 pt-2">
        <h3 className="text-xl font-semibold">{product.title}</h3>
        <p className="text-sm text-muted-foreground">Por {product.user.name}</p>
        <p className="font-semibold text-sm">{product.user.name}</p>
        <p className="text-xs text-muted-foreground">{product.user.email}</p>
      </CardHeader>

      <CardContent className="space-y-4 px-6 pt-2">
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" />${product.price}
          </Badge>

          <Badge variant="outline" className="flex items-center gap-1">
            <Percent className="w-3 h-3" />
            {product.percentShare}%
          </Badge>

          <Badge variant="secondary" className="flex items-center gap-1">
            <Handbag className="w-3 h-3" />
            {(() => {
              const gain =
                (product.price - product.price * 0.08) *
                (parseFloat(product.percentShare) / 100);
              return `+${gain.toFixed(2)} KZ`;
            })()}{" "}
            ganho
          </Badge>
        </div>

        <p className="text-sm text-center text-muted-foreground line-clamp-3">
          {product.description}
        </p>
        <Separator />
      </CardContent>

      <CardFooter className="flex justify-center border-t pt-4 pb-4">
        <Button
          disabled={loading}
          onClick={async () => {
            await handleJoin();
          }}
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
