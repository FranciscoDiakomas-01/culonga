"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, MoveLeft, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import UserGetter from "@/services/user/get";
import { toast } from "sonner";
import server from "@/services/server";

type Step = 1 | 2 | 3;

export default function DocumentForm() {
  const [files, setFiles] = useState<Record<number, File | null>>({});
  const [error, setError] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    currentStep: Step
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => ({ ...prev, [currentStep]: e.target.files![0] }));
      setError("");
    }
  };

  // mesma lógica de validação de usuário
  const userService = new UserGetter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    async function get(token: string) {
      const myData = await userService.getMyData(token);
      if (
        myData?.data?.status == "APROVED" ||
        myData?.data?.status == "REJECTED"
      ) {
        router.back();
        return;
      }
    }
    get(token);
  }, []);

  const handleSubmit = async () => {
    if (!files[1] || !files[2] || !files[3]) {
      setError("Todas as etapas devem ser concluídas antes de finalizar.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const body = {
      productId: "profile",
      type: "file",
    };
    setProcessing(true);

    try {
      const canUpload = await fetch(`${server}products/canupload`, {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const can = (await canUpload.json()) as {
        status: boolean;
        message: string;
        key: string;
        server: string;
      };
      if (!can?.status) {
        toast.error(can?.message);
        console.log(can)
        setProcessing(false);
        return;
      }
      const uploaded = await Promise.all(
        [files[1], files[2], files[3]].map(async (file) => {
          const res = await fetch(can.server, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Uploadthing-Api-Key": can.key,
            },
            body: JSON.stringify({
              files: [
                {
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  customId: null,
                },
              ],
              acl: "public-read",
              metadata: null,
              contentDisposition: "inline",
            }),
          });
          const data = await res.json();
          const uploadData = data?.data?.[0];
          if (!uploadData?.url || !uploadData?.fields) {
            toast.info("Erro ao gerar link de upload");
            return;
          }
          const formData = new FormData();
          Object.entries(uploadData.fields).forEach(([key, value]) => {
            formData.append(key, value as string);
          });
          formData.append("file", file);
          const s3Res = await fetch(uploadData.url, {
            method: "POST",
            body: formData,
          });
          if (!s3Res.ok) {
            toast.info("Erro ao enviar para S3");
            return;
          }
          return uploadData.fileUrl;
        })
      );
      const [url1, url2, url3] = uploaded;
      if (!url1 || !url2 || !url3) {
        toast.info("Problemas de conexão", {
          description: "Tente recarregar a página",
        });
        setProcessing(false);
        return;
      }
      const update = await fetch(`${server}users/uploadverificationsfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          front: url1,
          back: url2,
          selfie: url3,
        }),
      });
      const res = (await update.json()) as {
        created: boolean;
        message: string;
      };
      toast.info(res.message);
      setProcessing(false);
      return;
    } catch (error) {
      toast.warning("Erro ao enviar as imagens", {
        description: "Tente novamente",
      });
      setProcessing(false);
      return;
    }
  };

  const stepLabels = [
    { id: 1, label: "Foto Frontal" },
    { id: 2, label: "Foto Traseira" },
    { id: 3, label: "Selfie" },
  ];

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col">
      <div className="w-full px-6 pt-6 flex justify-between">
        <Button
          variant={"outline"}
          onClick={() => {
            router.back();
          }}
          className="lg:flex hidden"
        >
          <MoveLeft /> Sair
        </Button>

        <div className="flex justify-between text-sm gap-4 text-gray-400 mt-2">
          {stepLabels.map((s) => (
            <span
              key={s.id}
              className={`border-l items-center px-3 font-medium flex gap-1 ${
                files[s.id] ? "text-green-400" : ""
              }`}
            >
              <span className="rounded-full border w-5 h-5 flex justify-center items-center text-xs">
                {s.id}
              </span>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 text-center px-6 gap-10">
        {stepLabels.map((s) => (
          <label
            key={s.id}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="flex items-center gap-2 border border-dashed border-gray-500 rounded-md px-6 py-3 hover:bg-gray-800">
              <Upload size={20} />
              <span className="text-sm">
                {files[s.id] ? files[s.id]?.name : `Selecionar ${s.label}`}
              </span>
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, s.id as Step)}
              className="hidden"
            />
            <span className="text-xs text-gray-400 mt-2">
              JPG, PNG ou PDF. Máx 5MB
            </span>
          </label>
        ))}

        {error && (
          <Alert
            variant="destructive"
            className="mt-6 max-w-md border-red-500 bg-red-500/10"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-end items-center p-6">
        <Button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700"
        >
          {processing ? <Loader className="animate-spin" /> : "Finalizar"}
        </Button>
      </div>
    </div>
  );
}
