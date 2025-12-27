/**
 * Evolution API Service
 * Integração com WhatsApp via Evolution API
 */

const DEFAULT_API_URL = 'https://apiwp.automacaototal.com';

// Types
export interface WhatsAppInstance {
    instanceName: string;
    status: 'close' | 'connecting' | 'open';
    integration: string;
    profileName?: string;
    profilePicUrl?: string;
    ownerJid?: string;
}

export interface WhatsAppConfig {
    apiUrl: string;
    apiKey: string;
}

export interface WhatsAppQRCode {
    code: string;
    base64: string;
    count?: number;
}

export interface WhatsAppChat {
    id: string;
    name: string;
    unreadCount: number;
    lastMessage?: {
        message: string;
        timestamp: number;
        fromMe: boolean;
    };
    profilePicUrl?: string;
}

export interface WhatsAppMessage {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
    };
    message: {
        conversation?: string;
        extendedTextMessage?: {
            text: string;
        };
        imageMessage?: {
            url: string;
            caption?: string;
            mimetype: string;
        };
        audioMessage?: {
            url: string;
            mimetype: string;
        };
        videoMessage?: {
            url: string;
            caption?: string;
            mimetype: string;
        };
    };
    messageTimestamp: string | number;
    status?: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ';
    pushName?: string;
}

export interface SendMessageResponse {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
    };
    message: object;
    messageTimestamp: string;
    status: string;
}

// API Errors
export class EvolutionAPIError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'EvolutionAPIError';
        this.status = status;
    }
}

// Service Class
class EvolutionAPIService {
    private baseURL: string;
    private apiKey: string;

    constructor(config?: WhatsAppConfig) {
        this.baseURL = config?.apiUrl || DEFAULT_API_URL;
        this.apiKey = config?.apiKey || '';
    }

    setConfig(config: WhatsAppConfig) {
        this.baseURL = config.apiUrl || DEFAULT_API_URL;
        this.apiKey = config.apiKey;
    }

    getConfig(): WhatsAppConfig {
        return { apiUrl: this.baseURL, apiKey: this.apiKey };
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        if (!this.apiKey) {
            throw new EvolutionAPIError('API Key não configurada', 401);
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.apiKey,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new EvolutionAPIError(
                `Erro na API: ${response.status} - ${errorText}`,
                response.status
            );
        }

        return response.json();
    }

    // Instance Management
    async createInstance(instanceName: string): Promise<{ instance: WhatsAppInstance; qrcode?: WhatsAppQRCode }> {
        return this.request('/instance/create', {
            method: 'POST',
            body: JSON.stringify({
                instanceName,
                token: crypto.randomUUID(),
                qrcode: true,
                integration: 'WHATSAPP-BAILEYS'
            }),
        });
    }

    async connectInstance(instanceName: string): Promise<WhatsAppQRCode> {
        return this.request(`/instance/connect/${instanceName}`);
    }

    async getConnectionState(instanceName: string): Promise<{ instance: { instanceName: string; state: 'close' | 'connecting' | 'open' } }> {
        return this.request(`/instance/connectionState/${instanceName}`);
    }

    async fetchInstances(instanceName?: string): Promise<WhatsAppInstance[]> {
        const query = instanceName ? `?instanceName=${instanceName}` : '';
        return this.request(`/instance/fetchInstances${query}`);
    }

    async deleteInstance(instanceName: string): Promise<void> {
        return this.request(`/instance/delete/${instanceName}`, {
            method: 'DELETE',
        });
    }

    async logoutInstance(instanceName: string): Promise<void> {
        return this.request(`/instance/logout/${instanceName}`, {
            method: 'DELETE',
        });
    }

    // Messages
    async sendTextMessage(instanceName: string, number: string, text: string): Promise<SendMessageResponse> {
        // Remove non-digits from number
        const cleanNumber = number.replace(/\D/g, '');

        return this.request(`/message/sendText/${instanceName}`, {
            method: 'POST',
            body: JSON.stringify({
                number: cleanNumber,
                options: {
                    delay: 1200,
                    presence: 'composing'
                },
                textMessage: { text }
            }),
        });
    }

    async sendMediaMessage(
        instanceName: string,
        number: string,
        mediaUrl: string,
        caption: string,
        mediaType: 'image' | 'video' | 'audio'
    ): Promise<SendMessageResponse> {
        const cleanNumber = number.replace(/\D/g, '');

        return this.request(`/message/sendMedia/${instanceName}`, {
            method: 'POST',
            body: JSON.stringify({
                number: cleanNumber,
                options: {
                    delay: 1200,
                    presence: 'composing'
                },
                mediaMessage: {
                    mediatype: mediaType,
                    caption,
                    media: mediaUrl
                }
            }),
        });
    }

    // Chats
    async fetchChats(instanceName: string): Promise<WhatsAppChat[]> {
        return this.request(`/chat/fetchAllChats/${instanceName}`);
    }

    async fetchMessages(instanceName: string, remoteJid: string, limit: number = 50): Promise<WhatsAppMessage[]> {
        return this.request(`/chat/fetchMessages/${instanceName}?remoteJid=${encodeURIComponent(remoteJid)}&limit=${limit}`);
    }

    // Test connection
    async testConnection(): Promise<boolean> {
        try {
            await this.fetchInstances();
            return true;
        } catch {
            return false;
        }
    }
}

// Singleton instance
export const evolutionAPI = new EvolutionAPIService();

// Helper to get config from localStorage
export function loadEvolutionConfig(): WhatsAppConfig | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem('evolution_config');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }
    return null;
}

// Helper to save config to localStorage
export function saveEvolutionConfig(config: WhatsAppConfig): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('evolution_config', JSON.stringify(config));
    evolutionAPI.setConfig(config);
}

// Initialize from localStorage on module load
if (typeof window !== 'undefined') {
    const savedConfig = loadEvolutionConfig();
    if (savedConfig) {
        evolutionAPI.setConfig(savedConfig);
    }
}

export default evolutionAPI;
