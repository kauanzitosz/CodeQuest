import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert, AppState, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { C } from './src/theme';
import { LESSONS } from './src/data/lessons';
import { BottomNav, Label } from './src/components/UI';
import { WelcomeScreen, LoginScreen, RegisterScreen } from './src/screens/AuthScreens';
import { HomeScreen, UnitScreen, MissionsScreen } from './src/screens/DashboardScreens';
import { QuizScreen, ResultScreen, ReviewDoneScreen } from './src/screens/LearningScreens';
import { SocialScreen, ProfileScreen, PremiumScreen } from './src/screens/ExtrasScreens';
import { createProfile, normaliseDay, completeLesson, completeReview, isLessonUnlocked } from './src/logic/progress';
import { authApi } from './src/services/api';

const TOKEN_KEY = 'codequest.auth.token.v1';
const tabs = ['home', 'missions', 'social', 'premium', 'profile'];

function Application() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(createProfile());
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [startupError, setStartupError] = useState('');
  const [screen, setScreen] = useState('welcome');
  const [quiz, setQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [review, setReview] = useState(null);
  const [reviewBonus, setReviewBonus] = useState(0);
  const [liked, setLiked] = useState([]);

  // Recupera a sessão no servidor. O token fica no armazenamento seguro do aparelho.
  useEffect(() => {
    let live = true;
    const restoreSession = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (savedToken) {
          try {
            const data = await authApi.me(savedToken);
            if (!live) return;
            const restoredProfile = normaliseDay(data.profile);
            setAuthToken(savedToken);
            setUser(data.user);
            setProfile(restoredProfile);
            setScreen('home');
            if (JSON.stringify(restoredProfile) !== JSON.stringify(data.profile)) {
              authApi.updateProfile(savedToken, restoredProfile).catch(() => {});
            }
          } catch (error) {
            if (!live) return;
            if (error.status === 401) {
              await SecureStore.deleteItemAsync(TOKEN_KEY);
              setScreen('welcome');
            } else {
              setStartupError('Não foi possível validar sua sessão porque a API está indisponível. Ligue o servidor do CodeQuest e tente entrar novamente.');
              setScreen('login');
            }
          }
        }
      } catch {
        if (live) setStartupError('Não foi possível acessar o armazenamento seguro da sessão.');
      } finally {
        if (live) setReady(true);
      }
    };
    restoreSession();
    return () => { live = false; };
  }, []);

  const applyAuthentication = async (data) => {
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    const nextProfile = normaliseDay(data.profile);
    setAuthToken(data.token);
    setUser(data.user);
    setProfile(nextProfile);
    setStartupError('');
    setQuiz(null);
    setResult(null);
    setReview(null);
    setScreen('home');
    if (JSON.stringify(nextProfile) !== JSON.stringify(data.profile)) {
      authApi.updateProfile(data.token, nextProfile).catch(() => {});
    }
  };

  const handleRegister = async (payload) => {
    const data = await authApi.register(payload);
    await applyAuthentication(data);
  };

  const handleLogin = async (payload) => {
    const data = await authApi.login(payload);
    await applyAuthentication(data);
  };

  const handleLogout = async () => {
    const token = authToken;
    try { if (token) await authApi.logout(token); } catch { /* O logout local continua mesmo sem rede. */ }
    try { await SecureStore.deleteItemAsync(TOKEN_KEY); } catch { /* A sessão é removida do estado mesmo se houver falha local. */ }
    setAuthToken(null);
    setUser(null);
    setProfile(createProfile());
    setQuiz(null);
    setResult(null);
    setReview(null);
    setScreen('welcome');
  };

  const saveProfile = async (nextProfile) => {
    setProfile(nextProfile);
    if (!authToken) return;
    try {
      await authApi.updateProfile(authToken, nextProfile);
    } catch (error) {
      Alert.alert('Progresso não sincronizado', `${error.message}\n\nConfira a conexão com a API. O progresso continua nesta sessão, mas pode não estar salvo no banco.`);
    }
  };

  const resetProgress = async () => {
    const freshProfile = createProfile(user?.username || 'Dev');
    await saveProfile(freshProfile);
  };

  // Quando o app volta ao primeiro plano, atualiza os indicadores do novo dia.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') setProfile(current => normaliseDay(current));
    });
    return () => subscription.remove();
  }, []);

  const go = useCallback((destination) => {
    setScreen(destination);
  }, []);

  const startLesson = (index) => {
    if (!isLessonUnlocked(profile.completedLessons, index, LESSONS)) {
      Alert.alert('Lição bloqueada', 'Conclua a lição anterior para desbloquear esta etapa.');
      return;
    }
    setQuiz({ lessonIndex: index, index: 0, answers: [], selected: null, checked: false, lives: 5 });
    setReview(null);
    setScreen('quiz');
  };

  const answer = (choice) => setQuiz(current => current && !current.checked ? { ...current, selected: choice } : current);
  const checkAnswer = () => setQuiz(current => {
    if (!current || current.checked || current.selected === null) return current;
    const q = LESSONS[current.lessonIndex].questions[current.index];
    const correct = current.selected === q.correctIndex;
    return { ...current, checked: true, answers: [...current.answers, { index: current.index, correct }], lives: Math.max(0, current.lives - (correct ? 0 : 1)) };
  });

  const advanceQuestion = () => {
    if (!quiz?.checked) return;
    const lesson = LESSONS[quiz.lessonIndex];
    if (quiz.index + 1 < lesson.questions.length) {
      setQuiz(current => ({ ...current, index: current.index + 1, selected: null, checked: false }));
      return;
    }
    const correct = quiz.answers.filter(item => item.correct).length;
    const awarded = completeLesson(profile, lesson.id, correct, lesson.questions.length);
    setProfile(awarded.profile);
    authApi.updateProfile(authToken, awarded.profile).catch(error => {
      Alert.alert('Progresso não sincronizado', `A lição foi concluída nesta sessão, mas o banco não confirmou a gravação. ${error.message}`);
    });
    setResult({ lesson, correct, total: lesson.questions.length, xpEarned: awarded.xpEarned,
      gemsEarned: awarded.gemsEarned, alreadyCompleted: awarded.alreadyCompleted,
      wrongIndices: quiz.answers.filter(item => !item.correct).map(item => item.index) });
    setQuiz(null);
    setScreen('result');
  };

  const beginReview = () => {
    if (!result?.wrongIndices?.length) return;
    setReview({ indices: result.wrongIndices, cursor: 0, checked: false, selected: null });
    setScreen('review');
  };

  const nextReview = () => {
    if (!review?.checked || !result) return;
    if (review.cursor < review.indices.length - 1) {
      setReview(current => ({ ...current, cursor: current.cursor + 1, checked: false, selected: null }));
    } else {
      const reward = completeReview(profile, result.lesson.id);
      setProfile(reward.profile);
      authApi.updateProfile(authToken, reward.profile).catch(error => {
        Alert.alert('Progresso não sincronizado', `A revisão terminou, mas o banco não confirmou a gravação. ${error.message}`);
      });
      setReviewBonus(reward.xpEarned);
      setScreen('reviewDone');
    }
  };

  if (!ready) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={C.lime} /><Label color={C.muted} style={{ marginTop: 18 }}>Conferindo sua conta...</Label></View>;
  }

  let content;
  switch (screen) {
    case 'welcome': content = <WelcomeScreen onStart={() => go('register')} onLogin={() => go('login')} />; break;
    case 'register': content = <RegisterScreen onBack={() => go('welcome')} onLogin={() => go('login')} onRegister={handleRegister} />; break;
    case 'login': content = <LoginScreen initialError={startupError} onBack={() => go('welcome')} onRegister={() => go('register')} onLogin={handleLogin} />; break;
    case 'home': content = <HomeScreen profile={profile} openUnit={() => go('unit')} startLesson={startLesson} />; break;
    case 'unit': content = <UnitScreen profile={profile} onBack={() => go('home')} startLesson={startLesson} />; break;
    case 'missions': content = <MissionsScreen profile={profile} />; break;
    case 'premium': content = <PremiumScreen />; break;
    case 'social': content = <SocialScreen liked={liked} toggleLike={id => setLiked(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id])} />; break;
    case 'profile': content = <ProfileScreen profile={profile} user={user} onReset={resetProgress} onLogout={handleLogout} />; break;
    case 'quiz': {
      const lesson = LESSONS[quiz.lessonIndex];
      content = <QuizScreen lesson={lesson} index={quiz.index} total={lesson.questions.length}
        selected={quiz.selected} checked={quiz.checked} onSelect={answer} onCheck={checkAnswer}
        onNext={advanceQuestion} onQuit={() => { setQuiz(null); go('unit'); }} lives={quiz.lives} />;
      break;
    }
    case 'result': content = <ResultScreen result={result} onReview={beginReview} onHome={() => go('home')}
      onRetry={() => startLesson(LESSONS.findIndex(l => l.id === result.lesson.id))} />; break;
    case 'review': {
      const questions = review.indices.map(index => result.lesson.questions[index]);
      const reviewLesson = { ...result.lesson, questions };
      content = <QuizScreen lesson={reviewLesson} index={review.cursor} total={questions.length} isReview
        selected={review.selected} checked={review.checked}
        onSelect={i => setReview(s => s && !s.checked ? { ...s, selected: i } : s)}
        onCheck={() => setReview(s => s && s.selected !== null ? { ...s, checked: true } : s)}
        onNext={nextReview} onQuit={() => go('result')} />;
      break;
    }
    case 'reviewDone': content = <ReviewDoneScreen onBack={() => go('home')} xpEarned={reviewBonus} count={review?.indices.length || 0} />; break;
    default: content = <WelcomeScreen onStart={() => go('register')} onLogin={() => go('login')} />;
  }

  return <View style={[styles.root, { paddingTop: insets.top }]}> 
    <StatusBar style="light" backgroundColor={C.bg} />
    <View style={{ flex: 1 }}>{content}</View>
    {tabs.includes(screen) && <BottomNav active={screen} navigate={go} insetBottom={insets.bottom} />}
    {!tabs.includes(screen) && <View style={{ height: Math.max(insets.bottom, 4), backgroundColor: C.bg }} />}
  </View>;
}

export default function App() { return <SafeAreaProvider><Application /></SafeAreaProvider>; }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loading: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
});
