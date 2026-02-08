export interface SavedNote {
  id: string;
  presentationName: string;
  presentationUrl?: string;
  slideIndex: number;
  slideId?: string; // New field for deep linking
  summary: string;
  speakerNotes: string;
  researchTags: string[];
  timestamp: number;
}

const STORAGE_KEY = "adapt_id_notes_library";

export const getSavedNotes = (): SavedNote[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load notes", e);
    return [];
  }
};

export const saveNote = (note: Omit<SavedNote, "id" | "timestamp">) => {
  try {
    const notes = getSavedNotes();
    const newNote: SavedNote = {
      ...note,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    const updated = [newNote, ...notes];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newNote;
  } catch (e) {
    console.error("Failed to save note", e);
    return null;
  }
};

export const deleteNote = (id: string) => {
  try {
    const notes = getSavedNotes();
    const updated = notes.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to delete note", e);
    return [];
  }
};
