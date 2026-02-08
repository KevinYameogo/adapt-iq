export default function SummaryViewer({ params }: { params: { id: string } }) {
    return (
        <div className="max-w-2xl mx-auto p-8 font-sans">
            <h1 className="text-3xl font-black text-indigo-600 mb-6">AdaptIQ Summary</h1>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-slate-700 leading-relaxed italic">
                    Retrieving summary for session: {params.id}...
                </p>
                {/* You would fetch the summary from your API/Store here */}
            </div>
        </div>
    );
}