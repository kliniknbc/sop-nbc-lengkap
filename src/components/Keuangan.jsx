import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Keuangan({ currentUser, showToast }) {
  const [omzet, setOmzet] = useState(0);
  const [ops, setOps] = useState(0);
  const [gaji, setGaji] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const profit = omzet - (ops + gaji);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if (currentUser?.role !== 'manager') return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFinance();
      setHistory(data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat riwayat keuangan.");
    }
    setLoading(false);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus laporan ini?')) return;
    try {
      // Finance records are in 'Finance' sheet, but our generic deleter takes sheetName
      // Let's assume api.deleteData handles generic deletions by sheet name
      const res = await api.deleteData('Finance', id);
      if (res && res.success) {
        loadHistory();
        showToast('Laporan dihapus');
      }
    } catch (e) {
      showToast('Gagal menghapus', true);
    }
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
  };

  const handleSave = async () => {
    if (!currentUser) return showToast('Harap login!', true);
    if (omzet === 0) return showToast('Omzet masih 0?', true);

    setSaving(true);
    const data = {
      date: new Date().toISOString().split('T')[0],
      omzet,
      ops,
      gaji,
      profit,
      saved_by: currentUser.name,
      note: 'Laporan Harian via React App'
    };

    try {
      const res = await api.addFinance(data);
      if (res && res.success) {
        showToast('Laporan Tersimpan ke Sheet!');
        setOmzet(0);
        setOps(0);
        setGaji(0);
        loadHistory();
      } else {
        throw new Error("Save failed");
      }
    } catch (e) {
      console.error(e);
      showToast('Gagal menyimpan laporan. Cek koneksi.', true);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b pb-4 border-stone-200">
        <h2 className="text-3xl font-bold text-stone-800">Laporan Keuangan</h2>
        <p className="text-stone-500 mt-2">Hitung dan simpan laporan ke Google Sheets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">🧮 Simulator Laba Bersih</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1">Total Omzet Hari Ini</label>
              <input
                type="number"
                value={omzet || ''}
                onChange={e => setOmzet(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-stone-300 rounded bg-stone-50 font-bold text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">Biaya Ops</label>
                <input
                  type="number"
                  value={ops || ''}
                  onChange={e => setOps(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-stone-300 rounded bg-stone-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">Gaji/Komisi</label>
                <input
                  type="number"
                  value={gaji || ''}
                  onChange={e => setGaji(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-stone-300 rounded bg-stone-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 bg-emerald-50 p-4 rounded-lg text-center">
              <label className="block text-xs font-bold text-emerald-800 mb-1">PROFIT BERSIH</label>
              <div className="text-3xl font-bold text-emerald-600">{formatRupiah(profit)}</div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : '💾 Simpan Laporan'}
            </button>
          </div>
        </div>

        {/* History */}
        {currentUser?.role === 'manager' ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-stone-800">Riwayat Laporan</h3>
              <button onClick={loadHistory} className="text-xs text-emerald-600 hover:underline">Refresh</button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-xs mb-3 border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-center text-stone-400 text-sm py-4">Memuat data...</div>
              ) : history.length === 0 ? (
                <div className="text-center text-stone-400 text-sm italic py-4">Belum ada laporan.</div>
              ) : (
                history.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-stone-50 rounded border border-stone-200 text-sm group">
                    <div>
                      <div className="font-bold text-stone-700">{item.date}</div>
                      <div className="text-xs text-stone-500">Oleh: {item.saved_by}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-emerald-600">{formatRupiah(item.profit)}</div>
                      {currentUser?.role === 'manager' && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-stone-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                          title="Hapus Laporan"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-stone-100 p-6 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 italic">
            Riwayat hanya untuk Manager
          </div>
        )}
      </div>
    </div>
  );
}
