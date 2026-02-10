export default function Dashboard({ setActiveTab }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Dashboard Operasional</h2>
        <p className="opacity-90">Sistem terhubung ke Google Sheets Database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => setActiveTab('operasional')}
          className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 cursor-pointer hover:border-emerald-500 transition group"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-stone-700 group-hover:text-emerald-700 transition">📋 Checklist Harian</h3>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">Sync</span>
          </div>
          <p className="text-sm text-stone-500">Pantau kebersihan dan persiapan outlet secara harian.</p>
        </div>

        <div 
          onClick={() => setActiveTab('keuangan')}
          className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 cursor-pointer hover:border-emerald-500 transition group"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-stone-700 group-hover:text-emerald-700 transition">📊 Laporan Keuangan</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Save</span>
          </div>
          <p className="text-sm text-stone-500">Hitung laba harian dan simpan ke database sheet.</p>
        </div>
      </div>
    </div>
  );
}
