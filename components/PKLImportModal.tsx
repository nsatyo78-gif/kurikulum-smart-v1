
import React, { useState, useRef } from 'react';
import { PKLAssignment, Teacher } from '../types';
import { X, Upload, AlertCircle, Check, RefreshCw, AlertTriangle } from 'lucide-react';

interface PKLImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pklList: PKLAssignment[]) => void;
  teachers: Teacher[]; // Needed for Name -> ID mapping
}

export const PKLImportModal: React.FC<PKLImportModalProps> = ({ isOpen, onClose, onSave, teachers }) => {
  const [inputType, setInputType] = useState<'paste' | 'file'>('paste');
  const [rawText, setRawText] = useState('');
  const [previewData, setPreviewData] = useState<PKLAssignment[]>([]);
  const [unknownTeachers, setUnknownTeachers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fungsi helper mencari ID guru berdasarkan nama (Case Insensitive)
  const findTeacherIdByName = (name: string): string => {
      const normalizedName = name.trim().toLowerCase();
      const teacher = teachers.find(t => t.name.toLowerCase().includes(normalizedName));
      return teacher ? teacher.id : '';
  };

  const parseRawData = (text: string) => {
    try {
      const rows = text.trim().split(/\r\n|\n/);
      
      if (rows.length === 0) {
        setError("Data kosong.");
        setPreviewData([]);
        setUnknownTeachers([]);
        return;
      }

      const missingTeachers = new Set<string>();

      const parsedPKL: PKLAssignment[] = rows.map((row, index) => {
        // Format: Nama Siswa [tab] Nama DUDI [tab] Nama Guru [tab] Tgl Mulai [tab] Tgl Selesai
        const cols = row.split(/[\t;]+/).map(c => c.trim().replace(/^"|"$/g, ''));
        
        if (cols.length < 2) return null;

        const studentName = cols[0];
        const companyName = cols[1];
        const teacherNameRaw = cols[2];
        const startDate = cols[3] || '2025-01-06';
        const endDate = cols[4] || '2025-04-06';
        const status = 'Pending'; // Default

        let teacherId = '';
        if (teacherNameRaw) {
            teacherId = findTeacherIdByName(teacherNameRaw);
            if (!teacherId) {
                missingTeachers.add(teacherNameRaw);
            }
        }

        return {
          id: `pkl-imp-${Date.now()}-${index}`,
          studentName: studentName || 'Unknown',
          companyName: companyName || 'Unknown',
          teacherId: teacherId, // Jika kosong, nanti bisa di-handle di UI
          startDate,
          endDate,
          status
        } as PKLAssignment;
      }).filter(item => item !== null) as PKLAssignment[];

      setPreviewData(parsedPKL);
      setUnknownTeachers(Array.from(missingTeachers));
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
            <Upload className="text-orange-600" size={20} />
            Import Plotting PKL
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
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border ${inputType === 'paste' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        Copy-Paste (Excel)
                    </button>
                    <button 
                        onClick={() => {
                            setInputType('file');
                            fileInputRef.current?.click();
                        }}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border ${inputType === 'file' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        Upload CSV
                    </button>
                    <input type="file" ref={fileInputRef} accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-4 text-xs text-yellow-800">
                    <div className="font-bold mb-1 flex items-center gap-1"><AlertCircle size={12}/> Format Kolom (Urutan):</div>
                    <div className="font-mono bg-white px-2 py-1 rounded border border-yellow-200 mb-1">
                        Siswa [tab] DUDI [tab] Nama Guru [tab] Mulai [tab] Selesai
                    </div>
                    <p>Sistem akan otomatis mencocokkan Nama Guru dengan database untuk mendapatkan ID.</p>
                </div>

                <textarea
                    className="flex-1 w-full border border-gray-300 rounded-lg p-3 font-mono text-xs focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    placeholder={`Ahmad Zulkarnain\tPT Telkom\tDra. Sri Mularsih\t2025-01-06\t2025-06-06\nSiti Aminah\tCV Media\tPak Joko\t...`}
                    value={rawText}
                    onChange={handlePasteChange}
                ></textarea>
            </div>

            <div className="w-full md:w-1/2 p-6 flex flex-col bg-gray-50/50 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 text-sm">Preview Data ({previewData.length})</h3>
                    {previewData.length > 0 && (
                        <button onClick={() => {setRawText(''); setPreviewData([]); setUnknownTeachers([]);}} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                            <RefreshCw size={10} /> Reset
                        </button>
                    )}
                </div>

                {unknownTeachers.length > 0 && (
                    <div className="mb-3 bg-red-50 p-2 rounded border border-red-200 text-[10px] text-red-700">
                        <strong className="flex items-center gap-1"><AlertTriangle size={10}/> Guru tidak ditemukan:</strong>
                        <p className="line-clamp-2">{unknownTeachers.join(', ')}</p>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 text-gray-600 font-bold sticky top-0">
                            <tr>
                                <th className="px-3 py-2 border-b">Siswa</th>
                                <th className="px-3 py-2 border-b">DUDI</th>
                                <th className="px-3 py-2 border-b">Guru (Match?)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {previewData.length > 0 ? (
                                previewData.map((d, i) => (
                                    <tr key={i}>
                                        <td className="px-3 py-2 font-medium">{d.studentName}</td>
                                        <td className="px-3 py-2 text-gray-500">{d.companyName}</td>
                                        <td className="px-3 py-2">
                                            {d.teacherId ? (
                                                <span className="text-green-600 font-bold text-[10px]">OK</span>
                                            ) : (
                                                <span className="text-red-500 font-bold text-[10px]">Gagal</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-4 py-10 text-center text-gray-400 italic">
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
                previewData.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
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
