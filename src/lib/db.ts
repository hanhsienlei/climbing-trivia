import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "trivia.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        wrong_answers TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS explanations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        explanation TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (question_id) REFERENCES questions(id)
      );
    `);
  }
  return db;
}

export interface QuestionRow {
  id: number;
  question: string;
  correct_answer: string;
  wrong_answers: string; // JSON array
  created_at: string;
}

export function getRandomQuestions(count: number): QuestionRow[] {
  const stmt = getDb().prepare(
    "SELECT * FROM questions ORDER BY RANDOM() LIMIT ?"
  );
  return stmt.all(count) as QuestionRow[];
}

export function getQuestionCount(): number {
  const row = getDb().prepare("SELECT COUNT(*) as count FROM questions").get() as { count: number };
  return row.count;
}

export function saveQuestions(
  questions: { question: string; correct_answer: string; wrong_answers: string[] }[]
): QuestionRow[] {
  const insert = getDb().prepare(
    "INSERT INTO questions (question, correct_answer, wrong_answers) VALUES (?, ?, ?)"
  );
  const saved: QuestionRow[] = [];
  const insertMany = getDb().transaction(() => {
    for (const q of questions) {
      const result = insert.run(q.question, q.correct_answer, JSON.stringify(q.wrong_answers));
      saved.push({
        id: Number(result.lastInsertRowid),
        question: q.question,
        correct_answer: q.correct_answer,
        wrong_answers: JSON.stringify(q.wrong_answers),
        created_at: new Date().toISOString(),
      });
    }
  });
  insertMany();
  return saved;
}

export function getExplanation(questionId: number): string | null {
  const row = getDb()
    .prepare("SELECT explanation FROM explanations WHERE question_id = ?")
    .get(questionId) as { explanation: string } | undefined;
  return row?.explanation ?? null;
}

export function saveExplanation(questionId: number, explanation: string): void {
  getDb()
    .prepare("INSERT INTO explanations (question_id, explanation) VALUES (?, ?)")
    .run(questionId, explanation);
}
