export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-md border-b sticky top-0 z-50 glass-nav">
      {/* BRAND LOGO AREA */}
      <div className="flex items-center gap-2 group cursor-pointer">
        {/* CSS-Based Icon */}
        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100 relative transition-transform group-hover:scale-110">
          <span className="text-white font-black text-lg italic tracking-tighter">
            A
          </span>
          {/* IQ Pulse Dot */}
          <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        </div>

        {/* Brand Name */}
        <div className="flex flex-col leading-none">
          <span className="font-black text-sm tracking-tighter italic uppercase">
            Adapt <span className="text-indigo-600">IQ</span>
          </span>
          <span className="text-[7px] text-slate-400 font-bold tracking-widest uppercase">
            AI Assistant
          </span>
        </div>
      </div>

      {/* Scrollable links for narrow sidebars */}
      <div className="flex gap-4 text-[10px] font-bold text-slate-600 overflow-x-auto no-scrollbar px-4">
        <a
          href="#solutions"
          className="whitespace-nowrap hover:text-indigo-600 transition-colors uppercase tracking-widest"
        >
          Solutions
        </a>
        <a
          href="#contact"
          className="whitespace-nowrap hover:text-indigo-600 transition-colors uppercase tracking-widest"
        >
          Contact
        </a>
      </div>

      <button className="bg-green-500 text-white text-[10px] px-4 py-2 rounded-xl font-bold hover:bg-green-600 shadow-lg shadow-green-100 transition-all active:scale-95">
        Start
      </button>
    </nav>
  );
}
