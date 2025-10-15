"use client";

import VendorsRanking from "@/components/trending";
import { Button } from "@/components/ui/button";
import server from "@/services/server";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
type User = {
  name: string;
  lastname: string;
  profile: string;
  totalEarned: number;
};

export default function Rannkinh() {
  const [users, setUsers] = useState<User[]>([]);
  const [load, setLoad] = useState(true);
  const router = useRouter();
  useEffect(() => {
    async function get() {
      try {
        const res = await fetch(`${server}users/ranking`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = (await res.json()) as any;
        console.log(data);
        setUsers(data?.data ?? []);
      } catch (error) {
        console.log(error);
        setUsers([]);
      }
      setLoad(false);
    }
    get();
    const interval = setInterval(() => {
      get();
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <main className=" flex flex-col gap-4 items-center w-full bg-white min-h-screen text-black font-inter font-bold">
      <header className="grid lg:grid-cols-3 gap-3 flex-wrap w-full bg-orange-500 text-white p-5">
        <Button
          onClick={() => {
            const token = localStorage.getItem("token");
            if (!token) {
              router.push("/");
              return;
            }
            router.push("/dashboard");
          }}
          className="w-[100px]"
        >
          Voltar
        </Button>
        <h1 className="text-center text-[#F9BC2C] text-3xl">
          Ranking de Facturamento
        </h1>
      </header>

      {load ? (
        <Loader2 className="animate-spin mt-4" />
      ) : (
        <aside className="w-full justify-center fex flex-col items-center  gap-9 pb-12">
          {Array.isArray(users) && users.length > 0 ? (
            <div className="flex flex-col gap-4 pt-8">
              <h1 className="font-inter text-orange-600 uppercase font-bold text-center">
                Top 3 sellers de{" "}
                {new Date().toLocaleDateString("pt", {
                  month: "long",
                })}
              </h1>
              <VendorsRanking vendors={users} />
              <span className="flex flex-col justify-center items-center w-full px-4 pt-5 gap-5">
                {users.length > 3 && (
                  <div className="lg:px-40 px-5 w-full">
                    <h1 className="text-center my-7 font-inter text-orange-600 uppercase font-bold ">
                      Outros Sellers
                    </h1>
                    <span className="w-fulll">
                      {users.map((item, index) => (
                        <div
                          key={index}
                          className="font-semibold w-full lg:w-[60%] place-self-center"
                        >
                          {index > 2 && (
                            <span className="flex border justify-between w-full p-3 rounded-sm border-gray-200 shadow items-center">
                              <p className="rounded-full h-12 w-12 flex justify-center items-center bg-orange-500/10 text-orange-500 border-orange-500">
                                {index + 1}
                              </p>
                              <p>{item.name + " " + item.lastname}</p>
                              <p className="rounded-full bg-orange-500/10 text-orange-500 gap-1 px-4 flex justify-center items-center font-semibold border-orange-500 border">
                                {Number(item.totalEarned).toLocaleString("pt")}{" "}
                                kz
                              </p>
                            </span>
                          )}
                        </div>
                      ))}
                    </span>
                  </div>
                )}
              </span>
            </div>
          ) : (
            <h1 className="text-center">
              Escaladores Seja o primeiro escalador
            </h1>
          )}
        </aside>
      )}
    </main>
  );
}
