export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-black border-b border-white/10 sticky top-0 z-[100]">
      {/* BRAND LOGO AREA - Scaled Up */}
      <div className="flex items-center gap-3 group cursor-pointer">
        {/* CSS-Based Icon - Increased to h-10 w-10 */}
        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 relative transition-transform group-hover:scale-110">
          <span className="text-white font-black text-xl italic tracking-tighter">
            A
          </span>
          {/* IQ Pulse Dot - Adjusted for larger icon */}
          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-400 rounded-full border-2 border-black animate-pulse" />
        </div>

        {/* Brand Name - Increased Font Sizes */}
        <div className="flex flex-col leading-none">
          <span className="font-black text-lg tracking-tighter italic uppercase text-white">
            Adapt <span className="text-indigo-400">IQ</span>
          </span>
          <span className="text-[9px] text-slate-500 font-bold tracking-[0.2em] uppercase mt-0.5">
            AI Assistant
          </span>
        </div>
      </div>

      {/* Scrollable links - 12.5px */}
      <div className="flex gap-6 text-[12.5px] font-bold text-slate-400 overflow-x-auto no-scrollbar px-4">
        {/* Change this from href="/" to href="#home" */}
        <a
          href="#home"
          className="whitespace-nowrap hover:text-white transition-colors uppercase tracking-widest"
        >
          Home
        </a>
        <a
          href="#solutions"
          className="whitespace-nowrap hover:text-white transition-colors uppercase tracking-widest"
        >
          Solutions
        </a>
        <a
          href="#contact"
          className="whitespace-nowrap hover:text-white transition-colors uppercase tracking-widest"
        >
          Contact
        </a>
      </div>
    </nav>
  );
}
