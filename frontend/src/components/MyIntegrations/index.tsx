"use client";

import { MyIntegrations } from "@/types/integrations";
import { Card } from "../ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { Loader2, Unplug } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FormEvent, useState } from "react";
import { isValidUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import IntegrationConsumer from "@/services/integration";
import { toast } from "sonner";
export default function MyIntegrationCard({
  integration,
  active,
}: {
  integration: MyIntegrations;
  active: boolean;
}) {
  const [load, setLoad] = useState(false);
  const [URL, setURL] = useState("");
  const router = useRouter();
  const service = new IntegrationConsumer();
  async function handelOnsubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    setLoad(true);
    const platform = JSON.stringify({
      imageURL: integration.imageURL,
      title: integration.title,
    });
    const created = await service.create(token, {
      platform,
      url: URL,
    });
    toast.info(created.message);
    setTimeout(() => {
      setLoad(false);
    }, 1000);
    return;
  }
  return (
    <Card className="gap-2 bg-transparent rounded-sm p-3 flex justify-center items-center">
      <img
        className="h-20 w-15 object-contain"
        src={integration.imageURL}
        alt={integration.title}
      />
      <h1>{integration.title}</h1>
      {active ? (
        <Sheet>
          <Button
            className="w-full dark:bg-gray-800/30 dark:text-white"
            asChild
          >
            <SheetTrigger>
              <Unplug /> Integrar
            </SheetTrigger>
          </Button>

          <SheetContent>
            <SheetHeader>
              <SheetTitle>{integration.title}</SheetTitle>
              <SheetDescription>
                Cadastre o link de notificação do seu webhook
              </SheetDescription>
            </SheetHeader>

            <form
              onSubmit={handelOnsubmit}
              action=""
              className="flex flex-col gap-6 px-3"
            >
              {integration.title == "UTMFY" ? (
                <>
                  <Label htmlFor="url">TOKEN</Label>
                  <Input
                    type="text"
                    required
                    placeholder="Código (TOKEN)"
                    name="url"
                    id="url"
                    value={URL}
                    onChange={(e) => {
                      setURL(e.target.value);
                    }}
                  />
                </>
              ) : (
                <>
                  <Label htmlFor="url"></Label>
                  <Input
                    type="url"
                    required
                    placeholder="https://"
                    name="url"
                    id="url"
                    value={URL}
                    onChange={(e) => {
                      setURL(e.target.value);
                    }}
                  />
                </>
              )}

              <Button variant={"outline"}>
                {load ? <Loader2 className="animate-spin" /> : "Cadastrar"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      ) : (
        <Button className="w-full" variant={"outline"} disabled>
          Brevemente
        </Button>
      )}
    </Card>
  );
}
