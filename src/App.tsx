import React, { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";

// ─── Профиль: хранилище ──────────────────────────────────────────
interface UserProfile {
  name: string;
  avatarColor: string;
  notifications: boolean;
}

interface TestRecord {
  testId: number;
  testTitle: string;
  correct: number;
  total: number;
  date: string;
}

const AVATAR_COLORS = [
  "from-indigo-400 to-violet-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-blue-400 to-cyan-500",
  "from-purple-400 to-fuchsia-500",
];

function loadProfile(): UserProfile {
  try {
    const s = localStorage.getItem("math_profile");
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return { name: "Игрок", avatarColor: AVATAR_COLORS[0], notifications: true };
}

function saveProfile(p: UserProfile) {
  localStorage.setItem("math_profile", JSON.stringify(p));
}

function loadRecords(): TestRecord[] {
  try {
    const s = localStorage.getItem("math_records");
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return [];
}

function saveRecords(r: TestRecord[]) {
  localStorage.setItem("math_records", JSON.stringify(r));
}

function calcXP(records: TestRecord[]) {
  return records.reduce((sum, r) => sum + r.correct * 10 + 5, 0);
}

function calcLevel(xp: number) {
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const titles = ["", "Новичок", "Ученик", "Знаток", "Мастер", "Эксперт", "Профессор"];
  const title = titles[Math.min(level, titles.length - 1)] ?? "Легенда";
  return { level, xpInLevel, title };
}

function calcAccuracy(records: TestRecord[]) {
  if (!records.length) return 0;
  const c = records.reduce((s, r) => s + r.correct, 0);
  const t = records.reduce((s, r) => s + r.total, 0);
  return t ? Math.round((c / t) * 100) : 0;
}

type Page = "home" | "tests" | "quiz" | "stats" | "levels" | "profile" | "level-quiz";

// ─── данные тестов ───────────────────────────────────────────────
interface Question {
  text: string;
  options: string[];
  correct: number;
}

interface TestDef {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  difficulty: "Лёгкий" | "Средний" | "Сложный";
  time: number; // секунд на вопрос
  questions: Question[];
}

const TESTS: TestDef[] = [
  {
    id: 1,
    title: "Сложение до 100",
    subtitle: "Тренируй быстрый счёт",
    icon: "Plus",
    color: "bg-blue-50 border-blue-100",
    gradient: "from-blue-400 to-indigo-500",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    difficulty: "Лёгкий",
    time: 15,
    questions: [
      { text: "34 + 47 = ?", options: ["71", "81", "91", "61"], correct: 1 },
      { text: "56 + 28 = ?", options: ["74", "84", "94", "64"], correct: 1 },
      { text: "15 + 79 = ?", options: ["84", "94", "74", "89"], correct: 1 },
      { text: "63 + 19 = ?", options: ["72", "82", "92", "62"], correct: 1 },
      { text: "27 + 46 = ?", options: ["63", "73", "83", "53"], correct: 1 },
      { text: "44 + 38 = ?", options: ["72", "82", "62", "92"], correct: 1 },
      { text: "71 + 16 = ?", options: ["77", "87", "97", "67"], correct: 1 },
      { text: "32 + 55 = ?", options: ["87", "77", "97", "67"], correct: 0 },
    ],
  },
  {
    id: 2,
    title: "Таблица умножения",
    subtitle: "Знай наизусть",
    icon: "X",
    color: "bg-emerald-50 border-emerald-100",
    gradient: "from-emerald-400 to-teal-500",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    difficulty: "Средний",
    time: 12,
    questions: [
      { text: "7 × 8 = ?", options: ["54", "56", "48", "63"], correct: 1 },
      { text: "9 × 6 = ?", options: ["45", "54", "56", "63"], correct: 1 },
      { text: "8 × 7 = ?", options: ["48", "54", "56", "64"], correct: 2 },
      { text: "6 × 9 = ?", options: ["54", "56", "63", "45"], correct: 0 },
      { text: "7 × 7 = ?", options: ["42", "49", "56", "48"], correct: 1 },
      { text: "8 × 9 = ?", options: ["72", "63", "81", "64"], correct: 0 },
      { text: "6 × 7 = ?", options: ["36", "42", "48", "54"], correct: 1 },
    ],
  },
  {
    id: 3,
    title: "Вычитание",
    subtitle: "Быстро и точно",
    icon: "Minus",
    color: "bg-amber-50 border-amber-100",
    gradient: "from-amber-400 to-orange-500",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    difficulty: "Лёгкий",
    time: 15,
    questions: [
      { text: "83 − 47 = ?", options: ["36", "46", "26", "56"], correct: 0 },
      { text: "100 − 63 = ?", options: ["27", "37", "47", "57"], correct: 1 },
      { text: "75 − 28 = ?", options: ["57", "47", "37", "67"], correct: 1 },
      { text: "64 − 19 = ?", options: ["35", "45", "55", "25"], correct: 1 },
      { text: "91 − 35 = ?", options: ["56", "46", "66", "76"], correct: 0 },
      { text: "50 − 17 = ?", options: ["23", "33", "43", "13"], correct: 1 },
    ],
  },
  {
    id: 4,
    title: "Скорость счёта",
    subtitle: "Успей за 8 секунд!",
    icon: "Zap",
    color: "bg-rose-50 border-rose-100",
    gradient: "from-rose-400 to-pink-500",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-700",
    difficulty: "Сложный",
    time: 8,
    questions: [
      { text: "12 × 5 = ?", options: ["50", "60", "70", "55"], correct: 1 },
      { text: "144 ÷ 12 = ?", options: ["11", "12", "13", "14"], correct: 1 },
      { text: "25 × 4 = ?", options: ["80", "90", "100", "110"], correct: 2 },
      { text: "81 ÷ 9 = ?", options: ["7", "8", "9", "10"], correct: 2 },
      { text: "15 × 6 = ?", options: ["80", "85", "90", "95"], correct: 2 },
      { text: "48 ÷ 6 = ?", options: ["6", "7", "8", "9"], correct: 2 },
      { text: "7 × 13 = ?", options: ["81", "91", "71", "84"], correct: 1 },
      { text: "132 ÷ 11 = ?", options: ["10", "11", "12", "13"], correct: 2 },
    ],
  },
];

const ACHIEVEMENTS = [
  { id: 1, icon: "⚡", title: "Молния", desc: "10 задач за 5 минут", earned: true },
  { id: 2, icon: "🎯", title: "Снайпер", desc: "5 подряд без ошибок", earned: true },
  { id: 3, icon: "🔥", title: "7 дней", desc: "Заходи 7 дней подряд", earned: false },
  { id: 4, icon: "🏆", title: "Чемпион", desc: "Пройди 50 тестов", earned: false },
  { id: 5, icon: "🌟", title: "Звезда", desc: "100% в тесте", earned: true },
  { id: 6, icon: "🧮", title: "Мастер", desc: "Реши 500 примеров", earned: false },
];

const WEEK = [
  { day: "Пн", val: 14, max: 16 },
  { day: "Вт", val: 8, max: 10 },
  { day: "Ср", val: 20, max: 22 },
  { day: "Чт", val: 5, max: 8 },
  { day: "Пт", val: 18, max: 20 },
  { day: "Сб", val: 12, max: 15 },
  { day: "Вс", val: 0, max: 0 },
];

// ─── Quiz (экран теста) ──────────────────────────────────────────
interface QuizResult { correct: number; total: number; }

function QuizPage({
  test,
  onFinish,
  onBack,
}: {
  test: TestDef;
  onFinish: (r: QuizResult) => void;
  onBack: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(test.time);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const q = test.questions[idx];
  const total = test.questions.length;

  const next = useCallback(
    (choice: number | null) => {
      const isCorrect = choice === q.correct;
      const newCorrect = correct + (isCorrect ? 1 : 0);
      const newAnswers = [...answers, choice];
      setAnswers(newAnswers);

      if (idx + 1 >= total) {
        setDone(true);
        onFinish({ correct: newCorrect, total });
      } else {
        setCorrect(newCorrect);
        setIdx(idx + 1);
        setSelected(null);
        setTimeLeft(test.time);
      }
    },
    [idx, q, correct, answers, total, test.time, onFinish]
  );

  useEffect(() => {
    if (done || selected !== null) return;
    if (timeLeft <= 0) { next(null); return; }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, selected, done, next]);

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    setTimeout(() => next(i), 600);
  };

  if (done) {
    const pct = Math.round((correct / total) * 100);
    const emoji = pct >= 90 ? "🏆" : pct >= 70 ? "🌟" : pct >= 50 ? "👍" : "📚";
    return (
      <div className="animate-pop flex flex-col items-center text-center px-2 pt-8 gap-5">
        <div className="text-7xl">{emoji}</div>
        <div>
          <h2 className="text-2xl font-bold">
            {pct >= 90 ? "Отлично!" : pct >= 70 ? "Хорошо!" : pct >= 50 ? "Неплохо!" : "Продолжай стараться!"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">{test.title}</p>
        </div>
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${test.gradient} flex flex-col items-center justify-center text-white shadow-lg`}>
          <span className="text-4xl font-bold">{pct}%</span>
          <span className="text-sm opacity-80">{correct}/{total}</span>
        </div>
        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { label: "Верно", value: correct, icon: "CheckCircle", color: "text-emerald-500" },
            { label: "Ошибок", value: total - correct, icon: "XCircle", color: "text-rose-500" },
            { label: "Очков", value: correct * 10, icon: "Star", color: "text-amber-500" },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl p-3 text-center">
              <Icon name={s.icon} size={18} className={`mx-auto mb-1 ${s.color}`} />
              <div className="font-bold text-lg">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="w-full flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-2xl border border-border font-semibold text-sm hover:bg-muted transition-colors"
          >
            К тестам
          </button>
          <button
            onClick={() => { setIdx(0); setSelected(null); setCorrect(0); setTimeLeft(test.time); setDone(false); setAnswers([]); }}
            className={`flex-1 py-3 rounded-2xl bg-gradient-to-r ${test.gradient} text-white font-semibold text-sm`}
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  const timerPct = (timeLeft / test.time) * 100;
  const timerColor = timerPct > 50 ? "bg-emerald-400" : timerPct > 25 ? "bg-amber-400" : "bg-rose-500";

  return (
    <div className="animate-slide-up space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <Icon name="ChevronLeft" size={18} className="text-muted-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium">{test.title}</p>
          <div className="flex gap-1 mt-1">
            {test.questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${i < idx ? `bg-gradient-to-r ${test.gradient}` : i === idx ? "bg-indigo-300" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{idx + 1}/{total}</span>
      </div>

      <div className="bg-white border border-border rounded-2xl p-3 flex items-center gap-2">
        <Icon name="Clock" size={14} className="text-muted-foreground" />
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${timerColor} transition-all duration-1000`} style={{ width: `${timerPct}%` }} />
        </div>
        <span className={`text-sm font-bold tabular-nums ${timeLeft <= 3 ? "text-rose-500" : "text-foreground"}`}>{timeLeft}с</span>
      </div>

      <div className={`${test.color} border rounded-3xl p-6 text-center`}>
        <p className="text-xs text-muted-foreground mb-3 font-medium">Вопрос {idx + 1}</p>
        <div className="font-cormorant text-5xl font-bold leading-tight">{q.text}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt, i) => {
          let cls = "bg-white border-2 border-border text-foreground";
          if (selected !== null) {
            if (i === q.correct) cls = "bg-emerald-50 border-emerald-400 text-emerald-700";
            else if (i === selected) cls = "bg-rose-50 border-rose-400 text-rose-700";
            else cls = "bg-white border-border text-muted-foreground opacity-60";
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={selected !== null}
              className={`${cls} rounded-2xl py-4 font-bold text-2xl transition-all active:scale-95 font-cormorant`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className={`animate-pop rounded-2xl px-4 py-3 flex items-center gap-2 ${selected === q.correct ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"}`}>
          <span className="text-xl">{selected === q.correct ? "✅" : "❌"}</span>
          <span className={`font-semibold text-sm ${selected === q.correct ? "text-emerald-700" : "text-rose-700"}`}>
            {selected === q.correct ? "Правильно!" : `Правильный ответ: ${q.options[q.correct]}`}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Главная ─────────────────────────────────────────────────────
function HomePage({
  setPage,
  startTest,
  startLevel,
  records,
}: {
  setPage: (p: Page) => void;
  startTest: (t: TestDef) => void;
  startLevel: (l: LevelDef) => void;
  records: TestRecord[];
}) {
  const profile = loadProfile();
  const xp = calcXP(records);
  const { level, xpInLevel, title } = calcLevel(xp);
  const accuracy = calcAccuracy(records);
  const streak = getStreak(records);
  const totalCorrect = records.reduce((s, r) => s + r.correct, 0);
  const hasData = records.length > 0;

  // Найти первый незавершённый уровень
  const nextLevel = LEVELS.find((lv) => {
    if (!isLevelUnlocked(lv.id, records)) return false;
    return getLevelProgress(lv.id, records) < 70;
  }) ?? LEVELS[0];

  const nextLevelProgress = getLevelProgress(nextLevel.id, records);

  // Достижения (аналогично ProfilePage)
  const earnedAchievements = ACHIEVEMENTS.filter((a) =>
    (a.id === 1 && records.length >= 1) ||
    (a.id === 2 && records.some((r) => r.correct / r.total === 1)) ||
    (a.id === 3 && records.length >= 10) ||
    (a.id === 4 && records.length >= 50) ||
    (a.id === 5 && records.some((r) => r.correct === r.total && r.total > 0)) ||
    (a.id === 6 && totalCorrect >= 500)
  );

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Доброе утро" : greetingHour < 18 ? "Добрый день" : "Добрый вечер";

  return (
    <div className="animate-fade-in space-y-5">

      {/* Hero-баннер */}
      <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full -translate-y-14 translate-x-14 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/10 rounded-full translate-y-10 -translate-x-10 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white/70 text-sm">{greeting}, {profile.name}! 👋</p>
            <div className="bg-white/20 rounded-xl px-2.5 py-1 text-xs font-semibold">
              Ур. {level} · {title}
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {hasData ? "Продолжаем учиться?" : "Начнём учиться?"}
          </h1>

          {/* XP прогресс */}
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold">{nextLevel.title}</span>
              <span className="text-sm text-white/80">{nextLevelProgress}%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${nextLevelProgress}%` }} />
            </div>
            <button
              onClick={() => startLevel(nextLevel)}
              className="w-full bg-white text-indigo-600 font-bold text-sm py-2.5 rounded-xl active:scale-95 transition-all"
            >
              {nextLevelProgress > 0 ? "Продолжить →" : "Начать →"}
            </button>
          </div>
        </div>
      </div>

      {/* Мини-статистика */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: hasData ? String(totalCorrect) : "0", l: "Задач", c: "text-indigo-600" },
          { v: hasData ? `${accuracy}%` : "—", l: "Точность", c: "text-emerald-600" },
          { v: streak > 0 ? `${streak}🔥` : "0", l: "Дней", c: "text-amber-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 text-center border border-border">
            <div className={`text-xl font-bold ${s.c}`}>{s.v}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {/* XP-бар */}
      <div className="bg-white border border-border rounded-2xl p-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-muted-foreground font-medium">Опыт (XP)</span>
          <span className="font-semibold text-indigo-600">{xpInLevel} / 100 до уровня {level + 1}</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full progress-bar" style={{ width: `${xpInLevel}%` }} />
        </div>
      </div>

      {/* Быстрые тесты */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Быстрые тесты</h2>
          <button onClick={() => setPage("tests")} className="text-sm text-indigo-500 font-medium">Все →</button>
        </div>
        <div className="space-y-2.5">
          {TESTS.slice(0, 3).map((t) => {
            const testRecords = records.filter((r) => r.testId === t.id);
            const best = testRecords.length
              ? Math.max(...testRecords.map((r) => Math.round((r.correct / r.total) * 100)))
              : null;
            return (
              <button
                key={t.id}
                onClick={() => startTest(t)}
                className={`w-full ${t.color} border rounded-2xl p-4 flex items-center gap-3 card-hover text-left`}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <Icon name={t.icon} size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.questions.length} вопр. · {t.time}с</div>
                </div>
                {best !== null ? (
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${best >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {best}%
                  </span>
                ) : (
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg ${t.badgeBg} ${t.badgeText}`}>{t.difficulty}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Уровни — продолжить */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Уровни</h2>
          <button onClick={() => setPage("levels")} className="text-sm text-indigo-500 font-medium">Все →</button>
        </div>
        <div className="space-y-2">
          {LEVELS.slice(0, 3).map((lv) => {
            const unlocked = isLevelUnlocked(lv.id, records);
            const prog = getLevelProgress(lv.id, records);
            const passed = prog >= 70;
            return (
              <button
                key={lv.id}
                onClick={() => unlocked && startLevel(lv)}
                disabled={!unlocked}
                className={`w-full bg-white border border-border rounded-2xl p-3.5 flex items-center gap-3 text-left transition-all ${unlocked ? "card-hover active:scale-[0.98]" : "opacity-40"}`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${lv.color} flex items-center justify-center flex-shrink-0 ${!unlocked ? "grayscale" : ""}`}>
                  {passed
                    ? <Icon name="CheckCircle" size={16} className="text-white" />
                    : unlocked
                      ? <Icon name={lv.icon} size={16} className="text-white" />
                      : <Icon name="Lock" size={14} className="text-white" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm">{lv.title}</span>
                    {passed && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">✓</span>}
                  </div>
                  {unlocked && prog > 0 && (
                    <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${lv.color}`} style={{ width: `${prog}%` }} />
                    </div>
                  )}
                  {!unlocked && <span className="text-[10px] text-muted-foreground">🔒 Заблокировано</span>}
                </div>
                {unlocked && (
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Достижения */}
      {earnedAchievements.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Достижения</h2>
            <button onClick={() => setPage("profile")} className="text-sm text-indigo-500 font-medium">Все →</button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {earnedAchievements.map((a, i) => (
              <div key={a.id} className="flex-shrink-0 bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center w-20 card-hover animate-pop" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="text-2xl mb-1">{a.icon}</div>
                <div className="text-[11px] font-semibold leading-tight">{a.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Пустое состояние — первый запуск */}
      {!hasData && (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5 text-center">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="font-bold mb-1">Добро пожаловать!</h3>
          <p className="text-sm text-muted-foreground mb-4">Пройди первый уровень или быстрый тест — статистика появится здесь</p>
          <button
            onClick={() => startLevel(LEVELS[0])}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl"
          >
            Начать обучение →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Тесты ───────────────────────────────────────────────────────
const DIFFICULTY_ORDER: Record<string, number> = { "Лёгкий": 0, "Средний": 1, "Сложный": 2 };
const DIFF_COLORS: Record<string, string> = {
  "Лёгкий": "bg-emerald-100 text-emerald-700",
  "Средний": "bg-amber-100 text-amber-700",
  "Сложный": "bg-rose-100 text-rose-700",
};

function TestsPage({ startTest, records }: { startTest: (t: TestDef) => void; records: TestRecord[] }) {
  const [filter, setFilter] = React.useState<"all" | "Лёгкий" | "Средний" | "Сложный">("all");
  const [sort, setSort] = React.useState<"default" | "best" | "attempts">("default");

  const getTestStats = (id: number) => {
    const recs = records.filter((r) => r.testId === id);
    if (!recs.length) return null;
    const best = Math.max(...recs.map((r) => Math.round((r.correct / r.total) * 100)));
    return { attempts: recs.length, best };
  };

  const filtered = TESTS.filter((t) => filter === "all" || t.difficulty === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "best") {
      const sa = getTestStats(a.id)?.best ?? -1;
      const sb = getTestStats(b.id)?.best ?? -1;
      return sb - sa;
    }
    if (sort === "attempts") {
      const sa = getTestStats(a.id)?.attempts ?? 0;
      const sb = getTestStats(b.id)?.attempts ?? 0;
      return sb - sa;
    }
    return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
  });

  const totalDone = TESTS.filter((t) => getTestStats(t.id)).length;
  const totalCorrectAll = records.reduce((s, r) => s + r.correct, 0);
  const totalAll = records.reduce((s, r) => s + r.total, 0);
  const overallAcc = totalAll ? Math.round((totalCorrectAll / totalAll) * 100) : null;

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Тесты</h1>
        <p className="text-muted-foreground text-sm mt-1">Выбери тему и начни прямо сейчас</p>
      </div>

      {/* Итоговые карточки */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Тем пройдено", value: `${totalDone}/${TESTS.length}`, icon: "BookOpen", color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Все попытки", value: String(records.length), icon: "RefreshCcw", color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Точность", value: overallAcc !== null ? `${overallAcc}%` : "—", icon: "Target", color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-3 text-center">
            <div className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
              <Icon name={s.icon} size={13} className={s.color} />
            </div>
            <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Фильтр по сложности */}
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {(["all", "Лёгкий", "Средний", "Сложный"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === f
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white border border-border text-muted-foreground"
            }`}
          >
            {f === "all" ? "Все" : f}
          </button>
        ))}
        <div className="ml-auto flex-shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="text-xs border border-border rounded-xl px-2.5 py-1.5 bg-white text-muted-foreground focus:outline-none"
          >
            <option value="default">По сложности</option>
            <option value="best">По результату</option>
            <option value="attempts">По попыткам</option>
          </select>
        </div>
      </div>

      {/* Список тестов */}
      <div className="space-y-3">
        {sorted.map((t, i) => {
          const stats = getTestStats(t.id);
          const bestColor = stats
            ? stats.best >= 80 ? "text-emerald-600" : stats.best >= 50 ? "text-amber-600" : "text-rose-500"
            : "";
          return (
            <button
              key={t.id}
              onClick={() => startTest(t)}
              className={`w-full bg-white border border-border rounded-2xl p-4 flex items-center gap-3 card-hover text-left animate-slide-up`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                <Icon name={t.icon} size={20} className="text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{t.title}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${DIFF_COLORS[t.difficulty]}`}>{t.difficulty}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</div>
                <div className="text-xs text-muted-foreground">{t.questions.length} вопр. · {t.time}с на вопрос</div>
                {stats && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">{stats.attempts} попыток</span>
                      <span className={`font-bold ${bestColor}`}>лучший {stats.best}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${t.gradient}`}
                        style={{ width: `${stats.best}%`, transition: "width 0.8s ease" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                {stats ? (
                  <div className={`text-lg font-bold ${bestColor}`}>{stats.best}%</div>
                ) : (
                  <div className="w-9 h-9 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <Icon name="Play" size={14} className="text-muted-foreground" />
                  </div>
                )}
                <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
              </div>
            </button>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          Нет тестов по выбранному фильтру
        </div>
      )}
    </div>
  );
}

// ─── Статистика ──────────────────────────────────────────────────
const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const TOPIC_GRADIENTS: Record<string, string> = {
  "Основы счёта":   "from-blue-400 to-indigo-500",
  "Умножение":      "from-emerald-400 to-teal-500",
  "Деление":        "from-amber-400 to-orange-500",
  "Дроби":          "from-rose-400 to-pink-500",
  "Проценты":       "from-violet-400 to-purple-500",
  "Уравнения":      "from-cyan-400 to-blue-500",
  "Степени":        "from-fuchsia-400 to-pink-500",
  "Геометрия":      "from-teal-400 to-emerald-500",
  "Сложение до 100":"from-blue-400 to-indigo-500",
  "Таблица умножения":"from-emerald-400 to-teal-500",
  "Вычитание":      "from-amber-400 to-orange-500",
  "Скорость счёта": "from-rose-400 to-pink-500",
};

function getStreak(records: TestRecord[]): number {
  if (!records.length) return 0;
  const days = new Set(
    records.map((r) => {
      const parts = r.date.split(" ");
      return parts.join("-");
    })
  );
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    if (days.has(label)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function getWeekActivity(records: TestRecord[]): { day: string; count: number; accuracy: number }[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    const dayRecords = records.filter((r) => r.date === label);
    const count = dayRecords.length;
    const accuracy = count
      ? Math.round((dayRecords.reduce((s, r) => s + r.correct, 0) / dayRecords.reduce((s, r) => s + r.total, 0)) * 100)
      : 0;
    return { day: WEEKDAYS[d.getDay()], count, accuracy };
  });
}

function getTopicStats(records: TestRecord[]): { title: string; attempts: number; best: number; gradient: string }[] {
  const map: Record<string, { correct: number[]; total: number[] }> = {};
  for (const r of records) {
    if (!map[r.testTitle]) map[r.testTitle] = { correct: [], total: [] };
    map[r.testTitle].correct.push(r.correct);
    map[r.testTitle].total.push(r.total);
  }
  return Object.entries(map).map(([title, data]) => ({
    title,
    attempts: data.correct.length,
    best: Math.round((Math.max(...data.correct.map((c, i) => c / data.total[i]))) * 100),
    gradient: TOPIC_GRADIENTS[title] ?? "from-indigo-400 to-violet-500",
  })).sort((a, b) => b.best - a.best);
}

function StatsPage({ records }: { records: TestRecord[] }) {
  const totalAnswers = records.reduce((s, r) => s + r.total, 0);
  const totalCorrect = records.reduce((s, r) => s + r.correct, 0);
  const accuracy = totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
  const streak = getStreak(records);
  const week = getWeekActivity(records);
  const topicStats = getTopicStats(records);
  const maxCount = Math.max(...week.map((d) => d.count), 1);

  const hasData = records.length > 0;

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Статистика</h1>
        <p className="text-muted-foreground text-sm mt-1">Твой реальный прогресс</p>
      </div>

      {/* Карточки */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: "Решено задач", v: hasData ? String(totalCorrect) : "—", icon: "Hash", c: "text-indigo-500", bg: "bg-indigo-50" },
          { l: "Точность", v: hasData ? `${accuracy}%` : "—", icon: "Target", c: "text-emerald-500", bg: "bg-emerald-50" },
          { l: "Серия дней", v: streak > 0 ? `${streak} 🔥` : "—", icon: "Flame", c: "text-amber-500", bg: "bg-amber-50" },
          { l: "Тестов пройдено", v: hasData ? String(records.length) : "—", icon: "CheckCircle", c: "text-rose-500", bg: "bg-rose-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-4 card-hover animate-pop" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon name={s.icon} size={16} className={s.c} />
            </div>
            <div className="font-bold text-xl">{s.v}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Активность за неделю */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Активность за 7 дней</h3>
        {hasData ? (
          <div className="flex items-end gap-1.5 h-28">
            {week.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                {d.count > 0 && (
                  <span className="text-[9px] font-semibold text-indigo-600">{d.count}</span>
                )}
                <div className="w-full flex flex-col justify-end" style={{ height: 72 }}>
                  {d.count > 0 ? (
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-indigo-600 to-indigo-400"
                      style={{ height: `${Math.max((d.count / maxCount) * 72, 8)}px`, transition: "height 0.8s ease" }}
                    />
                  ) : (
                    <div className="w-full rounded-lg bg-muted" style={{ height: 4 }} />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Пройди первый тест — здесь появится график 📊
          </div>
        )}
      </div>

      {/* Кольцо точности */}
      {hasData && (
        <div className="bg-white border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Общая точность</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="url(#grad)" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${accuracy} ${100 - accuracy}`}
                  strokeDashoffset="0"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{accuracy}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {[
                { label: "Правильно", value: totalCorrect, color: "bg-emerald-500" },
                { label: "Ошибок", value: totalAnswers - totalCorrect, color: "bg-rose-400" },
                { label: "Всего", value: totalAnswers, color: "bg-indigo-500" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-xs text-muted-foreground flex-1">{s.label}</span>
                  <span className="text-xs font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* По темам */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-4">По темам</h3>
        {topicStats.length > 0 ? (
          <div className="space-y-4">
            {topicStats.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium truncate flex-1 mr-2">{item.title}</span>
                  <span className="text-muted-foreground text-xs flex-shrink-0">
                    {item.attempts} попыток · {item.best}%
                  </span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                    style={{ width: `${item.best}%`, transition: "width 1s ease" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Здесь будет твой прогресс по каждой теме 🎯
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Уровни: данные ──────────────────────────────────────────────
interface LevelDef {
  id: number;
  title: string;
  desc: string;
  topic: string;
  color: string;
  icon: string;
  questions: Question[];
}

const LEVELS: LevelDef[] = [
  {
    id: 1, title: "Основы счёта", desc: "Сложение и вычитание до 100", topic: "Арифметика",
    color: "from-blue-400 to-indigo-500", icon: "Calculator",
    questions: [
      { text: "23 + 14 = ?", options: ["35", "37", "36", "38"], correct: 1 },
      { text: "50 − 18 = ?", options: ["31", "32", "33", "34"], correct: 1 },
      { text: "47 + 36 = ?", options: ["81", "83", "82", "84"], correct: 1 },
      { text: "91 − 44 = ?", options: ["45", "46", "47", "48"], correct: 2 },
      { text: "62 + 29 = ?", options: ["89", "91", "90", "92"], correct: 1 },
      { text: "75 − 37 = ?", options: ["36", "38", "37", "39"], correct: 1 },
      { text: "18 + 45 = ?", options: ["61", "63", "62", "64"], correct: 1 },
      { text: "84 − 56 = ?", options: ["26", "28", "27", "29"], correct: 1 },
    ],
  },
  {
    id: 2, title: "Умножение", desc: "Таблица умножения", topic: "Арифметика",
    color: "from-emerald-400 to-teal-500", icon: "X",
    questions: [
      { text: "6 × 7 = ?", options: ["40", "42", "44", "38"], correct: 1 },
      { text: "8 × 9 = ?", options: ["63", "72", "71", "74"], correct: 1 },
      { text: "7 × 7 = ?", options: ["47", "48", "49", "50"], correct: 2 },
      { text: "9 × 4 = ?", options: ["32", "36", "34", "38"], correct: 1 },
      { text: "6 × 8 = ?", options: ["46", "48", "50", "44"], correct: 1 },
      { text: "12 × 5 = ?", options: ["55", "60", "65", "50"], correct: 1 },
      { text: "7 × 9 = ?", options: ["61", "63", "65", "67"], correct: 1 },
      { text: "11 × 8 = ?", options: ["80", "88", "84", "86"], correct: 1 },
    ],
  },
  {
    id: 3, title: "Деление", desc: "Основы деления", topic: "Арифметика",
    color: "from-amber-400 to-orange-500", icon: "Divide",
    questions: [
      { text: "56 ÷ 8 = ?", options: ["6", "7", "8", "9"], correct: 1 },
      { text: "81 ÷ 9 = ?", options: ["7", "8", "9", "10"], correct: 2 },
      { text: "48 ÷ 6 = ?", options: ["6", "7", "8", "9"], correct: 2 },
      { text: "72 ÷ 8 = ?", options: ["8", "9", "10", "7"], correct: 1 },
      { text: "63 ÷ 7 = ?", options: ["7", "8", "9", "10"], correct: 2 },
      { text: "36 ÷ 4 = ?", options: ["7", "8", "9", "10"], correct: 2 },
      { text: "100 ÷ 5 = ?", options: ["18", "20", "22", "25"], correct: 1 },
      { text: "144 ÷ 12 = ?", options: ["10", "11", "12", "13"], correct: 2 },
    ],
  },
  {
    id: 4, title: "Дроби", desc: "Простые дроби", topic: "Дроби",
    color: "from-rose-400 to-pink-500", icon: "Percent",
    questions: [
      { text: "1/2 + 1/4 = ?", options: ["2/6", "3/4", "1/2", "5/8"], correct: 1 },
      { text: "3/4 − 1/4 = ?", options: ["2/4", "1/2", "2/8", "1/4"], correct: 0 },
      { text: "2/3 × 3 = ?", options: ["1", "2", "3", "6/3"], correct: 1 },
      { text: "Что больше: 3/5 или 1/2?", options: ["1/2", "3/5", "Равны", "Нельзя сравнить"], correct: 1 },
      { text: "1/3 + 1/6 = ?", options: ["2/9", "1/2", "1/3", "3/6"], correct: 1 },
      { text: "5/6 − 1/3 = ?", options: ["4/6", "1/2", "2/3", "1/6"], correct: 1 },
      { text: "3/4 от 40 = ?", options: ["20", "25", "30", "35"], correct: 2 },
      { text: "1/5 от 100 = ?", options: ["15", "20", "25", "10"], correct: 1 },
    ],
  },
  {
    id: 5, title: "Проценты", desc: "Вычисление процентов", topic: "Проценты",
    color: "from-violet-400 to-purple-500", icon: "TrendingUp",
    questions: [
      { text: "10% от 200 = ?", options: ["10", "20", "30", "40"], correct: 1 },
      { text: "25% от 80 = ?", options: ["15", "20", "25", "10"], correct: 1 },
      { text: "50% от 150 = ?", options: ["65", "75", "85", "55"], correct: 1 },
      { text: "15% от 60 = ?", options: ["6", "9", "12", "15"], correct: 1 },
      { text: "30% от 90 = ?", options: ["25", "27", "29", "23"], correct: 1 },
      { text: "5% от 400 = ?", options: ["15", "20", "25", "10"], correct: 1 },
      { text: "40% от 50 = ?", options: ["18", "20", "22", "25"], correct: 1 },
      { text: "75% от 120 = ?", options: ["80", "90", "85", "95"], correct: 1 },
    ],
  },
  {
    id: 6, title: "Уравнения", desc: "Линейные уравнения", topic: "Алгебра",
    color: "from-cyan-400 to-blue-500", icon: "Equal",
    questions: [
      { text: "x + 7 = 15, x = ?", options: ["6", "7", "8", "9"], correct: 2 },
      { text: "2x = 18, x = ?", options: ["7", "8", "9", "10"], correct: 2 },
      { text: "3x − 4 = 11, x = ?", options: ["4", "5", "6", "7"], correct: 1 },
      { text: "x/3 = 7, x = ?", options: ["18", "21", "24", "27"], correct: 1 },
      { text: "5x + 2 = 27, x = ?", options: ["4", "5", "6", "7"], correct: 1 },
      { text: "4x − 8 = 12, x = ?", options: ["4", "5", "6", "7"], correct: 1 },
      { text: "x/5 + 3 = 7, x = ?", options: ["15", "20", "25", "10"], correct: 1 },
      { text: "2x + 3x = 25, x = ?", options: ["4", "5", "6", "7"], correct: 1 },
    ],
  },
  {
    id: 7, title: "Степени", desc: "Возведение в степень и корни", topic: "Алгебра",
    color: "from-fuchsia-400 to-pink-500", icon: "Zap",
    questions: [
      { text: "2⁴ = ?", options: ["8", "12", "16", "20"], correct: 2 },
      { text: "3³ = ?", options: ["9", "18", "27", "36"], correct: 2 },
      { text: "√81 = ?", options: ["7", "8", "9", "10"], correct: 2 },
      { text: "5² + 4² = ?", options: ["38", "41", "43", "45"], correct: 1 },
      { text: "√144 = ?", options: ["10", "11", "12", "13"], correct: 2 },
      { text: "2⁵ = ?", options: ["16", "32", "64", "24"], correct: 1 },
      { text: "10³ = ?", options: ["300", "1000", "10000", "100"], correct: 1 },
      { text: "√49 + √25 = ?", options: ["10", "11", "12", "13"], correct: 2 },
    ],
  },
  {
    id: 8, title: "Геометрия", desc: "Площади и периметры", topic: "Геометрия",
    color: "from-teal-400 to-emerald-500", icon: "Square",
    questions: [
      { text: "Площадь прямоугольника 8×5 = ?", options: ["35", "40", "45", "30"], correct: 1 },
      { text: "Периметр квадрата со стороной 6 = ?", options: ["20", "24", "28", "18"], correct: 1 },
      { text: "Площадь треугольника: основание 10, высота 4 = ?", options: ["20", "40", "25", "30"], correct: 0 },
      { text: "Площадь круга с r=7, π≈3.14 ≈ ?", options: ["143", "154", "165", "132"], correct: 1 },
      { text: "Гипотенуза при катетах 3 и 4 = ?", options: ["5", "6", "7", "8"], correct: 0 },
      { text: "Объём куба со стороной 3 = ?", options: ["9", "18", "27", "36"], correct: 2 },
      { text: "Диагональ квадрата со стороной 4 ≈ ?", options: ["4.5", "5.7", "6.0", "4.9"], correct: 1 },
      { text: "Периметр треугольника со сторонами 5, 7, 9 = ?", options: ["19", "21", "23", "25"], correct: 1 },
    ],
  },
];

// Считаем прогресс уровня по истории результатов
function getLevelProgress(levelId: number, records: TestRecord[]): number {
  const key = `level_${levelId}`;
  const levelRecords = records.filter((r) => r.testId === -levelId);
  if (!levelRecords.length) return 0;
  const best = Math.max(...levelRecords.map((r) => Math.round((r.correct / r.total) * 100)));
  return best;
}

function isLevelUnlocked(levelId: number, records: TestRecord[]): boolean {
  if (levelId === 1) return true;
  return getLevelProgress(levelId - 1, records) >= 70;
}

// ─── LevelQuiz ────────────────────────────────────────────────────
function LevelQuiz({
  level,
  onFinish,
  onBack,
}: {
  level: LevelDef;
  onFinish: (correct: number, total: number) => void;
  onBack: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const q = level.questions[idx];
  const total = level.questions.length;

  const next = useCallback(
    (choice: number | null) => {
      const isOk = choice === q.correct;
      const newCorrect = correct + (isOk ? 1 : 0);
      if (idx + 1 >= total) {
        setDone(true);
        onFinish(newCorrect, total);
      } else {
        setCorrect(newCorrect);
        setIdx(idx + 1);
        setSelected(null);
      }
    },
    [idx, q, correct, total, onFinish]
  );

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    setTimeout(() => next(i), 700);
  };

  if (done) {
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 70;
    return (
      <div className="animate-pop flex flex-col items-center text-center gap-5 pt-8">
        <div className="text-7xl">{passed ? "🏆" : "📚"}</div>
        <div>
          <h2 className="text-2xl font-bold">{passed ? "Уровень пройден!" : "Попробуй ещё раз"}</h2>
          <p className="text-muted-foreground text-sm mt-1">{level.title}</p>
        </div>
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${level.color} flex flex-col items-center justify-center text-white shadow-lg`}>
          <span className="text-4xl font-bold">{pct}%</span>
          <span className="text-sm opacity-80">{correct}/{total}</span>
        </div>
        {passed && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-emerald-700 text-sm font-medium w-full">
            🎉 Следующий уровень открыт!
          </div>
        )}
        {!passed && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-amber-700 text-sm font-medium w-full">
            Нужно 70%+ чтобы открыть следующий уровень
          </div>
        )}
        <div className="w-full flex gap-3">
          <button onClick={onBack} className="flex-1 py-3 rounded-2xl border border-border font-semibold text-sm">К уровням</button>
          <button
            onClick={() => { setIdx(0); setSelected(null); setCorrect(0); setDone(false); }}
            className={`flex-1 py-3 rounded-2xl bg-gradient-to-r ${level.color} text-white font-semibold text-sm`}
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center">
          <Icon name="ChevronLeft" size={18} className="text-muted-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium">{level.title}</p>
          <div className="flex gap-1 mt-1">
            {level.questions.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < idx ? `bg-gradient-to-r ${level.color}` : i === idx ? "bg-indigo-300" : "bg-muted"}`} />
            ))}
          </div>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{idx + 1}/{total}</span>
      </div>

      <div className={`bg-gradient-to-br ${level.color} rounded-3xl p-6 text-center`}>
        <p className="text-white/70 text-xs mb-3 font-medium">Вопрос {idx + 1}</p>
        <div className="font-cormorant text-5xl font-bold text-white leading-tight">{q.text}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt, i) => {
          let cls = "bg-white border-2 border-border text-foreground";
          if (selected !== null) {
            if (i === q.correct) cls = "bg-emerald-50 border-emerald-400 text-emerald-700";
            else if (i === selected) cls = "bg-rose-50 border-rose-400 text-rose-700";
            else cls = "bg-white border-border text-muted-foreground opacity-50";
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={selected !== null}
              className={`${cls} rounded-2xl py-4 font-bold text-2xl transition-all active:scale-95 font-cormorant`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className={`animate-pop rounded-2xl px-4 py-3 flex items-center gap-2 ${selected === q.correct ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"}`}>
          <span className="text-xl">{selected === q.correct ? "✅" : "❌"}</span>
          <span className={`font-semibold text-sm ${selected === q.correct ? "text-emerald-700" : "text-rose-700"}`}>
            {selected === q.correct ? "Правильно!" : `Ответ: ${q.options[q.correct]}`}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── LevelsPage ───────────────────────────────────────────────────
function LevelsPage({
  records,
  onStartLevel,
}: {
  records: TestRecord[];
  onStartLevel: (level: LevelDef) => void;
}) {
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Уровни</h1>
        <p className="text-muted-foreground text-sm mt-1">Пройди 70%+ чтобы открыть следующий</p>
      </div>

      {/* Общий прогресс */}
      <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-4 text-white">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">Общий прогресс</span>
          <span className="text-sm opacity-80">
            {LEVELS.filter((lv) => getLevelProgress(lv.id, records) >= 70).length} / {LEVELS.length} пройдено
          </span>
        </div>
        <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full"
            style={{
              width: `${(LEVELS.filter((lv) => getLevelProgress(lv.id, records) >= 70).length / LEVELS.length) * 100}%`,
              transition: "width 1s ease",
            }}
          />
        </div>
      </div>

      {/* Список уровней */}
      <div className="relative">
        <div className="absolute left-[22px] top-6 bottom-6 w-0.5 bg-border z-0" />
        <div className="space-y-3 relative z-10">
          {LEVELS.map((lv, i) => {
            const unlocked = isLevelUnlocked(lv.id, records);
            const progress = getLevelProgress(lv.id, records);
            const passed = progress >= 70;

            return (
              <div key={lv.id} className="flex gap-3 animate-slide-up" style={{ animationDelay: `${i * 0.07}s` }}>
                {/* Иконка */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm font-bold text-white
                    ${unlocked ? `bg-gradient-to-br ${lv.color}` : "bg-muted"}
                    ${passed ? "ring-2 ring-offset-1 ring-emerald-400" : ""}
                  `}
                >
                  {passed ? (
                    <Icon name="CheckCircle" size={18} className="text-white" />
                  ) : unlocked ? (
                    <Icon name={lv.icon} size={18} className="text-white" />
                  ) : (
                    <Icon name="Lock" size={16} className="text-muted-foreground" />
                  )}
                </div>

                {/* Карточка */}
                <div className={`flex-1 bg-white border rounded-2xl p-4 transition-all ${unlocked ? "border-border card-hover" : "border-border opacity-50"}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{lv.title}</h3>
                        {passed && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-md">✓</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{lv.desc}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{lv.questions.length} вопросов</p>
                    </div>
                    {unlocked && (
                      <button
                        onClick={() => onStartLevel(lv)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl bg-gradient-to-r ${lv.color} text-white flex-shrink-0 active:scale-95 transition-transform`}
                      >
                        {passed ? "Повторить" : progress > 0 ? "Продолжить" : "Начать"}
                      </button>
                    )}
                  </div>

                  {/* Прогресс-бар */}
                  {unlocked && progress > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Лучший результат</span>
                        <span className={progress >= 70 ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${lv.color}`}
                          style={{ width: `${progress}%`, transition: "width 0.8s ease" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Что нужно для разблокировки */}
                  {!unlocked && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      🔒 Пройди «{LEVELS[i - 1]?.title}» на 70%+
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Профиль ─────────────────────────────────────────────────────
function ProfilePage({ records }: { records: TestRecord[] }) {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile.name);
  const [pickingColor, setPickingColor] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function saveName() {
    const updated = { ...profile, name: draft.trim() || profile.name };
    setProfile(updated);
    saveProfile(updated);
    setEditing(false);
  }

  function pickColor(c: string) {
    const updated = { ...profile, avatarColor: c };
    setProfile(updated);
    saveProfile(updated);
    setPickingColor(false);
  }

  function toggleNotifications() {
    const updated = { ...profile, notifications: !profile.notifications };
    setProfile(updated);
    saveProfile(updated);
  }

  const xp = calcXP(records);
  const { level, xpInLevel, title } = calcLevel(xp);
  const accuracy = calcAccuracy(records);
  const xpProgress = xpInLevel;
  const initial = (profile.name[0] ?? "И").toUpperCase();

  const earnedAchievements = ACHIEVEMENTS.map((a) => ({
    ...a,
    earned:
      (a.id === 1 && records.length >= 1) ||
      (a.id === 2 && records.some((r) => r.correct / r.total === 1)) ||
      (a.id === 3 && records.length >= 10) ||
      (a.id === 4 && records.length >= 50) ||
      (a.id === 5 && records.some((r) => r.correct === r.total && r.total > 0)) ||
      (a.id === 6 && records.reduce((s, r) => s + r.correct, 0) >= 500),
  }));

  return (
    <div className="animate-fade-in space-y-5">
      {/* Карточка профиля */}
      <div className="bg-white border border-border rounded-3xl p-6">
        <div className="flex items-start gap-4">
          {/* Аватар */}
          <button
            onClick={() => setPickingColor(!pickingColor)}
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${profile.avatarColor} flex items-center justify-center text-white text-2xl font-bold shadow-sm relative flex-shrink-0 active:scale-95 transition-transform`}
          >
            {initial}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-border rounded-full flex items-center justify-center">
              <Icon name="Palette" size={10} className="text-muted-foreground" />
            </span>
          </button>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditing(false); }}
                  maxLength={24}
                  className="flex-1 font-bold text-xl border-b-2 border-primary outline-none bg-transparent"
                />
                <button onClick={saveName} className="text-primary">
                  <Icon name="Check" size={18} />
                </button>
                <button onClick={() => setEditing(false)} className="text-muted-foreground">
                  <Icon name="X" size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-xl truncate">{profile.name}</h2>
                <button onClick={() => { setDraft(profile.name); setEditing(true); }} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="Pencil" size={14} />
                </button>
              </div>
            )}
            <p className="text-muted-foreground text-sm mt-0.5">Уровень {level} · {title}</p>
          </div>
        </div>

        {/* Палитра цветов */}
        {pickingColor && (
          <div className="mt-4 flex gap-2 flex-wrap animate-pop">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => pickColor(c)}
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c} ${profile.avatarColor === c ? "ring-2 ring-offset-2 ring-primary" : ""} active:scale-90 transition-transform`}
              />
            ))}
          </div>
        )}

        {/* XP прогресс */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">До уровня {level + 1}</span>
            <span className="font-semibold">{xpInLevel} / 100 XP</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full progress-bar" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>

        {/* Мини-статистика */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Тестов", value: records.length, color: "text-indigo-600" },
            { label: "Точность", value: `${accuracy}%`, color: "text-emerald-600" },
            { label: "XP всего", value: xp, color: "text-amber-600" },
          ].map((s, i) => (
            <div key={i} className="bg-muted/60 rounded-xl p-2.5 text-center">
              <div className={`font-bold text-lg ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Достижения */}
      <div>
        <h3 className="font-semibold mb-3">Достижения</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {earnedAchievements.map((a, i) => (
            <div
              key={a.id}
              className={`bg-white border rounded-2xl p-3 text-center animate-pop ${!a.earned ? "opacity-35 grayscale border-border" : "border-amber-200 bg-amber-50/50 card-hover"}`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="text-3xl mb-1.5">{a.icon}</div>
              <div className="text-xs font-semibold leading-tight">{a.title}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Последние результаты */}
      {records.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Последние тесты</h3>
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            {records.slice(0, 5).map((r, i, arr) => {
              const pct = Math.round((r.correct / r.total) * 100);
              return (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${pct >= 80 ? "bg-emerald-100 text-emerald-700" : pct >= 50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                    {pct}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.testTitle}</div>
                    <div className="text-xs text-muted-foreground">{r.correct}/{r.total} верно · {r.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Настройки */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
            <Icon name="Bell" size={16} className="text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Уведомления</div>
            <div className="text-xs text-muted-foreground">{profile.notifications ? "Включены" : "Выключены"}</div>
          </div>
          <button
            onClick={toggleNotifications}
            className={`w-12 h-6 rounded-full transition-colors relative ${profile.notifications ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${profile.notifications ? "left-6" : "left-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center gap-3 p-4">
          <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
            <Icon name="HelpCircle" size={16} className="text-muted-foreground" />
          </div>
          <div className="flex-1 text-sm font-medium">Помощь</div>
          <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────
const NAV: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "tests", label: "Тесты", icon: "ClipboardList" },
  { id: "stats", label: "Статистика", icon: "BarChart2" },
  { id: "levels", label: "Уровни", icon: "Layers" },
  { id: "profile", label: "Профиль", icon: "User" },
];

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [activeTest, setActiveTest] = useState<TestDef | null>(null);
  const [activeLevel, setActiveLevel] = useState<LevelDef | null>(null);
  const [records, setRecords] = useState<TestRecord[]>(loadRecords);

  const startTest = (t: TestDef) => {
    setActiveTest(t);
    setPage("quiz");
  };

  const finishTest = (r: QuizResult) => {
    if (!activeTest) return;
    const rec: TestRecord = {
      testId: activeTest.id,
      testTitle: activeTest.title,
      correct: r.correct,
      total: r.total,
      date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
    };
    setRecords((prev) => {
      const next = [rec, ...prev].slice(0, 100);
      saveRecords(next);
      return next;
    });
  };

  const startLevel = (lv: LevelDef) => {
    setActiveLevel(lv);
    setPage("level-quiz");
  };

  const finishLevel = (correct: number, total: number) => {
    if (!activeLevel) return;
    const rec: TestRecord = {
      testId: -activeLevel.id,
      testTitle: activeLevel.title,
      correct,
      total,
      date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
    };
    setRecords((prev) => {
      const next = [rec, ...prev].slice(0, 100);
      saveRecords(next);
      return next;
    });
  };

  const backFromQuiz = () => {
    setActiveTest(null);
    setPage("tests");
  };

  const backFromLevel = () => {
    setActiveLevel(null);
    setPage("levels");
  };

  const renderPage = () => {
    if (page === "quiz" && activeTest) {
      return <QuizPage test={activeTest} onFinish={finishTest} onBack={backFromQuiz} />;
    }
    if (page === "level-quiz" && activeLevel) {
      return <LevelQuiz level={activeLevel} onFinish={finishLevel} onBack={backFromLevel} />;
    }
    switch (page) {
      case "home": return <HomePage setPage={setPage} startTest={startTest} startLevel={startLevel} records={records} />;
      case "tests": return <TestsPage startTest={startTest} records={records} />;
      case "stats": return <StatsPage records={records} />;
      case "levels": return <LevelsPage records={records} onStartLevel={startLevel} />;
      case "profile": return <ProfilePage records={records} />;
    }
  };

  const showNav = page !== "quiz" && page !== "level-quiz";

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-sm flex flex-col min-h-screen">
        <div className={`flex-1 overflow-y-auto px-4 pt-6 ${showNav ? "pb-24" : "pb-8"}`}>
          {renderPage()}
        </div>
        {showNav && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white/90 backdrop-blur border-t border-border px-2">
            <div className="flex items-center justify-around py-2">
              {NAV.map((item) => {
                const active = page === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPage(item.id)}
                    className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all ${active ? "bg-indigo-50 text-indigo-600" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Icon name={item.icon} size={20} />
                    <span className={`text-[10px] font-medium ${active ? "text-indigo-600" : ""}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}