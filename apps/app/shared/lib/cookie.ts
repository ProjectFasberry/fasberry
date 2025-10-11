export function parseCookie(header?: string): Record<string, string> {
  if (!header) return {};

  return header
    .split(';')
    .map(v => v.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, pair) => {
      const eqIndex = pair.indexOf('=');
      if (eqIndex === -1) return acc;

      const key = pair.slice(0, eqIndex).trim();
      const value = pair.slice(eqIndex + 1).trim();

      if (key) acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

export function setCookie(
  name: string,
  value: string,
  options: {
    maxAgeMs?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  } = {
    sameSite: "Lax",
    path: "/"
  }
) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (options.maxAgeMs) {
    const expires = new Date(Date.now() + options.maxAgeMs);
    parts.push(`Expires=${expires.toUTCString()}`);
  }

  if (options.path) parts.push(`Path=${options.path}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.secure) parts.push(`Secure`);
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);

  document.cookie = parts.join('; ');
}