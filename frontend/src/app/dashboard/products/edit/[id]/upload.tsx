"use client";

import server from "@/services/server";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
export default function FileUploaderREST({
  id,
  type,
  defaultValue,
  status,
}: {
  id: string;
  type: string;
  defaultValue?: string;
  status?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(defaultValue || null);
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  async function uploadFile(file: File) {
    setUploading(true);
     const token = localStorage.getItem("token");
     if (!token) {
       router.push("/");
       return;
     }
    const body = {
      productId: id,
      type,
    };
   
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
      toast.error("Erro ao salvar o arquivo");
      return;
    }
    const response = await fetch(can.server, {
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
    const data = await response.json();
    const uploadData = data?.data?.[0];
    if (!uploadData?.fileUrl || !uploadData?.fields) {
      toast.error("Erro ao gerar o link de download");
      setUploading(false);
      console.log(uploadData);
      return;
    }
    const formData = new FormData();
    Object.entries(uploadData.fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append("file", file);
    const uploadRes = await fetch(uploadData.url, {
      method: "POST",
      body: formData,
    });
    if (!uploadRes.ok) {
      console.error("Erro no upload:", await uploadRes.text());
      toast.error("Falha ao enviar para S3");
      setUploading(false);
      return;
    }
    const fileUrl = uploadData.fileUrl;
    const upDate = await fetch(`${server}products/upload`, {
      body: JSON.stringify({
        productId: id,
        type,
        file: fileUrl,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
    });
    const lastRes = await upDate.json();
    if (lastRes?.updated) {
      toast.success("Arquivo salvo com sucesso");
      setFileUrl(fileUrl);
    } else {
      toast.error("Erro em salvar o arquivo", {
        description: lastRes?.message,
      });
    }
    setUploading(false);
    return fileUrl;
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-4  rounded-lg shadow-sm border dark:border-white/10">
      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500/30  dark:hover:bg-blue-50/10 hover:bg-blue-500/10 transition">
        <span className="text-gray-500 text-sm mb-2">
          {file ? file.name : "Clique ou arraste o arquivo"}
        </span>
        <input
          type="file"
          onChange={handleChange}
          className="hidden"
          accept={type === "file" ? "*/*" : "image/*"}
        />
      </label>
      <button
        onClick={async () => {
          if (!file) {
            return;
          }
          await uploadFile(file);
        }}
        disabled={uploading || !file}
        className={`w-full px-4 py-2 rounded-md text-white font-semibold transition ${
          uploading || !file
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {uploading ? "Enviando..." : "Enviar"}
      </button>

      {fileUrl && (
        <div className="text-sm text-gray-700">
          <p>URL actual : </p>
          <a href={fileUrl} target="_blank" className="text-blue-600 underline">
            {fileUrl.split("/").pop()}
          </a>
        </div>
      )}

      {status && type == "file" && (
        <Alert className="bg-transparent">
          <CheckCircle className="text-green-500" />
          <AlertTitle>Alerta</AlertTitle>
          <AlertDescription>
            Este produto já está publicado. Para garantir a privacidade e
            segurança, a URL de download não pode ser exibida.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
