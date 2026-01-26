/**
 * Google Gmail Service
 * Integra com a Gmail API do Google para enviar e ler emails
 */

import { GmailMessage, GmailLabel } from "@/types/google.types";

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1";

export class GoogleGmailService {
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(`${GMAIL_API_BASE}${endpoint}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({})) as { error?: { message?: string } };
            throw new Error(
                error.error?.message || `Gmail API error: ${response.status}`
            );
        }

        return response.json();
    }

    /**
     * Lista mensagens
     */
    async listMessages(
        maxResults: number = 50,
        pageToken?: string,
        query?: string,
        labelIds?: string[]
    ): Promise<{
        messages: Array<{ id: string; threadId: string }>;
        nextPageToken?: string;
        resultSizeEstimate?: number;
    }> {
        const params = new URLSearchParams({
            maxResults: maxResults.toString(),
        });

        if (pageToken) params.append("pageToken", pageToken);
        if (query) params.append("q", query);
        if (labelIds) {
            labelIds.forEach((id) => params.append("labelIds", id));
        }

        return this.request(`/users/me/messages?${params.toString()}`);
    }

    /**
     * Obtém uma mensagem completa
     */
    async getMessage(
        messageId: string,
        format: "full" | "minimal" | "raw" | "metadata" = "full"
    ): Promise<GmailMessage> {
        const params = new URLSearchParams({ format });
        return this.request(`/users/me/messages/${messageId}?${params.toString()}`);
    }

    /**
     * Envia um email
     */
    async sendEmail(
        to: string,
        subject: string,
        body: string,
        html: boolean = true
    ): Promise<GmailMessage> {
        const contentType = html ? "text/html" : "text/plain";

        const email = [
            `To: ${to}`,
            `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
            `Content-Type: ${contentType}; charset=utf-8`,
            "",
            body,
        ].join("\r\n");

        // Base64url encode
        const encodedEmail = btoa(unescape(encodeURIComponent(email)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        return this.request("/users/me/messages/send", {
            method: "POST",
            body: JSON.stringify({ raw: encodedEmail }),
        });
    }

    /**
     * Lista labels (pastas)
     */
    async listLabels(): Promise<{ labels: GmailLabel[] }> {
        return this.request("/users/me/labels");
    }

    /**
     * Marca mensagem como lida
     */
    async markAsRead(messageId: string): Promise<GmailMessage> {
        return this.request(`/users/me/messages/${messageId}/modify`, {
            method: "POST",
            body: JSON.stringify({
                removeLabelIds: ["UNREAD"],
            }),
        });
    }

    /**
     * Marca mensagem como não lida
     */
    async markAsUnread(messageId: string): Promise<GmailMessage> {
        return this.request(`/users/me/messages/${messageId}/modify`, {
            method: "POST",
            body: JSON.stringify({
                addLabelIds: ["UNREAD"],
            }),
        });
    }

    /**
     * Move mensagem para lixeira
     */
    async trashMessage(messageId: string): Promise<void> {
        await this.request(`/users/me/messages/${messageId}/trash`, {
            method: "POST",
        });
    }

    /**
     * Extrai o corpo do email de uma mensagem
     */
    static extractBody(message: GmailMessage): string {
        const payload = message.payload;

        if (!payload) return "";

        // Simple message with direct body
        if (payload.body?.data) {
            return atob(payload.body.data.replace(/-/g, "+").replace(/_/g, "/"));
        }

        // Multipart message
        if (payload.parts) {
            // Prefer HTML
            const htmlPart = payload.parts.find((p) => p.mimeType === "text/html");
            if (htmlPart?.body?.data) {
                return atob(htmlPart.body.data.replace(/-/g, "+").replace(/_/g, "/"));
            }

            // Fallback to plain text
            const textPart = payload.parts.find((p) => p.mimeType === "text/plain");
            if (textPart?.body?.data) {
                return atob(textPart.body.data.replace(/-/g, "+").replace(/_/g, "/"));
            }
        }

        return "";
    }

    /**
     * Extrai headers de uma mensagem
     */
    static extractHeaders(
        message: GmailMessage
    ): Record<string, string | undefined> {
        const headers = message.payload?.headers || [];
        return {
            from: headers.find((h) => h.name.toLowerCase() === "from")?.value,
            to: headers.find((h) => h.name.toLowerCase() === "to")?.value,
            subject: headers.find((h) => h.name.toLowerCase() === "subject")?.value,
            date: headers.find((h) => h.name.toLowerCase() === "date")?.value,
        };
    }
}

// Singleton factory
export function createGoogleGmailService(accessToken: string) {
    return new GoogleGmailService(accessToken);
}
