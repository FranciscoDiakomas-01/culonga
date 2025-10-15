import server from "../server";

export default class UserCreater {
  public async login({ email, password }: { email: string; password: string }) {
    if (!email || !password) {
      return {
        status: false,
        token: "",
        message: "Envia todos os dados",
      };
    }
    try {
      const data = await fetch(`${server}users/auth`, {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        method: "POST",
      });
      const res = (await data.json()) as {
        looged: boolean;
        token: string;
        message: string;
      };
      return {
        status: res?.looged,
        token: res?.token,
        message: res?.message,
      };
    } catch (error: any) {
      return {
        status: false,
        token: "",
        message: error?.message ?? error?.error ?? "Envia todos os dados",
      };
    }
  }
  public async sigIn({
    email,
    name,
    lastname,
    password,
    telefone,
  }: {
    name: string;
    lastname: string;
    email: string;
    password: string;
    telefone: string;
  }) {
    if (!email || !password || !name || !lastname || !telefone) {
      return {
        status: false,
        token: "",
        message: "Envia todos os dados",
      };
    }

    try {
      const data = await fetch(`${server}users`, {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, lastname, telefone }),
        method: "POST",
      });
      const res = (await data.json()) as {
        created: boolean;
        token: string;
        message: string;
      };
      return {
        status: res?.created,
        token: res?.token,
        message: res?.message,
      };
    } catch (error: any) {
      return {
        status: false,
        token: "",
        message: error?.message ?? error?.error ?? "Envia todos os dados",
      };
    }
  }
  public async update(
    {
      email,
      name,
      lastname,
      telefone,
      file,
    }: {
      name: string;
      lastname: string;
      email: string;
      telefone: string;
      file: string;
    },
    token: string
  ) {
    if (!email || !name || !lastname || !telefone) {
      return {
        status: false,
        message: "Envia todos os dados",
      };
    }
    try {
      const data = await fetch(`${server}users`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          email,
          name,
          lastname,
          telefone,
          file,
        }),
        method: "PUT",
      });
      const res = (await data.json()) as {
        updated: boolean;
        message: string;
      };
   
      console.log(res, { email, name, lastname, telefone, file });
      
      return {
        status: res?.updated,
        message: res?.message,
      };
    } catch (error: any) {
      return {
        status: false,
        message: error?.message ?? error?.error ?? "Envia todos os dados",
      };
    }
  }
  public async updatePassword(
    {
      oldpassword,
      password,
    }: {
      password: string;
      oldpassword: string;
    },
    token: string
  ) {
    if (!password || !oldpassword) {
      return {
        status: false,
        token: "",
        message: "Envia todos os dados",
      };
    }

    try {
      const data = await fetch(`${server}users/credential`, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          oldpassword,
          password,
        }),
        method: "PUT",
      });
      const res = (await data.json()) as {
        updated: boolean;
        message: string;
      };
      return {
        status: res?.updated,
        message: res?.message,
      };
    } catch (error: any) {
      return {
        status: false,
        message: error?.message ?? error?.error ?? "Envia todos os dados",
      };
    }
  }
  public async resetPassRequest(email: string) {
    try {
      const data = await fetch(`${server}users/recovery`, {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
        method: "POST",
      });
      const res = (await data.json()) as {
        message: string;
      };
      return {
        message: res?.message,
      };
    } catch (error: any) {
      return {
        message: error?.message ?? error?.error ?? "Envia todos os dados",
      };
    }
  }
  public async resetPassword(body: { password: string; token: string }) {
    try {
      const data = await fetch(`${server}users/recovery`, {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        method: "PUT",
      });
      const res = (await data.json()) as {
        message: string;
      };
      console.log(res);
      return {
        message: res?.message,
      };
    } catch (error: any) {
      return {
        message: error?.message ?? error?.error ?? "Envia todos os dados",
      };
    }
  }
}
