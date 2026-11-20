import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { C } from '../theme';

export const Label = ({ children, style, color = C.white, size = 14, weight = '400', ...props }) => (
  <Text {...props} style={[{ color, fontSize: size, fontWeight: weight, includeFontPadding: false }, style]}>{children}</Text>
);

export function Page({ children, style, contentStyle, scroll = true }) {
  const base = [styles.page, style];
  if (!scroll) return <View style={base}>{children}</View>;
  return <ScrollView style={base} contentContainerStyle={[styles.pageContent, contentStyle]}
    showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
}

export function Panel({ children, style, ...props }) {
  return <View {...props} style={[styles.panel, style]}>{children}</View>;
}

export function Action({ title, onPress, variant = 'primary', disabled = false, style, compact = false, accessibilityLabel }) {
  const primary = variant === 'primary';
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
    accessibilityLabel={accessibilityLabel || title}
    style={({ pressed }) => [styles.action, compact && { minHeight: 44 },
      primary ? styles.actionPrimary : variant === 'outline' ? styles.actionOutline : styles.actionSecondary,
      disabled && { opacity: 0.45 }, pressed && !disabled && { opacity: 0.78, transform: [{ scale: 0.99 }] }, style]}>
    <Label color={primary ? C.ink : C.white} size={14} weight="800" style={{ textAlign: 'center' }}>{title}</Label>
  </Pressable>;
}

export function ProgressBar({ value, maximum = 100, color = C.lime, style, height = 9 }) {
  const percentage = maximum > 0 ? Math.min(100, Math.max(0, value / maximum * 100)) : 0;
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: maximum, now: value }}
    style={[{ width: '100%', height, borderRadius: 20, backgroundColor: C.outline, overflow: 'hidden' }, style]}>
    <View style={{ width: `${percentage}%`, height: '100%', borderRadius: 20, backgroundColor: color }} />
  </View>;
}

export function Pill({ label, color = C.lime, style }) {
  return <View style={[styles.pill, style]}><Label size={10} weight="800" color={color}>{label}</Label></View>;
}

export function SectionTitle({ children, side, onSidePress, style }) {
  return <View style={[styles.section, style]}>
    <Label size={12} weight="800">{children}</Label>
    {side && <Pressable onPress={onSidePress} accessibilityRole="button"><Label size={11} weight="700" color={C.lime}>{side}</Label></Pressable>}
  </View>;
}

export function Back({ title = 'VOLTAR', onPress }) {
  return <Pressable style={styles.back} onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
    <Label size={18} weight="700" color={C.mint}>‹</Label><Label size={12} weight="800" color={C.mint}>{title}</Label>
  </Pressable>;
}

export function Byte({ size = 90 }) {
  const k = size / 100;
  const rect = (x, y, w, h, bg, radius = 8) => ({ position: 'absolute', left: x*k, top: y*k, width: w*k, height: h*k, backgroundColor: bg, borderRadius: radius*k });
  return <View accessible accessibilityLabel="Byte, mascote robô do CodeQuest" style={{ width: size, height: 114*k }}>
    <View style={rect(47, 0, 5, 15, C.mint, 2)} /><View style={rect(43, -2, 13, 13, C.lime, 10)} />
    <View style={rect(7, 34, 17, 30, C.mint, 9)} /><View style={rect(76, 34, 17, 30, C.mint, 9)} />
    <View style={rect(26, 71, 48, 37, C.mint, 14)} />
    <View style={rect(13, 17, 74, 65, C.mint, 20)} />
    <View style={rect(19, 24, 62, 49, C.ink, 14)} />
    <View style={rect(31, 41, 15, 5, C.cyan, 4)} /><View style={rect(56, 41, 15, 5, C.cyan, 4)} />
    <View style={rect(45, 58, 12, 4, C.lime, 3)} />
    <View style={rect(42, 88, 17, 17, C.cyan, 12)} /><View style={rect(46, 91, 10, 10, C.lime, 9)} />
    <View style={rect(32, 104, 13, 7, C.cyan, 5)} /><View style={rect(58, 104, 13, 7, C.cyan, 5)} />
  </View>;
}

const tabs = [
  { key: 'home', name: 'Aprender', icon: '⌂' },
  { key: 'premium', name: 'Premium', icon: '✧' },
  { key: 'missions', name: 'Missões', icon: '▣' },
  { key: 'social', name: 'Social', icon: '♧' },
  { key: 'profile', name: 'Perfil', icon: '◉' },
];

export function BottomNav({ active, navigate, insetBottom = 0 }) {
  return <View style={[styles.bottomNav, { paddingBottom: Math.max(insetBottom, 9) }]}>
    {tabs.map(tab => <Pressable key={tab.key} onPress={() => navigate(tab.key)} accessibilityRole="tab"
      accessibilityState={{ selected: active === tab.key }} accessibilityLabel={tab.name}
      style={styles.navItem}>
      <View style={[styles.navSymbol, active === tab.key && styles.navActive]}>
        <Label size={25} weight="700" color={active === tab.key ? C.lime : C.muted}>{tab.icon}</Label>
      </View>
      <Label size={10} weight={active === tab.key ? '800' : '500'} color={active === tab.key ? C.lime : C.muted}>{tab.name}</Label>
    </Pressable>)}
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  pageContent: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 32 },
  panel: { borderRadius: 22, backgroundColor: C.surface, padding: 18 },
  action: { minHeight: 54, paddingHorizontal: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionPrimary: { backgroundColor: C.lime }, actionSecondary: { backgroundColor: C.elevated },
  actionOutline: { borderWidth: 1, borderColor: C.outline, backgroundColor: C.surface },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 11, backgroundColor: C.elevated, alignSelf: 'flex-start' },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: 24 },
  bottomNav: { flexDirection: 'row', borderTopWidth: 1, borderColor: C.outline, backgroundColor: C.surface, paddingTop: 8 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 57, gap: 1 },
  navSymbol: { width: 35, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  navActive: { backgroundColor: C.elevated },
});
