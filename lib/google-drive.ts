/**
 * Google Drive Service
 * Integra com a Drive API do Google para gerenciar arquivos
 */

import { GoogleDriveFile } from "@/types/google.types";

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const UPLOAD_API_BASE = "https://www.googleapis.com/upload/drive/v3";

export class GoogleDriveService {
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        baseUrl: string = DRIVE_API_BASE
    ): Promise<T> {
        const response = await fetch(`${baseUrl}${endpoint}`, {
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
                error.error?.message || `Google Drive API error: ${response.status}`
            );
        }

        return response.json();
    }

    /**
     * Lista arquivos no Drive
     */
    async listFiles(
        pageSize: number = 100,
        pageToken?: string,
        folderId?: string,
        query?: string
    ): Promise<{
        files: GoogleDriveFile[];
        nextPageToken?: string;
    }> {
        let q = "trashed=false";

        if (folderId) {
            q += ` and '${folderId}' in parents`;
        }

        if (query) {
            q += ` and ${query}`;
        }

        const params = new URLSearchParams({
            pageSize: pageSize.toString(),
            q,
            fields: "nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,iconLink,parents)",
            orderBy: "modifiedTime desc",
        });

        if (pageToken) {
            params.append("pageToken", pageToken);
        }

        return this.request(`/files?${params.toString()}`);
    }

    /**
     * Obtém metadados de um arquivo
     */
    async getFile(fileId: string): Promise<GoogleDriveFile> {
        const params = new URLSearchParams({
            fields: "*",
        });

        return this.request(`/files/${fileId}?${params.toString()}`);
    }

    /**
     * Cria uma pasta no Drive
     */
    async createFolder(
        name: string,
        parentId?: string
    ): Promise<GoogleDriveFile> {
        const body: any = {
            name,
            mimeType: "application/vnd.google-apps.folder",
        };

        if (parentId) {
            body.parents = [parentId];
        }

        return this.request("/files", {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    /**
     * Upload de arquivo para o Drive
     * Usa multipart upload para arquivos pequenos
     */
    async uploadFile(
        file: File | Blob,
        fileName: string,
        mimeType: string,
        folderId?: string
    ): Promise<GoogleDriveFile> {
        const metadata: any = {
            name: fileName,
            mimeType,
        };

        if (folderId) {
            metadata.parents = [folderId];
        }

        // Create multipart body
        const boundary = "confeiteiro_boundary_" + Date.now();
        const delimiter = "\r\n--" + boundary + "\r\n";
        const closeDelimiter = "\r\n--" + boundary + "--";

        const fileContent = await file.arrayBuffer();
        const base64Data = btoa(
            new Uint8Array(fileContent).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ""
            )
        );

        const multipartBody =
            delimiter +
            "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
            JSON.stringify(metadata) +
            delimiter +
            `Content-Type: ${mimeType}\r\n` +
            "Content-Transfer-Encoding: base64\r\n\r\n" +
            base64Data +
            closeDelimiter;

        const response = await fetch(
            `${UPLOAD_API_BASE}/files?uploadType=multipart`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": `multipart/related; boundary="${boundary}"`,
                },
                body: multipartBody,
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({})) as { error?: { message?: string } };
            throw new Error(error.error?.message || "Upload failed");
        }

        return response.json();
    }

    /**
     * Deleta um arquivo (move para lixeira)
     */
    async deleteFile(fileId: string): Promise<void> {
        await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            },
        });
    }

    /**
     * Obtém link para download direto
     */
    getDownloadUrl(fileId: string): string {
        return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    }
}

// Singleton factory
export function createGoogleDriveService(accessToken: string) {
    return new GoogleDriveService(accessToken);
}
