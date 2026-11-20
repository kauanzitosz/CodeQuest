import test from 'node:test';
import assert from 'node:assert/strict';
import { createProfile, completeLesson, completeReview, normaliseDay, isLessonUnlocked, levelOf } from '../src/logic/progress.js';

const date = (y,m,d) => new Date(y,m-1,d,12,0,0);
const lessons = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

test('perfil inicial e desbloqueio sequencial', () => {
  const p = createProfile('Lara');
  assert.equal(p.name, 'Lara');
  assert.equal(p.xp, 0);
  assert.equal(isLessonUnlocked([], 0, lessons), true);
  assert.equal(isLessonUnlocked([], 1, lessons), false);
  assert.equal(isLessonUnlocked(['a'], 1, lessons), true);
});

test('uma lição recompensa uma vez e afeta missões', () => {
  const p = createProfile('Dev');
  const r = completeLesson(p, 'a', 3, 3, date(2026,10,16));
  assert.equal(r.xpEarned, 45);
  assert.equal(r.gemsEarned, 8);
  assert.equal(r.profile.todayLessons, 1);
  assert.equal(r.profile.todayPerfect, 1);
  assert.equal(r.profile.streak, 1);
  assert.equal(completeLesson(r.profile, 'a', 3, 3, date(2026,10,16)).xpEarned, 0);
});

test('streak continua no dia seguinte e reseta após intervalo', () => {
  const one = completeLesson(createProfile(), 'a', 2, 3, date(2026,10,16)).profile;
  const two = completeLesson(one, 'b', 2, 3, date(2026,10,17)).profile;
  assert.equal(two.streak, 2);
  assert.equal(two.bestStreak, 2);
  const three = completeLesson(two, 'c', 3, 3, date(2026,10,19)).profile;
  assert.equal(three.streak, 1);
  assert.equal(three.bestStreak, 2);
});

test('o novo dia zera somente os contadores diários', () => {
  const p = completeLesson(createProfile(), 'a', 3, 3, date(2026,10,16)).profile;
  const next = normaliseDay(p, date(2026,10,17));
  assert.equal(next.todayXp, 0);
  assert.equal(next.completedLessons.length, 1);
  assert.equal(next.xp, 45);
});

test('revisão gera bônus só uma vez', () => {
  const a = completeReview(createProfile(), 'a');
  assert.equal(a.xpEarned, 10);
  assert.equal(levelOf(a.profile.xp), 1);
  const b = completeReview(a.profile, 'a');
  assert.equal(b.xpEarned, 0);
});
