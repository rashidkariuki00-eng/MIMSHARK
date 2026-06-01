// TypeScript definitions for Cloudflare Pages Functions

interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  ENVIRONMENT?: string;
  SHOP_NAME?: string;
  ADMIN_WHATSAPP?: string;
}

declare type PagesFunction<E = Env> = (context: EventContext<E, string, Record<string, unknown>>) => Response | Promise<Response>;

interface EventContext<Env, P extends string, Data> {
  request: Request;
  env: Env;
  params: Record<P, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Data;
}
