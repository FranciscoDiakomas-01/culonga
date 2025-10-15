import Integration from "@/types/integrations";
import server from "../server";

export default class IntegrationConsumer {
  public async get(token: string) {
    try {
      const data = await fetch(`${server}integrations`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        next: {
          revalidate: 10000,
        },
      });
      const res = (await data.json()) as {
        data: {
          createdAt: Date;
          updatedAt: Date;
          platform: string;
          id: string;
          url: string;
        }[];
        message: string;
      };
      if (res.data?.length > 0) {
        const formatted = res.data.map((item: any) => {
          const parsed = JSON.parse(item.platform);
          return {
            id: item.id,
            createdAT: item.createdAt,
            imageURL: parsed.imageURL,
            title: parsed.title,
            link: item.url,
          };
        }) as Integration[];
        return {
          data: formatted,
        };
      }
      return {
        data: [] as Integration[],
      };
    } catch (error) {
      return {
        data: [] as Integration[],
        message: "Sem integraçõe",
      };
    }
  }
  public async create(token: string, body: { platform: string; url: string }) {
    try {
      const data = await fetch(`${server}integrations`, {
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
        message: "Sem integraçõe",
      };
    }
  }
  public async delete(token: string, id: string) {
    try {
      const data = await fetch(`${server}integrations/${id}`, {
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
        message: "Sem integraçõe",
      };
    }
  }
  public async update(
    token: string,
    body: { platform: string; url: string },
    id: string
  ) {
    try {
      const data = await fetch(`${server}integrations/${id}`, {
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
        message: "Sem integraçõe",
      };
    }
  }
}
