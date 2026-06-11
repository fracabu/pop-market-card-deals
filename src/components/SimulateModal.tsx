import React, { useState, useEffect } from 'react';
import { PokemonCard } from '../types';
import { X, Save, Trash2, TrendingUp, Sparkles } from 'lucide-react';

interface SimulateModalProps {
  card: PokemonCard | null;
  onClose: () => void;
  onSaveTransaction: (transaction: {
    id: string;
    cardId: string;
    cardName: string;
    buyPrice: number;
    sellPrice: number | null;
    status: 'bought' | 'completed';
    notes: string;
    date: string;
  }) => void;
  existingTransaction?: {
    id: string;
    cardId: string;
    cardName: string;
    buyPrice: number;
    sellPrice: number | null;
    status: 'bought' | 'completed';
    notes: string;
    date: string;
  } | null;
  onDeleteTransaction?: (id: string) => void;
}

export default function SimulateModal({
  card,
  onClose,
  onSaveTransaction,
  existingTransaction,
  onDeleteTransaction
}: SimulateModalProps) {
  if (!card && !existingTransaction) return null;

  // If editing, use existing values, otherwise defaults
  const [buyPrice, setBuyPrice] = useState<number>(
    existingTransaction ? existingTransaction.buyPrice : (card?.buyUnder || 0)
  );
  const [sellPrice, setSellPrice] = useState<string>(
    existingTransaction && existingTransaction.sellPrice !== null
      ? existingTransaction.sellPrice.toString()
      : card ? Math.round((card.resaleMin + card.resaleMax) / 2).toString() : ''
  );
  const [status, setStatus] = useState<'bought' | 'completed'>(
    existingTransaction ? existingTransaction.status : 'completed'
  );
  const [notes, setNotes] = useState<string>(
    existingTransaction ? existingTransaction.notes : ''
  );

  // Sync state if mock changes out of order
  useEffect(() => {
    if (existingTransaction) {
      setBuyPrice(existingTransaction.buyPrice);
      setSellPrice(existingTransaction.sellPrice !== null ? existingTransaction.sellPrice.toString() : '');
      setStatus(existingTransaction.status);
      setNotes(existingTransaction.notes);
    } else if (card) {
      setBuyPrice(card.buyUnder);
      setSellPrice(Math.round((card.resaleMin + card.resaleMax) / 2).toString());
      setStatus('completed');
      setNotes('');
    }
  }, [card, existingTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedSell = sellPrice === '' ? null : parseFloat(sellPrice);
    
    onSaveTransaction({
      id: existingTransaction?.id || `tx-${Date.now()}`,
      cardId: card?.id || existingTransaction?.cardId || '',
      cardName: card?.name || existingTransaction?.cardName || '',
      buyPrice,
      sellPrice: status === 'completed' ? parsedSell : null,
      status,
      notes,
      date: existingTransaction?.date || new Date().toISOString().split('T')[0]
    });
    
    onClose();
  };

  const calculatedProfit = status === 'completed' && sellPrice !== ''
    ? parseFloat(sellPrice) - buyPrice
    : null;

  const currentCard = card || {
    name: existingTransaction?.cardName || '',
    imageUrl: '',
    emoji: '',
    buyUnder: 0,
    resaleMin: 0,
    resaleMax: 0,
    expansion: ''
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white border-4 border-slate-950 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header (Vibrant Rose header as specified in Vibrant Palette) */}
        <div className="flex items-center justify-between px-6 py-4 bg-rose-500 border-b-4 border-slate-950 text-white shrink-0">
          <h3 className="text-lg font-black uppercase tracking-tight font-display flex items-center gap-2">
            <TrendingUp className="h-5 w-5 stroke-[2.5]" />
            <span>{existingTransaction ? 'Modifica Operazione' : 'Simulatore di Affare'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-rose-600 rounded-lg border-2 border-slate-950 bg-white text-slate-950 font-bold transition-all cursor-pointer box-border"
          >
            <X className="h-5 w-5 stroke-[3]" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-900 bg-white">
          
          {/* Card Info Summary */}
          <div className="flex items-center gap-4 bg-amber-50 border-2 border-slate-950 p-3.5 rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            {currentCard.imageUrl ? (
              <img
                src={currentCard.imageUrl}
                alt={currentCard.name}
                className="w-14 h-18 object-contain rounded-md border-2 border-slate-950 bg-white p-1"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-18 bg-white border-2 border-slate-950 rounded-md flex items-center justify-center text-slate-400 shrink-0">
                <Sparkles className="h-6 w-6 stroke-[2]" />
              </div>
            )}
            <div>
              <p className="text-sm font-black uppercase text-slate-950 tracking-tight leading-none mb-1.5">{currentCard.name}</p>
              {card && (
                <p className="text-xs font-bold text-slate-650 flex flex-wrap gap-x-2 gap-y-0.5 leading-tight">
                  <span>Target: <strong className="text-emerald-700 font-mono">{card.buyUnder}€</strong></span>
                  <span>|</span>
                  <span>Rivendita: <strong className="text-rose-500 font-mono">{card.resaleMin}-{card.resaleMax}€</strong></span>
                </p>
              )}
            </div>
          </div>

          {/* Status Choose */}
          <div>
            <span className="block text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1.5">Stato Operazione</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase border-2 border-slate-950 transition-all duration-100 cursor-pointer ${
                  status === 'completed'
                    ? 'bg-emerald-300 text-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                Comprata & Rivenduta
              </button>
              <button
                type="button"
                onClick={() => setStatus('bought')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase border-2 border-slate-950 transition-all duration-100 cursor-pointer ${
                  status === 'bought'
                    ? 'bg-sky-300 text-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                In Magazzino
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Buy Price */}
            <div>
              <label className="block text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1.5">Prezzo d'Acquisto (€)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-800 text-sm font-black font-mono">€</span>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border-2 border-slate-950 text-slate-950 font-bold font-mono text-sm rounded-xl pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Sell Price */}
            <div>
              <label className="block text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1.5">
                Prezzo di Vendita (€)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-850 text-sm font-black font-mono">€</span>
                <input
                  type="number"
                  required={status === 'completed'}
                  disabled={status === 'bought'}
                  min="0.1"
                  step="0.1"
                  placeholder={status === 'bought' ? 'Nessuno' : '0.00'}
                  value={status === 'bought' ? '' : sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  className="w-full bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 border-2 border-slate-950 text-slate-950 font-bold font-mono text-sm rounded-xl pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Real-time Math profit check */}
          {status === 'completed' && calculatedProfit !== null && (
            <div className={`p-3.5 rounded-2xl border-2 border-slate-950 flex items-center justify-between text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
              calculatedProfit >= 0
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-rose-100 text-rose-900'
            }`}>
              <span className="font-black uppercase tracking-tight">Ritorno Stimato:</span>
              <span className="font-mono font-black text-base leading-none">
                {calculatedProfit >= 0 ? '+' : ''}{calculatedProfit.toFixed(1)}€ 
                <span className="text-xs ml-1 font-bold">({buyPrice > 0 ? Math.round((calculatedProfit / buyPrice) * 100) : 0}% ROI)</span>
              </span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1.5">Note private dell'affare</label>
            <textarea
              placeholder="Es. acquistato su eBay da lotto privato, condizioni mint."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border-2 border-slate-950 text-slate-950 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-slate-450 resize-none font-bold"
            />
          </div>

          {/* Footer Save & Delete */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-dashed border-slate-200">
            {existingTransaction && onDeleteTransaction && (
              <button
                type="button"
                onClick={() => {
                  onDeleteTransaction(existingTransaction.id);
                  onClose();
                }}
                className="mr-auto flex items-center gap-1.5 px-3 py-2 bg-rose-100 hover:bg-rose-200 border-2 border-slate-950 rounded-xl text-rose-700 text-xs font-black uppercase shadow-[2.5px_2.5px_0px_0px_#000000] cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Elimina
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border-2 border-slate-950 text-slate-950 text-xs font-black uppercase rounded-xl shadow-[2.5px_2.5px_0px_0px_#000000] cursor-pointer"
            >
              Annulla
            </button>
            
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-550 hover:bg-yellow-400 border-2 border-slate-950 text-slate-950 text-xs font-black uppercase rounded-xl shadow-[2.5px_2.5px_0px_0px_#000000] cursor-pointer transition-all active:translate-y-[1px] active:translate-x-[1px] active:shadow-[1px_1px_0px_0px_#000000]"
            >
              <Save className="h-4 w-4" />
              Salva
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
