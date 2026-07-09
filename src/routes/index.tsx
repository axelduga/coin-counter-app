import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PlusCircle, ArrowUpRight, ArrowDownRight, Wallet, AlertCircle, Tag, FileText, Coins, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "Dólar ($)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "GBP", symbol: "£", label: "Libra (£)" },
  { code: "PYG", symbol: "Gs. ", label: "Guaraní (Gs.)" },
  { code: "MXN", symbol: "MX$", label: "Peso Mex (MX$)" },
  { code: "ARS", symbol: "AR$", label: "Peso Arg (AR$)" },
];

function Index() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [budgetLimit, setBudgetLimit] = useState<number>(500);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const isOverBudget = totalExpenses > budgetLimit;

  const handleAddTransaction = (transactionType: "income" | "expense") => {
    if (!description || !amount || !category) {
      toast.error("Por favor, completa la descripción, el monto y la categoría.");
      return;
    }

    const currentAmount = parseFloat(amount);
    if (isNaN(currentAmount) || currentAmount <= 0) {
      toast.error("Por favor, ingresa un monto válido mayor a 0.");
      return;
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount: currentAmount,
      type: transactionType,
      category,
      date: new Date().toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription("");
    setAmount("");
    setCategory("");

    if (transactionType === "expense" && totalExpenses + currentAmount > budgetLimit) {
      toast.error(`⚠️ ¡Alerta de Presupuesto! Has superado tu límite mensual de ${currencySymbol}${budgetLimit}`);
    } else {
      toast.success(transactionType === "income" ? "Ingreso registrado" : "Gasto registrado");
    }
  };

  const exportToPDF = () => {
    if (transactions.length === 0) {
      toast.error("No hay movimientos registrados para exportar.");
      return;
    }

    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("COINCOUNTER - REPORTE CONTABLE", 14, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 27);
    
    doc.setDrawColor(230);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 33, 182, 24, "FD");
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text("RESUMEN FINANCIERO:", 20, 40);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Ingresos Totales: ${currencySymbol}${totalIncome.toFixed(2)}`, 20, 48);
    doc.text(`Gastos Totales: ${currencySymbol}${totalExpenses.toFixed(2)}`, 85, 48);
    doc.text(`Balance Neto: ${currencySymbol}${balance.toFixed(2)}`, 150, 48);

    const tableRows = transactions.map((t) => [
      t.date,
      t.description,
      t.category,
      t.type === "income" ? "Ingreso" : "Gasto",
      `${t.type === "income" ? "+" : "-"}${currencySymbol}${t.amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 65,
      head: [["Fecha", "Descripción", "Categoría", "Tipo", "Importe"]],
      body: tableRows,
      headStyles: { fillColor: [15, 23, 42], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: 65 },
      styles: { font: "helvetica", fontSize: 10 },
    });

    doc.save(`Balance_Contable_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF descargado correctamente");
  };

  return (
    <div className={`min-h-screen px-4 py-8 md:py-12 transition-colors duration-500 ${isOverBudget ? 'bg-red-50/40' : 'bg-slate-50/60'}`}>
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">CoinCounter</h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">Gestiona tus finanzas con claridad y control total</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <Coins className="h-3.5 w-3.5 text-slate-400" />
              <Select value={currencySymbol} onValueChange={setCurrencySymbol}>
                <SelectTrigger className="border-0 focus:ring-0 h-7 w-[110px] p-0 font-semibold text-slate-700 bg-transparent text-xs uppercase tracking-wider">
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((cur) => (
                    <SelectItem key={cur.code} value={cur.symbol} className="text-xs">
                      {cur.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Label htmlFor="budget" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Límite:</Label>
              <div className="relative flex items-center">
                <span className="absolute left-1 text-slate-400 text-xs font-bold">{currencySymbol}</span>
                <Input
                  id="budget"
                  type="number"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(Number(e.target.value) || 0)}
                  className="w-20 h-7 pl-5 pr-1 text-right font-semibold text-slate-700 bg-slate-50/50 border-slate-200 focus-visible:ring-slate-400 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {isOverBudget && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-900 rounded-2xl shadow-sm">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-bold text-red-700">Presupuesto Excedido:</span> Has gastado un total de <span className="font-bold underline decoration-red-400">{currencySymbol}{totalExpenses.toFixed(2)}</span>, superando tu techo establecido de {currencySymbol}{budgetLimit}.
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Balance Disponible</p>
                <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <div className={`text-2xl font-black mt-2 tracking-tight ${balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                {currencySymbol}{balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Ingresos</p>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black mt-2 tracking-tight text-emerald-600">
                +{currencySymbol}{totalIncome.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Gastos</p>
                <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-rose-50 text-rose-600'}`}>
                  <ArrowDownRight className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black mt-2 tracking-tight text-rose-600">
                -{currencySymbol}{totalExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200/80 shadow-md bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
            <CardTitle className="text-base font-bold text-slate-800">Nueva Operación</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold text-slate-600 tracking-wide flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" /> Descripción
                </Label>
                <Input
                  id="description"
                  placeholder="Ej. Nómina mensual, Compra supermercado..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-slate-200 focus-visible:ring-slate-400 h-10 rounded-lg"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-xs font-bold text-slate-600 tracking-wide flex items-center gap-1.5">
                    <span className="text-slate-400 font-bold text-xs">{currencySymbol}</span> Importe
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border-slate-200 focus-visible:ring-slate-400 h-10 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs font-bold text-slate-600 tracking-wide flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-slate-400" /> Categoría
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="border-slate-200 focus:ring-slate-400 h-10 rounded-lg">
                      <SelectValue placeholder="Selecciona el rubro" />
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
              </div>

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <Button 
                  type="button" 
                  onClick={() => handleAddTransaction("income")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 rounded-xl transition-all shadow-sm active:scale-[0.99]"
                >
                  <ArrowUpRight className="mr-2 h-4 w-4 stroke-[3]" /> Añadir Ingreso
                </Button>
                
                <Button 
                  type="button" 
                  onClick={() => handleAddTransaction("expense")}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 rounded-xl transition-all shadow-sm active:scale-[0.99]"
                >
                  <ArrowDownRight className="mr-2 h-4 w-4 stroke-[3]" /> Añadir Gasto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between pl-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Movimientos Recientes</h2>
            <Button
              onClick={exportToPDF}
              variant="outline"
              size="sm"
              className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg gap-1.5 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5" /> Exportar PDF
            </Button>
          </div>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 subtle-scrollbar">
            {transactions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 shadow-inner">
                <p className="text-sm text-slate-400 font-medium">
                  No hay transacciones guardadas en esta sesión.
                </p>
              </div>
            ) : (
              transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      t.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}>
                      {t.type === "income" ? <ArrowUpRight className="h-4 w-4 stroke-[2.5]" /> : <ArrowDownRight className="h-4 w-4 stroke-[2.5]" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-800 tracking-tight group-hover:text-slate-900 transition-colors">{t.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 text-[10px] uppercase font-bold tracking-wide">{t.category}</span>
                        <span>•</span>
                        <span>{t.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-sm font-bold tracking-tight ${
                    t.type === "income" ? "text-emerald-600" : "text-slate-900"
                  }`}>
                    {t.type === "income" ? "+" : "-"}{currencySymbol}{t.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
