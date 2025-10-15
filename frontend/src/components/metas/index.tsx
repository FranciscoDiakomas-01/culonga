import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";

interface Props {
  vendas: number; // valor vendido pelo cliente
}

export default function MetaVendasCard({ vendas }: Props) {
  const metaInicial = 1_000_000;

  // calcula a meta baseada nas vendas
  const meta = useMemo(() => {
    if (vendas < metaInicial) return metaInicial;
    return vendas * 2;
  }, [vendas]);

  // calcula a percentagem atingida
  const percent = useMemo(() => {
    return Math.min((vendas / meta) * 100, 100);
  }, [vendas, meta]);

  // calcula quanto falta para atingir a meta
  const falta = useMemo(() => {
    return Math.max(meta - vendas, 0);
  }, [vendas, meta]);

  function formatNumber(num: number): string {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
  }

  return (
    <Card className="p-3 rounded-sm bg-transparent backdrop-blur-3xl shadow-orange-500/10 border-orange-500/20 shadow-2xl">
      <div className="p-0 flex justify-between items-center gap-4 flex-wrap text-xl font-bold">
        <p>Meta Atual</p>
        <p>{formatNumber(meta)} ⚡️</p>
      </div>

      <div className="flex justify-between gap-3 items-center">
        <ProgressBar percent={percent} />
      </div>

      <div className="flex justify-center lg:gap-0 gap-3 md:flex-row flex-col md:items-center md:text-center">
        {falta > 0 ? (
          <span className="text-gray-400">
            <p>
              Faltam {falta.toLocaleString()} kz para você atingir o próximo
              nível.
            </p>
            <p>
              Alcance {formatNumber(meta)} em Vendas e Seja um Escalador na
              Culonga
            </p>
          </span>
        ) : (
          <p className="text-green-400 font-bold">Parabéns! Meta atingida 🎉</p>
        )}
      </div>
    </Card>
  );
}
