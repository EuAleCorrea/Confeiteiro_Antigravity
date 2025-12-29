import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Define all Google scopes needed
const GOOGLE_SCOPES = [
    "openid",
    "email",
    "profile",
    // Gmail
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    // Drive
    "https://www.googleapis.com/auth/drive.file",
    // Contacts
    "https://www.googleapis.com/auth/contacts.readonly",
    "https://www.googleapis.com/auth/contacts",
].join(" ");

async function refreshAccessToken(token: any) {
    try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: GOOGLE_SCOPES,
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Initial sign in
            if (account) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    expiresAt: account.expires_at,
                };
            }

            // Return previous token if not expired
            if (Date.now() < (token.expiresAt as number) * 1000) {
                return token;
            }

            // Token expired, refresh it
            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            // Pass the access token to the client
            (session as any).accessToken = token.accessToken;
            (session as any).error = token.error;
            return session;
        },
    },
    pages: {
        signIn: "/configuracoes?tab=Google",
        error: "/configuracoes?tab=Google&error=auth",
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
