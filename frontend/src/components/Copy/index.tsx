"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

type CopyButtonProps = {
  text: string;
  className?: string;
  revertMs?: number; 
};

export function CopyButton({
  text,
  className,
  revertMs = 2000,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), revertMs);
    } catch {
      // opcional: lidar com erro (toast, etc.)
    }
  }

  return (
    <Button
      type="button"
      variant={"outline"}
      onClick={handleCopy}
      className="text-black dark:text-back border hover:text-black dark:border-gray-100 border-gray-100 w-22"
    >
      {copied ? (
        <>
          <Check size={14}/>
          Copiado
        </>
      ) : (
        <>
          <Copy size={14}/>
          Copiar
        </>
      )}
    </Button>
  );
}
