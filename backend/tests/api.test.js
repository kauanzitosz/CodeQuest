import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../database.js';
import { createApiServer } from '../server.js';

test('API expõe health, cadastro, sessão e logout', async () => {
  const db = openDatabase(':memory:');
  const server = createApiServer({ db });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;

  try {
    const health = await fetch(`${base}/api/health`).then(r => r.json());
    assert.equal(health.ok, true);

    const registeredResponse = await fetch(`${base}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'API Tester', email: 'api@example.com', password: 'senha-api-123' }),
    });
    assert.equal(registeredResponse.status, 201);
    const registered = await registeredResponse.json();

    const meResponse = await fetch(`${base}/api/auth/me`, {
      headers: { Authorization: `Bearer ${registered.token}` },
    });
    assert.equal(meResponse.status, 200);
    const me = await meResponse.json();
    assert.equal(me.user.email, 'api@example.com');

    const logout = await fetch(`${base}/api/auth/logout`, {
      method: 'POST', headers: { Authorization: `Bearer ${registered.token}` },
    });
    assert.equal(logout.status, 200);

    const afterLogout = await fetch(`${base}/api/auth/me`, {
      headers: { Authorization: `Bearer ${registered.token}` },
    });
    assert.equal(afterLogout.status, 401);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
