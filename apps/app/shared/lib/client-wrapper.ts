import { clientInstance } from "@/shared/api/client"
import { logger } from "./log";
import { Options } from "ky";

type FetchContext = {
  path: string;
  options?: Options;
};

type FetchPipe = (ctx: FetchContext) => FetchContext;

type ClientFetch = {
  <T = unknown>(path: string, options?: Options): ApiPipeline<T>;
  get<T = unknown>(path: string, options?: Options): ApiPipeline<T>;
  post<T = unknown>(path: string, options?: Options): ApiPipeline<T>;
  put<T = unknown>(path: string, options?: Options): ApiPipeline<T>;
  patch<T = unknown>(path: string, options?: Options): ApiPipeline<T>;
  delete<T = unknown>(path: string, options?: Options): ApiPipeline<T>;
};

function isErrorRes(v: unknown): v is { error: string } {
  return (
    v !== null && typeof v === 'object' && 'error' in v && typeof (v as any).error === 'string'
  );
}

export async function parseWrappedJson<T>(res: Response): Promise<T> {
  const json = (await res.json()) as unknown;

  if (isErrorRes(json)) {
    throw new Error(json.error);
  }

  if (!('data' in (json as any))) {
    throw new Error('Malformed response');
  }

  return (json as any).data;
}

class ApiPipeline<T> {
  constructor(
    private readonly path: string,
    private readonly pipes: FetchPipe[] = [],
    private readonly kyOptions?: Options
  ) { }

  pipe(...fns: FetchPipe[]): ApiPipeline<T> {
    return new ApiPipeline(this.path, [...this.pipes, ...fns], this.kyOptions);
  }

  async exec(): Promise<T> {
    const ctx = this.pipes.reduce(
      (acc, fn) => fn(acc),
      { path: this.path, options: this.kyOptions } as FetchContext
    );

    const res = await clientInstance(ctx.path, { ...ctx.options, });

    return parseWrappedJson<T>(res);
  }
}

function createClient<T = unknown>(path: string, options?: Options) {
  return new ApiPipeline<T>(path, [], options);
}

export const client: ClientFetch = createClient as ClientFetch;

["get", "post", "put", "patch", "delete"].forEach((method) => {
  (client as any)[method] = (path: string, options?: Options) =>
    new ApiPipeline(path, [], { ...options, method: method.toUpperCase() });
});

// 
export function withLogging(fn?: (msg: string) => void): FetchPipe {
  return ({ path, options }) => {
    const msg = `${options?.method ?? "GET"} ${'/' + path}`;
    
    if (fn) {
      fn(msg)
    } else {
      logger.withTag("Request").debug(msg);
    }

    return { options, path };
  };
}

export const withAbort = (signal?: AbortSignal | null): FetchPipe => ({ options, path }) => ({
  path,
  options: { ...options, signal }
})

export const withHeaders = (headers: HeadersInit): FetchPipe => ({ options, path }) => ({
  path,
  options: { ...options, headers: { ...options?.headers, ...headers } },
});

export const withJsonBody = (body: unknown): FetchPipe => ({ options, path }) => ({
  path,
  options: { ...options, json: body, headers: { ...options?.headers, "Content-Type": "application/json" } },
});

export const withQueryParams = (params: Record<string, string | number | boolean | undefined>): FetchPipe => ({ options, path }) => {
  if (!params || Object.keys(params).length === 0) return { options, path };

  const [base, query = ""] = path.split("?");
  const search = new URLSearchParams(query);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.append(key, String(value));
  }

  return { path: `${base}?${search.toString()}`, options };
};