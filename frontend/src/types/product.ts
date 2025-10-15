export default interface Product {
  cover: string;
  createdAt: Date;
  status: string;
  id: number | string;
  title: string;
  description: string;
  type: "default" | "offer";
  whatsappSuport?: string;
  garant: number;
  price: number;
  orderBumps: number[];
  offers: Offer[];
  payments: number[];
  pixelids: PixelId[];
  checkoutstile: ProductChekout;
  link: string;
  backredirect: string;
  upsell?: string;
  category: string;
}

export interface Offer {
  id: number;
  productid: number;
  name: string;
  price: string;
  link: string;
  title: "";
  createdAt: Date;
}

export interface PaymentWay {
  id: number;
  title: string;
  img: string;
  description: string;
}
export interface PixelId {
  id: number | string;
  type: "facebook" | "google" | "tiktok" | "kwai";
  pixel?: string;
  domain?: string;
  name?: string;
}

export interface ProductChekout {
  id: number | string;
  productid: number | string;
  bg?: string;
  textColor?: string;
  timer?: {
    textColor: string;
    bgColor: string;
    text: string;
    time: number;
    active: boolean;
  };
  btn: {
    bgColor: string;
    textColor: string;
    text: string;
  };
  orderbump?: {
    borderColor: string;
    bgColor: string;
    textColor: string;
    titleColor: string;
    priceColor: string;
  };
}
