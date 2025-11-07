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
  Percent,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import server from "@/services/server";
import { toast } from "sonner";

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

// Função helper para formatar valores monetários
const formatCurrency = (value: number): string => {
  return Number(value).toLocaleString("pt");
};

// Função helper para lidar com imagens quebradas
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  target.src = "/logo.jpeg";
  target.alt = "Imagem não disponível";
};

export function AfilitionCard({ afilition }: { afilition: Afilition }) {
  const [copied, setCopied] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(afilition.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
      const textArea = document.createElement("textarea");
      textArea.value = afilition.link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Validação de dados para prevenir erros
  if (!afilition?.product) {
    return (
      <Card className="relative overflow-hidden rounded-md border-white/10 shadow-lg border bg-transparent p-0">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Dados do produto não disponíveis
          </p>
        </CardContent>
      </Card>
    );
  }

  const { product } = afilition;

  return (
    <Card className="relative overflow-hidden rounded-md border-white/10 shadow-lg border bg-transparent transition-all hover:shadow-xl p-0">
      <div className="relative">
        {imageLoading && (
          <div className="w-full h-48 bg-muted animate-pulse flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <img
          src={product.banner || "/images/placeholder-product.jpg"}
          alt={product.title || "Produto sem título"}
          className={`w-full h-48 object-cover ${
            imageLoading ? "hidden" : "block"
          }`}
          onLoad={() => setImageLoading(false)}
          onError={handleImageError}
        />

        <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2">
          <Avatar className="w-20 h-20 ring-4 ring-background shadow-md">
            <AvatarImage
              src={product.user?.profile}
              alt={product.user?.name || "Usuário"}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <AvatarFallback>
              {product.user?.name
                ? product.user.name.charAt(0).toUpperCase()
                : "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardHeader className="mt-12 text-center space-y-1">
        <h3 className="text-xl font-semibold line-clamp-2">
          {product.title || "Produto sem título"}
        </h3>
        <p className="text-sm text-muted-foreground">
          por {product.user?.name || "Anônimo"}
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
            Comissão {product.percentShare || "0"}%
          </Badge>
          <Badge variant="secondary">${formatCurrency(product.price)}</Badge>
        </div>

        <p className="text-sm text-center text-muted-foreground line-clamp-3">
          {product.description || "Sem descrição disponível"}
        </p>

        <Separator />

        <div className="grid grid-cols-3 text-center">
          <div className="flex flex-col items-center">
            <ShoppingBag className="w-5 h-5 mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">Vendas</span>
            <p className="font-semibold">{afilition.totalSells || 0}</p>
          </div>

          <div className="flex flex-col items-center">
            <TrendingUp className="w-5 h-5 mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">Ganhos</span>
            <p className="font-semibold">
              ${formatCurrency(afilition.totalPurchase)}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <CalendarDays className="w-5 h-5 mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">Criado em</span>
            <p className="font-semibold text-xs">
              {afilition.createdAt
                ? new Date(afilition.createdAt).toLocaleDateString("pt-BR")
                : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between px-6 pb-4 pt-2 border-t">
        <Button
          variant="outline"
          onClick={handleCopy}
          className="flex items-center gap-2 w-full"
          disabled={!afilition.link}
        >
          <Copy className="w-4 h-4" />
          {copied ? "Link copiado!" : "Copiar link"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ProductToJoinCard({
  product,
}: {
  product: ProductDisponibleToJoin;
}) {
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleJoin = async () => {
    if (!product?.id) {
      toast.error("ID do produto não disponível");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        setLoading(false);
        return;
      }

      const res = await fetch(`${server}affiliates/${product.id}`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Afiliado com sucesso!");
      } else {
        toast.error(data.message || "Erro ao se afiliar");
      }
    } catch (error) {
      console.error("Erro ao se afiliar:", error);
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Validação de dados
  if (!product) {
    return (
      <Card className="relative overflow-hidden rounded-md border-white/10 shadow-lg border bg-transparent p-0">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Produto não disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden rounded-md border-white/10 shadow-lg border bg-transparent transition-all hover:shadow-xl p-0">
      <div className="relative">
        {imageLoading && (
          <div className="w-full h-48 bg-muted animate-pulse flex items-center justify-center rounded-t-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <img
          src={product.banner || "/images/placeholder-product.jpg"}
          alt={product.title || "Produto sem título"}
          className={`w-full h-48 object-cover rounded-t-2xl ${
            imageLoading ? "hidden" : "block"
          }`}
          onLoad={() => setImageLoading(false)}
          onError={handleImageError}
        />

        <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2">
          <Avatar className="w-20 h-20 ring-4 ring-background shadow-md">
            <AvatarImage
              src={product.user?.profile}
              alt={product.user?.name || "Usuário"}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <AvatarFallback>
              {product.user?.name
                ? product.user.name.charAt(0).toUpperCase()
                : "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardHeader className="mt-12 text-center space-y-1 p-0 pt-2">
        <h3 className="text-xl font-semibold line-clamp-2">
          {product.title || "Produto sem título"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Por {product.user?.name || "Anônimo"}
        </p>
        <p className="text-xs text-muted-foreground">
          {product.user?.email || "Email não disponível"}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 px-6 pt-2">
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" />${formatCurrency(product.price)}
          </Badge>

          <Badge variant="outline" className="flex items-center gap-1">
            <Percent className="w-3 h-3" />
            {product.percentShare || "0"}%
          </Badge>
        </div>

        <p className="text-sm text-center text-muted-foreground line-clamp-3">
          {product.description || "Sem descrição disponível"}
        </p>
        <Separator />
      </CardContent>

      <CardFooter className="flex justify-center border-t pt-4 pb-4">
        <Button
          disabled={loading || !product.id}
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
