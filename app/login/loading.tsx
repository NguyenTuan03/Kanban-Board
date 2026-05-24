
export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-linear-to-tr from-slate-900 via-indigo-950 to-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="space-y-4 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="text-lg font-medium text-slate-300">Đang tải...</p>
      </div>
    </div>
  );
}
