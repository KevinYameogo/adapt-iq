"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import BackToTop from "../components/BackToTop";

export default function Home() {
  // --- STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Adapt IQ Assistant. How can I help you optimize your presentation today?",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen, isTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: inputValue }]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "That sounds like a great project! I'm currently in 'Demo Mode,' but I can certainly help you brainstorm slide layouts here.",
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleStartAction = () => {
    setIsLaunching(true);
    // Simulating the "Intelligence Engine" starting up
    setTimeout(() => {
      setIsLaunching(false);
      setIsChatOpen(true);
      // Add a success message to the chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "🚀 Adapt IQ is now online. I've analyzed your current slide deck. How should we proceed?",
        },
      ]);
    }, 2000);
  };

  return (
    <div className="relative min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      <Navbar />

      <main className="relative">
        {/* SECTION 1: HERO */}
        <section
          id="home"
          className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          <div className="z-20 text-center p-4">
            <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter italic text-glow">
              ADAPT <span className="text-indigo-400">IQ</span>
            </h2>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
              The Future of Presentation Intelligence
            </p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="text-6xl text-white font-black italic border-b-4 border-white">
              VIDEO
            </span>
          </div>
        </section>

        <div className="p-6 space-y-20">
          {/* SECTION 2: THE HOOK */}
          <section className="text-center pt-8">
            <h1 className="text-4xl font-extrabold tracking-tighter mb-4 leading-[0.85]">
              More automation, less <br />
              <span className="text-indigo-600 italic">"I hate slides"</span>
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mx-auto max-w-[280px] mb-8">
              Scale your productivity without sacrificing quality. Adapt IQ
              keeps slide creation fast, reliable, and human.
            </p>
          </section>

          {/* SECTION 3: ICONS */}
          <section className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-10">
            <NavIcon icon="🤖" label="AI Agent" sub="Auto-Layout" />
            <NavIcon icon="⚡" label="Fast Track" sub="Notes to Deck" />
            <NavIcon icon="🎨" label="Design" sub="Smart Styles" />
          </section>

          {/* SECTION 4: DEEP DIVE */}
          <section id="solutions" className="space-y-10 py-6 scroll-mt-24">
            <div className="text-center">
              <h2 className="text-2xl font-black uppercase italic text-slate-800 tracking-tighter">
                A complete platform
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Built for human and AI alignment
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
              <ServiceCard
                emoji="📝"
                title="Note-to-Slide"
                desc="Turn rough ideas into polished structured slides instantly."
              />
              <ServiceCard
                emoji="📊"
                title="Smart Summaries"
                desc="Generate comparisons and pros/cons directly inside PowerPoint."
              />
              <ServiceCard
                emoji="🔍"
                title="Research AI"
                desc="Real-time fact checking and data sourcing for every slide."
              />
            </div>
          </section>

          {/* SECTION 5: FOOTER & START BUTTON */}
          <footer
            id="contact"
            className="-mx-6 -mb-6 bg-slate-950 p-10 text-white rounded-t-[3.5rem] relative z-10 shadow-2xl scroll-mt-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-black text-sm italic">
                      A
                    </span>
                  </div>
                  <span className="font-black text-xl tracking-tighter italic uppercase text-white">
                    Adapt <span className="text-indigo-400">IQ</span>
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">
                  Redefining the presentation workflow with intelligent AI.
                </p>
              </div>
              <FooterColumn
                title="Legal"
                links={["Terms of Service", "Privacy Policy"]}
              />
              <FooterColumn
                title="Resources"
                links={["FAQs", "Documentation"]}
              />
              <FooterColumn
                title="Support"
                links={["Help Center", "Contact Us"]}
              />
            </div>

            {/* THE START BUTTON AREA */}
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center relative">
              {/* RADIAL GLOW: Only shows when launching */}
              {isLaunching && (
                <div className="absolute inset-0 bg-indigo-500/30 blur-[60px] rounded-full animate-pulse scale-150 z-0" />
              )}

              <button
                onClick={handleStartAction}
                disabled={isLaunching}
                className={`group relative flex items-center gap-3 bg-indigo-600 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-white transition-all active:scale-95 shadow-2xl shadow-indigo-500/20 z-10 overflow-hidden ${
                  isLaunching
                    ? "cursor-not-allowed opacity-90"
                    : "hover:bg-indigo-500"
                }`}
              >
                {/* SHIMMER EFFECT: Slides across button when launching */}
                {isLaunching && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                )}

                {isLaunching ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>🚀 Start Adapt IQ</>
                )}
              </button>

              <p className="mt-4 text-[9px] text-slate-500 font-bold uppercase tracking-widest animate-pulse z-10">
                Ready to optimize your workflow
              </p>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 mt-12">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                ADAPT IQ © 2026
              </span>
              <div className="flex gap-8 grayscale opacity-50 items-center">
                <span className="cursor-pointer hover:opacity-100 transition-opacity">
                  🐦
                </span>
                <span className="cursor-pointer hover:opacity-100 transition-opacity">
                  🐙
                </span>
                <span className="cursor-pointer hover:opacity-100 transition-opacity">
                  📷
                </span>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* CHAT WINDOW */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-72 bg-white rounded-3xl shadow-2xl z-[100] border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <span className="font-bold text-[10px] uppercase tracking-widest">
              Adapt IQ Support
            </span>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-2xl font-light"
            >
              ×
            </button>
          </div>
          <div className="p-4 space-y-4 h-64 overflow-y-auto bg-slate-50/50 flex flex-col">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                  msg.role === "assistant"
                    ? "bg-white self-start rounded-tl-none border border-slate-100 text-slate-700"
                    : "bg-indigo-600 self-end rounded-tr-none text-white"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div className="bg-white self-start rounded-2xl rounded-tl-none border border-slate-100 p-3 shadow-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-100 bg-white flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 ring-indigo-500/20 transition-all"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-[10px] font-bold"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <BackToTop />

      {/* Floating Chat Trigger */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-6 h-14 w-14 bg-indigo-600 rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center justify-center text-white text-2xl hover:translate-y-[-4px] transition-transform z-50 active:scale-95"
      >
        💬
      </button>
    </div>
  );
}

// SUB-COMPONENTS
function ServiceCard({
  emoji,
  title,
  desc,
}: {
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="space-y-3">
      <div className="w-full aspect-[4/3] bg-slate-50 rounded-[1.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group relative overflow-hidden transition-all hover:border-indigo-300">
        <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">
          {emoji}
        </span>
        <span className="text-[7px] font-bold text-slate-300 uppercase tracking-widest text-center px-4">
          Interface Preview
        </span>
      </div>
      <div className="text-center md:text-left">
        <h4 className="text-base font-bold text-slate-800 mb-0.5">{title}</h4>
        <p className="text-[11px] text-slate-500 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function NavIcon({
  icon,
  label,
  sub,
}: {
  icon: string;
  label: string;
  sub: string;
}) {
  return (
    <button className="flex flex-col items-center text-center group">
      <div className="h-11 w-11 bg-slate-50 rounded-xl flex items-center justify-center text-xl mb-2 group-hover:bg-indigo-50 transition-colors border border-transparent group-hover:border-indigo-100">
        {icon}
      </div>
      <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">
        {label}
      </h5>
      <p className="text-[8px] text-slate-400 font-medium">{sub}</p>
    </button>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">
        {title}
      </h4>
      {links.map((link) => (
        <a
          key={link}
          href="#"
          className="text-xs text-slate-300 hover:text-white transition-colors"
        >
          {link}
        </a>
      ))}
    </div>
  );
}
