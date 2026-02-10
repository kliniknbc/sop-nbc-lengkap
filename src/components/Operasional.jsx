import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Operasional({ currentUser, showToast }) {
  const [checklist, setChecklist] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split('T')[0];
  const displayDate = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getChecklist(today);
      setChecklist(data.items || {});
    } catch (err) {
      console.error(err);
      setError("Gagal memuat checklist. Cek koneksi atau URL Script.");
      showToast("Gagal memuat data", true);
    }
    setLoading(false);
  };

  const handleToggle = async (itemId, isChecked) => {
    if (!currentUser) {
      showToast('Silakan login terlebih dahulu!', true);
      return;
    }

    // Optimistic update
    const timestamp = new Date().toLocaleTimeString();
    setChecklist(prev => ({
      ...prev,
      [itemId]: { 
        checked: isChecked, 
        by: currentUser.name, 
        time: timestamp 
      }
    }));

    // API Call
    try {
      const res = await api.updateChecklist({
        date: today,
        item_id: itemId,
        checked: isChecked,
        by: currentUser.name,
        time: timestamp
      });
      
      if (res && res.success === false) {
          throw new Error("Update failed");
      }
    } catch (e) {
      console.error(e);
      showToast('Gagal menyimpan data ke Sheet', true);
      // Revert optimistic update (optional, but good practice)
      setChecklist(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], checked: !isChecked } // simple revert
      }));
    }
  };

  const items = [
    { id: 'clean_floor', label: 'Sapu & Pel seluruh area dengan disinfektan' },
    { id: 'aromatherapy', label: 'Nyalakan diffuser (Sereh/Lavender)' },
    { id: 'stock_check', label: 'Cek stok (Alkohol, Kassa, Jarum, Kop)' },
    { id: 'briefing', label: 'Briefing Pagi: Doa & Review Target' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b pb-4 border-stone-200 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-stone-800">Operasional Outlet</h2>
          <p className="text-stone-500 text-sm">Checklist harian tersimpan di Google Sheet.</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs text-stone-400 font-mono">ID: {today}</div>
          <div className="font-bold text-emerald-600">{displayDate}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-emerald-500 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-stone-800">1.1 Persiapan Outlet (08:00 WIB)</h3>
            <button onClick={loadChecklist} className="text-xs text-emerald-600 hover:underline">
                Refresh Data
            </button>
        </div>
        
        <div className="space-y-4">
          {items.map(item => {
            const data = checklist[item.id];
            const isChecked = data?.checked || false;
            
            return (
              <label 
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer ${
                  isChecked ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-100 hover:border-emerald-300'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={isChecked}
                  onChange={(e) => handleToggle(item.id, e.target.checked)}
                  className="w-6 h-6 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600"
                />
                <div className="flex-1">
                  <span className={`font-medium ${isChecked ? 'text-emerald-900' : 'text-stone-800'}`}>
                    {item.label}
                  </span>
                  {isChecked && (
                    <div className="text-xs mt-1 text-emerald-600 font-bold">
                      ✓ {data.by} ({data.time})
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="bg-stone-100 p-6 rounded-xl">
        <h3 className="font-bold text-stone-700 mb-2">Panduan Cepat Terapi</h3>
        <ul className="list-disc ml-5 text-sm text-stone-600 space-y-1">
          <li>Diagnosa Awal (Tensi Wajib &gt; 90/60)</li>
          <li>Sterilisasi tangan & alat (Wajib Gloves)</li>
          <li>Limbah jarum masuk Safety Box Kuning</li>
        </ul>
      </div>
    </div>
  );
}
