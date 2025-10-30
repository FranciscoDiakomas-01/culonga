"use client";
import logo from "@/assets/images/logo.png";
import {
  ChartArea,
  FolderKanban,
  Home,
  Landmark,
  LogOut,
  MessageCircleQuestion,
  SendToBack,
  Settings,
  SlidersHorizontal,
  Users,
  Wallet2,
} from "lucide-react";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "./button";
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/utils";
export default function SideBar() {
  type navigation = {
    to: string;
    label: string;
    icon: ReactNode;
    sub?: Omit<navigation, "sub">[];
    isLast?: boolean;
  };
  const [isLoad, setIsLoad] = useState(true);
  const [isHover, setIsHover] = useState(false);
  const router = useRouter();
  const adminNavigations: navigation[] = [
    {
      label: "Painel",
      icon: <Home size={18} />,
      to: "/dashboard",
    },
    {
      label: "Produtos",
      icon: <FolderKanban size={18} />,
      to: "/dashboard/products",
    },
    {
      label: "Vendas",
      icon: <Wallet2 size={18} />,
      to: "/dashboard/payments",
    },

    {
      label: "Usuários",
      icon: <Users size={18} />,
      to: "/dashboard/sellers",
    },
    {
      label: "Saques",
      icon: <Landmark size={18} />,
      to: "/dashboard/bank",
    },
    {
      label: "Ranking",
      icon: <ChartArea size={18} />,
      to: "/ranking",
    },
    {
      label: "Configurações",
      icon: <Settings size={18} />,
      to: "/dashboard/settings",
      isLast: true,
    },
  ];
  const [active, ssetActive] = useState(0);
  const sellerNavigations: navigation[] = [
    {
      label: "Painel",
      icon: <Home size={18} />,
      to: "/dashboard",
    },
    {
      label: "Produtos",
      icon: <FolderKanban size={18} />,
      to: "/dashboard/products",
    },
    {
      label: "Vendas",
      icon: <Wallet2 size={18} />,
      to: "/dashboard/payments",
    },
    {
      label: "Saques",
      icon: <Landmark size={18} />,
      to: "/dashboard/bank",
    },
    {
      label: "Transferências",
      icon: <SendToBack size={18} />,
      to: "/dashboard/transfer",
    },
    {
      label: "Integrações",
      icon: <SlidersHorizontal size={18} />,
      to: "/dashboard/integrations",
    },
    {
      label: "Ranking",
      icon: <ChartArea size={18} />,
      to: "/ranking",
    },
    {
      label: "Configurações",
      icon: <Settings size={18} />,
      to: "/dashboard/settings",
      isLast: true,
    },
    {
      label: "Suporte",
      icon: <MessageCircleQuestion size={18} />,
      to: "https://api.whatsapp.com/send/?phone=244952775029&text&type=phone_number&app_absent=0",
      isLast: true,
    },
  ];
  const [navigations, setnavigations] =
    useState<navigation[]>(sellerNavigations);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const decodedToken = decodeToken(token);
    if (decodedToken?.role == "SELLER") {
      setnavigations(sellerNavigations);
    } else if (decodedToken?.role?.toUpperCase() == "ADMIN") {
      setnavigations(adminNavigations);
    } else {
      router.push("/");
      return;
    }
    const timeout = setTimeout(() => {
      setIsLoad(false);
    });
    return () => clearTimeout(timeout);
  }, []);
  return (
    <>
      {isLoad ? null : (
        <>
          {" "}
          <span
            onMouseEnter={() => {
              setIsHover(true);
            }}
            onMouseLeave={() => {
              setIsHover(false);
            }}
            className={clsx(
              "fixed bg-background hidden lg:flex left-0 z-[88888] overflow-hidden  h-screen p-4 border-r  font-inter  transition-all flex-col",
              {
                "min-w-[15%]": isHover,
                "min-w-[5%]": !isHover,
              }
            )}
          >
            <Link
              href={"/dashboard"}
              onClick={() => {
                ssetActive(0);
              }}
              className={clsx("flex  overflow-hidden items-center   gap-2 ", {
                "justify-center": !isHover,
              })}
            >
              <Image
                src={logo}
                alt="logo"
                className="h-7 w-7 object-contain"
              />
              {isHover && <h1 className="font-bold text-2xl">culonga</h1>}
            </Link>

            <nav className="h-full py-8 flex flex-col justify-between">
              <ol className="flex flex-col gap-4">
                {navigations.map((item, key) => (
                  <Link
                    onClick={() => {
                      ssetActive(key);
                    }}
                    className={clsx(
                      "flex h-10 rounded-sm  transition-all gap-2 items-center p-2 py-3  cursor-pointer text-sm",
                      {
                        "dark:bg-gray-800/50 bg-primary text-white ":
                          active == key,
                        "hover:bg-gray-800/7 ": active != key,
                        "justify-center": !isHover,
                      }
                    )}
                    href={item.to}
                    key={key}
                  >
                    {item.icon} {isHover && item.label}{" "}
                  </Link>
                ))}
              </ol>
              <Button
                asChild
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                }}
                className="flex justify-center items-center gap-2"
              >
                <Link href={"/"}>
                  <LogOut /> {isHover && "Sair"}
                </Link>
              </Button>
            </nav>
          </span>
          <div className="lg:hidden flex fixed bottom-0 w-full  z-[99999999] min-h-[40px]  bg-background   left-0  overflow-hidden  p-2 border-r  font-inter  transition-all flex-col border-t">
            <ol className="flex justify-between gap-4">
              {navigations.map((item, key) => {
                if (item.isLast) return null;
                return (
                  <Link
                    onClick={() => {
                      ssetActive(key);
                    }}
                    className={clsx(
                      "flex h-10 rounded-sm  transition-all gap-2 items-center p-2 py-3  cursor-pointer text-sm w-full",
                      {
                        "dark:bg-gray-800/50 bg-primary text-white ":
                          active == key,
                        "hover:bg-gray-800/7 ": active != key,
                        "justify-center": !isHover,
                      }
                    )}
                    href={item.to}
                    key={key}
                  >
                    {item.icon}
                  </Link>
                );
              })}
            </ol>
          </div>
        </>
      )}
    </>
  );
}
