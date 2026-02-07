import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 flex flex-col p-0">
        {/* SECTION 1: HERO & VIDEO ANCHOR */}
        <section className="relative w-full aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10" />
          <div className="z-20 text-center p-4">
            <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter italic">
              ADAPT AI
            </h2>
            <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-widest">
              The Future of Presentation Intelligence
            </p>
          </div>
          {/* Placeholder for your actual project video */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <span className="text-6xl text-white font-black italic underline">
              VIDEO
            </span>
          </div>
        </section>

        {/* SECTION 2: THE HOOK */}
        <div className="p-6 space-y-24">
          <section className="text-center pt-8">
            <h1 className="text-4xl font-extrabold tracking-tighter mb-4 leading-[0.85]">
              More automation, less <br />
              <span className="text-indigo-600 italic">"I hate slides"</span>
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mx-auto max-w-[280px] mb-8">
              Scale your productivity without sacrificing quality. Adapt AI
              keeps slide creation fast, reliable, and human.
            </p>
            <button className="w-full py-5 bg-green-500 text-white rounded-2xl font-bold shadow-2xl shadow-green-100 hover:scale-[1.02] transition-transform">
              Start for free →
            </button>
          </section>

          {/* SECTION 3: ICON NAVIGATION */}
          <section className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-12">
            <NavIcon icon="🤖" label="AI Agent" sub="Auto-Layout" />
            <NavIcon icon="⚡" label="Fast Track" sub="Notes to Deck" />
            <NavIcon icon="🎨" label="Design" sub="Smart Styles" />
          </section>

          {/* SECTION 4: DEEP DIVE (SERVICE & PICTURES) */}
          <section className="space-y-20">
            <div className="text-center">
              <h2 className="text-xl font-black uppercase italic text-slate-800">
                A complete platform
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Built for human and AI alignment
              </p>
            </div>

            {/* Service 1: Note-to-Slide */}
            <div className="space-y-6">
              <div className="w-full aspect-video bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group relative overflow-hidden">
                <span className="text-4xl mb-2">📸</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center px-4">
                  Interface Screenshot Placeholder
                </span>
              </div>
              <div className="px-2">
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  Note-to-Slide Generation
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Turn your rough ideas into polished structured slides. Simply
                  paste your notes and watch the AI build the narrative.
                </p>
              </div>
            </div>

            {/* Service 2: Smart Summaries */}
            <div className="space-y-6">
              <div className="w-full aspect-video bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group relative overflow-hidden">
                <span className="text-4xl mb-2">📊</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center px-4">
                  Visual Result Placeholder
                </span>
              </div>
              <div className="px-2">
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  Smart Summaries
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Generate comparisons, pros/cons, and research-assisted content
                  inside PowerPoint. Clean, structured, and fast.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 5: THE DARK FOOTER (CONTACT) */}
          <section className="bg-slate-950 -mx-6 p-10 text-white rounded-t-[3.5rem] shadow-2xl">
            <h3 className="text-2xl font-black mb-8 italic tracking-tighter uppercase">
              Let's build your <br /> next deck.
            </h3>
            <form className="space-y-4 mb-12">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
              />
              <textarea
                placeholder="Tell us about your project..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
              />
              <button className="w-full py-4 bg-indigo-600 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all">
                Send Message
              </button>
            </form>
            <div className="pt-8 border-t border-white/10 flex justify-between items-center opacity-50">
              <span className="text-[10px] font-bold uppercase tracking-widest tracking-tighter">
                ADAPT AI © 2026
              </span>
              <div className="flex gap-4 text-sm">🐦 🐙 📷</div>
            </div>
          </section>
        </div>
      </main>

      {/* FLOATING ACTION BUTTON */}
      <button className="fixed bottom-8 right-6 h-14 w-14 bg-indigo-600 rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center justify-center text-white text-2xl hover:translate-y-[-4px] transition-transform z-50">
        💬
      </button>
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
      <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mb-3 group-hover:bg-indigo-50 transition-colors border border-transparent group-hover:border-indigo-100">
        {icon}
      </div>
      <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">
        {label}
      </h5>
      <p className="text-[9px] text-slate-400 font-medium">{sub}</p>
    </button>
  );
}
