"use client";

import { Button } from "@/components/ui/button";
import ProductConsumer from "@/services/product";
import Product, { ProductChekout } from "@/types/product";
import {
  Barcode,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  Mail,
  PartyPopper,
  Phone,
  User,
  Verified,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { toast, Toaster } from "sonner";
import isValidAngolaPhone from "@/services/isValiPhoneNumber";
import isValidEmail from "@/services/isValidEmail";
import PaymentService from "@/services/Payments";
import ReactPixel from "react-facebook-pixel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CopyButton } from "@/components/Copy";

export default function Chekout() {
  const { id } = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [payId, setpayId] = useState("PENDING");
  const [product, setProduct] = useState<any>({});
  const service = new ProductConsumer();
  const [myOrderBumps, setMyOrderBumps] = useState<Product[]>([]);
  const [processing, setProcessing] = useState(false);
  const [pixelId, setPixelId] = useState("");
  const paymentserviceAPI = new PaymentService();
  const [purschase, setPurchase] = useState(false);
  const PaymentServices = [
    {
      title: "Express",
      image:
        "http://noticiasangola.free.nf/wp-content/uploads/2025/04/GPONew.png",
      id: 1,
      label: `Permita que seus clientes finalizem a compra
                          rapidamente, com menos etapas e aprovação instantânea.
                          Ideal para aumentar conversões.`,
    },
    {
      title: "Referência",
      image:
        "https://noticiasangola.free.nf/wp-content/uploads/2025/04/REFNew.png",
      id: 2,
      label: `Pague em qualquer terminal Multicaixa`,
      escription: "Você receberá uma referência para pagamento em dinheiro.",
    },
    {
      title: "PayPay",
      image:
        "https://portal.paypayafrica.com/dist/ed99c559a1512b731bdc45083fda5798.png",
      id: 33,
      label: `Pague usando a sua conta paypay`,
      escription: "Usando paypay você recebe desconto de até 5% na sua compra",
    },
  ];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [modal, setModal] = useState<
    "express" | "reference" | "paypay" | undefined
  >(undefined);
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
      time: 60 * 5, // 5 minutos
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
  const [refeence, setReferece] = useState({
    referenece: "",
    entity: "",
  });
  const [paypayDeeplink, setPayPayDeepLink] = useState({
    dynamicLink: "",
    tradeToken: "",
  });
  const [timeLeft, setTimeLeft] = useState<number>(checkout?.timer?.time ?? 0);
  const [activePayment, setACtivePayments] = useState(1);
  const [message, setMessage] = useState("Pagamento Pendente");
  const [backRedirect, setbackRedirect] = useState("");
  useEffect(() => {
    if (!checkout?.timer?.active) return;
    setTimeLeft(checkout.timer.time); // reinicia sempre que checkout mudar
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
      setACtivePayments(
        Array.isArray(data?.product?.payment) ? data?.product?.payment[0] : 1
      );
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
    async function getStatus() {
      if (payId.length == 0) {
        return;
      }
      const data = await paymentserviceAPI.getMyPaymentsStatus(payId);
      setTimeout(() => {
        if (data?.status == "PENDING") {
          setMessage("Pagamento Pendente");
        } else if (data?.status == "APROVED") {
          setMessage("Pagamento efectuado com sucesso");
          if (pixelId && !purschase) {
            ReactPixel.init(pixelId);
            ReactPixel.track("Purchase", {
              currency: "BRL",
              value: parseFloat(String(total ?? 0)),
              content_ids: [product?.id?.toString() ?? crypto.randomUUID()],
              contents: [
                {
                  id: product?.id?.toString() ?? crypto.randomUUID(),
                  quantity: 1,
                },
              ],
              transaction_id: crypto.randomUUID(),
            });
            setPurchase(true);
          }

          if (product?.upsell) {
            setTimeout(() => {
              location.href = product?.upsell;
            }, 1500);
          }
        } else {
          //setMessage("Seu pagamento foi cancelado");
          setMessage("Pagamento Pendente");
        }
      }, 1500);
    }
    getStatus();
    const interval = setInterval(() => {
      getStatus();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [payId]);

  useEffect(() => {
    if (pixelId) {
      ReactPixel.init(pixelId);
      ReactPixel.pageView();
    }
  }, [pixelId]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    let tel = data.get("telefone") as string;
    const email = data.get("email") as string;
    const method = activePayment == 2 ? 0 : activePayment == 33 ? 2 : 1;
    const orderbumps = orderBumps.map((item) => {
      return item.id;
    });
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
    const body = {
      name,
      email,
      method,
      orderbumps,
      amount: total,
      productId: product.type == "Offer" ? product.productId : product.id,
      userid: product.userId,
      tel,
    };

    if (pixelId) {
      ReactPixel.init(pixelId);
      ReactPixel.track("InitiateCheckout", {
        currency: "BRL",
        value: parseFloat(String(total ?? 0)),
        num_items: 1 + orderBumps.length,
        content_ids: [
          product?.id?.toString() ?? crypto.randomUUID(),
          ...orderbumps.map((id) => id.toString()),
        ],
        contents: [
          {
            id: product?.id?.toString() ?? crypto.randomUUID(),
            quantity: 1,
          },
          ...orderBumps.map((id) => ({
            id: id.toString(),
            quantity: 1,
          })),
        ],
      });
    }
    setProcessing(true);
    const res = await paymentserviceAPI.createPayment({
      ...body,
      amount: Number(body.amount),
      email,
      method,
      name,
      orderbumps,
      tel,
    });
    console.log(res);

    if (method == 0 && res.referece && res.entity && res.id) {
      setReferece({
        entity: res.entity,
        referenece: res.referece,
      });

      setpayId(res.id);
      setModal("reference");
    } else if (method == 2 && res.dynamic_link && res.trade_token) {
      toast.error(res.message ?? "Erro ao efctuar o pagamento");
      setPayPayDeepLink({
        dynamicLink: res.dynamic_link,
        tradeToken: res.trade_token,
      });
      setModal("paypay");
      setpayId(res.id);
    } else if (method != 2 && method != 0 && res?.id && res?.data) {
      toast.error(res.message ?? "Erro ao efctuar o pagamento");
      setModal("express");
      setpayId(res.id);
      const iframe = iframeRef.current;
      if (iframe?.contentDocument) {
        iframe.contentDocument.open();
        iframe.contentDocument.write(res.data);
        iframe.contentDocument.close();
      }
    } else {
      toast.error(res.message ?? "Erro ao efctuar o pagamento");
      setModal(undefined);
    }
    setProcessing(false);
    setOpen(true);
  }

  return (
    <>
      {payId && (
        <iframe
          ref={iframeRef}
          style={{ width: "100%", height: "100vh", border: "none" }}
          title="Página Externa"
        />
      )}

      <Toaster theme="light"></Toaster>
      {load ? (
        <div className="h-screen w-screen flex justify-center items-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          {product &&
          checkout &&
          Array.isArray(myPayments) &&
          myPayments.length > 0 ? (
            <form
              onSubmit={submit}
              style={{
                backgroundColor: checkout?.bg ?? "#ffffff",
                color: checkout?.textColor ?? "#000",
              }}
              className="min-h-screen w-full pb-8 font-bold"
            >
              {modal == "reference" && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogContent
                    className="sm:max-w-md h-[70dvh] bg-white text-black overflow-y-scroll "
                    style={{
                      scrollbarColor: `${checkout.btn.bgColor} ${checkout.btn.bgColor}20`,
                    }}
                  >
                    <style>
                      {`
        /* Webkit Browsers (Chrome, Safari, Edge) */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${checkout.btn.bgColor}10;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: ${checkout.btn.bgColor};
          border-radius: 4px;
        }
      `}
                    </style>
                    <DialogHeader className="flex justify-center items-center flex-col gap-2">
                      <div className="bg-green-500/10 rounded-full place-self-center h-10 w-10 flex justify-center items-center border-green-500 border-dashed border">
                        <CheckCircle2 className="text-green-500" />
                      </div>
                      <DialogTitle>{message}</DialogTitle>
                      <DialogDescription className="text-center">
                        Use esta referência para pagar em qualquer terminal
                        Multicaixa
                      </DialogDescription>
                    </DialogHeader>

                    <span
                      className="w-full flex justify-center items-center flex-col gap-1 border rounded-sm p-3"
                      style={{
                        borderColor: `${checkout.btn.bgColor}20`,
                        backgroundColor: `${checkout.btn.bgColor}5`,
                        color: checkout?.btn.bgColor,
                      }}
                    >
                      <h1 className="text-3xl font-bold">
                        {total.toLocaleString("pt")}kz
                      </h1>
                      <small className="text-sm">Valor a pagar</small>
                    </span>

                    <div className="flex flex-col gap-2">
                      <p>Entidade de Pagamento</p>
                      <span
                        style={{
                          borderColor: `${checkout.btn.bgColor}20`,
                          backgroundColor: `${checkout.btn.bgColor}`,
                          color: checkout?.btn.textColor,
                        }}
                        className="p-3 rounded-sm flex justify-center items-center text-xl"
                      >
                        {refeence.entity}
                      </span>
                      <CopyButton text={refeence.entity} />
                      <p>Referência de Pagamento</p>
                      <span
                        style={{
                          borderColor: `${checkout.btn.bgColor}20`,
                          backgroundColor: `${checkout.btn.bgColor}`,
                          color: checkout?.btn.textColor,
                        }}
                        className="p-3 rounded-sm flex justify-center items-center text-xl"
                      >
                        {refeence.referenece}
                      </span>

                      <CopyButton text={refeence.referenece} />
                    </div>

                    <span
                      style={{
                        borderColor: `${checkout.btn.bgColor}50`,
                        backgroundColor: `${checkout.btn.bgColor}10`,
                      }}
                      className="p-3 flex flex-col gap-3 rounded-sm border"
                    >
                      <h1>Como autorizar o pagamento:</h1>
                      <ol className="flex flex-col text-sm gap-3 list-inside list-decimal">
                        <li>Aceda ao Multicaixa Express ou app do seu banco</li>
                        <li>Selecione Pagamento por Referência</li>
                        <li> Introduza a Entidade</li>
                        <li>Introduza a Referência</li>
                        <li> Confirme o pagamento</li>
                      </ol>
                    </span>
                    <div className="flex justify-center text-center gap-1 text-sm text-muted items-center flex-col md:flex-row">
                      <Verified size={14} />
                      Tecnologia fornecida pela EMIS - 100% Seguro
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {modal == "paypay" && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogContent className="sm:max-w-md h-[70dvh] bg-white text-black overflow-y-scroll">
                    <DialogHeader className="flex justify-center items-center flex-col gap-2">
                      <div className="bg-green-500/10 rounded-full place-self-center h-10 w-10 flex justify-center items-center border-green-500 border-dashed border">
                        <CheckCircle2 className="text-green-500" />
                      </div>
                      <DialogTitle>
                        {message || "Pagamento com PayPay"}
                      </DialogTitle>
                      <DialogDescription>
                        Foi aplicado um desconto de 5% na sua compra
                      </DialogDescription>
                    </DialogHeader>

                    <span
                      className="w-full flex justify-center items-center flex-col gap-1 border rounded-sm p-3"
                      style={{
                        borderColor: `${checkout.btn.bgColor}20`,
                        backgroundColor: `${checkout.btn.bgColor}5`,
                        color: checkout?.btn.bgColor,
                      }}
                    >
                      <h1 className="text-3xl font-bold">
                        {Number(total - total * 0.05).toLocaleString("pt")}kz
                      </h1>
                      <small className="text-sm">Valor a pagar</small>
                    </span>

                    <div className="flex flex-col gap-2 mt-4">
                      <p>Link de Pagamento</p>
                      <a
                        href={paypayDeeplink.dynamicLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          borderColor: `${checkout.btn.bgColor}20`,
                          backgroundColor: `${checkout.btn.bgColor}`,
                          color: checkout?.btn.textColor,
                        }}
                        className="p-3 rounded-sm flex justify-center items-center text-sm text-center break-all"
                      >
                        Abrir no PayPay App
                      </a>
                      <CopyButton text={paypayDeeplink.dynamicLink} />
                    </div>

                    <h1>Como autorizar o pagamento:</h1>
                    <ol className="flex flex-col text-sm gap-3 list-inside list-decimal">
                      <li>
                        Clique no botão <b>"Abrir no PayPay App"</b> acima.
                      </li>
                      <li>O aplicativo PayPay será aberto automaticamente.</li>
                      <li>Faça login, se ainda não estiver logado.</li>
                      <li>
                        Verifique o valor (já com desconto) e confirme o
                        pagamento.
                      </li>
                      <li>Volte ao site para verificar a confirmação.</li>
                    </ol>
                    <div className="flex justify-center text-center gap-1 text-sm text-muted items-center flex-col md:flex-row">
                      <Verified size={14} />
                      Tecnologia fornecida pela EMIS - 100% Seguro
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {checkout?.timer?.active && (
                <div
                  className="flex flex-col gap-2 p-3 w-full md:text-md "
                  style={{
                    backgroundColor: checkout?.btn.bgColor,
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
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="lg:w-[40%] md:w-[70%] md:px-0 px-5 place-self-center   py-2  w-full flex flex-col gap-4 rounded-md">
                {product?.banner && (
                  <img
                    className="w-full rounded-sm max-h-[450px]  overflow-hidden"
                    src={product?.banner}
                    alt="Banner"
                  />
                )}
                <div className="flex flex-col gap-2 shadow border rounded-sm p-3">
                  <h1 className="text-pretty text-sm">VOCÊ ESTÁ ADQUIRINDO:</h1>
                  <span className="flex gap-4">
                    {product?.cover && (
                      <img
                        className="w-15 rounded-sm  h-15 overflow-hidden"
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
                <div className=" overflow-hidden place-self-center  my-4 mx-2 w-full flex flex-col gap-4 rounded-md ">
                  <div className="shadow-2xl border shadow-black rounded-sm border-gray-200 p-4">
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
                        <User className="w-5 h-5  mr-2" />
                        <input
                          type="text"
                          placeholder="Nome Completo"
                          name="name"
                          id="name"
                          className="flex-1 bg-transparet outline-none"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                        <Mail className="w-5 h-5  mr-2" />
                        <input
                          type="email"
                          placeholder="Seu E-mail"
                          className="flex-1 bg-transparent outline-none"
                          name="email"
                          id="email"
                          required
                        />
                      </div>

                      {/* Telefone */}
                      <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                        <Phone className="w-5 h-5  mr-2" />
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
                    <div className="w-full mt-4 rounded-lg  bg-white space-y-5">
                      <div
                        className={`grid ${
                          myPayments.length >= 2 && "md:grid-cols-2"
                        }  gap-5`}
                      >
                        {myPayments.map((item, index) => {
                          const pay = PaymentServices.find((p) => {
                            return p.id == item;
                          });

                          return (
                            <button
                              key={index}
                              type="button"
                              className="border-2 border-gray-100 cursor-pointer w-full transition-all rounded-lg p-3 flex flex-col items-center justify-center space-y-2"
                              style={{
                                borderColor:
                                  activePayment == item
                                    ? `${checkout.btn.bgColor}10`
                                    : ``,
                                backgroundColor:
                                  activePayment == item
                                    ? `${checkout.btn.bgColor}10`
                                    : "",
                              }}
                              onClick={() => {
                                setACtivePayments(item);
                              }}
                            >
                              <img
                                src={pay?.image}
                                alt={pay?.title}
                                className="w-20 h-10 object-contain"
                              />
                              <span className="text-sm font-medium">
                                {pay?.title}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <div
                        className="flex items-center gap-2 border border-blue-100 flex-col rounded-lg px-3 py-2 text-sm"
                        style={{
                          backgroundColor: `${checkout.btn.bgColor}10`,
                          color: checkout?.btn?.bgColor,
                          borderColor: `${checkout.btn.bgColor}10`,
                        }}
                      >
                        <div className="flex gap-4 text-[15px] md:items-center w-full">
                          {activePayment == 2 ? (
                            <>
                              <Barcode size={18} />
                              <h1>Pague em qualquer terminal Multicaixa</h1>
                            </>
                          ) : activePayment == 33 ? (
                            <>
                              <PartyPopper size={18} />
                              <h1>Pague usando PayPay</h1>
                            </>
                          ) : (
                            <>
                              <Zap size={18} />
                              <h1>Pagamento por Express</h1>
                            </>
                          )}
                        </div>
                        <p className="md:text-start text-center w-full">
                          {activePayment == 2
                            ? "Você receberá uma referência para pagamento em dinheiro."
                            : activePayment == 33
                            ? "Pague com desconto de até 5% da sua compra"
                            : "Pagamento Rápido e Seguro — autorize direto no seu aplicativo bancário"}
                        </p>
                      </div>

                      {Array.isArray(myOrderBumps) &&
                        myOrderBumps.length > 0 && (
                          <div
                            className="flex flex-col justify-center items-center my-8 text-gray-600
                            font-semibold"
                          >
                            <p>APROVEITE ESTAS OFERTAS ESPECIAIS</p>
                            <small>
                              78% dos clientes adicionam estes itens
                            </small>

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
                                        {Number(item.price ?? 0).toLocaleString(
                                          "pt"
                                        )}
                                        kz
                                      </h1>
                                    </span>
                                  </div>
                                );
                              })}
                            </span>
                          </div>
                        )}
                      <Button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2   font-medium h-10 rounded-sm  transition"
                        style={{
                          backgroundColor: checkout?.btn.bgColor,
                          color: checkout?.btn.textColor,
                        }}
                      >
                        {processing ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <>
                            {" "}
                            {activePayment == 2 ? (
                              <>
                                <Barcode className="w-4 h-4" />
                                Gerar referência de pagamento
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4" />
                                {checkout.btn.text}
                              </>
                            )}
                          </>
                        )}
                      </Button>

                      <div className="border-b w-full border-gray-200"></div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-xl font-semibold">
                          <span>Valor</span>
                          <span>
                            {Number(total ?? 0).toLocaleString("pt")}
                            kz{" "}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
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
    </>
  );
}
