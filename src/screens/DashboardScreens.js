import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { C } from '../theme';
import { Page, Label, Panel, Byte, Pill, SectionTitle, Action, ProgressBar, Back } from '../components/UI';
import { LESSONS } from '../data/lessons';
import { isLessonUnlocked, levelOf, levelProgress, missionList } from '../logic/progress';

export function HomeScreen({ profile, openUnit, startLesson }) {
  const completed = profile.completedLessons;
  const nextIndex = LESSONS.findIndex(lesson => !completed.includes(lesson.id));
  const next = LESSONS[nextIndex >= 0 ? nextIndex : LESSONS.length - 1];
  const allDone = nextIndex < 0;
  return <Page>
    <View style={s.topRow}>
      <View><Label size={12} color={C.lime} weight="900">CODEQUEST</Label>
        <Label size={29} weight="900" style={{ marginTop: 18 }}>Olá, {profile.name}! ✦</Label>
        <Label size={13} color={C.muted} style={{ marginTop: 4 }}>Mais um dia para evoluir seu código.</Label></View>
      <View style={s.robotBadge}><Byte size={49} /></View>
    </View>
    <Panel style={s.statsStrip}>
      <View style={s.statPart}><Label size={13} weight="800" color={C.coral}>♥  {profile.streak} {profile.streak === 1 ? 'dia' : 'dias'}</Label></View>
      <View style={s.statPart}><Label size={13} weight="800" color={C.cyan}>◆  {profile.gems}</Label></View>
      <View style={s.statPart}><Label size={13} weight="800" color={C.lime}>✦  Nv. {levelOf(profile.xp)}</Label></View>
    </Panel>
    <Pressable onPress={openUnit} accessibilityRole="button" accessibilityLabel="Abrir visão geral do curso">
      <Panel style={s.courseCard}>
        <Pill label="JAVA · INICIANTE" />
        <Label weight="800" size={20} style={{ marginTop: 17 }}>Continue de onde parou</Label>
        <Label size={12} color={C.muted} style={{ marginTop: 5 }}>{completed.length} de {LESSONS.length} lições concluídas</Label>
        <ProgressBar value={completed.length} maximum={LESSONS.length} style={{ marginTop: 15 }} />
      </Panel>
    </Pressable>
    <SectionTitle side="VER CURSO →" onSidePress={openUnit} style={{ marginTop: 27 }}>SUA TRILHA</SectionTitle>
    <View style={s.path}>
      <View style={s.pathLine} />
      {LESSONS.map((lesson, index) => {
        const done = completed.includes(lesson.id);
        const unlocked = isLessonUnlocked(completed, index, LESSONS);
        const current = unlocked && !done;
        return <Pressable key={lesson.id} onPress={() => unlocked && startLesson(index)}
          disabled={!unlocked} accessibilityRole="button" accessibilityState={{ disabled: !unlocked }}
          style={[s.lessonRow, index === LESSONS.length - 1 && { marginBottom: 0 }]}>
          <View style={[s.lessonCircle, done && { backgroundColor: C.lime }, current && { backgroundColor: C.cyan }]}>
            <Label weight="900" size={current ? 17 : 20} color={unlocked ? C.ink : C.muted}>{done ? '✓' : unlocked ? '</>' : '·'}</Label>
          </View>
          <View style={{ flex: 1, paddingLeft: 18 }}>
            <Label size={17} weight="800" color={unlocked ? C.white : C.muted}>{`${String(index + 1).padStart(2,'0')}  ${lesson.title}`}</Label>
            <Label size={12} color={C.muted} style={{ marginTop: 5 }}>{done ? 'Concluída · revisar quando quiser' : unlocked ? 'Sua próxima aventura' : 'Conclua a anterior para desbloquear'}</Label>
          </View>
          {current && <Label color={C.lime} size={20}>›</Label>}
        </Pressable>;
      })}
    </View>
    <View style={{ marginTop: 26 }}><Action title={allDone ? 'REFAZER UMA LIÇÃO  →' : 'CONTINUAR LIÇÃO  →'} onPress={() => startLesson(nextIndex < 0 ? 0 : nextIndex)} /></View>
  </Page>;
}

export function UnitScreen({ profile, onBack, startLesson }) {
  const count = profile.completedLessons.length;
  return <Page>
    <Back title="VOLTAR À TRILHA" onPress={onBack} />
    <Label size={30} weight="900">Fundamentos de Java</Label>
    <Label color={C.muted} style={{ marginTop: 7, marginBottom: 24 }}>Unidade 01 · Sua jornada começa aqui.</Label>
    <Panel style={{ backgroundColor: C.elevated, minHeight: 144, marginBottom: 28 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ maxWidth: '72%' }}><Pill label="INICIANTE · JAVA" /><Label size={18} weight="800" style={{ marginTop: 12 }}>Uma grande aventura começa com o básico.</Label></View>
        <Byte size={72} />
      </View>
      <Label color={C.muted} size={11} style={{ marginTop: 12, marginBottom: 7 }}>{Math.round(count/LESSONS.length*100)}% concluída</Label>
      <ProgressBar value={count} maximum={LESSONS.length} />
    </Panel>
    <SectionTitle side={`${LESSONS.length} ETAPAS`}>SEU ROTEIRO</SectionTitle>
    {LESSONS.map((lesson, index) => {
      const unlocked = isLessonUnlocked(profile.completedLessons, index, LESSONS);
      const done = profile.completedLessons.includes(lesson.id);
      return <Pressable key={lesson.id} disabled={!unlocked} onPress={() => startLesson(index)}
        accessibilityRole="button" accessibilityState={{ disabled: !unlocked }}>
        <Panel style={s.unitItem}>
          <View style={[s.unitNum, { backgroundColor: done ? C.lime : unlocked ? C.cyan : C.outline }]}>
            <Label weight="900" color={unlocked ? C.ink : C.muted}>{done ? '✓' : String(index+1).padStart(2,'0')}</Label>
          </View>
          <View style={{ flex: 1 }}><Label size={15} weight="800" color={unlocked ? C.white : C.muted}>{lesson.title}</Label>
            <Label color={C.muted} size={12} style={{ marginTop: 5 }}>{lesson.subtitle}</Label></View>
          <Label size={17} color={unlocked ? C.lime : C.muted}>{unlocked ? '›' : '⊘'}</Label>
        </Panel>
      </Pressable>;
    })}
  </Page>;
}

export function MissionsScreen({ profile }) {
  const missions = missionList(profile);
  return <Page>
    <Label size={12} color={C.lime} weight="900">MISSÕES DO DIA</Label>
    <Label size={29} weight="900" style={{ marginTop: 19, lineHeight: 37 }}>Pequenas missões.{ '\n' }Grandes conquistas.</Label>
    <Label color={C.muted} size={13} style={{ marginTop: 8, marginBottom: 24 }}>Complete desafios e ganhe recompensas.</Label>
    <Panel style={{ backgroundColor: C.elevated, marginBottom: 27 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View><Label size={11} weight="900" color={C.lime}>SUA EVOLUÇÃO</Label>
          <Label size={17} weight="800" style={{ marginTop: 14 }}>{missions.filter(m => m.current >= m.goal).length} de 3 missões concluídas</Label></View><Byte size={79} /></View>
    </Panel>
    <SectionTitle side="REINICIA AMANHÃ">DESAFIOS</SectionTitle>
    {missions.map(m => <Panel key={m.id} style={{ marginBottom: 13, padding: 18 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Label weight="800" size={16}>{m.title}</Label>
        <Label size={13} weight="800" color={C[m.color]}>{m.current}/{m.goal}</Label></View>
      <Label color={C.muted} size={12} style={{ marginTop: 7, marginBottom: 16 }}>{m.subtitle}</Label>
      <ProgressBar value={m.current} maximum={m.goal} color={C[m.color]} />
      {m.current >= m.goal && <Label size={11} weight="800" color={C.lime} style={{ marginTop: 10 }}>✓ MISSÃO COMPLETA</Label>}
    </Panel>)}
    <Panel style={{ backgroundColor: C.elevated, marginTop: 10 }}><Label color={C.mint} weight="700" size={13}>✦ Uma missão por vez. Você consegue!</Label></Panel>
  </Page>;
}

const s = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  robotBadge: { width: 57, height: 57, borderRadius: 29, backgroundColor: C.elevated, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  statsStrip: { flexDirection: 'row', marginTop: 24, padding: 15, justifyContent: 'space-between' },
  statPart: { alignItems: 'center', flex: 1 },
  courseCard: { marginTop: 17, backgroundColor: C.elevated, padding: 18 },
  path: { paddingVertical: 8 }, pathLine: { position: 'absolute', left: 44, top: 24, bottom: 33, width: 4, backgroundColor: C.outline, borderRadius: 4 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', minHeight: 95, marginBottom: 2 },
  lessonCircle: { backgroundColor: C.surface, width: 80, height: 80, borderRadius: 42, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  unitItem: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12, padding: 13, borderRadius: 16 },
  unitNum: { width: 46, height: 46, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
