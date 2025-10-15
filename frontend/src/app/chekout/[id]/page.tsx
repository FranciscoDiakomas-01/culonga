"use client";
import { Button } from "@/components/ui/button";
import ProductConsumer from "@/services/product";
import Product, { ProductChekout } from "@/types/product";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  Verified,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import logo from "@/assets/images/logo.jpeg";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { toast, Toaster } from "sonner";
import isValidAngolaPhone from "@/services/isValiPhoneNumber";
import isValidEmail from "@/services/isValidEmail";
import PaymentService from "@/services/Payments";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Chekout() {
  const { id } = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  let [ReactPixel, setReactPixel] = useState<any>();

  const [payId, setpayId] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const [product, setProduct] = useState<any>({});
  const service = new ProductConsumer();
  const [myOrderBumps, setMyOrderBumps] = useState<Product[]>([]);
  const [processing, setProcessing] = useState(false);
  const [pixelId, setPixelId] = useState("");
  const paymentserviceAPI = new PaymentService();
  const [orderBumps, setOrderBumps] = useState<any[]>([]);
  const [load, setLoad] = useState(true);
  const [myPayments, setMyPayments] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [checkout, setChekout] = useState<ProductChekout>({
    id: "",
    productid: "",
    bg: "#ffffff",
    timer: {
      textColor: "#000000",
      bgColor: "#f5f5f5",
      text: "Oferta válida até:",
      time: 60 * 5,
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
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(checkout?.timer?.time ?? 0);
  const [backRedirect, setbackRedirect] = useState("");
  useEffect(() => {
    if (!checkout?.timer?.active) return;
    setTimeLeft(checkout.timer.time);
  }, [checkout]);

  useEffect(() => {
    if (!checkout?.timer?.active) return;
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, checkout?.timer?.active]);

  const percent = Math.max(
    (timeLeft / Number(checkout?.timer?.time ?? 0)) * 100,
    0
  );

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  useEffect(() => {
    async function get() {
      const data = await service.getProductById(id as string);
      if (!data.checkout || !data.product) {
        setLoad(false);
        return;
      }
      setChekout(data?.checkout ?? undefined);
      setProduct(data?.product ?? undefined);
      setMyOrderBumps(data?.orderbumps ?? []);
      setChekout(data?.checkout ?? undefined);
      setMyPayments(data?.product?.payment ?? []);
      setTotal(data?.product?.price ?? 0);
      setbackRedirect(data?.product?.backredirect ?? "");
      setPixelId(data?.product?.pixelId ?? "");
      if (data.message == "Produto não encontrado") {
        toast.error("Produto não encontrado");
      }
      setTimeout(() => {
        setLoad(false);
      }, 500);
    }
    get();
  }, []);

  useEffect(() => {
    const subTotal = orderBumps.reduce((acc, item) => acc + item.price, 0);
    setTotal(product?.price + subTotal);
  }, [orderBumps, product]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      setTimeout(() => {
        location.href = backRedirect;
      }, 1);
      return "";
    };
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", handleBeforeUnload);
      const handlePopState = () => {
        window.location.href = backRedirect;
      };
      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [backRedirect]);
  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined" && pixelId) {
        const mod = await import("react-facebook-pixel");
        ReactPixel = mod.default;
        ReactPixel.init(pixelId);
        ReactPixel.pageView();
      }
    })();
  }, [pixelId]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    let tel = data.get("telefone") as string;
    const email = data.get("email") as string;

    if (!email || !name || !tel) {
      toast.warning("Preenche todos os campos");
      return;
    }
    if (!isValidEmail(email)) {
      toast.warning("Email inválido");
      return;
    }
    if (!isValidAngolaPhone(tel)) {
      toast.warning("Telefone inválido");
      return;
    }

    if (pixelId) {
      ReactPixel.init(pixelId);
      ReactPixel.track("InitiateCheckout", {
        currency: "AOA",
        value: parseFloat(String(total ?? 0)),
        num_items: 1 + orderBumps.length,
      });
    }

    setProcessing(true);

    const body = {
      name,
      email,
      orderbumps: orderBumps.map((item) => item.id),
      amount: total,
      productId: product.type == "Offer" ? product.productId : product.id,
      userid: product.userId,
      tel,
      method: 1,
    };

    const res = await paymentserviceAPI.createPayment({
      amount: total.toString(),
      reference: crypto.randomUUID(),
      telefone: tel,
    });
    if (res?.iframeUrl && res?.id) {
      setpayId(res.id);
      setIframeUrl(res.iframeUrl);
      setOpen(true);
    } else {
      toast.error(res?.message ?? "Erro ao iniciar pagamento");
    }
    setProcessing(false);
  }

  return (
    <>
      <Toaster theme="light"></Toaster>
      {load ? (
        <div className="h-screen w-screen flex justify-center items-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          {product && checkout ? (
            <form
              onSubmit={submit}
              style={{
                backgroundColor: checkout?.bg ?? "#ffffff",
                color: checkout?.textColor ?? "#000",
              }}
              className="min-h-screen w-full pb-8 font-bold"
            >
              {/* Timer */}
              {checkout?.timer?.active && (
                <div
                  className="flex flex-col gap-2 p-3 w-full md:text-md "
                  style={{
                    backgroundColor: checkout?.btn?.bgColor,
                    color: checkout?.btn.textColor,
                  }}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Clock size={17} />
                    <p>{checkout.timer?.text ?? "Oferta expira em breve"}</p>
                    <b>{formatTime(timeLeft)}</b>
                  </div>
                  <div className="w-full h-2 rounded bg-white/20 overflow-hidden">
                    <div
                      className="h-2 bg-white transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Produto */}
              <div className="lg:w-[40%] md:w-[70%] md:px-0 px-5 place-self-center py-2 w-full flex flex-col gap-4 rounded-md">
                {product?.banner && (
                  <img
                    className="w-full rounded-sm max-h-[450px] overflow-hidden"
                    src={product?.banner}
                    alt="Banner"
                  />
                )}
                <div className="flex flex-col gap-2 shadow border rounded-sm p-3">
                  <h1 className="text-pretty text-sm">VOCÊ ESTÁ ADQUIRINDO:</h1>
                  <span className="flex gap-4">
                    {product?.cover && (
                      <img
                        className="w-15 rounded-sm h-15 overflow-hidden"
                        src={product?.cover}
                        alt="Cover"
                      />
                    )}
                    <span className="text-gray-700">
                      <h1 className="text-xl font-bold">
                        {product?.title ?? crypto.randomUUID()}
                      </h1>
                      <h1 className="text-xl font-bold">
                        {Number(product?.price ?? 0).toLocaleString("pt")} kz
                      </h1>
                    </span>
                  </span>
                </div>

                {/* Dados Pessoais */}
                <div className="shadow-2xl border rounded-sm border-gray-200 p-4">
                  <div className="flex gap-1">
                    <span
                      className="h-6 w-6 rounded-full flex justify-center items-center text-md font-bold"
                      style={{
                        backgroundColor: checkout?.btn?.bgColor,
                        color: checkout?.btn?.textColor,
                      }}
                    >
                      1
                    </span>
                    <p>Dados Pessoais</p>
                  </div>
                  <div className="space-y-3 w-full my-4">
                    <div className="flex items-center rounded-lg px-3 py-2 bg-gray-100 border">
                      <User className="w-5 h-5 mr-2" />
                      <input
                        type="text"
                        placeholder="Nome Completo"
                        name="name"
                        id="name"
                        className="flex-1 bg-transparet outline-none"
                        required
                      />
                    </div>
                    <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                      <Mail className="w-5 h-5 mr-2" />
                      <input
                        type="email"
                        placeholder="Seu E-mail"
                        className="flex-1 bg-transparent outline-none"
                        name="email"
                        id="email"
                        required
                      />
                    </div>
                    <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                      <Phone className="w-5 h-5 mr-2" />
                      <input
                        type="tel"
                        placeholder="9xxxxxxxx"
                        className="flex-1 bg-transparent outline-none"
                        name="telefone"
                        id="telefone"
                        required
                      />
                    </div>
                  </div>
                  {Array.isArray(myOrderBumps) && myOrderBumps.length > 0 && (
                    <div
                      className="flex flex-col justify-center items-center my-8 text-gray-600
                            font-semibold"
                    >
                      <p>APROVEITE ESTAS OFERTAS ESPECIAIS</p>
                      <small>78% dos clientes adicionam estes itens</small>

                      <span className="w-full flex flex-col gap-2 my-6">
                        {myOrderBumps.map((item, index) => {
                          const checked = orderBumps.some(
                            (p) => p.id === item.id
                          );

                          return (
                            <div
                              className="flex gap-3  w-full border border-dashed border-red-500 rounded-sm p-4"
                              key={index}
                              style={{
                                color: checkout?.btn?.bgColor,
                              }}
                            >
                              <Checkbox
                                onCheckedChange={() => {
                                  const exists = orderBumps.some(
                                    (order) => order.id === item.id
                                  );

                                  if (exists) {
                                    setOrderBumps(
                                      orderBumps.filter(
                                        (order) => order.id !== item.id
                                      )
                                    );
                                  } else {
                                    setOrderBumps([...orderBumps, item]);
                                  }
                                }}
                                className="border border-gray-500"
                              />

                              <img
                                className="h-12 w-12 rounded-sm object-cover"
                                src={item.cover}
                                alt=""
                              />
                              <span className="flex flex-col">
                                <h1>{item.title}</h1>
                                <small className="text-[12px] font-normal text-black">
                                  {item.description}
                                </small>
                                <h1
                                  style={{
                                    color: checkout?.btn.bgColor,
                                  }}
                                >
                                  +{" "}
                                  {Number(item.price ?? 0).toLocaleString("pt")}
                                  kz
                                </h1>
                              </span>
                            </div>
                          );
                        })}
                      </span>
                    </div>
                  )}
                  {/* Botão Único */}
                  <button
                    type="submit"
                    className="w-full bg-orange-500 rounded-sm text-center flex items-center justify-center text-white h-[50px] border gap-2"
                  >
                    {processing ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        {"Finalizar compra"}
                      </>
                    )}
                  </button>
                </div>

                {/* Valor */}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-semibold">
                    <span>Valor</span>
                    <span>{Number(total ?? 0).toLocaleString("pt")} kz </span>
                  </div>
                </div>
                <span className="place-self-center flex items-center gap-1 font-bold text-xl text-orange-900 justify-center w-full"></span>
                <div className="text-center text-xs text-gray-500 space-y-2">
                  <p>
                    Ao clicar em <b>Compre agora</b>, você concorda com os{" "}
                    <a
                      href="https://culonga.com/termos"
                      className="text-blue-600 underline"
                    >
                      Termos de Compra
                    </a>{" "}
                    e está ciente da{" "}
                    <a
                      href="https://culonga.com/politicas"
                      className="text-blue-600 underline"
                    >
                      Política de Privacidade
                    </a>
                    .
                  </p>
                  <p className="mt-2">
                    Tecnologia Culonga © 2025 — Todos os direitos reservados
                  </p>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex w-full h-screen justify-center items-center">
              <h1> Produto não encontrado ou banido</h1>
            </div>
          )}
        </>
      )}

      {/* Modal do Iframe EMIS */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg w-full h-[80vh] bg-white text-black p-0 overflow-hidden">
          <DialogHeader className="p-4">
            <DialogTitle className="text-lg font-bold">
              Finalizar Pagamento
            </DialogTitle>
            <DialogDescription>
              Autorize o pagamento no Multicaixa Express
            </DialogDescription>
          </DialogHeader>
          {iframeUrl ? (
            <iframe
              src={iframeUrl}
              className="w-full h-full border-0"
              allowFullScreen
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          )}
          <div className="flex justify-center text-center gap-1 text-sm text-muted items-center p-2">
            <Verified size={14} /> Tecnologia fornecida pela EMIS - 100% Seguro
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
