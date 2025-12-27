"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Send,
    Search,
    Loader2,
    MessageCircle,
    User,
    Phone,
    MoreVertical,
    Check,
    CheckCheck,
    Image as ImageIcon,
    Mic,
    Paperclip,
    RefreshCw,
    WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import evolutionAPI, { WhatsAppChat, WhatsAppMessage } from "@/lib/evolution-api";
import { storage } from "@/lib/storage";

// Helper to format phone number
function formatPhoneNumber(jid: string): string {
    const number = jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
    if (number.startsWith('55') && number.length === 13) {
        return `+55 (${number.slice(2, 4)}) ${number.slice(4, 9)}-${number.slice(9)}`;
    }
    return number;
}

// Helper to format timestamp
function formatTime(timestamp: string | number): string {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp: string | number): string {
    const date = new Date(Number(timestamp) * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// Get message text from different message types
function getMessageText(message: WhatsAppMessage['message']): string {
    if (message.conversation) return message.conversation;
    if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
    if (message.imageMessage) return '📷 Imagem';
    if (message.audioMessage) return '🎤 Áudio';
    if (message.videoMessage) return '🎬 Vídeo';
    return '';
}

// Check if message has media
function hasMedia(message: WhatsAppMessage['message']): 'image' | 'audio' | 'video' | null {
    if (message.imageMessage) return 'image';
    if (message.audioMessage) return 'audio';
    if (message.videoMessage) return 'video';
    return null;
}

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const instanceName = params.instanceName as string;

    const [chats, setChats] = useState<WhatsAppChat[]>([]);
    const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
    const [selectedChat, setSelectedChat] = useState<WhatsAppChat | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageText, setMessageText] = useState('');
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [connectionError, setConnectionError] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chats
    const loadChats = useCallback(async () => {
        try {
            setConnectionError(false);
            const data = await evolutionAPI.fetchChats(instanceName);
            // Sort by last message timestamp
            const sorted = data.sort((a, b) =>
                (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)
            );
            setChats(sorted);
        } catch (error: any) {
            console.error('Erro ao carregar chats:', error);
            if (error.status === 404 || error.status === 401) {
                setConnectionError(true);
            }
        } finally {
            setLoadingChats(false);
        }
    }, [instanceName]);

    // Load messages for selected chat
    const loadMessages = useCallback(async (chat: WhatsAppChat) => {
        setLoadingMessages(true);
        try {
            const data = await evolutionAPI.fetchMessages(instanceName, chat.id, 100);
            // Sort by timestamp (oldest first)
            const sorted = data.sort((a, b) =>
                Number(a.messageTimestamp) - Number(b.messageTimestamp)
            );
            setMessages(sorted);
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        } finally {
            setLoadingMessages(false);
        }
    }, [instanceName]);

    // Initial load
    useEffect(() => {
        loadChats();
    }, [loadChats]);

    // Polling for chats every 5 seconds
    useEffect(() => {
        const interval = setInterval(loadChats, 5000);
        return () => clearInterval(interval);
    }, [loadChats]);

    // Polling for messages every 3 seconds when chat is selected
    useEffect(() => {
        if (selectedChat) {
            const interval = setInterval(() => loadMessages(selectedChat), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedChat, loadMessages]);

    // Select chat
    const handleSelectChat = (chat: WhatsAppChat) => {
        setSelectedChat(chat);
        loadMessages(chat);
        inputRef.current?.focus();
    };

    // Send message
    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedChat || sending) return;

        const text = messageText.trim();
        setMessageText('');
        setSending(true);

        try {
            const number = selectedChat.id.replace('@s.whatsapp.net', '').replace('@g.us', '');
            await evolutionAPI.sendTextMessage(instanceName, number, text);

            // Add optimistic message
            const optimisticMessage: WhatsAppMessage = {
                key: {
                    remoteJid: selectedChat.id,
                    fromMe: true,
                    id: crypto.randomUUID()
                },
                message: { conversation: text },
                messageTimestamp: Math.floor(Date.now() / 1000).toString(),
                status: 'PENDING'
            };
            setMessages(prev => [...prev, optimisticMessage]);

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setMessageText(text); // Restore text on error
        } finally {
            setSending(false);
        }
    };

    // Handle Enter key
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Filter chats by search
    const filteredChats = chats.filter(chat =>
        chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.id.includes(searchQuery)
    );

    // Find linked client
    const findLinkedClient = (phone: string) => {
        const clients = storage.getClientes();
        const cleanPhone = phone.replace(/\D/g, '');
        return clients.find(c => c.telefone.replace(/\D/g, '').includes(cleanPhone.slice(-8)));
    };

    // Connection error screen
    if (connectionError) {
        return (
            <div className="h-[calc(100vh-120px)] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <WifiOff size={64} className="text-error mx-auto" />
                    <h2 className="text-xl font-bold text-text-primary">Conexão perdida</h2>
                    <p className="text-text-secondary">O WhatsApp foi desconectado</p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/whatsapp">
                            <Button variant="outline">Voltar</Button>
                        </Link>
                        <Link href={`/whatsapp/${instanceName}/connect`}>
                            <Button>Reconectar</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b">
                <Link href="/whatsapp">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="font-bold text-text-primary">{instanceName}</h1>
                    <p className="text-xs text-success flex items-center gap-1">
                        <span className="w-2 h-2 bg-success rounded-full"></span>
                        Conectado
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={loadChats}>
                    <RefreshCw size={18} />
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden mt-4 rounded-xl border bg-white">
                {/* Sidebar - Chat List */}
                <div className="w-80 border-r flex flex-col bg-neutral-50">
                    {/* Search */}
                    <div className="p-3 border-b bg-white">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar conversa..."
                                className="pl-9 bg-neutral-100"
                            />
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto">
                        {loadingChats ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-primary" size={24} />
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="text-center py-12 text-text-secondary">
                                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Nenhuma conversa</p>
                            </div>
                        ) : (
                            filteredChats.map((chat) => {
                                const linkedClient = findLinkedClient(chat.id);

                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => handleSelectChat(chat)}
                                        className={cn(
                                            "w-full p-3 flex items-start gap-3 hover:bg-neutral-100 transition-colors text-left border-b border-neutral-100",
                                            selectedChat?.id === chat.id && "bg-primary/5 hover:bg-primary/10"
                                        )}
                                    >
                                        {/* Avatar */}
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                                            {chat.name?.charAt(0).toUpperCase() || '?'}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium text-text-primary truncate">
                                                    {chat.name || formatPhoneNumber(chat.id)}
                                                </span>
                                                {chat.lastMessage && (
                                                    <span className="text-xs text-text-secondary ml-2 shrink-0">
                                                        {formatDate(chat.lastMessage.timestamp)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center mt-0.5">
                                                <p className="text-sm text-text-secondary truncate pr-2">
                                                    {chat.lastMessage?.fromMe && (
                                                        <CheckCheck size={14} className="inline mr-1 text-blue-500" />
                                                    )}
                                                    {chat.lastMessage?.message || 'Sem mensagens'}
                                                </p>
                                                {chat.unreadCount > 0 && (
                                                    <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            {linkedClient && (
                                                <span className="text-xs text-primary font-medium">
                                                    👤 {linkedClient.nome}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-3 border-b bg-neutral-50 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {selectedChat.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-text-primary">
                                        {selectedChat.name || formatPhoneNumber(selectedChat.id)}
                                    </h3>
                                    <p className="text-xs text-text-secondary">
                                        {formatPhoneNumber(selectedChat.id)}
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon">
                                    <Phone size={18} />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical size={18} />
                                </Button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 bg-[#e5ddd5] bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3Oeli0AAABra2ueli4AAAD///+eli36+vry8vLq6uri4uLa2trS0tLKysq6urqysrKqqqqdnZ2RVx7qAAAADnRSTlP///////////////8A////VafIkAAAAqFJREFUSMftlYuSgjAMRQOtPERABd//Q7dJW+jKuuPO7Li73XGnhZzcJElhNvtfXMsLY2wlCddLx+Lb+J7TM/eFjpn3Qv7sDxzXN/t9/sN7E8wfOq/r'));"] space-y-2">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-text-secondary">
                                    <p>Nenhuma mensagem</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const text = getMessageText(msg.message);
                                    const mediaType = hasMedia(msg.message);

                                    return (
                                        <div
                                            key={msg.key.id || idx}
                                            className={cn(
                                                "flex",
                                                msg.key.fromMe ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[70%] rounded-lg px-3 py-2 shadow-sm",
                                                    msg.key.fromMe
                                                        ? "bg-[#dcf8c6] rounded-tr-none"
                                                        : "bg-white rounded-tl-none"
                                                )}
                                            >
                                                {/* Media Preview */}
                                                {mediaType === 'image' && msg.message.imageMessage?.url && (
                                                    <img
                                                        src={msg.message.imageMessage.url}
                                                        alt="Imagem"
                                                        className="max-w-full rounded mb-1"
                                                    />
                                                )}

                                                {/* Text */}
                                                <p className="text-sm text-text-primary whitespace-pre-wrap break-words">
                                                    {text}
                                                </p>

                                                {/* Time & Status */}
                                                <div className="flex items-center justify-end gap-1 mt-1">
                                                    <span className="text-[10px] text-text-secondary">
                                                        {formatTime(msg.messageTimestamp)}
                                                    </span>
                                                    {msg.key.fromMe && (
                                                        <CheckCheck size={14} className={cn(
                                                            msg.status === 'READ' ? 'text-blue-500' : 'text-text-secondary'
                                                        )} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                    {/* Input Area */}
                    <div className="p-3 bg-neutral-100 border-t flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-text-secondary">
                            <Paperclip size={20} />
                        </Button>
                        <Input
                            ref={inputRef}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Digite uma mensagem..."
                            className="flex-1 bg-white"
                            disabled={sending}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!messageText.trim() || sending}
                            size="icon"
                            className="bg-green-500 hover:bg-green-600"
                        >
                            {sending ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                        </Button>
                    </div>
                </>
                ) : (
                /* No Chat Selected */
                <div className="flex-1 flex items-center justify-center bg-neutral-50">
                    <div className="text-center text-text-secondary">
                        <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
                        <h3 className="font-medium text-text-primary mb-1">WhatsApp Web</h3>
                        <p className="text-sm">Selecione uma conversa para começar</p>
                    </div>
                </div>
                    )}
            </div>
        </div>
        </div >
    );
}
