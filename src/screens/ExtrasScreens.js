import React from 'react';
import { View, Pressable, Alert, StyleSheet } from 'react-native';
import { C } from '../theme';
import { Page, Label, Panel, Byte, Action, Pill, SectionTitle, ProgressBar } from '../components/UI';
import { COMMUNITY_POSTS } from '../data/lessons';
import { levelOf, levelProgress } from '../logic/progress';

export function SocialScreen({ liked, toggleLike }) {
  return <Page>
    <Label size={29} weight="900">Comunidade</Label>
    <Label size={13} color={C.muted} style={{ marginTop: 7, marginBottom: 27 }}>Aprenda junto, evolua junto.</Label>
    <Panel style={{ padding: 13, flexDirection: 'row', justifyContent: 'space-around', marginBottom: 29 }}>
      <Pill label="NOVIDADES" /><Label color={C.muted} size={12} weight="800" style={{ marginTop: 7 }}>AMIGOS</Label>
    </Panel>
    <SectionTitle>SEU FEED</SectionTitle>
    {COMMUNITY_POSTS.map(post => <Panel key={post.id} style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 19 }}>
        <View style={[s.avatar, { backgroundColor: C[post.color] }]}><Label color={C.ink} weight="900" size={21}>{post.initial}</Label></View>
        <View><Label size={15} weight="800">{post.name}</Label><Label size={11} color={C.muted} style={{ marginTop: 4 }}>{post.time} · {post.course}</Label></View>
      </View>
      <Label size={16} weight="700" style={{ lineHeight: 23 }}>{post.content}</Label>
      {post.id === 'helen' && <Panel style={{ marginTop: 18, backgroundColor: C.elevated, padding: 13 }}><Label color={C.gold} size={13} weight="800">✦ PRIMEIROS 100 XP</Label></Panel>}
      <Pressable onPress={() => toggleLike(post.id)} accessibilityRole="button" accessibilityLabel={liked.includes(post.id) ? 'Remover curtida' : 'Curtir publicação'} style={{ alignSelf: 'flex-start', marginTop: 19 }}>
        <Label color={liked.includes(post.id) ? C.coral : C.muted} size={13} weight="700">{liked.includes(post.id) ? '♥' : '♡'}  {post.likes + (liked.includes(post.id) ? 1 : 0)}   Curtir</Label>
      </Pressable>
    </Panel>)}
    <Label color={C.muted} size={12} style={{ textAlign: 'center', lineHeight: 19, marginTop: 6 }}>Publicações de demonstração.{ '\n' }O compartilhamento real será implementado com um servidor.</Label>
  </Page>;
}

export function ProfileScreen({ profile, user, onReset, onLogout }) {
  const total = profile.completedLessons.length;
  return <Page>
    <Label size={12} weight="900" color={C.lime}>MEU PERFIL</Label>
    <Label size={27} weight="900" style={{ marginTop: 16, marginBottom: 24 }}>Sua jornada em números</Label>
    <Panel style={{ backgroundColor: C.elevated, flexDirection: 'row', alignItems: 'center', gap: 18, minHeight: 139 }}>
      <View style={s.robotAvatar}><Byte size={93} /></View>
      <View style={{ flex: 1 }}><Label size={18} weight="800">{user?.username || profile.name}</Label>
        <Label size={11} color={C.muted} style={{ marginTop: 6 }}>{user?.email || 'Conta CodeQuest'}</Label>
        <View style={{ marginTop: 11 }}><Pill label={`NÍVEL ${String(levelOf(profile.xp)).padStart(2, '0')} ✦`} /></View>
      </View>
    </Panel>
    <SectionTitle style={{ marginTop: 28 }}>SEU PROGRESSO</SectionTitle>
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {[{ value: `${profile.streak}d`, label: 'OFENSIVA', color: C.coral }, { value: profile.xp, label: 'XP TOTAL', color: C.lime }, { value: total, label: 'LIÇÕES', color: C.cyan }].map(x => <Panel key={x.label} style={{ flex: 1, padding: 14 }}>
        <Label size={21} color={x.color} weight="900">{x.value}</Label><Label color={C.muted} size={10} weight="800" style={{ marginTop: 12 }}>{x.label}</Label>
      </Panel>)}
    </View>
    <Label color={C.muted} size={12} style={{ marginTop: 23, marginBottom: 9 }}>{levelProgress(profile.xp)}/100 XP para o próximo nível</Label>
    <ProgressBar value={levelProgress(profile.xp)} maximum={100} />
    <SectionTitle style={{ marginTop: 33 }}>CONQUISTAS</SectionTitle>
    <View style={{ flexDirection: 'row', gap: 9 }}>
      {[{ symbol: '✓', name: 'PRIMEIRO PASSO', unlocked: total >= 1 }, { symbol: '✦', name: '3 LIÇÕES', unlocked: total >= 3 }, { symbol: '★', name: 'REVISOR', unlocked: profile.reviewedLessons.length >= 1 }].map(x => <Panel key={x.name} style={{ flex: 1, minHeight: 125, alignItems: 'center', justifyContent: 'center', padding: 7 }}>
        <View style={{ backgroundColor: x.unlocked ? C.elevated : C.outline, height: 46, width: 46, borderRadius: 26, justifyContent: 'center', alignItems: 'center' }}>
          <Label size={23} color={x.unlocked ? C.lime : C.muted}>{x.symbol}</Label></View>
        <Label size={9} weight="800" color={x.unlocked ? C.mint : C.muted} style={{ textAlign: 'center', marginTop: 15 }}>{x.name}</Label>
      </Panel>)}
    </View>
    <View style={{ marginTop: 27, gap: 11 }}>
      <Action title="REINICIAR PROGRESSO" variant="outline" onPress={() => Alert.alert('Reiniciar progresso?', 'As lições, XP, gems e ofensiva serão zerados no banco de dados desta conta.', [
        { text: 'Cancelar', style: 'cancel' }, { text: 'Reiniciar', style: 'destructive', onPress: onReset },
      ])} />
      <Action title="SAIR DA CONTA" variant="secondary" onPress={() => Alert.alert('Sair do CodeQuest?', 'Sua conta continuará salva. Você poderá entrar novamente com e-mail e senha.', [
        { text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: onLogout },
      ])} />
    </View>
  </Page>;
}

export function PremiumScreen() {
  const plans = [
    { name: 'Super Dev', tag: 'ESSENCIAL', color: C.cyan, benefit: 'Sem anúncios · Energia ilimitada' },
    { name: 'Super Deus Dev', tag: 'MAIS POPULAR', color: C.lime, benefit: 'Benefícios anteriores · XP bônus' },
    { name: 'Ultra Instinto Dev', tag: 'COMPLETO', color: C.gold, benefit: 'Todas as vantagens em um plano' },
  ];
  return <Page>
    <Label color={C.lime} size={12} weight="900">CODEQUEST PREMIUM</Label>
    <Label size={31} weight="900" style={{ marginTop: 17, lineHeight: 38 }}>Mais poder para{ '\n' }sua evolução.</Label>
    <Label size={13} color={C.muted} style={{ marginTop: 9, marginBottom: 26 }}>Uma experiência sem interrupções.</Label>
    <Panel style={{ backgroundColor: C.elevated, marginBottom: 27 }}>
      <Label size={12} color={C.gold} weight="900">✦ MAIS FOCO, MAIS PROGRESSO</Label><Label style={{ marginTop: 14 }} weight="800" size={18}>Escolha como quer evoluir.</Label>
    </Panel>
    <SectionTitle>COMPARE OS PLANOS</SectionTitle>
    {plans.map(plan => <Pressable key={plan.name} onPress={() => Alert.alert('Plano demonstrativo', 'Esta é somente uma prévia do plano. Nenhum pagamento é realizado.')}
      accessibilityRole="button">
      <Panel style={[s.plan, plan.tag === 'MAIS POPULAR' && { borderWidth: 1, borderColor: C.lime, backgroundColor: C.elevated }]}>
        <View style={[s.planIcon, { borderColor: plan.color }]}><Label color={plan.color} size={23}>✦</Label></View>
        <View style={{ flex: 1 }}><Label weight="800" size={17}>{plan.name}</Label><Label color={C.muted} size={11} style={{ marginTop: 7, lineHeight: 16 }}>{plan.benefit}</Label>
          <Pill label={plan.tag} color={plan.color} style={{ marginTop: 12 }} /></View><Label size={20} color={plan.color}>›</Label>
      </Panel></Pressable>)}
    <Label color={C.muted} size={12} style={{ marginTop: 15, lineHeight: 19 }}>Planos ilustrativos, sem preços, cobranças ou assinaturas ativas.</Label>
  </Page>;
}

const s = StyleSheet.create({
  avatar: { width: 46, height: 46, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  robotAvatar: { height: 100, width: 100, borderRadius: 56, backgroundColor: C.mint, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 14, minHeight: 125 },
  planIcon: { width: 47, height: 47, alignItems: 'center', justifyContent: 'center', borderRadius: 25, borderWidth: 1 },
});
