"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Link as LinkIcon, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Notification from "@/types/notification";
import DashBoardHeader from "@/components/ui/headerDashboard";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Novo Pedido Recebido",
      message: "Você acabou de receber um novo pedido em sua loja.",
      timestemp: new Date(),
      read: false,
      deepLink: "/orders/123",
    },
    {
      id: 2,
      title: "Pagamento Confirmado",
      message: "O pagamento do pedido #123 foi confirmado.",
      timestemp: new Date(Date.now() - 1000 * 60 * 60),
      read: true,
    },
    {
      id: 3,
      title: "Nova Mensagem",
      message: "Você recebeu uma nova mensagem de um cliente.",
      timestemp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      deepLink: "/chat",
    },
  ]);

  const markAsRead = (id: number | string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <main className="flex flex-col gap-4">
      <DashBoardHeader
        data={{
          isAdmin: false,
          canShowInput: false,
          pageTitle: "",
          inputPlaceHolder: "",
        }}
      />
      <Card className="px-4 place-self-center w-[98%] bg-transparent rounded-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
          <Badge variant="outline">
            {notifications.filter((n) => !n.read).length} não lidas
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border flex items-start justify-between transition ${
                notification.read ? "bg-gray-50/10" : ""
              }`}
            >
              <div className="space-y-1">
                <h4 className="font-medium flex items-center gap-2">
                  {notification.title}
                  {!notification.read && (
                    <Badge className="bg-blue-500 text-white">Novo</Badge>
                  )}
                </h4>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {notification.timestemp.toLocaleString()}
                </div>
                {notification.deepLink && (
                  <a
                    href={notification.deepLink}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <LinkIcon className="w-3 h-3" /> Detalhes
                  </a>
                )}
              </div>

              {!notification.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markAsRead(notification.id)}
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
