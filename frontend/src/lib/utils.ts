import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { jwtDecode } from "jwt-decode";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number) {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return value.toString();
}

export function validateInternationalPhone(phone: string): boolean {
  // Regex para número internacional: começa com +, código do país (1 a 3 dígitos) e o resto
  const regex = /^\+\d{1,3}\s?\d{6,14}$/;
  return regex.test(phone);
}

interface MyToken {
  userid: string;
  role: string;
}

export function decodeToken(token: string) {
  try {
    const decoded = jwtDecode<MyToken>(token);
    return decoded;
  } catch (error) {
    return null;
  }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url); // Se não for URL válida, lança erro
    return true;
  } catch (_) {
    return false;
  }
}

export function validarIbanAngola(iban: string): boolean {
  // Remover espaços
  const cleanIban = iban.replace(/\s+/g, "");

  // Verifica tamanho fixo 25
  if (cleanIban.length !== 25) return false;

  // Verifica prefixo AO
  if (!cleanIban.startsWith("AO")) return false;

  // Verifica se os restantes são números (após AO06)
  const resto = cleanIban.slice(4);
  if (!/^\d{21}$/.test(resto)) return false;

  return true;
}
