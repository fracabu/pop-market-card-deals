import React from 'react';
import { PokemonCard } from '../types';
import { TrendingUp, DollarSign, Award, Target } from 'lucide-react';

interface StatsDashboardProps {
  cards: PokemonCard[];
}

export default function StatsDashboard({ cards }: StatsDashboardProps) {
  const totalCards = cards.length;
  
  // Calculate stats
  const totalBuyUnder = cards.reduce((sum, card) => sum + card.buyUnder, 0);
  const totalResaleMin = cards.reduce((sum, card) => sum + card.resaleMin, 0);
  const totalResaleMax = cards.reduce((sum, card) => sum + card.resaleMax, 0);
  const avgResale = (totalResaleMin + totalResaleMax) / 2;
  const potentialProfit = avgResale - totalBuyUnder;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Stat 1: Totale Carte */}
      <div 
        id="stat-cards-count" 
        className="p-4 bg-white border-4 border-slate-950 rounded-2xl flex items-center gap-4 shadow-[4px_4px_0px_0px_#38bdf8] transition-all"
      >
        <div className="p-3 bg-sky-100 text-sky-900 rounded-xl border-2 border-slate-950 shrink-0">
          <Award className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider leading-none">Totale Carte</p>
          <p className="text-2xl font-black font-display text-slate-950 mt-1.5 leading-none">{totalCards}</p>
        </div>
      </div>

      {/* Stat 2: Budget di Acquisto */}
      <div 
        id="stat-buy-budget" 
        className="p-4 bg-white border-4 border-slate-950 rounded-2xl flex items-center gap-4 shadow-[4px_4px_0px_0px_#34d399] transition-all"
      >
        <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl border-2 border-slate-950 shrink-0">
          <Target className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider leading-none">Budget d'Acquisto</p>
          <p className="text-2xl font-black font-display text-emerald-600 mt-1.5 leading-none">{totalBuyUnder}€</p>
        </div>
      </div>

      {/* Stat 3: Valore Rivendita Medio */}
      <div 
        id="stat-resale-value" 
        className="p-4 bg-white border-4 border-slate-950 rounded-2xl flex items-center gap-4 shadow-[4px_4px_0px_0px_#facc15] transition-all"
      >
        <div className="p-3 bg-yellow-100 text-amber-900 rounded-xl border-2 border-slate-950 shrink-0">
          <TrendingUp className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider leading-none">Rivendita Media</p>
          <p className="text-2xl font-black font-display text-amber-600 mt-1.5 leading-none">{Math.round(avgResale)}€</p>
        </div>
      </div>

      {/* Stat 4: Margine Medio Totale */}
      <div 
        id="stat-potential-gain" 
        className="p-4 bg-white border-4 border-slate-950 rounded-2xl flex items-center gap-4 shadow-[4px_4px_0px_0px_#c084fc] transition-all"
      >
        <div className="p-3 bg-purple-100 text-purple-900 rounded-xl border-2 border-slate-950 shrink-0">
          <DollarSign className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider leading-none">Profitto Medio Stimato</p>
          <div className="flex items-baseline gap-1 mt-1.5 leading-none">
            <span className="text-2xl font-black font-display text-indigo-600">+{Math.round(potentialProfit)}€</span>
            <span className="text-xs font-black text-indigo-500 font-mono">({Math.round((potentialProfit / totalBuyUnder) * 100)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
