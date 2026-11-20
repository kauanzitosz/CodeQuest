import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { openDatabase } from './database.js';
import { AuthError, createAuthService } from './auth-service.js';

const PORT = Number(process.env.PORT || 3333);
const HOST = process.env.HOST || '0.0.0.0';
const MAX_BODY_BYTES = 32 * 1024;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 20;

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new AuthError('A requisição é muito grande.', 413, 'BODY_TOO_LARGE');
    chunks.push(chunk);
  }
  if (!size) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AuthError('O conteúdo enviado não é um JSON válido.', 400, 'INVALID_JSON'); }
}

function bearerToken(req) {
  const value = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(value);
  return match?.[1] || null;
}

export function createApiServer({ db = openDatabase(), auth = createAuthService(db) } = {}) {
  const attempts = new Map();

  function isRateLimited(ip) {
    const now = Date.now();
    const current = (attempts.get(ip) || []).filter(time => now - time < LOGIN_WINDOW_MS);
    if (current.length >= LOGIN_MAX_ATTEMPTS) {
      attempts.set(ip, current);
      return true;
    }
    current.push(now);
    attempts.set(ip, current);
    return false;
  }

  const server = createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const ip = req.socket.remoteAddress || 'unknown';

    try {
      if (req.method === 'GET' && url.pathname === '/api/health') {
        const check = db.prepare('SELECT 1 AS ok').get();
        return sendJson(res, 200, { ok: check?.ok === 1, service: 'codequest-api', database: 'sqlite', timestamp: new Date().toISOString() });
      }

      if (req.method === 'POST' && ['/api/auth/register', '/api/auth/login'].includes(url.pathname)) {
        if (isRateLimited(ip)) throw new AuthError('Muitas tentativas. Aguarde alguns minutos e tente novamente.', 429, 'RATE_LIMITED');
        const body = await readJson(req);
        const result = url.pathname.endsWith('/register') ? await auth.register(body) : await auth.login(body);
        return sendJson(res, url.pathname.endsWith('/register') ? 201 : 200, result);
      }

      if (req.method === 'GET' && url.pathname === '/api/auth/me') {
        const result = auth.me(bearerToken(req));
        return sendJson(res, 200, result);
      }

      if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
        auth.logout(bearerToken(req));
        return sendJson(res, 200, { ok: true });
      }

      if (req.method === 'PUT' && url.pathname === '/api/profile') {
        const body = await readJson(req);
        const profile = auth.updateProfile(bearerToken(req), body);
        return sendJson(res, 200, { profile });
      }

      return sendJson(res, 404, { error: 'Rota não encontrada.', code: 'NOT_FOUND' });
    } catch (error) {
      if (error instanceof AuthError) return sendJson(res, error.status, { error: error.message, code: error.code });
      console.error('[API] Erro inesperado:', error);
      return sendJson(res, 500, { error: 'Erro interno do servidor.', code: 'INTERNAL_ERROR' });
    }
  });

  server.on('close', () => { try { db.close(); } catch {} });
  return server;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const server = createApiServer();
  server.listen(PORT, HOST, () => {
    console.log('');
    console.log('  CODEQUEST API');
    console.log(`  Servidor: http://localhost:${PORT}`);
    console.log(`  Health:   http://localhost:${PORT}/api/health`);
    console.log('  Banco:    backend/data/codequest.sqlite');
    console.log('  Rede:     disponível na rede local (0.0.0.0)');
    console.log('');
    console.log('  Pressione Ctrl+C para encerrar.');
  });
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
