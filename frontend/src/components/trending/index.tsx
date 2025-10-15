"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MedalIcon, ShoppingCart, Stars } from "lucide-react";

type Vendor = {
  name: string;
  lastname: string;
  profile?: string;
  totalEarned: number;
};

interface RankingProps {
  vendors: Vendor[];
}

export default function VendorsRanking({ vendors }: RankingProps) {
  // pega os 3 melhores com rank real
  let sortedTop = [...vendors]
    .sort((a, b) => b.totalEarned - a.totalEarned)
    .slice(0, 3)
    .map((v, i) => ({ ...v, rank: i + 1 })); // rank 1,2,3

  // coloca o campeão no meio, mas mantém rank original
  if (sortedTop.length === 3) {
    sortedTop = [sortedTop[1], sortedTop[0], sortedTop[2]];
  }

  const topVendors = sortedTop;

  return (
    <div className="grid md:grid-cols-3 gap-6 items-center  lg:px-40 px-5">
      {topVendors.map((vendor, index) => {
        const initials =
          vendor.name.charAt(0).toUpperCase() +
          vendor.lastname.charAt(0).toUpperCase();

        return (
          <Card
            key={index}
            className="p-0 flex flex-col items-center text-center transition-transform gap-8 hover:scale-95 border shadow-2xl relative rounded-sm pb-6 bg-transparent"
          >
            {/* barra de cor conforme rank real */}
            <span
              className={`w-full h-2 rounded-full
          ${vendor.rank === 1 ? "bg-[#D78642]" : ""}
          ${vendor.rank === 2 ? "bg-[#9BA3BF]" : ""}
          ${vendor.rank === 3 ? "bg-[#9E4816]" : ""}
        `}
            ></span>

            <CardHeader className="flex flex-col items-center gap-3">
              <Avatar className="w-20 h-20">
                <AvatarImage src={vendor.profile} alt={vendor.name} />
                <AvatarFallback className="bg-primary/10 text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </CardHeader>

            <Stars className="text-orange-500 absolute top-6 left-2 opacity-70" />
            <Stars className="text-orange-500 absolute bottom-4 right-2 opacity-70" />

            <CardContent className="flex flex-col items-center gap-2">
              <h3 className="text-lg font-semibold text-black">
                {vendor.name} {vendor.lastname}
              </h3>

              {/* faixa conforme rank real */}
              <span
                className={`flex justify-center items-center gap-2
            ${
              vendor.rank === 1
                ? "bg-gradient-to-b from-yellow-500 to-yellow-600 p-2 rounded-full text-sm px-5"
                : ""
            }
            ${
              vendor.rank === 2
                ? "bg-gradient-to-b from-gray-500 to-gray-600 p-2 rounded-full text-sm px-5"
                : ""
            }
            ${
              vendor.rank === 3
                ? "bg-gradient-to-b from-blue-500 to-blue-600 p-2 rounded-full text-sm px-5"
                : ""
            }
          `}
              >
                {vendor.rank}º Lugar
              </span>

              <span className="rounded-full bg-orange-500/10 text-orange-500 gap-1 px-4 flex justify-center items-center font-semibold border-orange-500 border ">
                <MedalIcon size={16} />
                {Number(vendor.totalEarned).toLocaleString("pt")} kz
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
