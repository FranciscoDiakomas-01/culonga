"use client";
import {
  User,
  Mail,
  Phone,
  Lock,
  Zap,
  Check,
  ChevronsUpDown,
  Clock,
  X,
  Loader2,
  Trash,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DashBoardHeader from "@/components/ui/headerDashboard";
import Product, { Offer, ProductChekout } from "@/types/product";
import { FormEvent, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
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
import Link from "next/link";
import { DialogClose } from "@radix-ui/react-dialog";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import ProductConsumer from "@/services/product";
import { toast } from "sonner";
import FileUploader from "./upload";

export default function EditProductPage() {
  const [load, setLoad] = useState(true);
  const [product, setProduct] = useState<any>({});
  const { id } = useParams();
  const [myOrderBumps, setMyOrderBumps] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [myPayments, setMyPayments] = useState<number[]>([]);
  const [disponibleOrderBumps, setDisponibleOrderBumps] = useState<any[]>([]);
  const [checkout, setChekout] = useState<ProductChekout>({
    id: "",
    productid: "",
    bg: "#ffffff",
    timer: {
      textColor: "#000000",
      bgColor: "#f5f5f5",
      text: "Oferta válida até:",
      time: 60 * 60,
      active: false,
    },
    btn: {
      bgColor: "#007bff",
      textColor: "#ffffff",
      text: "Comprar Agora",
    },
    orderbump: {
      borderColor: "#cccccc",
      bgColor: "#ffffff",
      textColor: "#000000",
      titleColor: "#333333",
      priceColor: "#ff0000",
    },
    textColor: "#000",
  });
  const categorias = [
    "Administração e Negócios",
    "Animais de Estimação",
    "Arquitetura e Engenharia",
    "Artes e Música",
    "Auto-ajuda e Desenvolvimento Pessoal",
    "Automóveis",
    "Blogs e Redes Sociais",
    "Casa e Jardinagem",
    "Culinária, Gastronomia, Receitas",
    "Design e Templates PSD, PPT ou HTML",
    "Edição de Áudio, Vídeo ou Imagens",
    "Educacional, Cursos Técnicos e Profissionalizantes",
    "Entretenimento, Lazer e Diversão",
    "Esportes e Fitness",
    "Filmes e Cinema",
    "Geral",
    "Histórias em Quadrinhos",
    "Idiomas",
    "Informática",
    "Internet Marketing",
    "Investimentos e Finanças",
    "Jogos de Cartas, Poker, Loterias",
    "Jogos de Computador, Jogos Online",
    "Jurídico",
    "Literatura e Poesia",
    "Marketing de Rede",
    "Marketing e Comunicação",
    "Meio Ambiente",
    "Moda e vestuário",
    "Música, Bandas e Shows",
    "Paquera, Sedução e Relacionamentos",
    "Pessoas com deficiência",
    "Plugins, Widgets e Extensões",
    "Produtividade e Organização Pessoal",
    "Produtos infantis",
    "Relatórios, Artigos e Pesquisas",
    "Religião e Crenças",
    "Romances, Dramas, Estórias e Contos",
    "RPG e Jogos de Mesa",
    "Saúde, Bem-estar e Beleza",
    "Scripts",
    "Segurança do Trabalho",
    "Sexologia e Sexualidade",
    "Snippets (Trechos de Vídeo)",
    "Turismo",
  ];
  const router = useRouter();
  const service = new ProductConsumer();
  const [reload, setReload] = useState(true);
  useEffect(() => {
    async function get() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      const data = await service.getProductById(id as string);
      const offers = await service.getProductOffersById(id as string, token);
      setOffers(offers?.data ?? []);
      setChekout(data?.checkout ?? undefined);
      setProduct(data?.product ?? undefined);
      setMyOrderBumps(data?.orderbumps ?? []);
      setMyPayments(data?.product?.payment ?? []);
      setDisponibleOrderBumps(data?.disponibleOrderBumps ?? []);
      setTimeout(() => {
        setLoad(false);
      }, 500);
    }
    get();
  }, [reload]);

  async function handelOnSubmitProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    if (
      !product! ||
      !product.title ||
      !product.description ||
      !product.price ||
      !product.whatsappSuport ||
      !product.category ||
      !product.type
    ) {
      toast.info("Preenche os dados");
      return;
    }
    const orderBumpsId = myOrderBumps
      .filter((item) => item.id) // filtra só os que têm id
      .map((item) => item.id);
    const body = {
      whatsapp: product.whatsappSuport,
      productId: product.id,
      pixelId: product.pixelId,
      UpSell: product.upsell,
      backRedirect: product.backredirect,
      orderBump: orderBumpsId,
      category: product.category,
      type: product.type,
      title: product.title,
      description: product.description,
      price: product.price,
      garant: product.garant,
    };
    setProcessing(true);
    const res = await service.update(token, body);
    console.log(res);
    toast.info(Array.isArray(res.message) ? res.message[0] : res.message);
    setTimeout(() => {
      setProcessing(false);
    }, 1000);
  }
  async function updatePayments(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    if (myPayments.length == 0 || myPayments.length > 3) {
      toast.info("Erro ao salvar ");
      return;
    }
    setProcessing(true);
    const res = await service.updatePayments(token, {
      payments: myPayments,
      productId: product?.id ?? "",
    });
    toast.info(Array.isArray(res.message) ? res.message[0] : res.message);
    setTimeout(() => {
      setProcessing(false);
    }, 1000);
  }
  async function handelOnSubmitProductOffer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formdata = new FormData(e.currentTarget);
    const title = formdata.get("name") as string;
    const price = Number(formdata.get("price") as string);
    if (!token || !product) {
      router.push("/");
      return;
    }
    if (!title! || !price) {
      toast.info("Preenche os dados");
      return;
    }
    if (offers.length > 0) {
      const isIn = offers.filter((item) => {
        return (
          item?.title?.toLocaleLowerCase() == title?.toLocaleLowerCase() &&
          +item.price == price
        );
      });
      if (isIn.length > 0) {
        toast.info("Oferta existente");
        return;
      }
    }
    const body = {
      title,
      price,
      productId: id as string,
    };
    setProcessing(true);
    const res = await service.createOffer(token, body);
    toast.info(Array.isArray(res.message) ? res.message[0] : res.message);
    setReload((prev) => !prev);
    setTimeout(() => {
      setProcessing(false);
    }, 1000);
  }

  async function updateChekout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !product || !checkout) {
      router.push("/");
      return;
    }
    setProcessing(true);
    const res = await service.updateChekout(token, {
      id: product?.id,
      bg: checkout.bg,
      textColor: checkout.textColor,
      timer: checkout.timer,
      btn: checkout.btn,
      orderbump: checkout.orderbump,
    });
    toast.info(Array.isArray(res.message) ? res.message[0] : res.message);
    setReload((prev) => !prev);
    setTimeout(() => {
      setProcessing(false);
    }, 1000);
  }

  return (
    <main className="font-inter">
      <DashBoardHeader
        data={{
          canShowInput: false,
          isAdmin: false,
          pageTitle: "",
          inputPlaceHolder: "Buscar por produto",
        }}
      />

      {load ? (
        <div className="flex justify-center items-center mt-9">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          {product && myPayments && checkout && (
            <Tabs
              defaultValue="geral"
              className="w-full flex flex-col gap-8 px-4 py-5 flex-wrap"
            >
              <header className="flex md:flex-row flex-col justify-between items-center gap-4 w-full flex-wrap">
                <TabsList className="bg-transparent rounded-sm border sm:flex-wrap">
                  <TabsTrigger
                    value="geral"
                    onClick={() => {
                      setReload((prev) => !prev);
                    }}
                  >
                    Geral
                  </TabsTrigger>
                  <TabsTrigger
                    value="files"
                    onClick={() => {
                      setReload((prev) => !prev);
                    }}
                  >
                    Arquivos
                  </TabsTrigger>
                  <TabsTrigger
                    onClick={() => {
                      setReload((prev) => !prev);
                    }}
                    value="checkout"
                  >
                    Checkout
                  </TabsTrigger>
                </TabsList>
              </header>
              <TabsContent value="geral">
                <Card className=" bg-transparent backdrop-blur-2xl rounded-sm">
                  <CardHeader>
                    <CardTitle>Informações do produto</CardTitle>
                    <CardDescription>
                      Preencha todos os campos obrigatórios para poder liberar o
                      produto para os clientes
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {product && (
                      <form onSubmit={handelOnSubmitProduct}>
                        <span className="grid lg:grid-cols-2 gap-5">
                          <aside className="flex lg:w-[80%] flex-col gap-4">
                            {/* Nome */}
                            <div className="flex flex-col gap-3">
                              <Label htmlFor="name">Nome do produto</Label>
                              <Input
                                id="name"
                                name="name"
                                value={product?.title ?? ""}
                                placeholder="Nome do produto"
                                required
                                onChange={(e) => {
                                  if (product) {
                                    setProduct((prev: any) => ({
                                      ...prev,
                                      title: e.target.value, // não pode usar "+"
                                    }));
                                  }
                                }}
                              />
                            </div>

                            {/* Preço */}
                            <div className="flex flex-col gap-3">
                              <Label htmlFor="price">Preço do produto</Label>
                              <Input
                                id="price"
                                name="price"
                                type="number"
                                value={product?.price ?? ""}
                                placeholder="Preço do produto"
                                required
                                onChange={(e) => {
                                  if (product) {
                                    setProduct((prev: any) => ({
                                      ...prev,
                                      price: +e.target.value,
                                    }));
                                  }
                                }}
                              />
                            </div>

                            {/* Tipo */}
                            <div className="flex flex-col gap-3">
                              <Label>Tipo do produto</Label>
                              <Select
                                value={product?.type ?? ""}
                                onValueChange={(e) => {
                                  if (product) {
                                    setProduct((prev: any) => ({
                                      ...prev,
                                      type: e,
                                    }));
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Tipo de produto" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="curso online">
                                    Cursos Online
                                  </SelectItem>
                                  <SelectItem value="link">
                                    App / Software
                                  </SelectItem>
                                  <SelectItem value="ebook">Ebook</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Categoria */}
                            <div className="flex flex-col gap-3">
                              <Label>Categoria do produto</Label>
                              <Select
                                value={product?.category ?? ""}
                                onValueChange={(e) => {
                                  if (product) {
                                    setProduct((prev: any) => ({
                                      ...prev,
                                      category: e,
                                    }));
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Categoria do produto" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categorias.map((cat, index) => (
                                    <SelectItem key={index} value={cat}>
                                      {cat}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Pixel ID */}
                            <div className="flex flex-col gap-3">
                              <Label htmlFor="pixelIf">Pixel ID</Label>
                              <Input
                                id="pixelIf"
                                name="pixelIf"
                                value={product?.pixelId ?? ""}
                                placeholder="Pixel_id"
                                onChange={(e) => {
                                  if (product) {
                                    setProduct((prev: any) => ({
                                      ...prev,
                                      pixelId: e.target.value,
                                    }));
                                  }
                                }}
                              />
                            </div>

                            {/* Upsell */}
                            <div className="flex flex-col gap-3">
                              <Label htmlFor="upsell">Upsell</Label>
                              <Input
                                id="upsell"
                                type="url"
                                name="upsell"
                                value={product?.upsell ?? ""}
                                onChange={(e) => {
                                  if (product) {
                                    setProduct((prev: any) => ({
                                      ...prev,
                                      upsell: e.target.value,
                                    }));
                                  }
                                }}
                                placeholder="https://"
                              />
                            </div>
                          </aside>

                          <aside className="flex flex-col gap-4">
                            {/* Descrição */}
                            <div className="flex flex-col gap-3">
                              <Label htmlFor="desc">Descrição do produto</Label>
                              <Textarea
                                id="desc"
                                value={product?.description ?? ""}
                                name="desc"
                                placeholder="Descrição do produto"
                                required
                                onChange={(e) => {
                                  if (product) {
                                    setProduct((prev: any) => ({
                                      ...prev,
                                      description: e.target.value,
                                    }));
                                  }
                                }}
                              />
                            </div>

                            {/* Whatsapp */}
                            <div className="flex flex-col gap-3">
                              <Label htmlFor="whatsapp">
                                Whatsapp de suporte
                              </Label>
                              <Input
                                id="whatsapp"
                                name="whatsapp"
                                value={product?.whatsappSuport ?? ""}
                                type="tel"
                                placeholder="Suporte whatsapp"
                                required
                                onChange={(e) => {
                                  if (product) {
                                    setProduct((prev: any) => ({
                                      ...prev,
                                      whatsappSuport: e.target.value,
                                    }));
                                  }
                                }}
                              />
                            </div>

                            {/* Back-redirect */}
                            <div className="flex flex-col gap-3">
                              <Label htmlFor="Back-redirect">
                                Back-redirect
                              </Label>
                              <Input
                                id="Back-redirect"
                                type="url"
                                value={product?.backredirect ?? ""}
                                onChange={(e) => {
                                  if (product) {
                                    setProduct((prev: any) => ({
                                      ...prev,
                                      backredirect: e.target.value,
                                    }));
                                  }
                                }}
                                name="Back-redirect"
                                placeholder="https://"
                              />
                            </div>

                            <div className="flex flex-col gap-3">
                              <Label htmlFor="Back-redirect">OrderBump</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                  >
                                    Buscar por produto
                                    <ChevronsUpDown className="opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full dark:bg-transparent backdrop-blur-2xl p-0">
                                  <Command className=" dark:bg-transparent backdrop-blur-2xl">
                                    <CommandInput
                                      placeholder="Buscar por produto"
                                      className="h-9"
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        Sem orderbumps
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {disponibleOrderBumps.map(
                                          (orderbump, index) => (
                                            <CommandItem
                                              key={index}
                                              value={orderbump.title}
                                              onSelect={(currentValue) => {
                                                setOpen(false);
                                                if (myOrderBumps.length == 0) {
                                                  setMyOrderBumps((prev) => [
                                                    ...prev,
                                                    orderbump,
                                                  ]);
                                                  return;
                                                }
                                                const isIn = myOrderBumps.find(
                                                  (item) => {
                                                    return (
                                                      item.id == orderbump.id
                                                    );
                                                  }
                                                );
                                                if (!isIn) {
                                                  setMyOrderBumps((prev) => [
                                                    ...prev,
                                                    orderbump,
                                                  ]);
                                                }
                                              }}
                                            >
                                              {orderbump.title}
                                              {myOrderBumps.includes(
                                                orderbump
                                              ) && <Check />}
                                            </CommandItem>
                                          )
                                        )}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <span className="flex flex-wrap gap-2">
                                {" "}
                                {Array.isArray(myOrderBumps) &&
                                  myOrderBumps.length > 0 &&
                                  myOrderBumps.map((item, index) => (
                                    <Badge
                                      className="p-1 rounded-sm "
                                      key={index}
                                      variant={"outline"}
                                      onClick={() => {
                                        setMyOrderBumps(
                                          myOrderBumps.filter(
                                            (order) => order.id !== item.id
                                          )
                                        );
                                      }}
                                    >
                                      {" "}
                                      {item.title}{" "}
                                      <X className="text-red-500" />{" "}
                                    </Badge>
                                  ))}{" "}
                              </span>{" "}
                            </div>

                            {/* Garantia */}
                            <div className="flex flex-col gap-3">
                              <Label htmlFor="garant">
                                Período de Garantia
                              </Label>
                              <Input
                                id="garant"
                                type="number"
                                value={product?.garant ?? 0}
                                name="garant"
                                placeholder="7"
                                onChange={(e) => {
                                  if (product) {
                                    setProduct((prev: any) => ({
                                      ...prev,
                                      garant: +e.target.value,
                                    }));
                                  }
                                }}
                                required
                              />
                            </div>
                          </aside>
                        </span>

                        <Button className="mt-4 " type="submit">
                          {processing ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            "Salvar alterações"
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="files">
                <Tabs
                  className="w-full flex flex-col gap-8"
                  defaultValue="banner"
                >
                  <header className="flex  md:flex-row flex-col justify-between items-center gap-4 w-full flex-wrap">
                    <TabsList className="bg-transparent rounded-sm border">
                      <TabsTrigger
                        onClick={() => {
                          setReload((prev) => !prev);
                        }}
                        value="banner"
                      >
                        Banner
                      </TabsTrigger>
                      <TabsTrigger
                        onClick={() => {
                          setReload((prev) => !prev);
                        }}
                        value="fileProduct"
                      >
                        Produto
                      </TabsTrigger>
                      <TabsTrigger
                        onClick={() => {
                          setReload((prev) => !prev);
                        }}
                        value="image"
                      >
                        Imagem
                      </TabsTrigger>
                    </TabsList>
                  </header>
                  <TabsContent value="banner">
                    <FileUploader
                      id={product.id}
                      type="banner"
                      defaultValue={product.banner ?? ""}
                    />
                  </TabsContent>{" "}
                  <TabsContent value="fileProduct">
                    <FileUploader
                      id={product.id}
                      type="file"
                      status={product?.status == "APROVED"}
                      defaultValue={product.file ?? ""}
                    />
                  </TabsContent>{" "}
                  <TabsContent value="image">
                    <FileUploader
                      id={product.id}
                      type="cover"
                      defaultValue={product.cover ?? ""}
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>
              <TabsContent value="checkout">
                <Card className=" bg-transparent backdrop-blur-2xl rounded-sm">
                  <CardHeader>
                    <CardTitle>Estilo</CardTitle>
                    <CardDescription>
                      Personalize a aparência visual do checkout do seu produto
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {checkout &&
                      product &&
                      Array.isArray(myPayments) &&
                      myPayments.length > 0 && (
                        <form
                          onSubmit={updateChekout}
                          className="flex flex-col lg:flex-row gap-4 lg:gap-10"
                        >
                          <span className="lg:w-[50%] w-full flex flex-col gap-4">
                            <div className="flex flex-col gap-3">
                              <Label htmlFor="bg">Fundo</Label>
                              <span className="grid grid-cols-2 border p-1 rounded-sm items-center  gap-4">
                                <p className="w-full">
                                  {checkout?.bg ?? "#fff"}
                                </p>
                                <Input
                                  id="bg"
                                  type="color"
                                  name="bg"
                                  defaultValue={checkout?.bg ?? "#ffffff"}
                                  onChange={(e) => {
                                    const newColor = e.target.value;
                                    setChekout((prev) => ({
                                      ...prev,
                                      bg: newColor,
                                    }));
                                  }}
                                  className="border-none  shadow-none outline-none w-20 place-self-end"
                                />
                              </span>
                            </div>
                            <div className="flex flex-col gap-3">
                              <Label htmlFor="bg">Texto</Label>
                              <span className="grid grid-cols-2 border p-1 rounded-sm items-center  gap-4">
                                <p className="w-full">{checkout?.textColor}</p>
                                <Input
                                  id="bg"
                                  type="color"
                                  name="bg"
                                  defaultValue={checkout?.textColor}
                                  onChange={(e) => {
                                    const newColor = e.target.value;
                                    setChekout((prev) => ({
                                      ...prev,
                                      textColor: newColor,
                                    }));
                                  }}
                                  className="border-none  shadow-none outline-none w-20 place-self-end"
                                />
                              </span>
                            </div>
                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-center border p-3 rounded-sm">
                                <span className="lg:w-[50%] space-y-2 w-full">
                                  <h1>Timer</h1>
                                </span>

                                <Switch
                                  checked={checkout?.timer?.active ?? false}
                                  onCheckedChange={(e) => {
                                    setChekout((prev) => ({
                                      ...prev,
                                      timer: {
                                        textColor: "#000000",
                                        bgColor: "#f5f5f5",
                                        text: "Oferta válida até:",
                                        time: 60 * 60,
                                        active: e,
                                      },
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                            {checkout?.timer?.active && (
                              <>
                                <div className="flex flex-col gap-3">
                                  <Label htmlFor="bg">Texto (timer)</Label>
                                  <Input
                                    id="timerText"
                                    type="text"
                                    name="bg"
                                    defaultValue={checkout?.timer?.text}
                                    onChange={(e) => {
                                      setChekout((prev) => ({
                                        ...prev,
                                        timer: {
                                          textColor:
                                            prev.timer?.textColor ?? "",
                                          bgColor:
                                            prev.timer?.bgColor ?? "#fff",
                                          text: e.target.value,
                                          time: prev.timer?.time ?? 3600,
                                          active: prev.timer?.active
                                            ? true
                                            : false,
                                        },
                                      }));
                                    }}
                                    className=""
                                  />
                                </div>
                              </>
                            )}
                            <div className="flex flex-col gap-3">
                              <Label htmlFor="bg">Contorno</Label>
                              <span className="grid grid-cols-2 border p-1 rounded-sm items-center  gap-4">
                                <p className="w-full">
                                  {checkout?.btn.bgColor}
                                </p>
                                <Input
                                  id="bg"
                                  type="color"
                                  name="bg"
                                  defaultValue={checkout?.btn.bgColor}
                                  onChange={(e) => {
                                    const newColor = e.target.value;
                                    setChekout((prev) => ({
                                      ...prev,
                                      btn: {
                                        ...(prev.btn ?? {}),
                                        bgColor: newColor,
                                      },
                                    }));
                                  }}
                                  className="border-none  shadow-none outline-none w-20 place-self-end"
                                />
                              </span>
                            </div>
                            <div className="flex flex-col gap-3">
                              <Label htmlFor="bg">Cor do texto contorno</Label>
                              <span className="grid grid-cols-2 border p-1 rounded-sm items-center  gap-4">
                                <p className="w-full">
                                  {checkout?.btn.textColor}
                                </p>
                                <Input
                                  id="bg"
                                  type="color"
                                  name="bg"
                                  defaultValue={checkout?.btn.textColor}
                                  onChange={(e) => {
                                    const newColor = e.target.value;
                                    setChekout((prev) => ({
                                      ...prev,
                                      btn: {
                                        ...(prev.btn ?? {}),
                                        textColor: newColor,
                                      },
                                    }));
                                  }}
                                  className="border-none  shadow-none outline-none w-20 place-self-end"
                                />
                              </span>
                            </div>
                            <div className="flex flex-col gap-3">
                              <Label htmlFor="textButton">Texto do botão</Label>
                              <Input
                                id="textButton"
                                type="text"
                                name="textButton"
                                defaultValue={checkout?.btn.text}
                                onChange={(e) => {
                                  setChekout((prev) => ({
                                    ...prev,
                                    btn: {
                                      ...(prev.btn ?? {}),
                                      text: e.target.value,
                                    },
                                    timer: {
                                      textColor: e.target.value,
                                      bgColor: prev.timer?.bgColor ?? "#fff",
                                      text: prev.timer?.text ?? "",
                                      time: +e.target.value,
                                      active: prev.timer?.active ? true : false,
                                    },
                                  }));
                                }}
                                className=""
                              />
                            </div>
                            <Button type="submit">
                              {processing ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                "Salvar"
                              )}
                            </Button>
                          </span>

                          <article
                            className="w-full lg:w-[50%] overflow-hidden  rounded-sm min-h-[50dvh] flex flex-col gap-4   items-center"
                            style={{
                              backgroundColor: checkout?.bg ?? "#ffffff",
                              color: checkout?.timer?.textColor,
                            }}
                          >
                            {checkout?.timer?.active && (
                              <div
                                className="flex justify-center items-center gap-2 p-3 w-full md:text-md"
                                style={{
                                  backgroundColor: checkout?.btn.bgColor,
                                  color: checkout?.btn.textColor,
                                }}
                              >
                                <Clock size={17} />
                                <p>
                                  {checkout.timer?.text ??
                                    "Oferta expira em breve"}
                                </p>
                                {checkout?.timer?.time ?? "00"}:00 minutos
                              </div>
                            )}
                            <div className="lg:w-[80%] shadow  border overflow-hidden p-2 my-4 mx-2 w-full flex flex-col gap-4 rounded-md">
                              {product?.banner && (
                                <img
                                  className="w-full max-h-[400px]  rounded-sm overflow-hidden"
                                  src={product?.banner}
                                  alt="Banner"
                                />
                              )}
                              <h1>VOCÊ ESTÁ ADQUIRINDO:</h1>
                              <div className="flex gap-1">
                                <span
                                  className="h-6 w-6 rounded-full flex justify-center items-center text-md font-bold"
                                  style={{
                                    backgroundColor: checkout?.btn.bgColor,
                                    color: checkout?.btn.textColor,
                                  }}
                                >
                                  1
                                </span>
                                <p>Dados Pessoais</p>
                              </div>
                              <div className="space-y-3 w-full my-4">
                                <div className="flex items-center rounded-lg px-3 py-2 bg-gray-100 border">
                                  <User className="w-5 h-5 text-gray-500 mr-2" />
                                  <input
                                    type="text"
                                    placeholder="Nome Completo"
                                    className="flex-1 bg-transparent outline-none"
                                  />
                                </div>

                                {/* Email */}
                                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                                  <Mail className="w-5 h-5 text-gray-500 mr-2" />
                                  <input
                                    type="email"
                                    placeholder="Seu E-mail"
                                    className="flex-1 bg-transparent outline-none"
                                  />
                                </div>

                                {/* Telefone */}
                                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                                  <Phone className="w-5 h-5 text-gray-500 mr-2" />
                                  <input
                                    type="tel"
                                    placeholder="9xxxxxxxx"
                                    className="flex-1 bg-transparent outline-none"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <span
                                  className="h-6 w-6 rounded-full flex justify-center items-center text-md font-bold"
                                  style={{
                                    backgroundColor: checkout?.btn.bgColor,
                                    color: checkout?.btn.textColor,
                                  }}
                                >
                                  2
                                </span>
                                <p>Dados de Pagamento</p>
                              </div>
                              <div className="w-full max-w-lg mx-auto p-5 rounded-lg border bg-white space-y-5">
                                <Button
                                  type="button"
                                  className="w-full flex items-center justify-center gap-2   font-medium py-3 rounded-lg transition"
                                  style={{
                                    backgroundColor: checkout?.btn.bgColor,
                                    color: checkout?.btn.textColor,
                                  }}
                                >
                                  <Lock className="w-4 h-4" />
                                  {checkout.btn.text}
                                </Button>
                                {/* Valor */}
                                <div className="border-t pt-3">
                                  <div className="flex justify-between text-lg font-semibold">
                                    <span>Valor</span>
                                    <span>
                                      {Number(
                                        product.price ?? 0
                                      ).toLocaleString("pt")}
                                      kz{" "}
                                    </span>
                                  </div>
                                </div>

                                {/* Rodapé */}
                                <div className="text-center text-xs text-gray-500 space-y-2">
                                  <p>
                                    Ao clicar em <b>Compre agora</b>, você
                                    concorda com os{" "}
                                    <a
                                      href="#"
                                      className="text-blue-600 underline"
                                    >
                                      Termos de Compra
                                    </a>{" "}
                                    e está ciente da{" "}
                                    <a
                                      href="#"
                                      className="text-blue-600 underline"
                                    >
                                      Política de Privacidade
                                    </a>
                                    .
                                  </p>
                                  <p className="mt-2">
                                    Tecnologia culonga © 2025 — Todos os
                                    direitos reservados
                                  </p>
                                </div>
                              </div>
                            </div>
                          </article>
                        </form>
                      )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </main>
  );
}
