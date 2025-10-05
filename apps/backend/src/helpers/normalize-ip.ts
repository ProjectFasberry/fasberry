export function normalizeIp(ip: string | undefined | null): string | null {
  if (!ip) return null;

  if (ip === '::1') {
    return '127.0.0.1';
  }
  
  if (ip.startsWith('::ffff:')) {
    return ip.replace('::ffff:', '');
  }

  const result = ip.replace(/^\[|\]$/g, '');

  return result
}