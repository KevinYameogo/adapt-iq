"use client";
import dynamic from 'next/dynamic';

const TaskpaneContent = dynamic(() => import('./TaskpaneContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">AdaptIQ</h2>
        <p className="text-sm font-medium text-slate-500 mt-2">Initializing Sidebar...</p>
      </div>
    </div>
  )
});

export default function Page() {
  return <TaskpaneContent />;
}