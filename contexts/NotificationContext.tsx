"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { storage } from "@/lib/storage";

export type NotificationType = "pedido" | "producao" | "estoque" | "financeiro";
export type NotificationPriority = "urgente" | "importante" | "info" | "sucesso";

export interface Notification {
    id: string;
    tipo: NotificationType;
    prioridade: NotificationPriority;
    titulo: string;
    mensagem: string;
    link?: string;
    lida: boolean;
    criadoEm: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, "id" | "lida" | "criadoEm">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotification: (id: string) => void;
    checkAndGenerateNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const STORAGE_KEY = "confeiteiro_notifications";

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within NotificationProvider");
    }
    return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load notifications from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setNotifications(JSON.parse(stored));
            }
        }
    }, []);

    // Save notifications to localStorage
    const saveNotifications = useCallback((notifs: Notification[]) => {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
        }
    }, []);

    const addNotification = useCallback((notif: Omit<Notification, "id" | "lida" | "criadoEm">) => {
        const newNotif: Notification = {
            ...notif,
            id: crypto.randomUUID(),
            lida: false,
            criadoEm: new Date().toISOString(),
        };
        setNotifications((prev) => {
            const updated = [newNotif, ...prev].slice(0, 50); // Keep last 50
            saveNotifications(updated);
            return updated;
        });
    }, [saveNotifications]);

    const markAsRead = useCallback((id: string) => {
        setNotifications((prev) => {
            const updated = prev.map((n) =>
                n.id === id ? { ...n, lida: true } : n
            );
            saveNotifications(updated);
            return updated;
        });
    }, [saveNotifications]);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) => {
            const updated = prev.map((n) => ({ ...n, lida: true }));
            saveNotifications(updated);
            return updated;
        });
    }, [saveNotifications]);

    const clearNotification = useCallback((id: string) => {
        setNotifications((prev) => {
            const updated = prev.filter((n) => n.id !== id);
            saveNotifications(updated);
            return updated;
        });
    }, [saveNotifications]);

    // Check and generate automatic notifications based on system state
    const checkAndGenerateNotifications = useCallback(() => {
        const now = new Date();
        const today = now.toISOString().split("T")[0];

        // Check stock alerts
        const ingredientes = storage.getIngredientes();
        ingredientes.forEach((ing) => {
            if (ing.estoqueAtual <= 0) {
                // Critical - zero stock
                const exists = notifications.some(
                    (n) => n.tipo === "estoque" && n.mensagem.includes(ing.nome) && !n.lida
                );
                if (!exists) {
                    addNotification({
                        tipo: "estoque",
                        prioridade: "urgente",
                        titulo: "Estoque Zerado",
                        mensagem: `${ing.nome} está zerado!`,
                        link: "/estoque",
                    });
                }
            } else if (ing.estoqueAtual <= ing.estoqueMinimo) {
                // Low stock
                const exists = notifications.some(
                    (n) => n.tipo === "estoque" && n.mensagem.includes(ing.nome) && !n.lida
                );
                if (!exists) {
                    addNotification({
                        tipo: "estoque",
                        prioridade: ing.estoqueAtual <= ing.estoqueMinimo * 0.5 ? "urgente" : "importante",
                        titulo: "Estoque Baixo",
                        mensagem: `${ing.nome} em nível ${ing.estoqueAtual <= ing.estoqueMinimo * 0.5 ? "crítico" : "baixo"}`,
                        link: "/estoque",
                    });
                }
            }
        });

        // Check accounts payable
        const contasPagar = storage.getContasPagar();
        contasPagar.forEach((conta) => {
            const vencimento = new Date(conta.dataVencimento);
            const diffDays = Math.ceil((vencimento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (conta.status !== "pago") {
                if (diffDays < 0) {
                    // Overdue
                    const exists = notifications.some(
                        (n) => n.tipo === "financeiro" && n.mensagem.includes(conta.id) && !n.lida
                    );
                    if (!exists) {
                        addNotification({
                            tipo: "financeiro",
                            prioridade: "urgente",
                            titulo: "Conta Vencida",
                            mensagem: `${conta.descricao} - R$ ${conta.saldoRestante.toFixed(2)}`,
                            link: "/financeiro/contas-pagar",
                        });
                    }
                } else if (diffDays === 0) {
                    // Due today
                    const exists = notifications.some(
                        (n) => n.tipo === "financeiro" && n.mensagem.includes(conta.descricao) && !n.lida
                    );
                    if (!exists) {
                        addNotification({
                            tipo: "financeiro",
                            prioridade: "importante",
                            titulo: "Vence Hoje",
                            mensagem: `${conta.descricao} - R$ ${conta.saldoRestante.toFixed(2)}`,
                            link: "/financeiro/contas-pagar",
                        });
                    }
                } else if (diffDays <= 3) {
                    // Due in 3 days
                    const exists = notifications.some(
                        (n) => n.tipo === "financeiro" && n.mensagem.includes(conta.descricao) && !n.lida
                    );
                    if (!exists) {
                        addNotification({
                            tipo: "financeiro",
                            prioridade: "info",
                            titulo: `Vence em ${diffDays} dia${diffDays > 1 ? "s" : ""}`,
                            mensagem: `${conta.descricao} - R$ ${conta.saldoRestante.toFixed(2)}`,
                            link: "/financeiro/contas-pagar",
                        });
                    }
                }
            }
        });

        // Check orders for delivery today
        const pedidos = storage.getPedidos();
        pedidos.forEach((pedido) => {
            if (pedido.dataEntrega === today && pedido.status !== "Entregue" && pedido.status !== "Cancelado") {
                const exists = notifications.some(
                    (n) => n.tipo === "pedido" && n.mensagem.includes(`#${pedido.numero}`) && !n.lida
                );
                if (!exists) {
                    if (pedido.status === "Pronto") {
                        addNotification({
                            tipo: "pedido",
                            prioridade: "info",
                            titulo: "Pedido Pronto",
                            mensagem: `#${pedido.numero} - ${pedido.cliente.nome} pronto para ${pedido.tipo === "Entrega" ? "entrega" : "retirada"}`,
                            link: `/pedidos/${pedido.id}`,
                        });
                    } else if (pedido.status === "Aguardando Produção" || pedido.status === "Em Produção") {
                        addNotification({
                            tipo: "producao",
                            prioridade: "urgente",
                            titulo: "Prazo Apertado",
                            mensagem: `#${pedido.numero} entrega HOJE e ainda não está pronto!`,
                            link: `/pedidos/${pedido.id}`,
                        });
                    }
                }
            }
        });
    }, [addNotification, notifications]);

    // Run check on mount and periodically
    useEffect(() => {
        checkAndGenerateNotifications();
        const interval = setInterval(checkAndGenerateNotifications, 5 * 60 * 1000); // Every 5 minutes
        return () => clearInterval(interval);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const unreadCount = notifications.filter((n) => !n.lida).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                clearNotification,
                checkAndGenerateNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}
