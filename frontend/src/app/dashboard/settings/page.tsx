"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashBoardHeader from "@/components/ui/headerDashboard";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  HelpCircle,
  Image,
  ImageUp,
  Loader2,
  Lock,
  LogOut,
  Save,
  TrendingUpIcon,
  UserCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { FormEvent, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import UserGetter from "@/services/user/get";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import UserCreater from "@/services/user/create";
import { Checkbox } from "@/components/ui/checkbox";
import server from "@/services/server";
import Link from "next/link";
export default function Settings() {
  const [load, setLoad] = useState(true);
  const [reload, setReload] = useState(true);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [credenctials, setCredenciasl] = useState({
    password: "",
    oldpassword: "",
    confirm: "",
  });
  const [savingFile, setSavingFile] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [user, setUser] = useState({
    name: "",
    status: "",
    email: "",
    lastname: "",
    profile: "",
    id: "",
    telefone: "",
    createdAt: "",
  });
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    async function get() {
      if (!token) {
        router.push("/");
        return;
      }
      const service = new UserGetter();
      const data = await service.getMyData(token);

      if (data?.data) {
        setUser(data?.data);
        setLoad(true);
        setTimeout(() => {
          setLoad(false);
        }, 1000);
      } else {
        localStorage.clear();
        router.push("/");
        return;
      }
      return;
    }
    get();
  }, [reload]);

  if (!mounted) return null;

  async function handelOnSubmitProfiles(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let fileURL = user.profile ?? "";

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    if (!user.name || !user.lastname || !user.telefone || !user.email) {
      toast.info("Preenche todos os campos");
      return;
    }
    setSavingFile(true);
    if (file) {
      const fileUploaded = await upload(file);
      if (!fileUploaded.status) {
        setSavingFile(false);
        return;
      }
      fileURL = fileUploaded.url;
    }
    const service = new UserCreater();
    const updated = await service.update(
      {
        file: fileURL,
        ...user,
      },
      token
    );

    console.log(updated);
    toast.info(updated.message);
    if (updated.status) {
      setUser((prev) => ({
        ...prev,
        profile: fileURL,
      }));
    }
    setTimeout(() => {
      setSavingFile(false);
    }, 1000);
  }
  async function handelOnEditCredentials(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    if (
      !credenctials.confirm ||
      !credenctials.oldpassword ||
      !credenctials.password
    ) {
      toast.info("Preenche os dados");
      return;
    } else if (credenctials.confirm != credenctials.password) {
      toast.info("Senhas não combinam");
      return;
    }
    setSavingFile(true);
    const service = new UserCreater();
    const updated = await service.updatePassword(
      {
        oldpassword: credenctials.oldpassword,
        password: credenctials.password,
      },
      token
    );
    toast.info(updated.message);

    setTimeout(() => {
      setSavingFile(false);
    }, 1000);
  }

  const upload = async (file: File) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return {
        status: false,
        url: "",
      };
    }
    const body = {
      productId: "photo",
      type: "file",
    };

    const canUpload = await fetch(`${server}products/canupload`, {
      body: JSON.stringify(body),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
    });

    const can = (await canUpload.json()) as {
      status: boolean;
      message: string;
      key: string;
      server: string;
    };
    if (!can?.status) {
      toast.error(can?.message);
      return {
        status: false,
        url: "",
      };
    }

    const res = await fetch(can.server, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Uploadthing-Api-Key": can.key,
      },
      body: JSON.stringify({
        files: [
          {
            name: file.name,
            size: file.size,
            type: file.type,
            customId: null,
          },
        ],
        acl: "public-read",
        metadata: null,
        contentDisposition: "inline",
      }),
    });
    const data = await res.json();
    const uploadData = data?.data?.[0];
    if (!uploadData?.url || !uploadData?.fields) {
      toast.error("Erro ao gerar link de upload");
      return {
        status: false,
        url: "",
      };
    }
    // agora sobe para o S3 via formulário
    const formData = new FormData();
    Object.entries(uploadData.fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append("file", file);
    const s3Res = await fetch(uploadData.url, {
      method: "POST",
      body: formData,
    });
    if (!s3Res.ok) {
      toast.error("Erro ao enviar para S3");
      return {
        status: false,
        url: "",
      };
    }
    return {
      status: true,
      url: uploadData.fileUrl,
    };
  };

  return (
    <main>
      <DashBoardHeader
        data={{
          isAdmin: false,
          canShowInput: false,
          pageTitle: "",
          inputPlaceHolder: "",
        }}
      />

      <Tabs
        defaultValue="acount"
        className="w-full lg:flex hidden flex-col    lg:flex-row"
      >
        <aside className="lg:w-[20%] w-full p-4 px-2 flex flex-col 2  border-r  lg:h-[90dvh]">
          <div className="grid grid-cols-2 gap-4 w-full my-5">
            <Button
              asChild
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
              }}
              variant={"outline"}
              className="flex justify-center items-center gap-2 w-full"
            >
              <Link href={"/"}>
                <LogOut className="text-red-500" /> Sair
              </Link>
            </Button>

            <Button
              asChild
              variant={"outline"}
              className="flex justify-center items-center gap-2 w-full"
            >
              <Link
                href={
                  "https://api.whatsapp.com/send/?phone=244952775029&text&type=phone_number&app_absent=0"
                }
                target="_blank"
              >
                <HelpCircle /> Suporte
              </Link>
            </Button>
          </div>
          <div className="sticky flex flex-col gap-4 top-20">
            <span className="w-full border-t dark:border-white/10"></span>
            <TabsList className="lg:flex-col lg:flex grid grid-cols-2  gap-2 bg-transparent overflow-visible w-full m-0 h-auto">
              <TabsTrigger
                className="w-full  p-2 lg:justify-start"
                value="acount"
                onClick={() => {
                  setCredenciasl({
                    confirm: "",
                    oldpassword: "",
                    password: "",
                  });
                }}
              >
                <UserCircle />
                Dados pessoais
              </TabsTrigger>
              <TabsTrigger
                className="w-full  p-2 lg:justify-start"
                value="security"
              >
                <Lock />
                Segurança
              </TabsTrigger>
            </TabsList>
          </div>
        </aside>
        <div className="lg:w-[80%] w-full flex  lg:h-[90dvh] lg:overflow-y-hidden">
          <TabsContent value="acount">
            {load ? (
              <div className="h-full w-full flex justify-center items-center">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <aside className="h-full w-full flex flex-col gap-4 p-3">
                <h1 className="text-xl font-semibold">Minha conta</h1>

                <Card className="rounded-sm  p-4 bg-transparent gap-5">
                  <CardTitle>Dados pessoais</CardTitle>
                  <CardDescription>
                    Deixe seus dados pessoais sempre atualizados e disponíveis.
                  </CardDescription>

                  <form
                    onSubmit={handelOnSubmitProfiles}
                    className="flex w-full flex-col gap-5"
                  >
                    <span className="flex gap-2">
                      <Button asChild variant={"outline"}>
                        <span className="relative h-15 w-20 border rounded-sm border-dashed cursor-pointer overflow-hidden">
                          <Input
                            onChange={async (e) => {
                              const file = e.target.files && e.target.files[0];
                              if (file) {
                                const allowedTypes = [
                                  "image/jpeg",
                                  "image/jpg",
                                  "image/png",
                                  "image/gif",
                                ];
                                if (!allowedTypes.includes(file.type)) {
                                  toast.error("Apenas imagem");
                                  return;
                                }
                                const maxSizeInMB = 4;
                                const maxSize = maxSizeInMB * 1024 * 1024;
                                if (file.size > maxSize) {
                                  toast.error("Arquivo muito grande");
                                  return;
                                }
                                setFile(file);
                              }
                            }}
                            className="z-1 opacity-0 h-full absolute w-full "
                            type="file"
                            accept="image/*"
                          />
                          {user.profile && (
                            <img
                              src={user.profile}
                              alt="Perfil"
                              className="h-full w-full rounded-sm object-cover"
                            />
                          )}
                          {!user.profile && <Image />}
                        </span>
                      </Button>
                      <span className="w-[50%]">
                        <p>Foto de perfil</p>
                        <small className="dark:text-muted text-[12px] w-[0px] overflow-hidden text-wrap">
                          JPEG, PNG, GIF ou SVG. Recomendado: 500x500 px
                        </small>
                      </span>
                    </span>
                    {file && (
                      <p className="text-sm  text-green-500">{file.name}</p>
                    )}
                    <CardContent className="p-0 grid lg:grid-cols-2 gap-8">
                      <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          type="text"
                          required
                          placeholder="entre com seu nome"
                          onChange={(e) => {
                            setUser((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }));
                          }}
                          value={user.name ?? ""}
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="lastname">Sobrenome</Label>
                        <Input
                          id="lastname"
                          type="text"
                          required
                          placeholder="entre com seu sobrenome"
                          onChange={(e) => {
                            setUser((prev) => ({
                              ...prev,
                              lastname: e.target.value,
                            }));
                          }}
                          value={user.lastname ?? ""}
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="entre com seu e-mail"
                          onChange={(e) => {
                            setUser((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }));
                          }}
                          value={user.email ?? ""}
                        />
                      </div>

                      <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="tel">Telefone</Label>
                        <Input
                          id="tel"
                          required
                          type="tel"
                          placeholder="entre com seu telefone"
                          onChange={(e) => {
                            setUser((prev) => ({
                              ...prev,
                              telefone: e.target.value,
                            }));
                          }}
                          value={user.telefone ?? ""}
                        />
                      </div>
                    </CardContent>

                    <Button
                      className="bg-green-500 lg:w-[34.6%] w-full text-white hover:bg-green-600"
                      type="submit"
                    >
                      {savingFile ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          <Save />
                          Salvar alterações
                        </>
                      )}
                    </Button>
                  </form>
                </Card>
              </aside>
            )}
          </TabsContent>
          <TabsContent value="security">
            <aside className="h-full w-full flex flex-col gap-4 p-3">
              <h1 className="text-xl font-semibold">Credênciais</h1>
              <Card className="rounded-sm  p-4 bg-transparent gap-5">
                <CardTitle>Dados pessoais</CardTitle>
                <CardDescription>
                  Gerencie a sua cheve de acesso a sua conta da culonga, não
                  compartilhe com ninguém a sua senha
                </CardDescription>

                <form
                  onSubmit={handelOnEditCredentials}
                  action=""
                  className="flex w-full flex-col gap-5"
                >
                  <CardContent className="p-0 grid lg:grid-cols-2 gap-8">
                    <div className="grid w-full max-w-sm items-center gap-3">
                      <Label htmlFor="currentpass">Senha atual</Label>
                      <Input
                        id="currentpass"
                        type={showPassword ? "text" : "password"}
                        placeholder="*******"
                        onPaste={(e) => {
                          e.preventDefault();
                        }}
                        value={credenctials.oldpassword}
                        onChange={(e) => {
                          setCredenciasl((prev) => ({
                            ...prev,
                            oldpassword: e.target.value,
                          }));
                        }}
                        required
                      />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-3">
                      <Label htmlFor="password">Nova senha</Label>
                      <Input
                        id="password"
                        placeholder="*******"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        onPaste={(e) => {
                          e.preventDefault();
                        }}
                        value={credenctials.password}
                        onChange={(e) => {
                          setCredenciasl((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }));
                        }}
                      />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-3">
                      <Label htmlFor="confirmpassword">
                        Confirmar nova senha
                      </Label>
                      <Input
                        id="confirmpassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="*******"
                        minLength={8}
                        onPaste={(e) => {
                          e.preventDefault();
                        }}
                        value={credenctials.confirm}
                        onChange={(e) => {
                          setCredenciasl((prev) => ({
                            ...prev,
                            confirm: e.target.value,
                          }));
                        }}
                        required
                      />
                    </div>
                  </CardContent>

                  <div className="flex items-center gap-1">
                    <Checkbox
                      checked={showPassword}
                      onCheckedChange={() => {
                        setShowPassword((prev) => !prev);
                      }}
                    />
                    Visualizar senhas
                  </div>
                  <Button
                    className="bg-green-500 lg:w-[34.6%] w-full text-white hover:bg-green-600"
                    type="submit"
                  >
                    {savingFile ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Save />
                        Salvar alterações
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </aside>
          </TabsContent>
        </div>
      </Tabs>

      <Tabs
        defaultValue="acount"
        className="w-full  lg:hidden px-4  flex  flex-col"
      >
        <aside className="w-full flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 w-full my-5">
            <Button
              asChild
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
              }}
              variant={"outline"}
              className="flex justify-center items-center gap-2 w-full"
            >
              <Link href={"/"}>
                <LogOut className="text-red-500" /> Sair
              </Link>
            </Button>

            <Button
              asChild
              variant={"outline"}
              className="flex justify-center items-center gap-2 w-full"
            >
              <Link
                href={
                  "https://api.whatsapp.com/send/?phone=244952775029&text&type=phone_number&app_absent=0"
                }
                target="_blank"
              >
                <HelpCircle /> Suporte
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <span className="w-full border-t dark:border-white/10"></span>
            <TabsList className="flex overflow-visible h-auto  flex-wrap gap-4 bg-transparent max-h-[300px]">
              <TabsTrigger
                className="w-full  p-2 lg:justify-start"
                value="acount"
                onClick={() => {
                  setCredenciasl({
                    confirm: "",
                    oldpassword: "",
                    password: "",
                  });
                }}
              >
                <UserCircle />
                Dados pessoais
              </TabsTrigger>
              <TabsTrigger
                className="w-full  p-2 lg:justify-start"
                value="security"
              >
                <Lock />
                Segurança
              </TabsTrigger>
            </TabsList>
          </div>
        </aside>
        <div className="w-full flex">
          <TabsContent value="acount">
            {load ? (
              <div className="h-full w-full flex justify-center items-center">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <aside className="h-full w-full flex flex-col gap-4 p-3">
                <h1 className="text-xl font-semibold">Minha conta</h1>

                <Card className="rounded-sm  p-4 bg-transparent gap-5">
                  <CardTitle>Dados pessoais</CardTitle>
                  <CardDescription>
                    Deixe seus dados pessoais sempre atualizados e disponíveis.
                  </CardDescription>

                  <form
                    onSubmit={handelOnSubmitProfiles}
                    className="flex w-full flex-col gap-5"
                  >
                    <span className="flex gap-2">
                      <Button asChild variant={"outline"}>
                        <span className="relative h-15 w-20 border rounded-sm border-dashed cursor-pointer overflow-hidden">
                          <Input
                            onChange={async (e) => {
                              const file = e.target.files && e.target.files[0];
                              if (file) {
                                const allowedTypes = [
                                  "image/jpeg",
                                  "image/jpg",
                                  "image/png",
                                  "image/gif",
                                ];
                                if (!allowedTypes.includes(file.type)) {
                                  toast.error("Apenas imagem");
                                  return;
                                }
                                const maxSizeInMB = 4;
                                const maxSize = maxSizeInMB * 1024 * 1024;
                                if (file.size > maxSize) {
                                  toast.error("Arquivo muito grande");
                                  return;
                                }
                                setFile(file);
                              }
                            }}
                            className="z-1 opacity-0 h-full absolute w-full "
                            type="file"
                            accept="image/*"
                          />
                          {user.profile && (
                            <img
                              src={user.profile}
                              alt="Perfil"
                              className="h-full w-full rounded-sm object-cover"
                            />
                          )}
                          {!user.profile && <Image />}
                        </span>
                      </Button>
                      <span className="w-[50%]">
                        <p>Foto de perfil</p>
                        <small className="dark:text-muted text-[12px] w-[0px] overflow-hidden text-wrap">
                          JPEG, PNG, GIF ou SVG. Recomendado: 500x500 px
                        </small>
                      </span>
                    </span>
                    {file && (
                      <p className="text-sm  text-green-500">{file.name}</p>
                    )}
                    <CardContent className="p-0 grid lg:grid-cols-2 gap-8">
                      <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          type="text"
                          required
                          placeholder="entre com seu nome"
                          onChange={(e) => {
                            setUser((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }));
                          }}
                          value={user.name ?? ""}
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="lastname">Sobrenome</Label>
                        <Input
                          id="lastname"
                          type="text"
                          required
                          placeholder="entre com seu sobrenome"
                          onChange={(e) => {
                            setUser((prev) => ({
                              ...prev,
                              lastname: e.target.value,
                            }));
                          }}
                          value={user.lastname ?? ""}
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="entre com seu e-mail"
                          onChange={(e) => {
                            setUser((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }));
                          }}
                          value={user.email ?? ""}
                        />
                      </div>

                      <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="tel">Telefone</Label>
                        <Input
                          id="tel"
                          required
                          type="tel"
                          placeholder="entre com seu telefone"
                          onChange={(e) => {
                            setUser((prev) => ({
                              ...prev,
                              telefone: e.target.value,
                            }));
                          }}
                          value={user.telefone ?? ""}
                        />
                      </div>
                    </CardContent>

                    <Button
                      className="bg-green-500 lg:w-[34.6%] w-full text-white hover:bg-green-600"
                      type="submit"
                    >
                      {savingFile ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          <Save />
                          Salvar alterações
                        </>
                      )}
                    </Button>
                  </form>
                </Card>
              </aside>
            )}
          </TabsContent>
          <TabsContent value="security">
            <aside className="h-full w-full flex flex-col gap-4 p-3">
              <h1 className="text-xl font-semibold">Credênciais</h1>
              <Card className="rounded-sm  p-4 bg-transparent gap-5">
                <CardTitle>Dados pessoais</CardTitle>
                <CardDescription>
                  Gerencie a sua cheve de acesso a sua conta da culonga, não
                  compartilhe com ninguém a sua senha
                </CardDescription>

                <form
                  onSubmit={handelOnEditCredentials}
                  action=""
                  className="flex w-full flex-col gap-5"
                >
                  <CardContent className="p-0 grid lg:grid-cols-2 gap-8">
                    <div className="grid w-full max-w-sm items-center gap-3">
                      <Label htmlFor="currentpass">Senha atual</Label>
                      <Input
                        id="currentpass"
                        type={showPassword ? "text" : "password"}
                        placeholder="*******"
                        onPaste={(e) => {
                          e.preventDefault();
                        }}
                        value={credenctials.oldpassword}
                        onChange={(e) => {
                          setCredenciasl((prev) => ({
                            ...prev,
                            oldpassword: e.target.value,
                          }));
                        }}
                        required
                      />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-3">
                      <Label htmlFor="password">Nova senha</Label>
                      <Input
                        id="password"
                        placeholder="*******"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        onPaste={(e) => {
                          e.preventDefault();
                        }}
                        value={credenctials.password}
                        onChange={(e) => {
                          setCredenciasl((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }));
                        }}
                      />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-3">
                      <Label htmlFor="confirmpassword">
                        Confirmar nova senha
                      </Label>
                      <Input
                        id="confirmpassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="*******"
                        minLength={8}
                        onPaste={(e) => {
                          e.preventDefault();
                        }}
                        value={credenctials.confirm}
                        onChange={(e) => {
                          setCredenciasl((prev) => ({
                            ...prev,
                            confirm: e.target.value,
                          }));
                        }}
                        required
                      />
                    </div>
                  </CardContent>

                  <div className="flex items-center gap-1">
                    <Checkbox
                      checked={showPassword}
                      onCheckedChange={() => {
                        setShowPassword((prev) => !prev);
                      }}
                    />
                    Visualizar senhas
                  </div>
                  <Button
                    className="bg-green-500 lg:w-[34.6%] w-full text-white hover:bg-green-600"
                    type="submit"
                  >
                    {savingFile ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Save />
                        Salvar alterações
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </aside>
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}
