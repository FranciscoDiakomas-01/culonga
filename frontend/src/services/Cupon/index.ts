import server from "../server";

export interface CouponData {
  code: string;
  description?: string;
  discount: number;
  minPurchase?: number;
  maxUsage?: number;
}

export interface Coupon extends CouponData {
  id: string;
  active: boolean;
  usedCount: number;
  createdAt: string;
}

export default class CouponClient {
  private baseUrl = `${server}coupuns`;

  constructor(private token: string) {}

  private get headers() {
    return {
      "Content-Type": "application/json",
      token: this.token,
    };
  }

  async create(
    data: CouponData
  ): Promise<{ message: string; data?: Coupon } | null> {
    try {
      const res = await fetch(this.baseUrl, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao criar cupom");
      return await res.json();
    } catch (err: any) {
      console.error("Erro create:", err.message);
      return null;
    }
  }

  async list(): Promise<Coupon[] | null> {
    try {
      const res = await fetch(this.baseUrl, {
        method: "GET",
        headers: this.headers,
      });
      if (!res.ok) throw new Error("Erro ao listar cupons");
      const data = await res.json();
      return data?.data ?? [];
    } catch (err: any) {
      console.error("Erro list:", err.message);
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
        headers: this.headers,
      });
      if (!res.ok) throw new Error("Erro ao remover cupom");
      return true;
    } catch (err: any) {
      console.error("Erro remove:", err.message);
      return false;
    }
  }

  async toggle(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/${id}/toggle`, {
        method: "PATCH",
        headers: this.headers,
      });
      if (!res.ok) throw new Error("Erro ao alternar status");
      return true;
    } catch (err: any) {
      console.error("Erro toggle:", err.message);
      return false;
    }
  }
}
