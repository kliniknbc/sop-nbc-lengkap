import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Trash, Plus, Save } from 'lucide-react';

export default function GenericList({ title, category, placeholder, currentUser, showToast }) {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadItems();
    }, [category]);

    const loadItems = async () => {
        setLoading(true);
        const data = await api.getMasterData(category);
        setItems(data);
        setLoading(false);
    };

    const handleAdd = async () => {
        if (!newItem) return;
        if (!currentUser) return showToast('Harap login!', true);

        setAdding(true);
        try {
            const res = await api.addMasterData(category, newItem);
            if (res && res.success) {
                setNewItem('');
                loadItems();
                showToast('Item berhasil ditambahkan');
            }
        } catch (e) {
            showToast('Gagal menambah item', true);
        }
        setAdding(false);
    };

    const handleDelete = async (id) => {
        if (!currentUser || currentUser.role !== 'manager') {
            return showToast('Hanya Manager yang bisa menghapus!', true);
        }

        if (!confirm('Hapus item ini?')) return;

        try {
            const res = await api.deleteData('MasterData', id);
            if (res && res.success) {
                loadItems();
                showToast('Item dihapus');
            }
        } catch (e) {
            showToast('Gagal menghapus item', true);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-stone-800">{title}</h2>
                    <button onClick={loadItems} className="text-emerald-600 text-sm hover:underline">Refresh</button>
                </div>

                {/* Input Add */}
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                        placeholder={placeholder || "Input item baru..."}
                        className="flex-1 p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={adding || !newItem}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {adding ? '...' : <Plus size={20} />}
                        Tambah
                    </button>
                </div>

                {/* List */}
                {loading ? (
                    <div className="text-center py-4 text-stone-400">Memuat data...</div>
                ) : items.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-300">
                        Belum ada data. Silakan tambah baru.
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {items.map((item, idx) => (
                            <li key={item.id || idx} className="flex justify-between items-center p-3 bg-stone-50 rounded border border-stone-100 group hover:border-emerald-200 transition">
                                <span className="text-stone-700 font-medium">{item.content}</span>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-stone-300 hover:text-red-500 transition p-2 opacity-0 group-hover:opacity-100"
                                    title="Hapus"
                                >
                                    <Trash size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
