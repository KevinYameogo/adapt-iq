export default function SlidePreview({
  title,
  content,
}: {
  title: string;
  content: string[];
}) {
  return (
    <div className="aspect-video w-full bg-white rounded-md border-2 border-dashed border-slate-300 p-4 shadow-sm relative group cursor-pointer hover:border-indigo-400 transition-colors">
      <div className="absolute top-2 right-2 text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">
        Draft
      </div>
      <h4 className="text-sm font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">
        {title}
      </h4>
      <ul className="text-[10px] text-slate-600 space-y-1 list-disc pl-3">
        {content.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      {/* Hover Action */}
      <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <button className="bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-full shadow-lg font-bold">
          Push to Slide
        </button>
      </div>
    </div>
  );
}
