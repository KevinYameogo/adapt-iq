/**
 * Simple TTS helper using Web Speech API
 */
export const speak = (text: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Optional: Select a specific voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Samantha"));
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Speech synthesis not supported in this browser.");
  }
};
