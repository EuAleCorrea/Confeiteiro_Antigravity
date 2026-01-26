/// <reference types="@cloudflare/workers-types" />

// Declaração global do tipo PagesFunction
declare global {
    type PagesFunction<Env = unknown> = (context: {
        request: Request;
        env: Env;
        params: Record<string, string>;
        waitUntil: (promise: Promise<unknown>) => void;
        passThroughOnException: () => void;
        next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
        data: Record<string, unknown>;
    }) => Promise<Response> | Response;
}

export { };
