import server from "../server";

export interface CreateTransfer {
  to: string; // email do destinatário
  amount: number;
}

export interface Transfer {
  id: string;
  fromId: string | null;
  toId: string | null;
  fromUser?: { id: string; email: string };
  toUser?: { id: string; email: string };
  amount: number;
  type: "INTERNAL" | "EXTERNAL";
  status: "APROVED" | "REJECTED" | "PENDING" | "CANCELED";
  createdAt: string;
}

export default class TransferConsumer {
  /** 🔹 Pegar todas as transferências do usuário (com paginação) */
  public async get(token: string, page: number) {
    try {
      const data = await fetch(`${server}transfer?page=${page}`, {
        headers: {
          "Content-Type": "application/json",
          token,
        },
        next: {
          revalidate: 10000,
        },
      });

      const res = (await data.json()) as {
        data: Transfer[];
        lastPage: number;
        total: number;
        message: string;
        stats: {
          recived: number;
          transfered: number;
        };
      };

      if (Array.isArray(res.data) && res.data.length > 0) {
        const formatted = res.data.map((item) => ({
          id: item.id,
          fromId: item.fromId,
          toId: item.toId,
          amount: item.amount,
          type: item.type,
          status: item.status,
          createdAt: item.createdAt,
          fromUser: item.fromUser,
          toUser: item.toUser,
        }));

        return {
          ...res,
          data: formatted,
        };
      }
      

      return {
        data: [],
        lastPage: 1,
        total: 0,
        message: res.message ?? "Nenhuma transferência encontrada",
        stats: {
          recived: 0,
          transfered: 0,
        },
      };
    } catch (error) {
      return {
        data: [] as Transfer[],
        message: "Erro ao carregar transferências",
        lastPage: 1,
        total: 0,
        stats: {
          recived: 0,
          transfered: 0,
        },
      };
    }
  }

  /** 🔹 Criar uma nova transferência */
  public async create(token: string, body: CreateTransfer) {
    try {
      const data = await fetch(`${server}transfer`, {
        headers: {
          "Content-Type": "application/json",
          token,
        },
        method: "POST",
        body: JSON.stringify(body),
      });

      const res = (await data.json()) as {
        created: boolean;
        message: string;
      };

      return res;
    } catch (error) {
      return {
        created: false,
        message: "Erro ao criar a transferência",
      };
    }
  }

  /** 🔹 Apagar transferência (caso precise) */
  public async delete(token: string, id: string) {
    try {
      const data = await fetch(`${server}transfer/${id}`, {
        headers: {
          "Content-Type": "application/json",
          token,
        },
        method: "DELETE",
      });

      const res = (await data.json()) as {
        deleted: boolean;
        message: string;
      };

      return res;
    } catch (error) {
      return {
        deleted: false,
        message: "Erro ao se conectar",
      };
    }
  }
}
