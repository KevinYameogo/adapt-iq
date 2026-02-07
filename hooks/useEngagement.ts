import { useState, useRef, useEffect } from "react";
import { useAudioMonitor } from "./useAudioMonitor";
import { getSlideText, insertSlide } from "@/lib/office";

export const useEngagement = () => {
  const { isRecording, startRecording, stopRecording } = useAudioMonitor();
  const [engagementData, setEngagementData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const analyze = async () => {
    // Prevent overlapping analysis
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      // 1. Get audio
      const audioBlob = await stopRecording();

      // 2. Restart recording immediately (if we want continuous loop)
      // Note: This creates a small gap.
      // We need to check if we should continue recording.
      // Ideally we check a ref here, but for now we assume loop until stopped manually.
      startRecording();

      // 3. Get context (slide text)
      // This requires Office.js to be ready.
      let slideText = "";
      try {
        slideText = await getSlideText();
      } catch (e) {
        console.warn("Could not get slide text", e);
      }

      // 4. Send to API
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("slideText", slideText);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();

      if (data.analysis) {
        setEngagementData(data.analysis);
      }
      if (data.transcript) {
        setTranscript((prev) => prev + " " + data.transcript);
      }
    } catch (e) {
      console.error("Analysis error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const startMonitoring = () => {
    startRecording();
    // Analyze every 15 seconds
    intervalRef.current = setInterval(analyze, 15000);
  };

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopRecording();
  };

  const applySuggestion = async (type: string, content: string) => {
    if (type === "insert_slide") {
      await insertSlide(content, "Engagement Tip");
    }
    // Handle other types
  };

  return {
    isRecording,
    startMonitoring,
    stopMonitoring,
    engagementData,
    isProcessing,
    transcript,
    applySuggestion,
  };
};
