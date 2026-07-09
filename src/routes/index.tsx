import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  Wallet,
  TrendingUp,
  TrendingDown,
  X,
  ChevronDown,
  Settings,
} from "lucide-react";
import { useTransactions, type TransactionType } from "@/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mi Dinero — Control de Gastos" },
      { name: "description", content: "Controla tus ingresos y gastos diarios de forma sencilla." },
      { property: "og:title", content: "Mi Dinero — Control de Gastos" },
      { property: "og:description", content: "Controla tus ingresos y gastos diarios de forma sencilla." },
    ],
  }),
  component: Index,
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Index() {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    income,
    expense,
    balance,
    budgetLimit,
    setBudgetLimit,
    categories,
    mounted,
  } = useTransactions();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [newBudgetLimit, setNewBudgetLimit] = useState(String(budgetLimit));

  function openModal(type: TransactionType) {
    setModalType(type);
    setAmount("");
    setDescription("");
    setCategory("");
    setShowCategoryPicker(false);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(amount.replace(",", "."));
    if (!val || val <= 0) return;
    addTransaction({
      type: modalType,
      amount: val,
      description: description.trim() || (modalType === "income" ? "Ingreso" : "Gasto"),
      category: category || (modalType === "income" ? "Otros" : "Otros"),
    });
    closeModal();
  }

  const recentTransactions = transactions.slice(0, 50);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const overBudget = expense > budgetLimit;

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Balance */}
      <header
        className={`relative overflow-hidden px-4 pb-10 pt-8 text-primary-foreground transition-colors duration-500 sm:px-6 lg:px-8 ${
          overBudget ? "bg-expense" : "bg-primary"
        }`}
      >
        <div className="mx-auto max-w-md">
          <div className="mb-1 flex items-center gap-2 opacity-80">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide">TU BALANCE</span>
          </div>
          <div className="text-5xl font-extrabold tracking-tight">
            {formatCurrency(balance)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-sm opacity-80">
                <TrendingUp className="h-4 w-4" />
                <span>Ingresos</span>
              </div>
              <div className="mt-1 text-lg font-bold">{formatCurrency(income)}</div>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-sm opacity-80">
                  <TrendingDown className="h-4 w-4 shrink-0" />
                  <span>Gastos</span>
                  <button
                    onClick={() => {
                      setNewBudgetLimit(String(budgetLimit));
                      setBudgetModalOpen(true);
                    }}
                    className="ml-1 rounded p-0.5 text-white/60 hover:bg-white/20 hover:text-white"
                    aria-label="Configurar presupuesto"
                    title="Configurar presupuesto"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                </div>
                {overBudget && (
                  <div className="flex shrink-0 items-center gap-1 rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Alerta</span>
                  </div>
                )}
              </div>
              <div className="mt-1 text-lg font-bold">{formatCurrency(expense)}</div>
              {overBudget && (
                <div className="mt-1 text-[11px] font-semibold text-red-100">
                  ¡Cuidado con el presupuesto!
                </div>
              )}
            </div>
          </div>
        </div>
      </header>


      {/* Action Buttons */}
      <div className="mx-auto -mt-5 max-w-md px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => openModal("income")}
            className="h-14 gap-2 rounded-2xl bg-income text-white shadow-lg shadow-income/25 hover:bg-income/90"
          >
            <ArrowDownLeft className="h-5 w-5" />
            <span className="text-base font-semibold">Añadir Ingreso</span>
          </Button>
          <Button
            onClick={() => openModal("expense")}
            className="h-14 gap-2 rounded-2xl bg-expense text-white shadow-lg shadow-expense/25 hover:bg-expense/90"
          >
            <ArrowUpRight className="h-5 w-5" />
            <span className="text-base font-semibold">Añadir Gasto</span>
          </Button>
        </div>
      </div>

      {/* Expense Breakdown by Category */}
      {(() => {
        const byCategory = transactions
          .filter((t) => t.type === "expense")
          .reduce<Record<string, number>>((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {});
        const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
        if (entries.length === 0) return null;
        const max = entries[0][1];
        const palette = [
          "bg-expense",
          "bg-orange-500",
          "bg-amber-500",
          "bg-yellow-500",
          "bg-rose-500",
          "bg-pink-500",
          "bg-purple-500",
          "bg-indigo-500",
        ];
        return (
          <section className="mx-auto max-w-md px-4 pt-6 sm:px-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Gastos por categoría
            </h2>
            <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
              {entries.map(([cat, amt], i) => {
                const pct = expense > 0 ? (amt / expense) * 100 : 0;
                const barPct = max > 0 ? (amt / max) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{cat}</span>
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {formatCurrency(amt)}
                        </span>
                        <span className="ml-2 text-xs">{pct.toFixed(1)}%</span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${palette[i % palette.length]} transition-all`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>Categoría con más gasto</span>
                <span className="font-semibold text-expense">{entries[0][0]}</span>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Transactions List */}
      <main className="mx-auto max-w-md px-4 py-6 sm:px-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Movimientos recientes
        </h2>
        {recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Sin movimientos todavía
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Toca un botón para registrar tu primer ingreso o gasto
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/40"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    tx.type === "income"
                      ? "bg-income-muted text-income"
                      : "bg-expense-muted text-expense"
                  }`}
                >
                  {tx.type === "income" ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {tx.description}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                      {tx.category}
                    </span>
                    <span>{formatDate(tx.date)}</span>
                  </div>
                </div>
                <div
                  className={`shrink-0 text-right text-sm font-bold ${
                    tx.type === "income" ? "text-income" : "text-expense"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </div>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-card p-5 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {modalType === "income" ? "Nuevo Ingreso" : "Nuevo Gasto"}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount" className="mb-1.5 block text-sm font-medium">
                  Cantidad
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="1"
                    min="1"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    autoFocus
                    className="h-12 text-lg"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    Gs.
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="mb-1.5 block text-sm font-medium">
                  Concepto
                </Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Ej: Compra supermercado"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="relative">
                <Label className="mb-1.5 block text-sm font-medium">Categoría</Label>
                <button
                  type="button"
                  onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                  className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm text-foreground hover:bg-accent"
                >
                  <span>{category || "Selecciona una categoría"}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {showCategoryPicker && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowCategoryPicker(false)}
                    />
                    <div className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
                      {categories[modalType].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategory(cat);
                            setShowCategoryPicker(false);
                          }}
                          className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            category === cat
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <Button
                type="submit"
                className={`h-12 w-full rounded-xl text-base font-bold ${
                  modalType === "income"
                    ? "bg-income hover:bg-income/90"
                    : "bg-expense hover:bg-expense/90"
                }`}
              >
                {modalType === "income" ? "Registrar Ingreso" : "Registrar Gasto"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Budget Limit Modal */}
      {budgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setBudgetModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-card p-5 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Configurar alerta de presupuesto</h3>
              <button
                onClick={() => setBudgetModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = parseInt(newBudgetLimit.replace(/\./g, "").replace(",", ""), 10);
                if (val && val > 0) {
                  setBudgetLimit(val);
                  setBudgetModalOpen(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="budgetLimit" className="mb-1.5 block text-sm font-medium">
                  Límite de gastos (Gs.)
                </Label>
                <div className="relative">
                  <Input
                    id="budgetLimit"
                    type="number"
                    step="1"
                    min="1"
                    placeholder="500000"
                    value={newBudgetLimit}
                    onChange={(e) => setNewBudgetLimit(e.target.value)}
                    required
                    autoFocus
                    className="h-12 text-lg"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    Gs.
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Se mostrará una alerta cuando tus gastos superen este monto.
                </p>
              </div>
              <Button type="submit" className="h-12 w-full rounded-xl bg-primary text-base font-bold hover:bg-primary/90">
                Guardar límite
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
