import { User } from "@/types/user";
import server from "../server";

interface ApiResponse {
  data?: User[];
  message?: string;
  lastpage: number;
}
export default class UserGetter {
  public async getMyData(token: string) {
    if (!token) {
      return {
        message: "Envia todos os dados",
      };
    }
    try {
      const data = await fetch(`${server}users/me`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const res = (await data.json()) as {
        data: {
          name: string;
          status: string;
          email: string;
          lastname: string;
          profile: string;
          id: string;
          telefone: string;
          createdAt: string;
          availableBalance: number;
          totalEarned : number
        };
        message: string;
      };
      return {
        message: res?.message,
        data: res?.data,
      };
    } catch (error: any) {
      return {
        message: error?.message ?? error?.error ?? "Envia todos os dados",
      };
    }
  }
  public async getAllUser(token: string, page: number) {
    if (!token) {
      return {
        message: "Envia todos os dados",
      };
    }
    try {
      const data = await fetch(`${server}users?page=${page}`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const res = (await data.json()) as any;
      return {
        message: res?.message,
        data: res?.data as User[],
        lastpage: res.lastpage,
        stats: res.stats,
      };
    } catch (error: any) {
      return {
        message: error?.message ?? error?.error ?? "Envia todos os dados",
        data: [],
        lastpage: 0,
      } as any;
    }
  }
  public async updteUserStatus(
    token: string,
    body: {
      status: "1" | "0" | "2";
      userid: string;
    }
  ) {
    try {
      const data = await fetch(`${server}users/toogle`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        method: "POST",
        body: JSON.stringify(body),
      });
      const res = (await data.json()) as { updated: boolean; message: string };
      console.log(res);
      return res;
    } catch (error: any) {
      return {
        message:
          error?.message ?? error?.error ?? "Erro ao actualizar o usuário",
      };
    }
  }
  public async getUserVerificationFiles(token: string, userid: string) {
    if (!token) {
      return {
        message: "Envia todos os dados",
      };
    }
    try {
      const data = await fetch(`${server}users/verify/${userid}`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const res = (await data.json()) as {
        message: string;
        front: string;
        found: boolean;
        selfie: string;
        back: string;
      };
      return res;
    } catch (error: any) {
      return {
        message: error?.message ?? error?.error ?? "Envia todos os dados",
        found: false,
      };
    }
  }
  public async getMyToken(code: string) {
    try {
      const data = await fetch(`${server}users/gettoken/${code}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = (await data.json()) as {
        found: boolean;
        message: string;
        token: string;
      };
      return res;
    } catch (error: any) {
      return {
        message: error?.message ?? error?.error ?? "Envia todos os dados",
        found: false,
        token: "",
      };
    }
  }
}
