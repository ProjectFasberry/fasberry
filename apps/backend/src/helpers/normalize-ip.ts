export function normalizeIp(ip: string | undefined | null): string {
  if (!ip) return '';

  if (ip === '::1') {
    return '127.0.0.1';
  }
  
  if (ip.startsWith('::ffff:')) {
    return ip.replace('::ffff:', '');
  }

  return ip.replace(/^\[|\]$/g, '');
}