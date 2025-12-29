/**
 * Google Integration Types
 */

// Session with Google access token
export interface GoogleSession {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
}

// Google Contact
export interface GoogleContact {
    resourceName: string;
    etag?: string;
    names?: Array<{
        displayName?: string;
        familyName?: string;
        givenName?: string;
    }>;
    emailAddresses?: Array<{
        value?: string;
        type?: string;
    }>;
    phoneNumbers?: Array<{
        value?: string;
        type?: string;
    }>;
    photos?: Array<{
        url?: string;
    }>;
    addresses?: Array<{
        streetAddress?: string;
        city?: string;
        region?: string;
        postalCode?: string;
        country?: string;
        type?: string;
    }>;
    organizations?: Array<{
        name?: string;
        title?: string;
    }>;
}

// Google Drive File
export interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    createdTime?: string;
    modifiedTime?: string;
    webViewLink?: string;
    webContentLink?: string;
    thumbnailLink?: string;
    iconLink?: string;
    parents?: string[];
}

// Gmail Message
export interface GmailMessage {
    id: string;
    threadId: string;
    labelIds?: string[];
    snippet?: string;
    payload?: {
        headers?: Array<{
            name: string;
            value: string;
        }>;
        body?: {
            size: number;
            data?: string;
        };
        parts?: Array<{
            mimeType: string;
            body?: {
                data?: string;
            };
        }>;
    };
    internalDate?: string;
}

// Gmail Label
export interface GmailLabel {
    id: string;
    name: string;
    type: 'system' | 'user';
}
