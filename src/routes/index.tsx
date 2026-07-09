import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PlusCircle, ArrowUpRight, ArrowDownRight, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// CAMBIO: Ahora usamos Sonner (toast) que ya está instalado en tu app
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

const CATEGORIES = [
  "Comida",
  "Transporte",
  "Vivienda",
  "Entretenimiento",
  "Servicios",
  "Otros",
];

function Index() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  
  // Estado para controlar el límite de presupuesto (por defecto $500)
  const [budgetLimit, setBudgetLimit] = useState<number>(500);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Variable para saber si nos pasamos del presupuesto
  const isOverBudget = totalExpenses > budgetLimit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || !category) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const currentAmount = parseFloat(amount);

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount: currentAmount,
      type,
      category,
      date: new Date().toLocaleDateString(),
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription("");
    setAmount("");
    setCategory("");

    // ALERTA REVISADA CON SONNER
    if (type === "expense" && totalExpenses + currentAmount > budgetLimit) {
      toast.error(`⚠️ ¡Alerta de Presupuesto! Has superado tu límite mensual de $${budgetLimit}`);
    } else {
      toast.success("Transacción agregada correctamente");
    }
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-500 ${isOverBudget ? 'bg-red-50/50' : 'bg-gray-50/50'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">CoinCounter</h1>
            <p className="text-muted-foreground">Gestiona tus finanzas de forma simple</p>
          </div>
          
          {/* Control para ajustar el límite de presupuesto */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
            <Label htmlFor="budget" className="text-xs font-semibold text-gray-600 uppercase">Límite Gastos:</Label>
            <Input
              id="budget"
              type="number"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(Number(e.target.value) || 0)}
              className="w-24 h-8 text-right font-medium"
            />
          </div>
        </div>

        {/* BANNER DE ADVERTENCIA: Solo aparece si estás excedido */}
        {isOverBudget && (
          <div className="flex items-center gap-3 p-4 bg-red-100 border border-red-200 text-red-800 rounded-xl shadow-sm animate-pulse">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-bold">¡Atención!</span> Has gastado <span className="font-bold">${totalExpenses}</span>, superando tu límite establecido de ${budgetLimit}.
            </div>
          </div>
        )}

        {/* Tarjetas de Resumen */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-600 underline decoration-wavy' : 'text-red-600'}`}>
                ${totalExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Transacción</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    placeholder="Ej. Supermercado, Sueldo"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={type} onValueChange={(v: "income" | "expense") => setType(v)}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Ingreso</SelectItem>
                        <SelectItem value="expense">Gasto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Historial */}
          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay transacciones registradas.
                  </p>
                ) : (
                  transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{t.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.category} • {t.date}
                        </p>
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          t.type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
