import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CHECKLIST_ITEMS } from '../config/items';

export default function Operasional({ currentUser, showToast }) {
  const [checklist, setChecklist] = useState({});
  const [items, setItems] = useState([]); // Dynamic items from MasterData
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit Mode States
  const [isEditMode, setIsEditMode] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const displayDate = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get Checklist Status for Today
      const checklistRes = await api.getChecklist(today);
      setChecklist(checklistRes.items || {});

      // 2. Get Master Items for Checklist
      const masterItems = await api.getMasterData('checklist');
      if (masterItems && masterItems.length > 0) {
        setItems(masterItems.map(m => ({ id: m.id, label: m.content })));
      } else {
        // Fallback if no master data yet
        const { CHECKLIST_ITEMS } = await import('../config/items');
        setItems(CHECKLIST_ITEMS);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data.");
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
      [itemId]: { checked: isChecked, by: currentUser.name, time: timestamp }
    }));
    // API Call
    try {
      await api.updateChecklist({
        date: today, item_id: itemId, checked: isChecked, by: currentUser.name, time: timestamp
      });
    } catch (e) {
      console.error(e);
      showToast('Gagal menyimpan data ke Sheet', true);
      setChecklist(prev => ({ ...prev, [itemId]: { ...prev[itemId], checked: !isChecked } }));
    }
  };

  // --- CRUD Operations ---
  const handleAddItem = async () => {
    if (!newItemName) return;
    if (!currentUser) return showToast('Login dulu!', true);
    setAddingItem(true);
    try {
      const res = await api.addMasterData('checklist', newItemName);
      if (res && res.success) {
        setNewItemName('');
        loadData(); // Reload to get new ID
        showToast('Item berhasil ditambahkan');
      }
    } catch (e) { showToast('Gagal tambah item', true); }
    setAddingItem(false);
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Hapus item checklist ini? History data lama mungkin akan kehilangan konteks.')) return;
    try {
      const res = await api.deleteData('MasterData', itemId);
      if (res && res.success) {
        loadData();
        showToast('Item dihapus');
      }
    } catch (e) { showToast('Gagal hapus', true); }
  };


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

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-stone-800">Checklist Harian</h3>
          <div className="flex gap-2">
            {currentUser?.role === 'manager' && (
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`text-xs px-3 py-1 rounded border ${isEditMode ? 'bg-red-100 text-red-600 border-red-200' : 'bg-stone-100 text-stone-600'}`}
              >
                {isEditMode ? 'Selesai Hapus' : '🗑️ Mode Hapus'}
              </button>
            )}
            <button onClick={loadData} className="text-xs text-emerald-600 hover:underline">
              Refresh
            </button>
          </div>
        </div>



        <div className="space-y-4">
          {items.map(item => {
            const data = checklist[item.id];
            const isChecked = data?.checked || false;

            return (
              <div key={item.id} className="flex gap-2 items-center">
                <label
                  className={`flex-1 flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer ${isChecked ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-100 hover:border-emerald-300'
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

                {isEditMode && (
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-3 text-stone-400 hover:text-red-500 border border-stone-200 rounded-lg"
                    title="Hapus Item"
                  >
                    🗑️
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {/* Add Item Section (Always Visible for Manager) */}
        {currentUser?.role === 'manager' && (
          <div className="mt-8 pt-6 border-t border-stone-200">
            <h4 className="text-sm font-bold text-stone-700 mb-3 block">➕ Tambah Item Baru</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="Contoh: Cek Suhu Kulkas..."
                className="flex-1 p-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                onClick={handleAddItem}
                disabled={addingItem || !newItemName}
                className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-stone-900 transition flex items-center gap-2"
              >
                {addingItem ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-2">
              Item baru akan muncul di checklist hari ini dan seterusnya.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
