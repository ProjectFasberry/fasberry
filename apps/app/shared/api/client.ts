import ky, { Options } from "ky";
import { API_PREFIX_URL, isDevelopment } from "../env";

const devHeaders = {
  "x-forwarded-for": "127.0.0.1"
}

const clientConfig: Options = {
  prefixUrl: API_PREFIX_URL,
  credentials: "include",
  timeout: 4000,
  headers: isDevelopment ? devHeaders : {}
}

export const SKIP_HOOK_HEADER = "X-Skip-Error-Handling"

export const clientInstance = ky.create({
  ...clientConfig,
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        let skipHook = false;

        const reqHeaders = _request.headers

        if (reqHeaders) {
          if (reqHeaders.get(SKIP_HOOK_HEADER) === 'true') {
            skipHook = true
          }
        }
        
        if (skipHook) return;

        if (!response.ok) {
          const json = await response.json();

          if (json && typeof json === 'object' && 'error' in json) {
            throw new Error(
              String((json as Record<string, unknown>).error)
            );
          }

          throw new Error(response.statusText);
        }
      },
    ],
  }
})