import React, { useState } from 'react';
import { PokemonCard } from '../types';
import { ExternalLink, TrendingUp, PenSquare, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface CardCardProps {
  key?: string;
  card: PokemonCard;
  status: 'looking' | 'bought' | 'sold' | 'none';
  onStatusChange: (cardId: string, status: 'looking' | 'bought' | 'sold' | 'none') => void;
  onSimulate: (card: PokemonCard) => void;
}

const CARD_COLOR_THEMES = [
  { border: 'border-teal-400', shadow: 'shadow-[6px_6px_0px_0px_#2dd4bf]', hoverBg: 'hover:bg-teal-50', iconBg: 'bg-teal-100/55', textBg: 'bg-teal-50', badgeBorder: 'border-teal-300', accentText: 'text-teal-700' },
  { border: 'border-yellow-400', shadow: 'shadow-[6px_6px_0px_0px_#facc15]', hoverBg: 'hover:bg-yellow-50', iconBg: 'bg-yellow-100/55', textBg: 'bg-yellow-50', badgeBorder: 'border-yellow-300', accentText: 'text-amber-850' },
  { border: 'border-indigo-400', shadow: 'shadow-[6px_6px_0px_0px_#818cf8]', hoverBg: 'hover:bg-indigo-50', iconBg: 'bg-indigo-100/55', textBg: 'bg-indigo-50', badgeBorder: 'border-indigo-300', accentText: 'text-indigo-800' },
  { border: 'border-orange-400', shadow: 'shadow-[6px_6px_0px_0px_#fb923c]', hoverBg: 'hover:bg-orange-50', iconBg: 'bg-orange-100/55', textBg: 'bg-orange-50', badgeBorder: 'border-orange-300', accentText: 'text-orange-900' },
  { border: 'border-purple-400', shadow: 'shadow-[6px_6px_0px_0px_#c084fc]', hoverBg: 'hover:bg-purple-50', iconBg: 'bg-purple-100/55', textBg: 'bg-purple-50', badgeBorder: 'border-purple-300', accentText: 'text-purple-800' },
  { border: 'border-lime-400', shadow: 'shadow-[6px_6px_0px_0px_#a3e635]', hoverBg: 'hover:bg-lime-50', iconBg: 'bg-lime-100/55', textBg: 'bg-lime-50', badgeBorder: 'border-lime-300', accentText: 'text-lime-800' },
  { border: 'border-pink-400', shadow: 'shadow-[6px_6px_0px_0px_#f472b6]', hoverBg: 'hover:bg-pink-50', iconBg: 'bg-pink-100/55', textBg: 'bg-pink-50', badgeBorder: 'border-pink-300', accentText: 'text-pink-900' },
  { border: 'border-sky-400', shadow: 'shadow-[6px_6px_0px_0px_#38bdf8]', hoverBg: 'hover:bg-sky-50', iconBg: 'bg-sky-100/55', textBg: 'bg-sky-50', badgeBorder: 'border-sky-300', accentText: 'text-sky-800' }
];

export default function CardCard({ card, status, onStatusChange, onSimulate }: CardCardProps) {
  const [imageError, setImageError] = useState(false);
  const minGain = card.resaleMin - card.buyUnder;
  const maxGain = card.resaleMax - card.buyUnder;
  const avgGain = (minGain + maxGain) / 2;
  const roi = Math.round((avgGain / card.buyUnder) * 100);

  // Deterministic colorful theme selection
  const hash = card.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const theme = CARD_COLOR_THEMES[hash % CARD_COLOR_THEMES.length];

  // Status style helper (colorful boxes)
  const getStatusBadge = () => {
    switch (status) {
      case 'looking':
        return (
          <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-sky-100 text-sky-850 border-2 border-slate-950">
            Cerco
          </span>
        );
      case 'bought':
        return (
          <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-emerald-100 text-emerald-900 border-2 border-slate-950">
            Acquistata
          </span>
        );
      case 'sold':
        return (
          <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-purple-100 text-purple-900 border-2 border-slate-950">
            Rivenduta
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      whileHover={{ y: -6, x: -2 }}
      transition={{ duration: 0.2 }}
      id={`card-${card.id}`}
      className={`bg-white border-4 border-slate-950 rounded-[2rem] overflow-hidden ${theme.shadow} transition-all duration-200 flex flex-col h-full`}
    >
      {/* Top Banner with Type and Status */}
      <div className="px-4 py-2 bg-slate-100 border-b-4 border-slate-950 flex items-center justify-between text-xs text-slate-800 font-bold shrink-0">
        <span className="font-mono text-[11px] uppercase tracking-wide text-slate-900 font-black">
          {card.type} #{card.number}
        </span>
        <div className="flex items-center gap-1.5">
          {getStatusBadge()}
        </div>
      </div>

      {/* Main Image Area with custom pastel color bg inside */}
      <div className={`relative pt-[124%] ${theme.iconBg} border-b-4 border-slate-950 flex items-center justify-center overflow-hidden group/img shrink-0`}>
        {!imageError ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-300 group-hover/img:scale-105"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
            <Sparkles className="h-10 w-10 text-slate-400 mb-2" />
            <span className="text-xs font-black text-slate-900">{card.name}</span>
            <span className="text-[10px] text-rose-600 font-extrabold uppercase mt-1">Impossibile Caricare</span>
          </div>
        )}

        {/* Hover overlay with Cardmarket & Simulate tools */}
        <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3 p-4">
          <p className="text-base font-black text-white tracking-tight text-center uppercase px-2">{card.name}</p>
          <p className="text-xs font-bold text-yellow-300 italic mb-2">{card.expansion}</p>
          
          {card.cardmarketUrl && (
            <a
              href={card.cardmarketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-black uppercase border-2 border-slate-950 shadow-[2px_2px_0px_0px_#000000] hover:translate-y-[-1px] transition-all w-40 justify-center"
            >
              Cardmarket <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          <button
            onClick={() => onSimulate(card)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-black uppercase border-2 border-slate-950 shadow-[2px_2px_0px_0px_#000000] hover:translate-y-[-1px] transition-all w-40 justify-center cursor-pointer"
          >
            Simula Affare <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Pricing Data */}
      <div className="p-5 flex-grow flex flex-col justify-between bg-white text-slate-900">
        <div>
          {/* Card Meta */}
          <div className="mb-3">
            <h3 className="font-black text-base text-slate-950 font-display uppercase tracking-tight line-clamp-1 flex items-center leading-none">
              <span>{card.name}</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-extrabold mt-1.5 uppercase tracking-tight">{card.expansion}</p>
          </div>

          {/* Pricing Info Rows (Neobrutalism layout: prices display under image) */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t-2 border-dashed border-slate-200">
            <div className="bg-emerald-50 border-2 border-slate-950 p-2.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[9px] text-slate-600 block font-black uppercase tracking-wide">Compra Sotto</span>
              <span className="text-xl font-black text-emerald-600 font-mono flex items-center gap-0.5 leading-none mt-1">
                {card.buyUnder}€
              </span>
            </div>

            <div className="bg-amber-50 border-2 border-slate-950 p-2.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[9px] text-slate-600 block font-black uppercase tracking-wide">Rivendita Est.</span>
              <span className="text-xl font-black text-rose-500 font-mono block leading-none mt-1">
                {card.resaleMin}-{card.resaleMax}€
              </span>
            </div>
          </div>

          {/* Profit margins highlights */}
          <div className="mt-4 p-3 bg-violet-50 border-2 border-slate-950 rounded-xl flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600 shrink-0" />
              <div className="text-left">
                <span className="text-[9px] text-slate-650 block uppercase font-black tracking-wide leading-none">Margine Stimato</span>
                <span className="text-sm font-black text-indigo-950 font-mono">+{minGain}-{maxGain}€</span>
              </div>
            </div>
            <span className="text-xs font-black bg-indigo-505 bg-indigo-600 text-white rounded-md px-2 py-0.5 border-2 border-slate-950 font-mono">
              +{roi}% ROI
            </span>
          </div>
        </div>

        {/* Dynamic Status Dropdown / Action row */}
        <div className="mt-5 pt-4 border-t-2 border-dashed border-slate-200 flex items-center justify-between gap-2">
          <div className="flex-grow">
            <label className="text-[9px] text-slate-500 uppercase tracking-wider block font-black mb-1">Stato Possesso</label>
            <select
              value={status}
              onChange={(e) => onStatusChange(card.id, e.target.value as any)}
              className="w-full text-xs font-bold bg-slate-50 border-2 border-slate-955 border-slate-950 text-slate-900 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="none">Seleziona Stato</option>
              <option value="looking">Cerco da Comprare</option>
              <option value="bought">Ho Acquistato</option>
              <option value="sold">Ho Venduto</option>
            </select>
          </div>
          
          <button
            onClick={() => onSimulate(card)}
            title="Calcola profitto actual"
            className="mt-4 p-2.5 bg-yellow-300 hover:bg-yellow-450 hover:bg-yellow-400 border-2 border-slate-950 rounded-lg text-slate-950 hover:translate-y-[-1px] transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
          >
            <PenSquare className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
