/**
 * Evolution API Service
 * Integração com WhatsApp via Evolution API
 */

// Use environment variables with fallback
const DEFAULT_API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'https://apiwp.automacaototal.com';
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || '';

// Types
export interface WhatsAppInstance {
    instanceName: string;
    instance?: { instanceName?: string; state?: string };
    name?: string;
    status: 'close' | 'connecting' | 'open';
    state?: 'close' | 'connecting' | 'open';
    integration: string;
    profileName?: string;
    profilePicUrl?: string;
    ownerJid?: string;
}

export interface WhatsAppConfig {
    apiUrl: string;
    apiKey: string;
    instanceName?: string;
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
        message: string | {
            conversation?: string;
            extendedTextMessage?: { text: string };
            imageMessage?: { url?: string; caption?: string };
            audioMessage?: { url?: string };
            videoMessage?: { url?: string; caption?: string };
            [key: string]: unknown;
        };
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
    private instanceName?: string;

    constructor(config?: WhatsAppConfig) {
        this.baseURL = config?.apiUrl || DEFAULT_API_URL;
        this.apiKey = config?.apiKey || DEFAULT_API_KEY;
        this.instanceName = config?.instanceName;
    }

    setConfig(config: WhatsAppConfig) {
        this.baseURL = config.apiUrl || DEFAULT_API_URL;
        this.apiKey = config.apiKey || DEFAULT_API_KEY;
        this.instanceName = config.instanceName;
    }

    getConfig(): WhatsAppConfig {
        return { apiUrl: this.baseURL, apiKey: this.apiKey, instanceName: this.instanceName };
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

    // Check if instance exists, if not create it first
    async ensureInstanceExists(instanceName: string): Promise<boolean> {
        try {
            const instances = await this.fetchInstances(instanceName);
            const exists = instances.some(i => i.instanceName === instanceName);

            if (!exists) {
                console.log(`Instance "${instanceName}" not found, creating...`);
                await this.createInstance(instanceName);
                return true; // Was created
            }
            return false; // Already existed
        } catch (error) {
            console.error('Error checking instance:', error);
            // Try to create anyway
            try {
                await this.createInstance(instanceName);
                return true;
            } catch {
                return false;
            }
        }
    }

    async connectInstance(instanceName: string): Promise<WhatsAppQRCode> {
        // First ensure the instance exists
        await this.ensureInstanceExists(instanceName);

        const data = await this.request<any>(`/instance/connect/${instanceName}`);

        let base64 = data.base64 || '';
        if (base64 && !base64.startsWith('data:')) {
            base64 = `data:image/png;base64,${base64}`;
        }

        return {
            code: data.code || '',
            base64: base64,
            count: data.count
        };
    }

    async getConnectionState(instanceName: string): Promise<{ instance: { instanceName: string; state: 'close' | 'connecting' | 'open' } }> {
        return this.request(`/instance/connectionState/${instanceName}`);
    }

    async fetchInstances(nameOverride?: string): Promise<WhatsAppInstance[]> {
        const targetName = nameOverride || this.instanceName;
        const query = targetName ? `?instanceName=${targetName}` : '';
        const response = await this.request<any>(`/instance/fetchInstances${query}`);

        // Normalize response to array
        const data = Array.isArray(response) ? response : [response];

        // Map and strictly filter by name if targetName is set
        const instances = data.map((item: any) => {
            let status = item.instance?.state || item.instance?.status || item.status || 'close';

            // Normalização de status
            if (typeof status === 'string') {
                status = status.toLowerCase();
                if (status === 'connected') status = 'open';
            }

            return {
                instanceName: item.instance?.instanceName || item.instanceName || item.name || 'Desconhecida',
                status: status,
                integration: item.integration || 'WHATSAPP-BAILEYS',
                profileName: item.profileName || item.instance?.profileName,
                profilePicUrl: item.profilePicUrl || item.instance?.profilePicUrl,
                ownerJid: item.ownerJid || item.instance?.ownerJid
            };
        }).filter(i => i.instanceName !== 'Desconhecida');

        if (targetName) {
            return instances.filter(i => i.instanceName === targetName);
        }

        // Se não houver filtro, e quisermos ser estritos, poderíamos retornar vazio.
        // Mas para manter a funcionalidade de "escolha", retornamos tudo se nenhum filtro global existir.
        // No entanto, o usuário pediu para NÃO ver as demais, então se tivermos um nome global, mostramos só ele.
        return instances;
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
        // Evolution API v2 uses POST for findChats
        const rawData = await this.request<any[]>(`/chat/findChats/${instanceName}`, {
            method: 'POST',
            body: JSON.stringify({})
        });

        // Map API response to our WhatsAppChat interface
        return rawData.map((chat: any) => ({
            id: chat.remoteJid || chat.id || '',
            name: chat.pushName || chat.name || '',
            unreadCount: chat.unreadCount || 0,
            lastMessage: chat.lastMessage ? {
                message: chat.lastMessage.message,
                // API returns timestamp in seconds, convert to milliseconds for Date
                timestamp: (chat.lastMessage.messageTimestamp || 0) * 1000,
                fromMe: chat.lastMessage.key?.fromMe || false
            } : undefined,
            profilePicUrl: chat.profilePicUrl || chat.profilePictureUrl
        })).filter((chat: WhatsAppChat) => chat.id); // Filter out chats without ID
    }

    async fetchMessages(instanceName: string, remoteJid: string, limit: number = 50): Promise<WhatsAppMessage[]> {
        // Evolution API v2 uses POST for findMessages
        const rawData = await this.request<any>(`/chat/findMessages/${instanceName}`, {
            method: 'POST',
            body: JSON.stringify({
                where: {
                    key: {
                        remoteJid: remoteJid
                    }
                },
                limit: limit
            })
        });

        // API returns nested structure: { messages: { records: [...] } }
        const records = rawData?.messages?.records || rawData?.records || rawData || [];

        // Ensure we have an array
        if (!Array.isArray(records)) {
            console.warn('fetchMessages: unexpected response structure', rawData);
            return [];
        }

        // Map to WhatsAppMessage interface
        return records.map((msg: any) => ({
            key: {
                remoteJid: msg.key?.remoteJid || remoteJid,
                fromMe: msg.key?.fromMe || false,
                id: msg.key?.id || msg.id || ''
            },
            message: msg.message || {},
            messageTimestamp: msg.messageTimestamp || 0,
            status: msg.status,
            pushName: msg.pushName
        }));
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

// Helper to get config from localStorage, merged with env vars
export function loadEvolutionConfig(): WhatsAppConfig | null {
    if (typeof window === 'undefined') return null;

    // Start with environment variables (highest priority for credentials)
    const envConfig: WhatsAppConfig = {
        apiUrl: DEFAULT_API_URL,
        apiKey: DEFAULT_API_KEY,
        instanceName: ''
    };

    // Load localStorage config if available
    const stored = localStorage.getItem('evolution_config');
    if (stored) {
        try {
            const storedConfig = JSON.parse(stored);
            // Merge: use stored instanceName, but prefer env vars for URL/Key if available
            return {
                apiUrl: DEFAULT_API_URL || storedConfig.apiUrl,
                apiKey: DEFAULT_API_KEY || storedConfig.apiKey,
                instanceName: storedConfig.instanceName || ''
            };
        } catch {
            // If parsing fails, return env config
        }
    }

    // Return env config if no localStorage or it's empty
    return envConfig.apiKey ? envConfig : null;
}

// Helper to save config to localStorage
export function saveEvolutionConfig(config: WhatsAppConfig): void {
    if (typeof window === 'undefined') return;
    // Save instanceName to localStorage, but API credentials come from env
    const toSave = {
        apiUrl: config.apiUrl,
        apiKey: config.apiKey,
        instanceName: config.instanceName
    };
    localStorage.setItem('evolution_config', JSON.stringify(toSave));

    // When setting config, ensure env vars are prioritized
    evolutionAPI.setConfig({
        apiUrl: DEFAULT_API_URL || config.apiUrl,
        apiKey: DEFAULT_API_KEY || config.apiKey,
        instanceName: config.instanceName
    });
}

// Initialize from env vars and localStorage on module load
if (typeof window !== 'undefined') {
    const savedConfig = loadEvolutionConfig();
    if (savedConfig) {
        evolutionAPI.setConfig(savedConfig);
    }
}

export default evolutionAPI;

