import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;
const SESSION_DAYS = 30;

const nowIso = () => new Date().toISOString();
const dateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export class AuthError extends Error {
  constructor(message, status = 400, code = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
  }
}

function cleanUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

function profileFromRow(row, username) {
  if (!row) return null;
  return {
    name: username,
    xp: Number(row.xp),
    gems: Number(row.gems),
    streak: Number(row.streak),
    bestStreak: Number(row.best_streak),
    lastStudyDate: row.last_study_date,
    completedLessons: JSON.parse(row.completed_lessons_json || '[]'),
    reviewedLessons: JSON.parse(row.reviewed_lessons_json || '[]'),
    dayKey: row.day_key,
    todayXp: Number(row.today_xp),
    todayLessons: Number(row.today_lessons),
    todayPerfect: Number(row.today_perfect),
  };
}

function validateRegistration({ username, email, password }) {
  const safeUsername = String(username || '').trim().replace(/\s+/g, ' ');
  const safeEmail = String(email || '').trim().toLowerCase();
  const safePassword = String(password || '');

  if (safeUsername.length < 3 || safeUsername.length > 24) {
    throw new AuthError('O nome de usuário deve ter entre 3 e 24 caracteres.', 400, 'INVALID_USERNAME');
  }
  if (!/^[\p{L}\p{N}_. -]+$/u.test(safeUsername)) {
    throw new AuthError('Use apenas letras, números, espaços, ponto, hífen ou sublinhado no nome.', 400, 'INVALID_USERNAME');
  }
  if (safeEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
    throw new AuthError('Informe um e-mail válido.', 400, 'INVALID_EMAIL');
  }
  if (safePassword.length < 8 || safePassword.length > 128) {
    throw new AuthError('A senha deve ter entre 8 e 128 caracteres.', 400, 'INVALID_PASSWORD');
  }
  return { username: safeUsername, email: safeEmail, password: safePassword };
}

function validateProfile(profile) {
  const integerFields = ['xp', 'gems', 'streak', 'bestStreak', 'todayXp', 'todayLessons', 'todayPerfect'];
  const result = {};
  for (const key of integerFields) {
    const value = Number(profile?.[key] ?? 0);
    if (!Number.isSafeInteger(value) || value < 0 || value > 100_000_000) {
      throw new AuthError(`Valor inválido para ${key}.`, 400, 'INVALID_PROFILE');
    }
    result[key] = value;
  }
  for (const key of ['completedLessons', 'reviewedLessons']) {
    const value = profile?.[key] ?? [];
    if (!Array.isArray(value) || value.length > 500 || value.some(item => typeof item !== 'string' || item.length > 100)) {
      throw new AuthError(`Lista inválida para ${key}.`, 400, 'INVALID_PROFILE');
    }
    result[key] = [...new Set(value)];
  }
  for (const key of ['lastStudyDate', 'dayKey']) {
    const value = profile?.[key] ?? null;
    if (value !== null && (typeof value !== 'string' || value.length > 30)) {
      throw new AuthError(`Data inválida para ${key}.`, 400, 'INVALID_PROFILE');
    }
    result[key] = value;
  }
  return result;
}

export function createAuthService(db, { sessionDays = SESSION_DAYS } = {}) {
  const findUserByEmail = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE');
  const findUserById = db.prepare('SELECT * FROM users WHERE id = ?');
  const findProfile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?');
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, email, password_salt, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertProfile = db.prepare(`
    INSERT INTO user_profiles (user_id, day_key, updated_at)
    VALUES (?, ?, ?)
  `);

  function issueSession(userId) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const createdAt = nowIso();
    const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('DELETE FROM auth_sessions WHERE expires_at <= ?').run(createdAt);
    db.prepare(`
      INSERT INTO auth_sessions (id, user_id, token_hash, created_at, expires_at, last_used_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(randomUUID(), userId, tokenHash, createdAt, expiresAt, createdAt);
    return { token, expiresAt };
  }

  function buildResponse(userRow, token) {
    const profileRow = findProfile.get(userRow.id);
    return {
      user: cleanUser(userRow),
      profile: profileFromRow(profileRow, userRow.username),
      token,
    };
  }

  async function register(input) {
    const data = validateRegistration(input);
    const salt = randomBytes(16);
    const derived = await scryptAsync(data.password, salt, KEY_LENGTH);
    const id = randomUUID();
    const stamp = nowIso();

    try {
      db.exec('BEGIN IMMEDIATE;');
      insertUser.run(id, data.username, data.email, salt.toString('hex'), Buffer.from(derived).toString('hex'), stamp, stamp);
      insertProfile.run(id, dateKey(), stamp);
      db.exec('COMMIT;');
    } catch (error) {
      try { db.exec('ROLLBACK;'); } catch { /* A transação pode não ter sido iniciada. */ }
      if (String(error?.message || '').includes('UNIQUE')) {
        throw new AuthError('Este e-mail ou nome de usuário já está cadastrado.', 409, 'ACCOUNT_EXISTS');
      }
      throw error;
    }

    const user = findUserById.get(id);
    const session = issueSession(id);
    return buildResponse(user, session.token);
  }

  async function login(input) {
    const email = String(input?.email || '').trim().toLowerCase();
    const password = String(input?.password || '');
    if (!email || !password) throw new AuthError('Informe seu e-mail e sua senha.', 400, 'MISSING_CREDENTIALS');

    const user = findUserByEmail.get(email);
    if (!user) {
      // Mantém um custo de cálculo semelhante para e-mails inexistentes.
      await scryptAsync(password, Buffer.alloc(16), KEY_LENGTH);
      throw new AuthError('E-mail ou senha incorretos.', 401, 'INVALID_CREDENTIALS');
    }

    const candidate = Buffer.from(await scryptAsync(password, Buffer.from(user.password_salt, 'hex'), KEY_LENGTH));
    const saved = Buffer.from(user.password_hash, 'hex');
    const valid = candidate.length === saved.length && timingSafeEqual(candidate, saved);
    if (!valid) throw new AuthError('E-mail ou senha incorretos.', 401, 'INVALID_CREDENTIALS');

    const stamp = nowIso();
    db.prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?').run(stamp, stamp, user.id);
    const updatedUser = findUserById.get(user.id);
    const session = issueSession(user.id);
    return buildResponse(updatedUser, session.token);
  }

  function authenticate(token) {
    if (!token || typeof token !== 'string' || token.length > 256) {
      throw new AuthError('Sessão ausente. Entre novamente.', 401, 'UNAUTHENTICATED');
    }
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const session = db.prepare(`
      SELECT s.id AS session_id, s.user_id, s.expires_at, u.*
      FROM auth_sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
    `).get(tokenHash);
    if (!session || session.expires_at <= nowIso()) {
      if (session) db.prepare('DELETE FROM auth_sessions WHERE id = ?').run(session.session_id);
      throw new AuthError('Sua sessão expirou. Entre novamente.', 401, 'SESSION_EXPIRED');
    }
    db.prepare('UPDATE auth_sessions SET last_used_at = ? WHERE id = ?').run(nowIso(), session.session_id);
    return { user: cleanUser(session), profile: profileFromRow(findProfile.get(session.user_id), session.username) };
  }

  function me(token) {
    return authenticate(token);
  }

  function updateProfile(token, input) {
    const auth = authenticate(token);
    const p = validateProfile(input);
    const stamp = nowIso();
    db.prepare(`
      UPDATE user_profiles SET
        xp = ?, gems = ?, streak = ?, best_streak = ?, last_study_date = ?,
        completed_lessons_json = ?, reviewed_lessons_json = ?, day_key = ?,
        today_xp = ?, today_lessons = ?, today_perfect = ?, updated_at = ?
      WHERE user_id = ?
    `).run(
      p.xp, p.gems, p.streak, p.bestStreak, p.lastStudyDate,
      JSON.stringify(p.completedLessons), JSON.stringify(p.reviewedLessons), p.dayKey || dateKey(),
      p.todayXp, p.todayLessons, p.todayPerfect, stamp, auth.user.id,
    );
    return profileFromRow(findProfile.get(auth.user.id), auth.user.username);
  }

  function logout(token) {
    if (!token || typeof token !== 'string') return;
    const tokenHash = createHash('sha256').update(token).digest('hex');
    db.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').run(tokenHash);
  }

  return { register, login, me, updateProfile, logout };
}
