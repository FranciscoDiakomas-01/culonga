"use client";

import DashBoardHeader from "@/components/ui/headerDashboard";
import server from "@/services/server";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AfilitionCard, ProductToJoinCard } from "@/components/Share";

type Afilition = {
  id: number;
  userId: string;
  totalSells: number;
  totalPurchases: number;
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
export default function Afiliations() {
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const [isMarketPlace, setIsMarkplace] = useState(false);
  const [data, setData] = useState<{
    afiliations: Afilition[];
    notAfiliations: ProductDisponibleToJoin[];
  }>();
  const router = useRouter();

  useEffect(() => {
    get().then().catch();
  }, [router, reload]);

  async function get() {
    const token = localStorage.getItem("token") as string;
    try {
      const res = await fetch(`${server}affiliates`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const content = await res.json();
      if (content?.message) {
        toast.info(content?.message);
      } else {
        const value = content as typeof data;
        setData(value);
        console.log(JSON.stringify(value, null, 2));
      }
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  }
  return (
    <main className="font-inter">
      <DashBoardHeader
        data={{
          canShowInput: true,
          isAdmin: false,
          pageTitle: "",
          inputPlaceHolder: "Buscar por produto",
        }}
      />

      <section className="px-2 py-5 flex flex-col gap-8 place-self-center lg:w-[97%] w-full">
        {loading ? (
          <div className="flex justify-center items-center mt-8">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <article className="flex flex-col gap-6 px-4">
            <Button
              className="my-7 w-50"
              variant={isMarketPlace ? "default" : "outline"}
              onClick={() => {
                setReload((prev) => !prev);
                setIsMarkplace((prev) => !prev);
              }}
            >
              {isMarketPlace ? "Afiliações" : "MarketPlace"}
            </Button>

            {!isMarketPlace && (
              <article>
                {Array.isArray(data?.afiliations) &&
                data?.afiliations.length > 0 ? (
                  <span className="grid lg:grid-cols-4 gap-4  grid-cols-1">
                    {data.afiliations.map((item, idx) => (
                      <AfilitionCard key={idx} afilition={item} />
                    ))}
                  </span>
                ) : (
                  <span className="text-center">
                    Sem afiliação , visite o marketplace
                  </span>
                )}
              </article>
            )}

            {isMarketPlace && (
              <span>
                {Array.isArray(data?.notAfiliations) &&
                data?.notAfiliations.length > 0 ? (
                  <span className="grid lg:grid-cols-4 gap-4  grid-cols-1">
                    {data.notAfiliations.map((item, idx) => (
                      <ProductToJoinCard key={idx} product={item} />
                    ))}
                  </span>
                ) : (
                  <span className="text-center">
                    Sem produtos para se afiliar
                  </span>
                )}
              </span>
            )}
          </article>
        )}
      </section>
    </main>
  );
}
