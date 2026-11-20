export const makeDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const dayBeforeKey = (date = new Date()) => {
  const previous = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  return makeDateKey(previous);
};

export const createProfile = (name = 'Dev') => ({
  name: (name.trim() || 'Dev').slice(0, 24),
  xp: 0, gems: 0, streak: 0, bestStreak: 0,
  lastStudyDate: null,
  completedLessons: [],
  reviewedLessons: [],
  dayKey: makeDateKey(),
  todayXp: 0, todayLessons: 0, todayPerfect: 0,
});

export function normaliseDay(profile, date = new Date()) {
  const today = makeDateKey(date);
  if (profile.dayKey === today) return profile;
  return { ...profile, dayKey: today, todayXp: 0, todayLessons: 0, todayPerfect: 0 };
}

export const levelOf = (xp) => Math.floor(Math.max(0, xp) / 100) + 1;
export const levelProgress = (xp) => Math.max(0, xp) % 100;
export const isLessonUnlocked = (completed, index, lessons) =>
  index === 0 || completed.includes(lessons[index - 1].id);

export function completeLesson(profile, lessonId, correct, total, date = new Date()) {
  const current = normaliseDay(profile, date);
  if (current.completedLessons.includes(lessonId)) {
    return { profile: current, xpEarned: 0, gemsEarned: 0, alreadyCompleted: true };
  }
  const xpEarned = correct * 10 + 15;
  const gemsEarned = correct === total ? 8 : 4;
  const today = makeDateKey(date);
  const yesterday = dayBeforeKey(date);
  const streak = current.lastStudyDate === today
    ? current.streak
    : current.lastStudyDate === yesterday ? current.streak + 1 : 1;
  return {
    profile: {
      ...current,
      xp: current.xp + xpEarned, gems: current.gems + gemsEarned,
      streak, bestStreak: Math.max(current.bestStreak, streak), lastStudyDate: today,
      completedLessons: [...current.completedLessons, lessonId],
      todayXp: current.todayXp + xpEarned,
      todayLessons: current.todayLessons + 1,
      todayPerfect: current.todayPerfect + (correct === total ? 1 : 0),
    },
    xpEarned, gemsEarned, alreadyCompleted: false,
  };
}

export function completeReview(profile, lessonId) {
  if (profile.reviewedLessons.includes(lessonId)) {
    return { profile, xpEarned: 0, alreadyReviewed: true };
  }
  const current = normaliseDay(profile);
  return {
    profile: {
      ...current,
      xp: current.xp + 10,
      todayXp: current.todayXp + 10,
      reviewedLessons: [...current.reviewedLessons, lessonId],
    },
    xpEarned: 10,
    alreadyReviewed: false,
  };
}

export const missionList = (profile) => [
  { id: 'xp', title: 'Ganhe 10 XP', subtitle: 'Dê o primeiro passo hoje.', current: Math.min(profile.todayXp, 10), goal: 10, color: 'gold' },
  { id: 'lessons', title: 'Conclua 2 lições', subtitle: 'Constância é o segredo.', current: Math.min(profile.todayLessons, 2), goal: 2, color: 'cyan' },
  { id: 'perfect', title: 'Faça 2 lições perfeitas', subtitle: 'Capriche nas respostas.', current: Math.min(profile.todayPerfect, 2), goal: 2, color: 'lime' },
];
