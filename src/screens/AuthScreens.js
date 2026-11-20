import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { C } from '../theme';
import { Page, Label, Panel, Byte, Action, Back, Pill } from '../components/UI';

function AuthField({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default', autoCapitalize = 'sentences', accessibilityLabel, textContentType }) {
  return <View style={s.fieldWrap}>
    <Label size={11} weight="800" color={C.mint} style={s.fieldLabel}>{label}</Label>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      style={s.input}
      placeholder={placeholder}
      placeholderTextColor={C.muted}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
      maxLength={secureTextEntry ? 128 : 254}
      accessibilityLabel={accessibilityLabel || label}
      textContentType={textContentType}
      returnKeyType="next"
    />
  </View>;
}

function ErrorNotice({ message }) {
  if (!message) return null;
  return <View accessibilityRole="alert" style={s.errorBox}>
    <Label color={C.coral} weight="700" size={12} style={{ lineHeight: 18 }}>{message}</Label>
  </View>;
}

function InlineLink({ children, onPress }) {
  return <Pressable onPress={onPress} accessibilityRole="button" style={s.linkButton}>
    <Label color={C.lime} weight="800" size={13}>{children}</Label>
  </Pressable>;
}

export function WelcomeScreen({ onStart, onLogin }) {
  return <Page contentStyle={s.welcomeContent}>
    <View style={s.brand}><View style={s.brandLogo}><Label color={C.ink} size={19} weight="900">{'</>'}</Label></View><Label size={22} weight="900">CODEQUEST</Label></View>
    <Pill label="APRENDA PROGRAMAÇÃO JOGANDO" />
    <View style={s.hero}>
      <View style={s.heroGlow} /><Byte size={155} />
      <View style={s.bubble}><Label color={C.mint} weight="700" size={13}>Olá! Bora codar?</Label></View>
    </View>
    <Label size={36} weight="900" style={s.title}>Aprenda código.{ '\n' }Viva a aventura.</Label>
    <Label size={15} color={C.muted} style={s.description}>Lições rápidas, desafios práticos e recompensas a cada conquista.</Label>
    <View style={s.pills}><Pill label="✦  LIÇÕES CURTAS" color={C.mint} /><Pill label="◆  XP E MISSÕES" color={C.mint} /></View>
    <Panel style={s.realAccountCard}>
      <Label color={C.lime} weight="800" size={12}>CONTA CODEQUEST</Label>
      <Label color={C.muted} style={{ marginTop: 6, lineHeight: 19 }} size={12}>Crie sua conta e mantenha seu perfil e progresso registrados no banco de dados.</Label>
    </Panel>
    <Action title="CRIAR MINHA CONTA  →" onPress={onStart} style={{ marginBottom: 12 }} />
    <Action title="JÁ TENHO UMA CONTA" onPress={onLogin} variant="outline" />
    <Label color={C.muted} size={11} style={{ textAlign: 'center', marginTop: 22 }}>Uma missão por vez. No seu ritmo.</Label>
  </Page>;
}

export function RegisterScreen({ onRegister, onBack, onLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    if (password.length < 8) { setError('A senha precisa ter pelo menos 8 caracteres.'); return; }
    try {
      setLoading(true);
      await onRegister({ username, email, password });
    } catch (e) {
      setError(e.message || 'Não foi possível criar sua conta.');
    } finally {
      setLoading(false);
    }
  };

  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <Page contentStyle={s.authContent}>
      <Back onPress={onBack} />
      <View style={[s.brandLogo, { marginBottom: 20 }]}><Label color={C.ink} size={19} weight="900">{'</>'}</Label></View>
      <Label size={31} weight="900">Comece sua jornada.</Label>
      <Label color={C.muted} style={{ marginTop: 9, marginBottom: 24, lineHeight: 20 }}>Crie sua conta para salvar seus dados no CodeQuest.</Label>
      <AuthField label="NOME DE USUÁRIO" value={username} onChangeText={setUsername} placeholder="Como devemos te chamar?" accessibilityLabel="Nome de usuário" />
      <AuthField label="E-MAIL" value={email} onChangeText={setEmail} placeholder="voce@exemplo.com" keyboardType="email-address" autoCapitalize="none" accessibilityLabel="E-mail" textContentType="emailAddress" />
      <AuthField label="SENHA" value={password} onChangeText={setPassword} placeholder="Pelo menos 8 caracteres" secureTextEntry accessibilityLabel="Senha" textContentType="newPassword" />
      <AuthField label="CONFIRMAR SENHA" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Digite a senha novamente" secureTextEntry accessibilityLabel="Confirmar senha" textContentType="newPassword" />
      <Label color={C.muted} size={11} style={{ marginTop: -3, marginBottom: 16 }}>Use de 8 a 128 caracteres. Não utilize uma senha pessoal importante nesta demonstração local.</Label>
      <ErrorNotice message={error} />
      <Action title={loading ? 'CRIANDO CONTA...' : 'CRIAR CONTA  →'} onPress={submit} disabled={loading || !username.trim() || !email.trim() || !password || !confirmPassword} style={{ marginTop: 8 }} />
      <View style={s.switchAuth}><Label color={C.muted} size={13}>Já possui uma conta?</Label><InlineLink onPress={onLogin}>Entrar</InlineLink></View>
    </Page>
  </KeyboardAvoidingView>;
}

export function LoginScreen({ onLogin, onBack, onRegister, initialError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError || '');

  const submit = async () => {
    setError('');
    try {
      setLoading(true);
      await onLogin({ email, password });
    } catch (e) {
      setError(e.message || 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <Page contentStyle={s.authContent}>
      <Back onPress={onBack} />
      <View style={[s.brandLogo, { marginBottom: 23 }]}><Label color={C.ink} size={19} weight="900">{'</>'}</Label></View>
      <Label size={32} weight="900">Que bom ter você{ '\n' }de volta.</Label>
      <Label color={C.muted} style={{ marginTop: 9, marginBottom: 30 }}>Entre para continuar sua jornada.</Label>
      <AuthField label="E-MAIL" value={email} onChangeText={setEmail} placeholder="voce@exemplo.com" keyboardType="email-address" autoCapitalize="none" accessibilityLabel="E-mail" textContentType="emailAddress" />
      <AuthField label="SENHA" value={password} onChangeText={setPassword} placeholder="Sua senha" secureTextEntry accessibilityLabel="Senha" textContentType="password" />
      <ErrorNotice message={error} />
      <Action title={loading ? 'VALIDANDO...' : 'ENTRAR NO CODEQUEST  →'} onPress={submit} disabled={loading || !email.trim() || !password} style={{ marginTop: 9 }} />
      <View style={s.switchAuth}><Label color={C.muted} size={13}>Ainda não tem conta?</Label><InlineLink onPress={onRegister}>Cadastre-se</InlineLink></View>
      <Panel style={{ marginTop: 22 }}>
        <Label color={C.lime} weight="800" size={12}>ACESSO COM BANCO DE DADOS</Label>
        <Label color={C.muted} style={{ marginTop: 6, lineHeight: 19 }} size={12}>O e-mail e a senha são validados pela API do CodeQuest. O token de sessão fica salvo com armazenamento seguro no aparelho.</Label>
      </Panel>
    </Page>
  </KeyboardAvoidingView>;
}

const s = StyleSheet.create({
  welcomeContent: { flexGrow: 1, justifyContent: 'center', paddingTop: 27, paddingBottom: 22 },
  authContent: { flexGrow: 1, paddingTop: 17, paddingBottom: 34 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 30 },
  brandLogo: { width: 54, height: 54, borderRadius: 15, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  hero: { height: 235, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 11 },
  heroGlow: { position: 'absolute', backgroundColor: C.elevated, width: 206, height: 206, borderRadius: 110 },
  bubble: { position: 'absolute', right: 0, top: 30, backgroundColor: C.elevated, borderRadius: 15, padding: 12 },
  title: { lineHeight: 44, letterSpacing: -0.8 },
  description: { lineHeight: 22, marginTop: 14 },
  pills: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 23, marginBottom: 19, gap: 8 },
  realAccountCard: { marginBottom: 18, padding: 14 },
  fieldWrap: { marginBottom: 17 },
  fieldLabel: { marginBottom: 10 },
  input: { color: C.white, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.outline, paddingHorizontal: 18, minHeight: 58, fontSize: 16 },
  errorBox: { borderWidth: 1, borderColor: '#8f455d', backgroundColor: C.errorBg, borderRadius: 13, padding: 12, marginTop: 2, marginBottom: 11 },
  switchAuth: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, marginTop: 22 },
  linkButton: { paddingVertical: 8, paddingHorizontal: 3 },
});
