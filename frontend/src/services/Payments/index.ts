import server from "../server";

export default class PaymentService {
  public async getMyTransactions(token: string, page: number) {
    try {
      interface dataReturnType {
        bank: string;
        status: string;
        updatedAt: Date;
        iban: string;
        createdAt: Date;
        amount: number;
        id: string;
      }
      const res = await fetch(`${server}transaction?page=${page}`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const data = (await res.json()) as {
        message: string;
        data: dataReturnType[];
        lastPage: number;
        page: number;
        limit: number;
      };
      return data;
    } catch (error) {
      return {
        data: [] as any,
        lastPage: 0,
        page: 0,
        limit: 0,
        message: "Erro ao buscar",
      };
    }
  }
  public async getTransictionStats(token: string) {
    try {
      const data = await fetch(`${server}transaction/stats`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const res = (await data.json()) as any;
      return res;
    } catch (error) {
      return [] as any;
    }
  }
  public async createGetMoney(token: string, body: any) {
    try {
      const res = await fetch(`${server}transaction`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { message: string; created: boolean };
      return data;
    } catch (error) {
      return {
        created: false,
        message: "Problemas de internet",
      };
    }
  }
  public async getMyPayments(token: string, page: number) {
    try {
      interface dataReturnType {
        amount: string;
        method: string;
        createdAt: string;
        status: string;
        uuid: string;
        products: any;
        user: any;
        updatedAt: string;
      }
      const res = await fetch(`${server}payments?page=${page}`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const data = (await res.json()) as {
        message: string;
        data: dataReturnType[];
        lastPage: number;
        page: number;
        limit: number;
      };
      return data;
    } catch (error) {
      return {
        data: [] as any,
        lastpage: 0,
        page: 0,
        limit: 0,
        message: "Erro ao buscar",
      };
    }
  }
  public async createPayment(body: {
    name: string;
    email: string;
    method: number;
    orderbumps: string[];
    amount: number;
    productId: string;
    userid: string;
    tel: string;
  }) {
    try {
      const res = await fetch(`${server}payments`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      return data;
    } catch (error) {
      return {
        message: "Problemas de internet",
        iframeUrl: "",
        id: "",
      };
    }
  }

  public async getMyPaymentsStatus(id: string) {
    try {
      const res = await fetch(`${server}payments/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = (await res.json()) as any;
      return data;
    } catch (error) {
      return {
        message: "Erro ao buscar",
      };
    }
  }
  public async updatePaymentStatus({
    payId,
    status,
    token,
    file,
  }: {
    payId: string;
    status: "1" | "0";
    token: string;
    file: string;
  }) {
    try {
      const res = await fetch(
        `${server}transaction/${payId}?status=${status}`,
        {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          method: "PUT",
          body: JSON.stringify({
            file: file,
          }),
        }
      );
      const data = (await res.json()) as { message: string; sent: string };
      return data;
    } catch (error) {
      return {
        message: "Erro ao actualizar",
        sent: false,
      };
    }
  }
  public async getMyBanks(token: string) {
    try {
      interface dataReturnType {
        id: string;
        iban: string;
        title: string;
        image: string;
      }
      const res = await fetch(`${server}bank`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const data = (await res.json()) as [];
      return data;
    } catch (error) {
      return [];
    }
  }
  public async createBank(token: string, body: any) {
    try {
      const res = await fetch(`${server}bank`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { message: string; created: boolean };
      return data;
    } catch (error) {
      return {
        created: false,
        message: "Problemas de internet",
      };
    }
  }
  public async delete(token: string, id: string) {
    try {
      const res = await fetch(`${server}bank/${id}`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        method: "DELETE",
      });
      const data = (await res.json()) as { message: string; deleted: boolean };
      return data;
    } catch (error) {
      return {
        deleted: false,
        message: "Problemas de internet",
      };
    }
  }
  public async editBank(token: string, body: any, id: string) {
    try {
      const res = await fetch(`${server}bank/${id}`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        method: "PATCH",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { message: string; created: boolean };
      return data;
    } catch (error) {
      return {
        created: false,
        message: "Problemas de internet",
      };
    }
  }
  public async updateMnualyPaymentStatus({
    payid,
    status,
    token,
  }: {
    payid: string;
    status: "1" | "2";
    token: string;
  }) {
    try {
      const res = await fetch(`${server}payments`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({
          payid,
          status,
        }),
      });
      const data = (await res.json()) as { message: string };
      return data as any;
    } catch (error) {
      return {
        message: "Erro ao actualizar",
        sent: false,
      };
    }
  }
}
