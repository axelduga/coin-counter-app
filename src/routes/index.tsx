import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  Wallet,
  TrendingUp,
  TrendingDown,
  X,
  ChevronDown,
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
    categories,
    mounted,
  } = useTransactions();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Balance */}
      <header className="relative overflow-hidden bg-primary px-4 pb-10 pt-8 text-primary-foreground sm:px-6 lg:px-8">
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
              <div className="flex items-center gap-1.5 text-sm opacity-80">
                <TrendingDown className="h-4 w-4" />
                <span>Gastos</span>
              </div>
              <div className="mt-1 text-lg font-bold">{formatCurrency(expense)}</div>
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
    </div>
  );
}
