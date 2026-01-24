"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, Check, AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, Notification, NotificationPriority } from "@/contexts/NotificationContext";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const priorityConfig: Record<NotificationPriority, { icon: typeof AlertCircle; color: string; bg: string }> = {
    urgente: { icon: AlertCircle, color: "text-error", bg: "bg-error/10" },
    importante: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
    info: { icon: Info, color: "text-info", bg: "bg-info/10" },
    sucesso: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
};

export function NotificationPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-text-secondary hover:bg-neutral-100 transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold text-white bg-error rounded-full px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-neutral-50">
                        <h3 className="font-semibold text-text-primary">Notificações</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                                <Check size={14} />
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>

                    {/* Notifications list */}
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-text-secondary">
                                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Nenhuma notificação</p>
                            </div>
                        ) : (
                            notifications.slice(0, 20).map((notif) => (
                                <NotificationItem
                                    key={notif.id}
                                    notification={notif}
                                    onRead={() => markAsRead(notif.id)}
                                    onClear={() => clearNotification(notif.id)}
                                    onClose={() => setIsOpen(false)}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-border bg-neutral-50 text-center">
                            <Link
                                href="/dashboard/configuracoes?tab=notificacoes"
                                className="text-xs text-text-secondary hover:text-primary"
                                onClick={() => setIsOpen(false)}
                            >
                                Configurações de notificações
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function NotificationItem({
    notification,
    onRead,
    onClear,
    onClose,
}: {
    notification: Notification;
    onRead: () => void;
    onClear: () => void;
    onClose: () => void;
}) {
    const config = priorityConfig[notification.prioridade];
    const Icon = config.icon;

    const handleClick = () => {
        if (!notification.lida) {
            onRead();
        }
        if (notification.link) {
            onClose();
        }
    };

    const content = (
        <div
            className={cn(
                "flex gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer",
                !notification.lida && "bg-primary/5"
            )}
            onClick={handleClick}
        >
            <div className={cn("shrink-0 p-2 rounded-lg", config.bg)}>
                <Icon size={16} className={config.color} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                        "text-sm text-text-primary",
                        !notification.lida && "font-semibold"
                    )}>
                        {notification.titulo}
                    </p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClear();
                        }}
                        className="shrink-0 text-text-secondary hover:text-error transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
                <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {notification.mensagem}
                </p>
                <p className="text-xs text-text-secondary/60 mt-1">
                    {formatDistanceToNow(new Date(notification.criadoEm), {
                        addSuffix: true,
                        locale: ptBR,
                    })}
                </p>
            </div>
            {!notification.lida && (
                <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
            )}
        </div>
    );

    if (notification.link) {
        return <Link href={notification.link}>{content}</Link>;
    }

    return content;
}

