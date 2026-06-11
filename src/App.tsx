import React, { useState, useEffect } from 'react';
import { POKEMON_CARDS } from './data';
import { PokemonCard } from './types';
import StatsDashboard from './components/StatsDashboard';
import CardCard from './components/CardCard';
import SimulateModal from './components/SimulateModal';
import TransactionList from './components/TransactionList';
import { 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  TrendingUp, 
  RotateCcw, 
  HelpCircle,
  TrendingDown,
  Percent,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

export default function App() {
  // --- States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpansion, setSelectedExpansion] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'profit' | 'buyUnderLow' | 'buyUnderHigh' | 'name'>('profit');
  
  // LocalStorage state for track statuses
  const [cardStatuses, setCardStatuses] = useState<Record<string, 'looking' | 'bought' | 'sold' | 'none'>>(() => {
    try {
      const saved = localStorage.getItem('pkmn-card-statuses-v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // LocalStorage state for custom simulated deals/transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('pkmn-card-transactions-v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal active states
  const [selectedSimulateCard, setSelectedSimulateCard] = useState<PokemonCard | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('pkmn-card-statuses-v1', JSON.stringify(cardStatuses));
  }, [cardStatuses]);

  useEffect(() => {
    localStorage.setItem('pkmn-card-transactions-v1', JSON.stringify(transactions));
  }, [transactions]);

  // --- Handlers ---
  const handleStatusChange = (cardId: string, status: 'looking' | 'bought' | 'sold' | 'none') => {
    setCardStatuses(prev => ({
      ...prev,
      [cardId]: status
    }));
  };

  const handleSaveTransaction = (newTx: Transaction) => {
    setTransactions(prev => {
      const index = prev.findIndex(tx => tx.id === newTx.id);
      if (index !== -1) {
        // Edit existing
        const updated = [...prev];
        updated[index] = newTx;
        return updated;
      } else {
        // Add new
        return [newTx, ...prev];
      }
    });

    // Automatically synchronize status dropdown to 'bought' or 'sold' depending on simulate status!
    if (newTx.cardId) {
      handleStatusChange(
        newTx.cardId, 
        newTx.status === 'completed' ? 'sold' : 'bought'
      );
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  const handleResetAll = () => {
    if (window.confirm('Sei sicuro di voler resettare tutte le simulazioni e i tracciamenti?')) {
      setCardStatuses({});
      setTransactions([]);
      setSearchTerm('');
      setSelectedExpansion('All');
      setSelectedStatusFilter('All');
    }
  };

  // --- Filter & Sort Logic ---
  const expansions = ['All', ...Array.from(new Set(POKEMON_CARDS.map(c => c.expansion)))];

  const filteredCards = POKEMON_CARDS.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          card.expansion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          card.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExpansion = selectedExpansion === 'All' || card.expansion === selectedExpansion;
    
    const currentStatus = cardStatuses[card.id] || 'none';
    const matchesStatus = selectedStatusFilter === 'All' || 
                          (selectedStatusFilter === 'none' && currentStatus === 'none') ||
                          (selectedStatusFilter === currentStatus);

    return matchesSearch && matchesExpansion && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'profit') {
      const potentialA = ((a.resaleMin + a.resaleMax) / 2) - a.buyUnder;
      const potentialB = ((b.resaleMin + b.resaleMax) / 2) - b.buyUnder;
      return potentialB - potentialA; // Higher profit first
    }
    if (sortBy === 'buyUnderLow') {
      return a.buyUnder - b.buyUnder; // Lower buy budget first
    }
    if (sortBy === 'buyUnderHigh') {
      return b.buyUnder - a.buyUnder; // Higher buy budget first
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#fffdec] text-slate-900 flex flex-col font-sans selection:bg-rose-500/30 selection:text-slate-900 relative">
      
      {/* Header section (POPMARKET aesthetic: bg-rose-500 shadow-xl, italic title, robust yellow buttons) */}
      <header className="bg-rose-500 border-b-4 border-slate-950 sticky top-0 z-40 shadow-lg shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border-2 border-slate-950 rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
              <div className="w-8 h-8 bg-amber-400 border-2 border-slate-950 rounded-lg transform rotate-12 flex items-center justify-center font-black text-slate-950 text-xs">PK</div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight italic uppercase leading-none">
                POPMARKET DEALS
              </h1>
              <p className="text-[10px] md:text-xs text-yellow-250 text-yellow-300 font-extrabold uppercase mt-1">Tracciatore di Arbitraggio Pokémon per Rivenditori</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-yellow-300 text-slate-950 border-2 border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-transform cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 text-slate-950" />
              Come Funziona?
            </button>
            <button
              onClick={handleResetAll}
              className="p-2.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 border-2 border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-transform cursor-pointer"
              title="Resetta dati locali"
            >
              <RotateCcw className="h-4.5 w-4.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 space-y-8">

        {/* Explain Card Market Rules box */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-yellow-50 border-4 border-slate-950 p-6 rounded-[2.5rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-sm space-y-4">
                <h3 className="font-black font-display text-slate-950 text-base uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
                  Regole d'Oro per l'Arbitraggio Pokémon
                </h3>
                <p className="text-slate-800 font-bold leading-relaxed">
                  Questa applicazione ti consente di monitorare ed applicare strategie di acquisto e vendita per 
                  <strong> 14 carte Pokémon ad alta liquidità</strong>. Le soglie impostate sono sintonizzate sui valori effettivi del mercato europeo (Cardmarket):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                  <div className="space-y-1 bg-white p-4 rounded-2xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block">1. COMPRA SOTTO (BUY LIMIT)</span>
                    <p className="text-xs text-slate-600 font-bold leading-normal">
                      Il prezzo massimo a cui dovresti comprare la carta (su mercati privati, Vinted, eBay o lotti) per garantirti un profitto elevato nel momento in cui la rivendi.
                    </p>
                  </div>
                  <div className="space-y-1 bg-white p-4 rounded-2xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-xs font-black text-rose-500 uppercase tracking-wider block">2. RIVENDITA INDICATIVA</span>
                    <p className="text-xs text-slate-600 font-bold leading-normal">
                      Prezzo medio stimato di vendita rapida per carte in condizioni eccellenti (Excellent / Near Mint) singole su Cardmarket o canali specializzati.
                    </p>
                  </div>
                  <div className="space-y-1 bg-white p-4 rounded-2xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">3. SIMULA E LOGGA</span>
                    <p className="text-xs text-slate-600 font-bold leading-normal">
                      Clicca su "Simula Affare" per calcolare il ritorno sull'investimento (ROI) effettivo a seconda del tuo reale prezzo d'acquisto negoziato.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Interactive Stats Section (now neobrutalist style) */}
        <StatsDashboard cards={POKEMON_CARDS} />

        {/* Double-Panel Split: Core List & Simulation logger */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT/MAIN GRID: 2 cols on lg, whole width on small */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filters panel Container */}
            <div className="bg-white border-4 border-slate-950 p-5 rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search */}
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-650 font-bold" />
                <input
                  type="text"
                  placeholder="Cerca per carta, set, codice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-950 text-slate-950 text-sm font-bold rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder-slate-400"
                />
              </div>

              {/* Filters dropdown row */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Expansion filter */}
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-slate-800" />
                  <select
                    value={selectedExpansion}
                    onChange={(e) => setSelectedExpansion(e.target.value)}
                    className="text-xs font-bold bg-slate-50 border-2 border-slate-950 text-slate-900 rounded-lg p-2.5 focus:outline-none cursor-pointer"
                  >
                    <option value="All">Tutte le Espansioni</option>
                    {expansions.filter(ex => ex !== 'All').map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>

                {/* Tracking status filter */}
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border-2 border-slate-950 text-slate-900 rounded-lg p-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="All">Tutti gli Stati</option>
                  <option value="none">Nessuno Stato</option>
                  <option value="looking">In Cerca</option>
                  <option value="bought">Acquistate</option>
                  <option value="sold">Rivendute</option>
                </select>

                {/* Sorting */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-bold bg-slate-50 border-2 border-slate-950 text-slate-900 rounded-lg p-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="profit">Miglior Profitto Medio</option>
                  <option value="buyUnderLow">Budget Più Basso</option>
                  <option value="buyUnderHigh">Budget Più Alto</option>
                  <option value="name">Ordine Alfabetico</option>
                </select>
              </div>

            </div>

            {/* Matching items results count */}
            <div className="flex items-center justify-between text-xs text-slate-700 px-2 font-extrabold uppercase tracking-wide">
              <span>Mostrando <strong>{filteredCards.length}</strong> su {POKEMON_CARDS.length} carte</span>
              {(searchTerm || selectedExpansion !== 'All' || selectedStatusFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedExpansion('All');
                    setSelectedStatusFilter('All');
                  }}
                  className="text-rose-600 hover:underline font-black uppercase cursor-pointer"
                >
                  Azzera filtri
                </button>
              )}
            </div>

            {/* Pokemon Cards GRID */}
            {filteredCards.length > 0 ? (
              <motion.div 
                layout 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredCards.map((card) => (
                    <CardCard
                      key={card.id}
                      card={card}
                      status={cardStatuses[card.id] || 'none'}
                      onStatusChange={handleStatusChange}
                      onSimulate={setSelectedSimulateCard}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="bg-white border-4 border-slate-950 rounded-[2rem] p-12 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
                <Search className="h-12 w-12 text-slate-400 mb-4 stroke-[2]" />
                <h4 className="text-base font-black text-slate-950 uppercase tracking-tight">Nessun risultato trovato</h4>
                <p className="text-xs text-slate-650 font-bold mt-2">Prova a cambiare il testo inserito o ad azzerare i filtri attivi.</p>
              </div>
            )}
            
          </div>

          {/* RIGHT SIDE PANEL: Real Transactions Simulated list */}
          <div className="space-y-6">
            
            {/* Quick quick info helper */}
            <div className="bg-white border-4 border-slate-950 rounded-[2rem] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="font-extrabold text-sm text-slate-955 uppercase tracking-wide font-display flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span>Riepilogo Totali Reali</span>
              </h3>
              
              {/* Actual statistics tracker */}
              {transactions.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Investito Reale:</span>
                    <span className="font-mono font-black text-slate-950">
                      {transactions.reduce((s, t) => s + t.buyPrice, 0).toFixed(1)}€
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Operazioni Concluse:</span>
                    <span className="font-black text-slate-905 text-slate-950">
                      {transactions.filter(t => t.status === 'completed').length} / {transactions.length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-3 border-t-2 border-dashed border-slate-200">
                    <span className="text-slate-800 font-extrabold">MARGINE REALIZZATO:</span>
                    <span className={`font-mono font-black text-sm ${
                      transactions.reduce((s, tx) => {
                        if (tx.status === 'completed' && tx.sellPrice !== null) {
                          return s + (tx.sellPrice - tx.buyPrice);
                        }
                        return s;
                      }, 0) >= 0 ? 'text-emerald-650' : 'text-red-650'
                    }`}>
                      {transactions.reduce((s, tx) => {
                        if (tx.status === 'completed' && tx.sellPrice !== null) {
                          return s + (tx.sellPrice - tx.buyPrice);
                        }
                        return s;
                      }, 0).toFixed(1)}€
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-650 leading-relaxed font-bold">
                  Nessuna operazione registrata. Clicca su "Simula Affare" e inserisci i prezzi spesi per calcolare i tuoi ritorni reali.
                </p>
              )}
            </div>

            {/* List of Simulated Transactions */}
            <TransactionList
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onEditTransaction={setEditingTransaction}
            />

          </div>

        </div>

      </main>

      {/* Footer (Consistent with "POPMARKET STUDIO" theme footer) */}
      <footer className="bg-white border-t-4 border-rose-500 py-8 shrink-0">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-rose-500 font-black text-xs uppercase tracking-widest text-center md:text-left">
            © 2026 POPMARKET STUDIO • VALORI INDICATIVI MEDI EUROPEI
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-3.5 h-3.5 bg-teal-400 rounded-full border-2 border-slate-950"></div>
            <div className="w-3.5 h-3.5 bg-yellow-400 rounded-full border-2 border-slate-950"></div>
            <div className="w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-950"></div>
          </div>
          <div className="text-rose-500 font-black text-xs uppercase tracking-widest text-center md:text-right">
            TERMINI E CONDIZIONI DEALS
          </div>
        </div>
      </footer>

      {/* Simulate modal */}
      <AnimatePresence>
        {selectedSimulateCard && (
          <SimulateModal
            card={selectedSimulateCard}
            onClose={() => setSelectedSimulateCard(null)}
            onSaveTransaction={handleSaveTransaction}
          />
        )}
        {editingTransaction && (
          <SimulateModal
            card={POKEMON_CARDS.find(c => c.id === editingTransaction.cardId) || null}
            existingTransaction={editingTransaction}
            onClose={() => setEditingTransaction(null)}
            onSaveTransaction={handleSaveTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

