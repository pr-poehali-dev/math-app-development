import { useState, useEffect } from "react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface TestResult {
  date: string;
  score: number;
  total: number;
  topic: string;
  level: number;
}

export interface UserStats {
  totalTests: number;
  correctAnswers: number;
  totalAnswers: number;
  streak: number;
  lastActive: string;
  xp: number;
  level: number;
  testResults: TestResult[];
  achievements: Achievement[];
  unlockedLevels: number[];
}

const defaultAchievements: Achievement[] = [
  { id: "first_test", title: "Первый шаг", description: "Пройди первый тест", icon: "Star", unlocked: false },
  { id: "perfect_score", title: "Отличник", description: "Получи 100% в тесте", icon: "Trophy", unlocked: false },
  { id: "streak_3", title: "В ударе", description: "3 дня подряд", icon: "Flame", unlocked: false },
  { id: "streak_7", title: "Неделя побед", description: "7 дней подряд", icon: "Zap", unlocked: false },
  { id: "tests_10", title: "Практик", description: "Пройди 10 тестов", icon: "BookOpen", unlocked: false },
  { id: "tests_50", title: "Мастер", description: "Пройди 50 тестов", icon: "Award", unlocked: false },
  { id: "level_5", title: "Пятёрочник", description: "Открой 5-й уровень", icon: "Layers", unlocked: false },
  { id: "xp_500", title: "Набирает обороты", description: "Набери 500 XP", icon: "TrendingUp", unlocked: false },
];

const defaultStats: UserStats = {
  totalTests: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  streak: 0,
  lastActive: "",
  xp: 0,
  level: 1,
  testResults: [],
  achievements: defaultAchievements,
  unlockedLevels: [1],
};

function loadStats(): UserStats {
  try {
    const saved = localStorage.getItem("mathapp_stats");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultStats, ...parsed, achievements: parsed.achievements || defaultAchievements };
    }
  } catch {}
  return defaultStats;
}

function saveStats(stats: UserStats) {
  localStorage.setItem("mathapp_stats", JSON.stringify(stats));
}

export function getLevelInfo(xp: number) {
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = (level - 1) * 100;
  const nextLevelXp = level * 100;
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return { level, progress, currentLevelXp, nextLevelXp, xpInLevel: xp - currentLevelXp };
}

export function useGameStore() {
  const [stats, setStats] = useState<UserStats>(loadStats);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  function addTestResult(result: TestResult) {
    setStats((prev) => {
      const xpGained = Math.round((result.score / result.total) * 50) + 10;
      const newXp = prev.xp + xpGained;
      const { level } = getLevelInfo(newXp);

      const today = new Date().toISOString().split("T")[0];
      const lastDate = prev.lastActive;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const newStreak = lastDate === yesterday ? prev.streak + 1 : lastDate === today ? prev.streak : 1;

      const newUnlockedLevels = [...prev.unlockedLevels];
      if (result.score / result.total >= 0.7 && !newUnlockedLevels.includes(result.level + 1) && result.level + 1 <= 10) {
        newUnlockedLevels.push(result.level + 1);
      }

      const newAchievements = prev.achievements.map((a) => {
        if (a.unlocked) return a;
        if (a.id === "first_test" && prev.totalTests === 0) return { ...a, unlocked: true };
        if (a.id === "perfect_score" && result.score === result.total) return { ...a, unlocked: true };
        if (a.id === "streak_3" && newStreak >= 3) return { ...a, unlocked: true };
        if (a.id === "streak_7" && newStreak >= 7) return { ...a, unlocked: true };
        if (a.id === "tests_10" && prev.totalTests + 1 >= 10) return { ...a, unlocked: true };
        if (a.id === "tests_50" && prev.totalTests + 1 >= 50) return { ...a, unlocked: true };
        if (a.id === "level_5" && newUnlockedLevels.includes(5)) return { ...a, unlocked: true };
        if (a.id === "xp_500" && newXp >= 500) return { ...a, unlocked: true };
        return a;
      });

      return {
        ...prev,
        totalTests: prev.totalTests + 1,
        correctAnswers: prev.correctAnswers + result.score,
        totalAnswers: prev.totalAnswers + result.total,
        streak: newStreak,
        lastActive: today,
        xp: newXp,
        level,
        testResults: [result, ...prev.testResults].slice(0, 50),
        achievements: newAchievements,
        unlockedLevels: newUnlockedLevels,
      };
    });
  }

  return { stats, addTestResult };
}
