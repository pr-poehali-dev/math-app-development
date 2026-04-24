export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  topic: string;
  icon: string;
  color: string;
  questions: Question[];
}

export const levels: Level[] = [
  {
    id: 1,
    title: "Сложение",
    description: "Основы сложения чисел",
    topic: "Арифметика",
    icon: "Plus",
    color: "emerald",
    questions: [
      { id: 1, question: "12 + 15 = ?", options: ["25", "27", "28", "26"], correct: 1, explanation: "12 + 15 = 27" },
      { id: 2, question: "34 + 28 = ?", options: ["60", "62", "64", "58"], correct: 1, explanation: "34 + 28 = 62" },
      { id: 3, question: "7 + 8 + 5 = ?", options: ["18", "19", "20", "21"], correct: 2, explanation: "7 + 8 + 5 = 20" },
      { id: 4, question: "45 + 37 = ?", options: ["80", "82", "84", "78"], correct: 1, explanation: "45 + 37 = 82" },
      { id: 5, question: "99 + 11 = ?", options: ["108", "110", "112", "109"], correct: 1, explanation: "99 + 11 = 110" },
    ],
  },
  {
    id: 2,
    title: "Вычитание",
    description: "Основы вычитания чисел",
    topic: "Арифметика",
    icon: "Minus",
    color: "blue",
    questions: [
      { id: 1, question: "50 - 23 = ?", options: ["25", "27", "29", "31"], correct: 1, explanation: "50 - 23 = 27" },
      { id: 2, question: "100 - 37 = ?", options: ["61", "63", "65", "67"], correct: 1, explanation: "100 - 37 = 63" },
      { id: 3, question: "85 - 49 = ?", options: ["34", "36", "38", "40"], correct: 1, explanation: "85 - 49 = 36" },
      { id: 4, question: "200 - 128 = ?", options: ["70", "72", "74", "76"], correct: 1, explanation: "200 - 128 = 72" },
      { id: 5, question: "43 - 17 = ?", options: ["24", "26", "28", "30"], correct: 1, explanation: "43 - 17 = 26" },
    ],
  },
  {
    id: 3,
    title: "Умножение",
    description: "Таблица умножения",
    topic: "Арифметика",
    icon: "X",
    color: "violet",
    questions: [
      { id: 1, question: "7 × 8 = ?", options: ["54", "56", "58", "60"], correct: 1, explanation: "7 × 8 = 56" },
      { id: 2, question: "9 × 6 = ?", options: ["52", "54", "56", "58"], correct: 1, explanation: "9 × 6 = 54" },
      { id: 3, question: "12 × 4 = ?", options: ["44", "46", "48", "50"], correct: 2, explanation: "12 × 4 = 48" },
      { id: 4, question: "15 × 3 = ?", options: ["42", "45", "48", "51"], correct: 1, explanation: "15 × 3 = 45" },
      { id: 5, question: "11 × 11 = ?", options: ["111", "121", "131", "141"], correct: 1, explanation: "11 × 11 = 121" },
    ],
  },
  {
    id: 4,
    title: "Деление",
    description: "Основы деления",
    topic: "Арифметика",
    icon: "Divide",
    color: "amber",
    questions: [
      { id: 1, question: "72 ÷ 8 = ?", options: ["7", "8", "9", "10"], correct: 2, explanation: "72 ÷ 8 = 9" },
      { id: 2, question: "56 ÷ 7 = ?", options: ["6", "7", "8", "9"], correct: 2, explanation: "56 ÷ 7 = 8" },
      { id: 3, question: "144 ÷ 12 = ?", options: ["10", "11", "12", "13"], correct: 2, explanation: "144 ÷ 12 = 12" },
      { id: 4, question: "36 ÷ 4 = ?", options: ["7", "8", "9", "10"], correct: 2, explanation: "36 ÷ 4 = 9" },
      { id: 5, question: "100 ÷ 5 = ?", options: ["18", "19", "20", "21"], correct: 2, explanation: "100 ÷ 5 = 20" },
    ],
  },
  {
    id: 5,
    title: "Дроби",
    description: "Простые дроби",
    topic: "Дроби",
    icon: "Percent",
    color: "rose",
    questions: [
      { id: 1, question: "1/2 + 1/4 = ?", options: ["1/6", "2/6", "3/4", "1/3"], correct: 2, explanation: "1/2 + 1/4 = 2/4 + 1/4 = 3/4" },
      { id: 2, question: "3/4 - 1/4 = ?", options: ["2/8", "1/4", "1/2", "2/4"], correct: 2, explanation: "3/4 - 1/4 = 2/4 = 1/2" },
      { id: 3, question: "2/3 × 3 = ?", options: ["6/3", "1", "2", "3/2"], correct: 2, explanation: "2/3 × 3 = 6/3 = 2" },
      { id: 4, question: "Что больше: 3/5 или 1/2?", options: ["1/2", "3/5", "Равны", "Нельзя сравнить"], correct: 1, explanation: "3/5 = 0.6, 1/2 = 0.5, поэтому 3/5 > 1/2" },
      { id: 5, question: "1/3 + 1/6 = ?", options: ["2/9", "3/9", "1/2", "2/6"], correct: 2, explanation: "1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2" },
    ],
  },
  {
    id: 6,
    title: "Проценты",
    description: "Вычисление процентов",
    topic: "Проценты",
    icon: "Percent",
    color: "teal",
    questions: [
      { id: 1, question: "10% от 200 = ?", options: ["10", "20", "30", "40"], correct: 1, explanation: "10% от 200 = 200 × 0.1 = 20" },
      { id: 2, question: "25% от 80 = ?", options: ["15", "20", "25", "30"], correct: 1, explanation: "25% от 80 = 80 × 0.25 = 20" },
      { id: 3, question: "50% от 150 = ?", options: ["65", "70", "75", "80"], correct: 2, explanation: "50% от 150 = 150 × 0.5 = 75" },
      { id: 4, question: "30% от 90 = ?", options: ["25", "27", "29", "31"], correct: 1, explanation: "30% от 90 = 90 × 0.3 = 27" },
      { id: 5, question: "15% от 60 = ?", options: ["7", "8", "9", "10"], correct: 2, explanation: "15% от 60 = 60 × 0.15 = 9" },
    ],
  },
  {
    id: 7,
    title: "Степени",
    description: "Возведение в степень",
    topic: "Алгебра",
    icon: "Superscript",
    color: "indigo",
    questions: [
      { id: 1, question: "2³ = ?", options: ["6", "8", "10", "12"], correct: 1, explanation: "2³ = 2 × 2 × 2 = 8" },
      { id: 2, question: "5² = ?", options: ["10", "20", "25", "30"], correct: 2, explanation: "5² = 5 × 5 = 25" },
      { id: 3, question: "3⁴ = ?", options: ["64", "81", "100", "27"], correct: 1, explanation: "3⁴ = 3 × 3 × 3 × 3 = 81" },
      { id: 4, question: "√64 = ?", options: ["6", "7", "8", "9"], correct: 2, explanation: "√64 = 8, так как 8² = 64" },
      { id: 5, question: "4² + 3² = ?", options: ["20", "25", "30", "35"], correct: 1, explanation: "4² + 3² = 16 + 9 = 25" },
    ],
  },
  {
    id: 8,
    title: "Уравнения",
    description: "Линейные уравнения",
    topic: "Алгебра",
    icon: "Equal",
    color: "pink",
    questions: [
      { id: 1, question: "x + 5 = 12, x = ?", options: ["5", "7", "8", "9"], correct: 1, explanation: "x = 12 - 5 = 7" },
      { id: 2, question: "2x = 14, x = ?", options: ["5", "6", "7", "8"], correct: 2, explanation: "x = 14 ÷ 2 = 7" },
      { id: 3, question: "3x - 6 = 9, x = ?", options: ["3", "4", "5", "6"], correct: 2, explanation: "3x = 15, x = 5" },
      { id: 4, question: "x/4 = 8, x = ?", options: ["24", "28", "32", "36"], correct: 2, explanation: "x = 8 × 4 = 32" },
      { id: 5, question: "5x + 3 = 28, x = ?", options: ["4", "5", "6", "7"], correct: 1, explanation: "5x = 25, x = 5" },
    ],
  },
  {
    id: 9,
    title: "Геометрия",
    description: "Площади и периметры",
    topic: "Геометрия",
    icon: "Square",
    color: "cyan",
    questions: [
      { id: 1, question: "Площадь прямоугольника 6×4 = ?", options: ["20", "22", "24", "26"], correct: 2, explanation: "S = 6 × 4 = 24" },
      { id: 2, question: "Периметр квадрата со стороной 5 = ?", options: ["15", "20", "25", "30"], correct: 1, explanation: "P = 4 × 5 = 20" },
      { id: 3, question: "Площадь треугольника с основанием 8 и высотой 6 = ?", options: ["20", "24", "28", "32"], correct: 1, explanation: "S = (8 × 6) / 2 = 24" },
      { id: 4, question: "Площадь круга с радиусом 7 ≈ ? (π≈3.14)", options: ["143.07", "153.86", "163.54", "173.28"], correct: 1, explanation: "S = π × 7² ≈ 3.14 × 49 ≈ 153.86" },
      { id: 5, question: "Гипотенуза прямоугольного треугольника с катетами 3 и 4 = ?", options: ["4", "5", "6", "7"], correct: 1, explanation: "c² = 3² + 4² = 25, c = 5" },
    ],
  },
  {
    id: 10,
    title: "Логика",
    description: "Математическая логика",
    topic: "Логика",
    icon: "Brain",
    color: "orange",
    questions: [
      { id: 1, question: "Следующее в ряду: 2, 4, 8, 16, ?", options: ["24", "28", "32", "36"], correct: 2, explanation: "Каждое число умножается на 2: 16 × 2 = 32" },
      { id: 2, question: "Следующее в ряду: 1, 4, 9, 16, ?", options: ["20", "25", "30", "36"], correct: 1, explanation: "Квадраты чисел: 5² = 25" },
      { id: 3, question: "Если 3 ручки стоят 45₽, то 7 ручек стоят?", options: ["95₽", "105₽", "115₽", "125₽"], correct: 1, explanation: "1 ручка = 15₽, 7 × 15 = 105₽" },
      { id: 4, question: "Следующее в ряду: 1, 1, 2, 3, 5, 8, ?", options: ["11", "12", "13", "14"], correct: 2, explanation: "Фибоначчи: 5 + 8 = 13" },
      { id: 5, question: "Судно плывёт 10 км/ч, расстояние 25 км. Время в пути?", options: ["2 ч", "2.5 ч", "3 ч", "3.5 ч"], correct: 1, explanation: "t = 25 / 10 = 2.5 ч" },
    ],
  },
];
