import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../database.js';
import { AuthError, createAuthService } from '../auth-service.js';

function createTestService(options) {
  const db = openDatabase(':memory:');
  return { db, auth: createAuthService(db, options) };
}

test('cadastro cria usuário, perfil e sessão sem expor senha ou hash', async () => {
  const { db, auth } = createTestService();
  try {
    const result = await auth.register({ username: 'Dev Teste', email: 'dev@example.com', password: 'senha-segura-123' });
    assert.equal(result.user.username, 'Dev Teste');
    assert.equal(result.user.email, 'dev@example.com');
    assert.ok(result.token.length >= 32);
    assert.equal(result.profile.xp, 0);
    assert.deepEqual(result.profile.completedLessons, []);
    assert.equal('password_hash' in result.user, false);
    assert.equal('password_salt' in result.user, false);
    assert.equal(db.prepare('SELECT COUNT(*) AS total FROM users').get().total, 1);
    assert.equal(db.prepare('SELECT COUNT(*) AS total FROM user_profiles').get().total, 1);
    assert.equal(db.prepare('SELECT COUNT(*) AS total FROM auth_sessions').get().total, 1);
  } finally { db.close(); }
});

test('não permite cadastrar o mesmo e-mail duas vezes', async () => {
  const { db, auth } = createTestService();
  try {
    await auth.register({ username: 'Dev Um', email: 'same@example.com', password: 'senha-segura-123' });
    await assert.rejects(
      auth.register({ username: 'Dev Dois', email: 'SAME@example.com', password: 'senha-segura-123' }),
      error => error instanceof AuthError && error.status === 409,
    );
    assert.equal(db.prepare('SELECT COUNT(*) AS total FROM users').get().total, 1);
  } finally { db.close(); }
});

test('login valida senha e cria uma sessão diferente', async () => {
  const { db, auth } = createTestService();
  try {
    const registered = await auth.register({ username: 'Conta', email: 'conta@example.com', password: 'senha-segura-123' });
    const logged = await auth.login({ email: 'CONTA@example.com', password: 'senha-segura-123' });
    assert.equal(logged.user.id, registered.user.id);
    assert.notEqual(logged.token, registered.token);
    await assert.rejects(
      auth.login({ email: 'conta@example.com', password: 'senha-errada' }),
      error => error instanceof AuthError && error.status === 401,
    );
  } finally { db.close(); }
});

test('perfil pode ser salvo no banco e recuperado pela sessão', async () => {
  const { db, auth } = createTestService();
  try {
    const registered = await auth.register({ username: 'Persistente', email: 'persist@example.com', password: 'senha-segura-123' });
    const updated = auth.updateProfile(registered.token, {
      name: 'Persistente', xp: 55, gems: 8, streak: 2, bestStreak: 2,
      lastStudyDate: '2026-11-12', completedLessons: ['java-01'], reviewedLessons: [],
      dayKey: '2026-11-12', todayXp: 55, todayLessons: 1, todayPerfect: 0,
    });
    assert.equal(updated.xp, 55);
    assert.deepEqual(auth.me(registered.token).profile.completedLessons, ['java-01']);
    assert.equal(db.prepare('SELECT xp FROM user_profiles').get().xp, 55);
  } finally { db.close(); }
});

test('logout invalida o token', async () => {
  const { db, auth } = createTestService();
  try {
    const registered = await auth.register({ username: 'Logout', email: 'logout@example.com', password: 'senha-segura-123' });
    assert.equal(auth.me(registered.token).user.username, 'Logout');
    auth.logout(registered.token);
    assert.throws(() => auth.me(registered.token), error => error instanceof AuthError && error.status === 401);
  } finally { db.close(); }
});

test('cadastro rejeita senha curta', async () => {
  const { db, auth } = createTestService();
  try {
    await assert.rejects(
      auth.register({ username: 'Senha Curta', email: 'short@example.com', password: '1234567' }),
      error => error instanceof AuthError && error.code === 'INVALID_PASSWORD',
    );
    assert.equal(db.prepare('SELECT COUNT(*) AS total FROM users').get().total, 0);
  } finally { db.close(); }
});
