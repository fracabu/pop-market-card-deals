import React from 'react';
import { Trash2, AlertCircle, TrendingUp, CheckCircle, Package } from 'lucide-react';

interface Transaction {
  id: string;
  cardId: string;
  cardName: string;
  buyPrice: number;
  sellPrice: number | null;
  status: 'bought' | 'completed';
  notes: string;
  date: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export default function TransactionList({
  transactions,
  onDeleteTransaction,
  onEditTransaction
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white border-4 border-slate-950 rounded-[2rem] p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-3 border-2 border-slate-950">
          <AlertCircle className="h-6 w-6 text-indigo-600" />
        </div>
        <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">Nessuna simulazione attiva</h4>
        <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto font-bold leading-normal">
          Usa il pulsante <strong className="text-rose-600 uppercase">"Simula Affare"</strong> su qualsiasi carta per calcolare il tuo profitto e registrarne l'acquisto.
        </p>
      </div>
    );
  }

  const totalMockProfit = transactions.reduce((sum, tx) => {
    if (tx.status === 'completed' && tx.sellPrice !== null) {
      return sum + (tx.sellPrice - tx.buyPrice);
    }
    return sum;
  }, 0);

  return (
    <div className="bg-white border-4 border-slate-950 rounded-[2rem] overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      
      {/* Title / Summary */}
      <div className="p-5 bg-slate-55 bg-rose-50 border-b-4 border-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h4 className="text-base font-black text-slate-950 uppercase tracking-tight font-display">Simulazioni Loggate</h4>
          <p className="text-[11px] text-slate-600 font-extrabold mt-0.5">Le tue compravendite simulate nel browser.</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 border-2 border-slate-950 px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <TrendingUp className="h-4.5 w-4.5 text-slate-950 shrink-0" />
          <span className="text-xs text-slate-950 font-black uppercase tracking-tight">Profitto:</span>
          <span className={`text-sm font-black font-mono ${totalMockProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {totalMockProfit >= 0 ? '+' : ''}{totalMockProfit.toFixed(1)}€
          </span>
        </div>
      </div>

      {/* List items */}
      <div className="divide-y-2 divide-slate-150 max-h-[400px] overflow-y-auto">
        {transactions.map((tx) => {
          const profit = tx.sellPrice !== null ? tx.sellPrice - tx.buyPrice : null;
          const roi = profit !== null ? Math.round((profit / tx.buyPrice) * 100) : 0;

          return (
            <div key={tx.id} className="p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black uppercase text-slate-950 tracking-tight">{tx.cardName}</span>
                  {tx.status === 'completed' ? (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 rounded-full font-black border-2 border-slate-950 uppercase">
                      <CheckCircle className="h-3 w-3" /> Completato
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] bg-sky-100 text-sky-800 rounded-full font-black border-2 border-slate-950 uppercase">
                      <Package className="h-3 w-3" /> Magazzino
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-bold">
                  <span>Data: <span className="font-mono text-slate-900">{tx.date}</span></span>
                  <span>Acquisto: <span className="font-mono text-emerald-600">{tx.buyPrice}€</span></span>
                  {tx.sellPrice !== null && (
                    <span>Venduto: <span className="font-mono text-rose-600">{tx.sellPrice}€</span></span>
                  )}
                </div>
                {tx.notes && (
                  <p className="text-xs text-slate-700 bg-amber-50/50 p-2 rounded-lg border-2 border-dashed border-slate-200 inline-block max-w-full italic mt-2">
                    "{tx.notes}"
                  </p>
                )}
              </div>

              {/* Profit & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t-2 border-dashed border-slate-100 sm:border-0 pt-3 sm:pt-0 shrink-0">
                {profit !== null ? (
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block uppercase font-black tracking-wide leading-none">PROFITTO</span>
                    <span className={`text-base font-black font-mono leading-none block mt-1.5 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {profit >= 0 ? '+' : ''}{profit.toFixed(1)}€
                    </span>
                    <span className="text-[10px] text-slate-500 block font-black font-mono mt-0.5">({roi}% ROI)</span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block uppercase font-black tracking-wide leading-none">ATTESA</span>
                    <span className="text-xs font-black text-rose-500 font-mono mt-1.5 block">Pronta per rivendita</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onEditTransaction(tx)}
                    className="p-1.5 px-3 bg-white hover:bg-slate-100 border-2 border-slate-950 text-slate-950 text-xs font-black uppercase rounded-lg transition-all shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="p-2 bg-rose-100 hover:bg-rose-200 border-2 border-slate-950 text-rose-700 text-xs font-black rounded-lg transition-all shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                    title="Elimina"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
