"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface StoredSlide {
  index: number;
  text: string;
  imageBase64: string;
}

interface PresenterSocials {
  name?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

interface DeckData {
  slideSummaries: string[];
  fullSummary: string;
  slides: StoredSlide[];
  presenterSocials?: PresenterSocials;
}

export default function SummaryPage() {
  const params = useParams();
  const id = params?.id as string;
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Missing deck id");
      return;
    }
    fetch(`/api/deck/${id}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Summary not found");
          throw new Error("Failed to load");
        }
        return res.json();
      })
      .then((data: DeckData) => {
        setDeck(data);
      })
      .catch((e) => {
        setError(e?.message ?? "Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading summary…</p>
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold text-slate-800 mb-2">Summary not available</h1>
          <p className="text-slate-600">{error ?? "This link may have expired or the summary was not found."}</p>
        </div>
      </div>
    );
  }

  const socials = deck.presenterSocials;
  const hasSocials = socials && (socials.name || socials.twitter || socials.linkedin || socials.instagram);

  function toUrl(value: string, type: "twitter" | "linkedin" | "instagram"): string {
    const v = value.trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    const handle = v.startsWith("@") ? v.slice(1) : v;
    if (type === "twitter") return `https://x.com/${handle}`;
    if (type === "linkedin") return `https://linkedin.com/in/${handle}`;
    return `https://instagram.com/${handle}`;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 py-6 px-6 text-center">
        <h1 className="text-2xl font-black italic tracking-tighter text-indigo-600 uppercase">Presentation wrap-up</h1>
      </header>

      {hasSocials && (
        <section className="bg-white border-b border-slate-200 py-5 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Presenter</h2>
            {socials!.name && (
              <p className="text-lg font-semibold text-slate-800 mb-3">{socials!.name}</p>
            )}
            <div className="flex flex-wrap gap-3">
              {socials!.twitter && (
                <a href={toUrl(socials!.twitter, "twitter")} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline font-medium">
                  X / Twitter →
                </a>
              )}
              {socials!.linkedin && (
                <a href={toUrl(socials!.linkedin, "linkedin")} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline font-medium">
                  LinkedIn →
                </a>
              )}
              {socials!.instagram && (
                <a href={toUrl(socials!.instagram, "instagram")} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline font-medium">
                  Instagram →
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <main className="max-w-2xl mx-auto py-8 px-4 space-y-10">
        {deck.slides.map((slide, i) => (
          <section key={slide.index} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Slide {i + 1} · Key takeaway</span>
            </div>
            {slide.imageBase64 ? (
              <div className="p-4 flex justify-center bg-slate-50/50">
                <img
                  src={slide.imageBase64.startsWith("data:") ? slide.imageBase64 : `data:image/png;base64,${slide.imageBase64}`}
                  alt={`Slide ${i + 1}`}
                  className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm"
                  style={{ maxHeight: "360px", objectFit: "contain" }}
                />
              </div>
            ) : (
              <div className="p-4 text-sm text-slate-400 italic">No image for this slide.</div>
            )}
            <div className="p-4 pt-2">
              <p className="text-sm text-slate-700 leading-relaxed">
                {deck.slideSummaries[i] ?? "No summary available."}
              </p>
            </div>
          </section>
        ))}

        <section className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6">
          <h2 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-3">Key takeaways</h2>
          <p className="text-slate-800 font-medium leading-relaxed">{deck.fullSummary || "No key takeaways."}</p>
        </section>
      </main>
    </div>
  );
}
