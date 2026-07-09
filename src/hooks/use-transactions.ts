import { useState, useEffect, useCallback } from "react";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
}

const STORAGE_KEY = "daily-expenses-v1";
const BUDGET_LIMIT_KEY = "daily-expenses-budget-limit";

const DEFAULT_CATEGORIES: Record<TransactionType, string[]> = {
  income: ["Salario", "Freelance", "Inversiones", "Regalo", "Otros"],
  expense: [
    "Alimentación",
    "Transporte",
    "Vivienda",
    "Entretenimiento",
    "Salud",
    "Educación",
    "Compras",
    "Otros",
  ],
};

function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

function saveTransactions(txs: Transaction[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
}

function loadBudgetLimit(): number {
  if (typeof window === "undefined") return 500000;
  try {
    const raw = localStorage.getItem(BUDGET_LIMIT_KEY);
    return raw ? parseInt(raw, 10) || 500000 : 500000;
  } catch {
    return 500000;
  }
}

function saveBudgetLimit(limit: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BUDGET_LIMIT_KEY, String(limit));
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [budgetLimit, setBudgetLimitState] = useState<number>(loadBudgetLimit);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTransactions(loadTransactions());
  }, []);

  useEffect(() => {
    if (mounted) {
      saveTransactions(transactions);
    }
  }, [transactions, mounted]);

  const addTransaction = useCallback(
    (tx: Omit<Transaction, "id" | "date">) => {
      const newTx: Transaction = {
        ...tx,
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const totals = transactions.reduce(
    (acc, t) => {
      if (t.type === "income") acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const balance = totals.income - totals.expense;

  return {
    transactions: mounted ? transactions : [],
    addTransaction,
    deleteTransaction,
    income: totals.income,
    expense: totals.expense,
    balance,
    categories: DEFAULT_CATEGORIES,
    mounted,
  };
}
