import { api } from '../server.mjs';

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  return api(req, res, url.pathname, url);
}
