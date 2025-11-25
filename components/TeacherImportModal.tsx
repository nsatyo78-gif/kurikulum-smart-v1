
import React, { useState, useRef } from 'react';
import { Teacher, EmployeeStatus } from '../types';
import { X, Upload, FileText, AlertCircle, Check, RefreshCw } from 'lucide-react';

interface TeacherImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teachers: Teacher[]) => void;
}

export const TeacherImportModal: React.FC<TeacherImportModalProps> = ({ isOpen, onClose, onSave }) => {
  const [inputType, setInputType] = useState<'paste' | 'file'>('paste');
  const [rawText, setRawText] = useState('');
  const [previewData, setPreviewData] = useState<Teacher[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseRawData = (text: string) => {
    try {
      const rows = text.trim().split(/\r\n|\n/);
      
      if (rows.length === 0) {
        setError("Data kosong.");
        setPreviewData([]);
        return;
      }

      const parsedTeachers: Teacher[] = rows.map((row, index) => {
        // Format: Nama [tab] NIP [tab] Status [tab] Mapel (koma) [tab] Jam Mengajar
        const cols = row.split(/[\t;]+/).map(c => c.trim().replace(/^"|"$/g, ''));
        
        if (cols.length < 1) return null;

        const name = cols[0];
        const nip = cols[1] || '-';
        let status = (cols[2] || 'GTT') as EmployeeStatus;
        // Basic validation for status
        if (!['PNS', 'PPPK', 'Guru Tamu', 'GTT', 'Guru Kontrak'].includes(status)) {
            status = 'GTT';
        }

        const subjectsRaw = cols[3] || '';
        const subjects = subjectsRaw.split(',').map(s => s.trim()).filter(s => s);
        
        const teachingHours = parseInt(cols[4] || '0') || 0;

        return {
          id: `t-imp-${Date.now()}-${index}`,
          name: name || 'Tanpa Nama',
          nip: nip,
          status: status,
          subjects: subjects,
          maxHours: 24,
          teachingHours: teachingHours,
          additionalDuties: [], // Default empty
          phone: '' // Default empty
        } as Teacher;
      }).filter(item => item !== null) as Teacher[];

      setPreviewData(parsedTeachers);
      setError(null);
    } catch (err) {
      setError("Gagal memproses data. Pastikan format sesuai.");
      setPreviewData([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      parseRawData(text);
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(e.target.value);
    parseRawData(e.target.value);
  };

  const handleSave = () => {
    if (previewData.length > 0) {
      onSave(previewData);
      setRawText('');
      setPreviewData([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Upload className="text-blue-600" size={20} />
            Import Data Guru (Excel/CSV)
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-6 border-r border-gray-200 flex flex-col overflow-y-auto">
                <div className="flex gap-2 mb-4">
                    <button 
                        onClick={() => setInputType('paste')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border ${inputType === 'paste' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        Copy-Paste (Excel)
                    </button>
                    <button 
                        onClick={() => {
                            setInputType('file');
                            fileInputRef.current?.click();
                        }}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border ${inputType === 'file' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        Upload CSV
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept=".csv,.txt" 
                        className="hidden" 
                        onChange={handleFileUpload}
                    />
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-4 text-xs text-yellow-800">
                    <div className="font-bold mb-1 flex items-center gap-1"><AlertCircle size={12}/> Format Kolom (Urutan):</div>
                    <div className="font-mono bg-white px-2 py-1 rounded border border-yellow-200 mb-1">
                        Nama [tab] NIP [tab] Status [tab] Mapel (koma) [tab] Jam
                    </div>
                    <p>Contoh: <code>Budi Santoso, S.Pd  1980...  PNS  Matematika, PKWU  24</code></p>
                </div>

                <textarea
                    className="flex-1 w-full border border-gray-300 rounded-lg p-3 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder={`Budi Santoso\t19800101\tPNS\tMatematika\t24\nSiti Aminah\t-\tGTT\tBahasa Inggris\t12`}
                    value={rawText}
                    onChange={handlePasteChange}
                ></textarea>
            </div>

            <div className="w-full md:w-1/2 p-6 flex flex-col bg-gray-50/50 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 text-sm">Preview Data ({previewData.length})</h3>
                    {previewData.length > 0 && (
                        <button onClick={() => {setRawText(''); setPreviewData([]);}} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                            <RefreshCw size={10} /> Reset
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 text-gray-600 font-bold sticky top-0">
                            <tr>
                                <th className="px-3 py-2 border-b">Nama</th>
                                <th className="px-3 py-2 border-b">Status</th>
                                <th className="px-3 py-2 border-b">Mapel</th>
                                <th className="px-3 py-2 border-b text-center">Jam</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {previewData.length > 0 ? (
                                previewData.map((t, i) => (
                                    <tr key={i}>
                                        <td className="px-3 py-2 font-medium">{t.name}</td>
                                        <td className="px-3 py-2">{t.status}</td>
                                        <td className="px-3 py-2 text-gray-500 truncate max-w-[100px]">{t.subjects.join(', ')}</td>
                                        <td className="px-3 py-2 text-center font-bold">{t.teachingHours}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center text-gray-400 italic">
                                        {error ? <span className="text-red-500">{error}</span> : "Data preview akan muncul di sini"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={previewData.length === 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 shadow-sm ${
                previewData.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Check size={16} />
            Simpan Data
          </button>
        </div>
      </div>
    </div>
  );
};
