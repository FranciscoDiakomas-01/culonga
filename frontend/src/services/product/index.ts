import server from "../server";

interface CreateProduct {
  description: string;
  price: number;
  title: string;
  type: string;
}
export default class ProductConsumer {
  public async get(token: string, page: number) {
    try {
      const data = await fetch(`${server}products?page=${page}`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        next: {
          revalidate: 10000,
        },
      });
      const res = (await data.json()) as {
        products: any[];
        lastPage: number;
        limit: number;
        message: string;
        page: number;
        total: number;
      };

      if (res.total > 0) {
        const fomated = res.products.map((item) => {
          return {
            id: item.id,
            order: item.productid,
            title: item.title,
            cover: item.cover,
            createdAt: item.createdAt,
            status: item.status,
            link: item.link,
            price: item.price,
            user: item.user,
          };
        });
        return {
          ...res,
          products: fomated,
        };
      }
      return res;
    } catch (error) {
      return {
        products: [] as any[],
        message: "Sem produtos disponíveis",
        lastPage: 0,
        limit: 0,
        page: 0,
        total: 0,
      };
    }
  }
  public async getPoductStat(token: string) {
    try {
      const data = await fetch(`${server}products/stats/franciscodiakoma`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const res = (await data.json()) as
        | {
            message: string;
          }
        | any[];

      return res;
    } catch (error) {
      return {
        message: "",
      };
    }
  }
  public async create(token: string, body: CreateProduct) {
    try {
      const data = await fetch(`${server}products`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
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
        message: "Erro ao criar o produto",
        created: false,
      };
    }
  }
  public async delete(token: string, id: string) {
    try {
      const data = await fetch(`${server}products/${id}`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
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
  public async update(token: string, body: any) {
    try {
      const data = await fetch(`${server}products`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        method: "PUT",
        body: JSON.stringify(body),
      });
      const res = (await data.json()) as {
        updated: boolean;
        message: string;
      };
      return res;
    } catch (error) {
      return {
        updated: false,
        message: "Erro ao se conectar",
      };
    }
  }
  public async updatePayments(token: string, body: any) {
    try {
      const data = await fetch(`${server}products/payments`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        method: "PUT",
        body: JSON.stringify(body),
      });
      const res = (await data.json()) as {
        updated: boolean;
        message: string;
      };
      return res;
    } catch (error) {
      return {
        updated: false,
        message: "Erro ao se conectar",
      };
    }
  }
  public async getProductById(id: string) {
    try {
      const data = await fetch(`${server}products/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = (await data.json()) as {
        product: any;
        message: string;
        orderbumps: any[];
        checkout: any;
        type: string;
        disponibleOrderBumps: any[];
        offers: any[];
      };
      return res;
    } catch (error) {
      return {
        product: {},
        message: "Sem produtos disponíveis",
        orderbumps: [] as any[],
        checkout: {},
        type: "",
        offers: [],
        disponibleOrderBumps: [],
      };
    }
  }
  public async createOffer(
    token: string,
    body: {
      productId: string;
      price: number;
      title: string;
    }
  ) {
    try {
      const data = await fetch(`${server}products/offer`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        method: "POST",
        body: JSON.stringify(body),
      });
      const res = (await data.json()) as {
        created: boolean;
        message: string;
      };
      console.log(res);
      return res;
    } catch (error) {
      return {
        message: "Erro ao criar o oferta",
        created: false,
      };
    }
  }
  public async getProductOffersById(id: string, token: string) {
    try {
      console.log(id);
      const data = await fetch(`${server}products/offer/${id}`, {
        headers: {
          "Content-Type": "application/json",
          token,
        },
      });
      let res = (await data.json()) as {
        data: any[];
        message: string;
      };
      console.log(res);
      if (res?.data) {
        res.data = res.data.filter((item) => {
          return item.productId == id;
        });
      }
      return res;
    } catch (error) {
      return {
        data: [] as any[],
        message: "Sem produtos disponíveis",
      };
    }
  }
  public async deleteOffer(token: string, id: string) {
    try {
      const data = await fetch(`${server}products/offer/${id}`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
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
  public async updateChekout(token: string, body: any) {
    try {
      const data = await fetch(`${server}products/chekout`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        method: "PUT",
        body: JSON.stringify(body),
      });
      const res = (await data.json()) as {
        updated: boolean;
        message: string;
      };
      return res;
    } catch (error) {
      return {
        updated: false,
        message: "Erro ao se conectar",
      };
    }
  }
  public async updateProductstatus(
    token: string,
    body: {
      status: string;
      id: string;
    }
  ) {
    try {
      const data = await fetch(
        `${server}products/toogle/${body.id}/${body.status}`,
        {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          method: "POST",
        }
      );
      const res = (await data.json()) as { updated: boolean; message: string };

      return res;
    } catch (error: any) {
      return {
        message:
          error?.message ?? error?.error ?? "Erro ao actualizar o usuário",
      };
    }
  }
}
