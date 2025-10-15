"use client";

import MyIntegrationCard from "@/components/MyIntegrations";
import { Button } from "@/components/ui/button";
import DashBoardHeader from "@/components/ui/headerDashboard";
import {
  integrations,
  automations,
  fiscalNotes,
  member,
  sms,
  track,
} from "@/mocks/integrations";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Integrations() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
  }, []);
  return (
    <main>
      <DashBoardHeader
        data={{
          canShowInput: false,
          isAdmin: false,
          pageTitle: "",
        }}
      />
      <section className="px-2 pt-5 place-self-center lg:w-[95%] w-full flex flex-col gap-6">
        <h1 className="text-xl">Integrações</h1>
        <Button asChild variant={"outline"} className="place-self-end">
          <Link href={"/dashboard/integrations/my"} prefetch>
            Minhas Integrações
          </Link>
        </Button>

        <span className="flex pb-5 flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="font-semibold text-xl">
              Integrações disponíveis( {track.length} ){" "}
            </h1>
            <aside className="grid xl:grid-cols-5 lg:grid-cols-4 gap-4 md:grid-cols-4">
              {track.map((inte, index) => (
                <MyIntegrationCard active integration={inte} key={index} />
              ))}
            </aside>
          </div>
        </span>
      </section>
    </main>
  );
}
