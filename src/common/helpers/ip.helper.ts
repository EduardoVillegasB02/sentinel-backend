export function getIP(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  let ip = '';
  if (typeof forwarded === 'string') ip = forwarded.split(',')[0];
  else if (Array.isArray(forwarded)) ip = forwarded[0];
  else ip = req.socket.remoteAddress || '';
  if (ip === '::1' || ip.startsWith('::ffff:'))
    ip = ip.replace('::ffff:', '') || '127.0.0.1';
  return ip;
}
