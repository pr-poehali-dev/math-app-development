import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

type Page = "home" | "tests" | "quiz" | "stats" | "levels" | "profile";

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
function HomePage({ setPage, startTest }: { setPage: (p: Page) => void; startTest: (t: TestDef) => void }) {
  return (
    <div className="animate-fade-in space-y-5">
      <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-8 -translate-x-8 pointer-events-none" />
        <div className="relative">
          <p className="text-white/70 text-sm mb-0.5">Привет, Алекс! 👋</p>
          <h1 className="text-2xl font-bold mb-4">Продолжаем учиться?</h1>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Таблица умножения</span>
              <span className="text-sm text-white/80">75%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden mb-3">
              <div className="h-full progress-bar" style={{ width: "75%" }} />
            </div>
            <button
              onClick={() => startTest(TESTS[1])}
              className="w-full bg-white text-indigo-600 font-bold text-sm py-2.5 rounded-xl hover:bg-white/90 transition-colors"
            >
              Продолжить →
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { v: "247", l: "Задач", c: "text-indigo-600" },
          { v: "87%", l: "Точность", c: "text-emerald-600" },
          { v: "7🔥", l: "Дней", c: "text-amber-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 text-center border border-border">
            <div className={`text-xl font-bold ${s.c}`}>{s.v}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Быстрые тесты</h2>
          <button onClick={() => setPage("tests")} className="text-sm text-indigo-500 font-medium">Все →</button>
        </div>
        <div className="space-y-2.5">
          {TESTS.slice(0, 3).map((t) => (
            <button
              key={t.id}
              onClick={() => startTest(t)}
              className={`w-full ${t.color} border rounded-2xl p-4 flex items-center gap-3 card-hover text-left`}
            >
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <Icon name={t.icon} size={18} className="text-indigo-500" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{t.title}</div>
                <div className="text-xs text-muted-foreground">{t.questions.length} вопросов · {t.time}с/вопрос</div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-lg ${t.badgeBg} ${t.badgeText}`}>{t.difficulty}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-bold text-lg mb-3">Достижения</h2>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {ACHIEVEMENTS.filter(a => a.earned).map((a, i) => (
            <div key={a.id} className="flex-shrink-0 bg-white border border-border rounded-2xl p-3 text-center w-20 card-hover animate-pop" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="text-2xl mb-1">{a.icon}</div>
              <div className="text-[11px] font-semibold leading-tight">{a.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Тесты ───────────────────────────────────────────────────────
function TestsPage({ startTest }: { startTest: (t: TestDef) => void }) {
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Тесты</h1>
        <p className="text-muted-foreground text-sm mt-1">Выбери тему и начни прямо сейчас</p>
      </div>
      <div className="space-y-3">
        {TESTS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => startTest(t)}
            className={`w-full ${t.color} border rounded-2xl p-4 flex items-center gap-3 card-hover text-left animate-slide-up`}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
              <Icon name={t.icon} size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{t.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</div>
              <div className="text-xs text-muted-foreground">{t.questions.length} вопросов · {t.time}с на вопрос</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${t.badgeBg} ${t.badgeText}`}>{t.difficulty}</span>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Статистика ──────────────────────────────────────────────────
function StatsPage() {
  const maxVal = Math.max(...WEEK.map(d => d.max || 1));
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Статистика</h1>
        <p className="text-muted-foreground text-sm mt-1">Твой прогресс за неделю</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: "Решено задач", v: "247", icon: "Hash", c: "text-indigo-500", bg: "bg-indigo-50" },
          { l: "Точность", v: "87%", icon: "Target", c: "text-emerald-500", bg: "bg-emerald-50" },
          { l: "Серия дней", v: "7 🔥", icon: "Flame", c: "text-amber-500", bg: "bg-amber-50" },
          { l: "Тестов пройдено", v: "34", icon: "CheckCircle", c: "text-rose-500", bg: "bg-rose-50" },
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
      <div className="bg-white border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Активность за неделю</h3>
        <div className="flex items-end justify-between gap-2 h-24">
          {WEEK.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center justify-end h-16">
                {d.max > 0 ? (
                  <div className="w-full rounded-lg bg-indigo-100 relative overflow-hidden" style={{ height: `${(d.max / maxVal) * 64}px` }}>
                    <div className="absolute bottom-0 left-0 right-0 rounded-lg bg-gradient-to-t from-indigo-600 to-indigo-400" style={{ height: `${(d.val / d.max) * 100}%` }} />
                  </div>
                ) : (
                  <div className="w-full rounded-lg bg-muted h-2" />
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-border rounded-2xl p-5">
        <h3 className="font-semibold mb-4">По темам</h3>
        <div className="space-y-4">
          {[
            { topic: "Сложение", pct: 94, g: "from-blue-400 to-indigo-500" },
            { topic: "Умножение", pct: 75, g: "from-emerald-400 to-teal-500" },
            { topic: "Вычитание", pct: 60, g: "from-amber-400 to-orange-500" },
            { topic: "Скорость счёта", pct: 40, g: "from-rose-400 to-pink-500" },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">{item.topic}</span>
                <span className="text-muted-foreground">{item.pct}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${item.g}`} style={{ width: `${item.pct}%`, transition: "width 1s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Уровни ──────────────────────────────────────────────────────
const LEVELS = [
  { id: 1, title: "Основы счёта", desc: "Сложение и вычитание", color: "from-blue-400 to-indigo-500", progress: 100, unlocked: true },
  { id: 2, title: "Умножение", desc: "Таблица умножения", color: "from-emerald-400 to-teal-500", progress: 75, unlocked: true },
  { id: 3, title: "Дроби", desc: "Простые и десятичные", color: "from-amber-400 to-orange-500", progress: 30, unlocked: true },
  { id: 4, title: "Уравнения", desc: "Линейные уравнения", color: "from-rose-400 to-pink-500", progress: 0, unlocked: false },
  { id: 5, title: "Геометрия", desc: "Фигуры и площади", color: "from-violet-400 to-purple-500", progress: 0, unlocked: false },
];

function LevelsPage() {
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Уровни</h1>
        <p className="text-muted-foreground text-sm mt-1">Путь к математическому мастерству</p>
      </div>
      <div className="relative">
        <div className="absolute left-6 top-8 bottom-8 w-px bg-border z-0" />
        <div className="space-y-4 relative z-10">
          {LEVELS.map((lv, i) => (
            <div key={lv.id} className="flex gap-4 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${lv.color} flex items-center justify-center text-white font-bold flex-shrink-0 ${!lv.unlocked ? "opacity-30 grayscale" : ""} shadow-sm`}>
                {lv.unlocked ? lv.id : <Icon name="Lock" size={18} />}
              </div>
              <div className={`flex-1 bg-white border border-border rounded-2xl p-4 ${lv.unlocked ? "card-hover" : "opacity-50"}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{lv.title}</h3>
                    <p className="text-xs text-muted-foreground">{lv.desc}</p>
                  </div>
                  {lv.progress === 100 && <span className="text-emerald-500 text-xs font-semibold">✓ Готово</span>}
                </div>
                {lv.unlocked && lv.progress > 0 && (
                  <>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Прогресс</span><span>{lv.progress}%</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${lv.color}`} style={{ width: `${lv.progress}%` }} />
                    </div>
                  </>
                )}
                {lv.unlocked && lv.progress === 0 && (
                  <button className={`mt-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r ${lv.color} text-white`}>Начать</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Профиль ─────────────────────────────────────────────────────
function ProfilePage() {
  return (
    <div className="animate-fade-in space-y-5">
      <div className="bg-white border border-border rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-sm">А</div>
          <div className="flex-1">
            <h2 className="font-bold text-xl">Алексей</h2>
            <p className="text-muted-foreground text-sm">Уровень 3 · Ученик</p>
          </div>
          <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center">
            <Icon name="Settings" size={16} className="text-muted-foreground" />
          </button>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">До уровня 4</span>
            <span className="font-semibold">1240 / 2000 XP</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full progress-bar" style={{ width: "62%" }} />
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Достижения</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {ACHIEVEMENTS.map((a, i) => (
            <div key={a.id} className={`bg-white border rounded-2xl p-3 text-center animate-pop ${!a.earned ? "opacity-35 grayscale" : "border-border card-hover"}`} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="text-3xl mb-1.5">{a.icon}</div>
              <div className="text-xs font-semibold leading-tight">{a.title}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        {[
          { icon: "BookOpen", label: "Мои курсы", desc: "3 активных" },
          { icon: "Bell", label: "Уведомления", desc: "Включены" },
          { icon: "HelpCircle", label: "Помощь", desc: "" },
        ].map((item, i, arr) => (
          <div key={i} className={`flex items-center gap-3 p-4 ${i < arr.length - 1 ? "border-b border-border" : ""} hover:bg-muted/50 transition-colors cursor-pointer`}>
            <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
              <Icon name={item.icon} size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{item.label}</div>
              {item.desc && <div className="text-xs text-muted-foreground">{item.desc}</div>}
            </div>
            <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
          </div>
        ))}
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

  const startTest = (t: TestDef) => {
    setActiveTest(t);
    setPage("quiz");
  };

  const finishTest = (_r: QuizResult) => {};

  const backFromQuiz = () => {
    setActiveTest(null);
    setPage("tests");
  };

  const renderPage = () => {
    if (page === "quiz" && activeTest) {
      return <QuizPage test={activeTest} onFinish={finishTest} onBack={backFromQuiz} />;
    }
    switch (page) {
      case "home": return <HomePage setPage={setPage} startTest={startTest} />;
      case "tests": return <TestsPage startTest={startTest} />;
      case "stats": return <StatsPage />;
      case "levels": return <LevelsPage />;
      case "profile": return <ProfilePage />;
    }
  };

  const showNav = page !== "quiz";

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