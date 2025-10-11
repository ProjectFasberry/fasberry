import ky, { Options } from "ky";
import { API_PREFIX_URL } from "../env";

const clientConfig: Options = {
  prefixUrl: API_PREFIX_URL,
  credentials: "include",
  timeout: 4000
}

export const clientInstance = ky.create({
  ...clientConfig,
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
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