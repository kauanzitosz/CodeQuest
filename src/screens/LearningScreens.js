import React from 'react';
import { View, Pressable, StyleSheet, Alert } from 'react-native';
import { C } from '../theme';
import { Page, Label, Panel, ProgressBar, Action, Byte, Back, Pill, SectionTitle } from '../components/UI';

export function QuizScreen({ lesson, index, total, selected, checked, onSelect, onCheck, onNext, onQuit, lives = 5, isReview = false }) {
  const question = lesson.questions[index];
  const isCorrect = selected === question.correctIndex;
  const color = isCorrect ? C.lime : C.coral;
  return <Page contentStyle={{ paddingBottom: 28 }}>
    <View style={s.quizHeader}>
      <Pressable onPress={() => Alert.alert('Sair da lição?', 'Seu progresso desta tentativa será perdido.', [
        { text: 'Continuar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: onQuit },
      ])} accessibilityRole="button" accessibilityLabel="Sair"><Label color={C.muted} size={26}>×</Label></Pressable>
      <ProgressBar value={index + (checked ? 1 : 0)} maximum={total} style={{ flex: 1 }} />
      <Label weight="800" color={C.coral} size={15}>{isReview ? `${index+1}/${total}` : `♥ ${lives}`}</Label>
    </View>
    <Label color={C.lime} size={11} weight="900" style={{ marginTop: 34 }}>{isReview ? 'REVISÃO DE ERROS' : lesson.category}</Label>
    <Label size={27} weight="900" style={{ marginTop: 16, lineHeight: 34 }}>{question.title}</Label>
    <Label color={C.muted} size={14} style={{ marginTop: 8, marginBottom: 28 }}>{question.instruction}</Label>
    <Panel style={s.codePanel}>
      <View style={s.codeHeader}><View style={s.dots}>{[C.coral,C.gold,C.lime].map((c,i) => <View key={i} style={{ width: 8, height: 8, backgroundColor: c, borderRadius: 5 }} />)}</View>
        <Label color={C.muted} size={11}>Main.java</Label></View>
      <View style={{ padding: 18 }}><Label color={C.cyan} size={15} weight="600" style={{ fontFamily: 'monospace', lineHeight: 25 }}>{question.code}</Label></View>
    </Panel>
    {isReview && <Panel style={s.hint}><View style={{ flex: 1 }}><Label color={C.lime} weight="800" size={11}>DICA DO BYTE</Label>
      <Label color={C.mint} style={{ marginTop: 8, lineHeight: 18 }} size={12}>{question.hint}</Label></View><Byte size={62} /></Panel>}
    <SectionTitle style={{ marginTop: 27 }}>ESCOLHA UMA RESPOSTA</SectionTitle>
    <View style={s.choices}>{question.options.map((option, i) => {
      const active = selected === i;
      const highlight = checked && i === question.correctIndex;
      const wrong = checked && active && !isCorrect;
      return <Pressable key={`${question.id}-${i}`} disabled={checked} onPress={() => onSelect(i)} accessibilityRole="radio" accessibilityState={{ selected: active }}
        style={[s.option, active && { backgroundColor: C.elevated, borderColor: C.lime }, wrong && { borderColor: C.coral }, highlight && { borderColor: C.lime }]}>
        <Label size={17} weight="800" color={wrong ? C.coral : active || highlight ? C.lime : C.white} style={{ textAlign: 'center' }}>{option}</Label>
      </Pressable>;
    })}</View>
    {checked && <Panel style={[s.feedback, { backgroundColor: isCorrect ? C.successBg : C.errorBg }]}>
      <Label weight="900" color={color} size={15}>{isCorrect ? '✓ Resposta correta!' : '✕ Ainda não. Veja a explicação:'}</Label>
      <Label color={C.white} style={{ marginTop: 7, lineHeight: 19 }} size={13}>{question.explanation}</Label>
    </Panel>}
    <View style={{ marginTop: checked ? 18 : 26 }}><Action title={checked ? index + 1 === total ? 'CONCLUIR  →' : 'PRÓXIMA QUESTÃO  →' : 'VERIFICAR RESPOSTA  →'}
      onPress={checked ? onNext : onCheck} disabled={!checked && selected === null} /></View>
  </Page>;
}

export function ResultScreen({ result, onReview, onHome, onRetry }) {
  if (!result) return null;
  const { lesson, correct, total, xpEarned, gemsEarned, wrongIndices, alreadyCompleted } = result;
  return <Page>
    <Back title="VOLTAR À TRILHA" onPress={onHome} />
    <Label size={11} color={C.lime} weight="900">{lesson.section}</Label>
    <Label size={31} weight="900" style={{ marginTop: 16 }}>Lição concluída!</Label>
    <Label size={14} color={C.muted} style={{ marginTop: 8 }}>Você mandou bem! Veja seu resultado.</Label>
    <Panel style={{ marginTop: 27, backgroundColor: C.elevated, minHeight: 161, flexDirection: 'row', alignItems: 'center', gap: 19 }}>
      <View style={s.scoreCircle}><Label size={30} color={C.ink} weight="900">{correct}/{total}</Label><Label color={C.ink} weight="900" size={10}>ACERTOS</Label></View>
      <View style={{ flex: 1 }}><Label size={19} weight="800">{correct === total ? 'Perfeito!' : 'Ótimo trabalho!'}</Label>
        <Label size={13} color={C.muted} style={{ marginTop: 8, lineHeight: 18 }}>{correct === total ? 'Você acertou todas as questões.' : 'Cada tentativa ajuda a evoluir.'}</Label></View>
    </Panel>
    <View style={{ flexDirection: 'row', gap: 14, marginTop: 18 }}>
      <Panel style={{ flex: 1 }}><Label size={28} weight="900" color={C.lime}>+{xpEarned}</Label><Label size={11} weight="800" color={C.muted} style={{ marginTop: 9 }}>XP GANHOS</Label></Panel>
      <Panel style={{ flex: 1 }}><Label size={28} weight="900" color={C.cyan}>+{gemsEarned}</Label><Label size={11} weight="800" color={C.muted} style={{ marginTop: 9 }}>GEMS</Label></Panel>
    </View>
    {alreadyCompleted && <Label style={{ marginTop: 13 }} size={12} color={C.muted}>Esta lição já havia sido concluída. Repetições não geram novas recompensas.</Label>}
    {wrongIndices.length > 0 ? <Panel style={{ marginTop: 27 }}><Label size={16} weight="800">{wrongIndices.length} exercício(s) para revisar</Label>
      <Label size={13} color={C.muted} style={{ lineHeight: 20, marginTop: 8 }}>Reforce os conceitos que errou antes de avançar na trilha.</Label></Panel>
      : <Panel style={{ marginTop: 27 }}><Label size={16} weight="800" color={C.lime}>✓ Nenhum erro nesta lição!</Label>
        <Label size={13} color={C.muted} style={{ marginTop: 7 }}>Você está pronto para o próximo desafio.</Label></Panel>}
    <View style={{ marginTop: 27 }}>
      {wrongIndices.length > 0 && <Action title="REVISAR MEUS ERROS  →" onPress={onReview} />}
      <Action title={wrongIndices.length > 0 ? 'CONTINUAR SEM REVISAR' : 'VOLTAR À TRILHA'} onPress={onHome} variant={wrongIndices.length > 0 ? 'outline' : 'primary'} style={{ marginTop: 12 }} />
      <Action title="REFAZER LIÇÃO" onPress={onRetry} variant="secondary" style={{ marginTop: 12 }} />
    </View>
  </Page>;
}

export function ReviewDoneScreen({ onBack, xpEarned, count }) {
  return <Page contentStyle={{ paddingTop: 21 }}>
    <Label size={12} weight="900" color={C.lime}>REVISÃO FINALIZADA</Label>
    <View style={{ height: 282, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 237, height: 237, backgroundColor: C.elevated, opacity: 0.65, borderRadius: 140, position: 'absolute' }} />
      <Byte size={167} />
    </View>
    <Label size={30} weight="900">Revisão concluída!</Label>
    <Label color={C.muted} style={{ marginTop: 12, lineHeight: 22 }}>Cada erro é uma chance de aprender.{ '\n' }E você aproveitou cada uma!</Label>
    <Panel style={{ marginTop: 31, backgroundColor: C.elevated }}><Label size={12} color={C.gold} weight="900">✦ RECOMPENSA EXTRA</Label>
      <Label size={27} weight="900" color={C.lime} style={{ marginTop: 10 }}>+{xpEarned} XP BÔNUS</Label></Panel>
    <SectionTitle style={{ marginTop: 29 }}>{count} CONCEITO(S) REVISADO(S)</SectionTitle>
    <Pill label="MISSÃO DE REVISÃO CONCLUÍDA" color={C.mint} />
    <Action title="VOLTAR À TRILHA  →" onPress={onBack} style={{ marginTop: 34 }} />
  </Page>;
}

const s = StyleSheet.create({
  quizHeader: { flexDirection: 'row', alignItems: 'center', gap: 20, justifyContent: 'space-between' },
  codePanel: { padding: 0, overflow: 'hidden', borderRadius: 19 },
  codeHeader: { height: 37, backgroundColor: C.elevated, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18 },
  dots: { flexDirection: 'row', gap: 7 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  option: { minHeight: 66, width: '48%', borderRadius: 17, borderWidth: 2, borderColor: C.surface, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', padding: 7 },
  hint: { backgroundColor: C.elevated, marginTop: 20, flexDirection: 'row', gap: 14, alignItems: 'center' },
  feedback: { marginTop: 21 },
  scoreCircle: { width: 117, height: 117, borderRadius: 63, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
});
