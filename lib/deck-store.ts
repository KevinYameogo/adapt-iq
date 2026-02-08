/**
 * In-memory store for summary decks. Cleared on server restart.
 * For production, replace with a database or file store.
 */

export interface StoredSlide {
  index: number;
  text: string;
  imageBase64: string;
}

export interface PresenterSocials {
  name?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

export interface DeckData {
  slideSummaries: string[];
  fullSummary: string;
  slides: StoredSlide[];
  presenterSocials?: PresenterSocials;
}

const store = new Map<string, DeckData>();

export function saveDeck(id: string, data: DeckData): void {
  store.set(id, data);
}

export function getDeck(id: string): DeckData | undefined {
  return store.get(id);
}
