"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Office?: any;
    PowerPoint?: any;
  }
}

export default function TaskpanePage() {
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("AI Slide Title");
  const [bullets, setBullets] = useState(
    "First bullet\nSecond bullet\nThird bullet"
  );
  const [notes, setNotes] = useState(
    "Speaker notes go here...\nSources:\n- https://example.com"
  );
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    // Office.js loads async; we poll until Office.onReady is available.
    const interval = setInterval(() => {
      const Office = window.Office;
      if (Office?.onReady) {
        Office.onReady(() => {
          setReady(true);
          setStatus("Office is ready ✅");
        });
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  async function insertTitleAndBullets() {
    try {
      if (!ready) return setStatus("Office not ready yet...");

      setStatus("Inserting into slide...");

      await window.PowerPoint.run(async (context: any) => {
        const slide = context.presentation.getSelectedSlides().getItemAt(0);

        // Title box
        const titleShape = slide.shapes.addTextBox(title);
        titleShape.left = 50;
        titleShape.top = 40;
        titleShape.width = 620;
        titleShape.height = 60;
        titleShape.textFrame.textRange.font.size = 32;

        // Bullets box
        const bulletLines = bullets
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);

        const bulletText = bulletLines.map((b) => `• ${b}`).join("\n");

        const bulletsShape = slide.shapes.addTextBox(bulletText);
        bulletsShape.left = 70;
        bulletsShape.top = 120;
        bulletsShape.width = 620;
        bulletsShape.height = 300;
        bulletsShape.textFrame.textRange.font.size = 20;

        await context.sync();
      });

      setStatus("Inserted ✅");
    } catch (e: any) {
      console.error(e);
      setStatus(`Error: ${e?.message ?? String(e)}`);
    }
  }

  async function insertSpeakerNotes() {
    try {
      if (!ready) return setStatus("Office not ready yet...");
      setStatus("Adding speaker notes...");

      await window.PowerPoint.run(async (context: any) => {
        const slide = context.presentation.getSelectedSlides().getItemAt(0);

        // Notes page text
        slide.notesPage.textFrame.textRange.text = notes;

        await context.sync();
      });

      setStatus("Notes inserted ✅");
    } catch (e: any) {
      console.error(e);
      setStatus(`Error: ${e?.message ?? String(e)}`);
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      {/* Loads Office.js in this page */}
      <Script
        src="https://appsforoffice.microsoft.com/lib/1/hosted/office.js"
        strategy="beforeInteractive"
      />

      <h2 style={{ marginBottom: 8 }}>AI Slide Assistant</h2>
      <div style={{ marginBottom: 12, color: ready ? "green" : "gray" }}>
        {ready ? "Connected to PowerPoint" : "Waiting for Office..."}
      </div>

      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
        Title
      </label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
        Bullets (one per line)
      </label>
      <textarea
        value={bullets}
        onChange={(e) => setBullets(e.target.value)}
        rows={6}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
        Speaker Notes
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={6}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={insertTitleAndBullets}
          style={{ padding: "10px 12px" }}
        >
          Insert Title + Bullets
        </button>
        <button onClick={insertSpeakerNotes} style={{ padding: "10px 12px" }}>
          Insert Speaker Notes
        </button>
      </div>

      <div style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>{status}</div>
    </div>
  );
}
