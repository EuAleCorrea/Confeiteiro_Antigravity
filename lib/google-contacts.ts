/**
 * Google Contacts Service
 * Integra com a People API do Google para gerenciar contatos
 */

import { GoogleContact } from "@/types/google.types";

const PEOPLE_API_BASE = "https://people.googleapis.com/v1";

export class GoogleContactsService {
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(`${PEOPLE_API_BASE}${endpoint}`, {
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
                error.error?.message || `Google API error: ${response.status}`
            );
        }

        return response.json();
    }

    /**
     * Lista os contatos do usuário
     */
    async listContacts(
        pageSize: number = 100,
        pageToken?: string
    ): Promise<{
        connections: GoogleContact[];
        nextPageToken?: string;
        totalPeople?: number;
    }> {
        const params = new URLSearchParams({
            pageSize: pageSize.toString(),
            personFields: "names,emailAddresses,phoneNumbers,photos,organizations,addresses",
            sortOrder: "FIRST_NAME_ASCENDING",
        });

        if (pageToken) {
            params.append("pageToken", pageToken);
        }

        return this.request(`/people/me/connections?${params.toString()}`);
    }

    /**
     * Busca contatos por nome ou email
     */
    async searchContacts(
        query: string,
        pageSize: number = 30
    ): Promise<{ results: Array<{ person: GoogleContact }> }> {
        // Warmup request (required by Google API)
        await this.request(
            `/people:searchContacts?query=&readMask=names,emailAddresses,phoneNumbers`
        );

        const params = new URLSearchParams({
            query,
            pageSize: pageSize.toString(),
            readMask: "names,emailAddresses,phoneNumbers,photos",
        });

        return this.request(`/people:searchContacts?${params.toString()}`);
    }

    /**
     * Obtém um contato específico
     */
    async getContact(resourceName: string): Promise<GoogleContact> {
        const params = new URLSearchParams({
            personFields: "names,emailAddresses,phoneNumbers,photos,organizations,addresses",
        });

        return this.request(`/${resourceName}?${params.toString()}`);
    }

    /**
     * Cria um novo contato
     */
    async createContact(contact: {
        givenName?: string;
        familyName?: string;
        email?: string;
        phone?: string;
    }): Promise<GoogleContact> {
        const body: any = {
            names: [],
            emailAddresses: [],
            phoneNumbers: [],
        };

        if (contact.givenName || contact.familyName) {
            body.names.push({
                givenName: contact.givenName,
                familyName: contact.familyName,
            });
        }

        if (contact.email) {
            body.emailAddresses.push({
                value: contact.email,
                type: "work",
            });
        }

        if (contact.phone) {
            body.phoneNumbers.push({
                value: contact.phone,
                type: "mobile",
            });
        }

        return this.request("/people:createContact", {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    /**
     * Deleta um contato
     */
    async deleteContact(resourceName: string): Promise<void> {
        await this.request(`/${resourceName}:deleteContact`, {
            method: "DELETE",
        });
    }
}

// Singleton factory
export function createGoogleContactsService(accessToken: string) {
    return new GoogleContactsService(accessToken);
}
