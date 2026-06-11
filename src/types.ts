export interface PokemonCard {
  id: string; // Unique ID
  name: string;
  emoji: string;
  number: string;
  type: string; // e.g. "SIR", "IR", "Alt Art", "Secret Rare"
  expansion: string;
  buyUnder: number; // Compra sotto
  resaleMin: number; // Rivendita indicativa min
  resaleMax: number; // Rivendita indicativa max
  imageUrl: string;
  cardmarketUrl?: string;
}
