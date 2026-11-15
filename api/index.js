import { api } from '../server.mjs';

export default async function handler(req, res) {
  try {
    const fwdHost = req.headers['x-forwarded-host'];
    const host = fwdHost || req.headers.host || 'localhost';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const url = new URL(req.url, `${proto}://${host}`);

    return await api(req, res, url.pathname, url);
  } catch (err) {
    console.error('Unhandled API error in api/index.js:', err);
    if (!res.headersSent) {
      const status = typeof err.status === 'number' ? err.status : 500;
      res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      });
      res.end(JSON.stringify({
        ok: false,
        error: {
          code: err.code || 'API_ERROR',
          message: err.message || 'Unable to complete the request.'
        }
      }));
    }
  }
}
