export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10">
      <div className="font-bold text-lg tracking-tighter">ADAPT AI</div>

      {/* Scrollable links for narrow sidebars */}
      <div className="flex gap-4 text-[10px] font-medium text-slate-600 overflow-x-auto no-scrollbar px-2">
        <button className="whitespace-nowrap hover:text-indigo-600">
          Product
        </button>
        <button className="whitespace-nowrap hover:text-indigo-600">
          Solutions
        </button>
        <button className="whitespace-nowrap hover:text-indigo-600">
          Resources
        </button>
      </div>

      <button className="bg-green-500 text-white text-[10px] px-3 py-1.5 rounded-md font-bold hover:bg-green-600 transition-colors">
        Start
      </button>
    </nav>
  );
}
