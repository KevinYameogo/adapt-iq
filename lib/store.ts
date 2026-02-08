
// Simple in-memory store for demonstration purposes.
// In a real application, use a database like Redis, Postgres, or MongoDB.

interface PresentationData {
    id: string;
    slides: string[];
    createdAt: number;
}

// Global variable to hold data
declare global {
    var presentationStore: Record<string, PresentationData>;
}

if (!global.presentationStore) {
    global.presentationStore = {};
}

export const store = {
    save: (id: string, slides: string[]) => {
        global.presentationStore[id] = {
            id,
            slides,
            createdAt: Date.now(),
        };
        return id;
    },

    get: (id: string) => {
        return global.presentationStore[id] || null;
    },
};
