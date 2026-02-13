import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { getScriptUrl, api } from '../services/api';

export default function Settings({ showToast }) {
    const [url, setUrl] = useState('');
    const [isTestLoading, setIsTestLoading] = useState(false);
    const [testStatus, setTestStatus] = useState(null); // 'success', 'error', null

    useEffect(() => {
        setUrl(getScriptUrl());
    }, []);

    const handleSave = () => {
        localStorage.setItem('google_script_url', url);
        showToast('URL Google Script berhasil disimpan!');
        // Force reload to apply changes in api.js context if needed, 
        // though getScriptUrl() reads directly from localStorage so it should be fine.
        // But a reload ensures clean state.
        // window.location.reload(); 
        // For now, just toast is enough as getScriptUrl is dynamic.
    };

    const handleTestConnection = async () => {
        setIsTestLoading(true);
        setTestStatus(null);
        try {
            // We temporarily set the URL in localStorage for the test to work 
            // if the user hasn't saved yet, but let's encourage saving first or just test the input string
            // Actually api.js uses getScriptUrl() which reads localStorage. 
            // So we must save first or mock the call. 
            // Let's safe-guard:
            localStorage.setItem('google_script_url', url);

            // Try a simple ping or fetch users
            await api.getUsers();

            setTestStatus('success');
            showToast('Koneksi Berhasil!', false);
        } catch (e) {
            console.error(e);
            setTestStatus('error');
            showToast('Koneksi Gagal. Cek URL.', true);
        }
        setIsTestLoading(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b pb-4 border-stone-200">
                <h2 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-stone-600" />
                    Pengaturan Aplikasi
                </h2>
                <p className="text-stone-500 mt-2">Konfigurasi koneksi ke Google Sheets.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 max-w-2xl">
                <div className="mb-6">
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                        Google Apps Script Web App URL
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://script.google.com/macros/s/..."
                            className="flex-1 p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono text-stone-600"
                        />
                    </div>
                    <p className="text-xs text-stone-400 mt-2">
                        Copy URL dari Deployment Google Apps Script anda. Pastikan access: "Anyone".
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        className="bg-stone-800 hover:bg-stone-900 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition"
                    >
                        <Save size={18} /> Simpan
                    </button>

                    <button
                        onClick={handleTestConnection}
                        disabled={isTestLoading}
                        className={`border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition ${isTestLoading ? 'opacity-50' : ''}`}
                    >
                        {isTestLoading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                        Test Koneksi
                    </button>

                    {testStatus === 'success' && (
                        <span className="text-emerald-600 flex items-center gap-1 text-sm font-bold animate-in fade-in">
                            <CheckCircle size={18} /> Terhubung
                        </span>
                    )}

                    {testStatus === 'error' && (
                        <span className="text-red-500 flex items-center gap-1 text-sm font-bold animate-in fade-in">
                            <AlertTriangle size={18} /> Gagal Terhubung
                        </span>
                    )}
                </div>
            </div>

            {/* Help Section */}
            <div className="bg-stone-100 p-6 rounded-xl border border-stone-200 max-w-2xl">
                <h3 className="font-bold text-stone-700 mb-2">Cara Mendapatkan URL:</h3>
                <ol className="list-decimal list-inside text-sm text-stone-600 space-y-1">
                    <li>Buka Google Sheet &gt; Extensions &gt; Apps Script.</li>
                    <li>Deploy &gt; New Deployment.</li>
                    <li>Pilih "Web App".</li>
                    <li>Execute as: "Me" & Who has access: "Anyone".</li>
                    <li>Copy URL yang diberikan.</li>
                </ol>
            </div>

        </div>
    );
}
