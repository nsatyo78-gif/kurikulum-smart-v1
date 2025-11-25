
import React, { useState, useRef } from 'react';
import { Student } from '../types';
import { CLASS_NAMES } from '../constants';
import { X, Upload, AlertCircle, Check, RefreshCw, Users } from 'lucide-react';

interface GuardianImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (students: Student[]) => void;
  existingStudents: Student[]; // Untuk validasi nama/NIS
}

export const GuardianImportModal: React.FC<GuardianImportModalProps> = ({ isOpen, onClose, onSave, existingStudents }) => {
  const [inputType, setInputType] = useState<'paste' | 'file'>('paste');
  const [rawText, setRawText] = useState('');
  const [previewData, setPreviewData] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper untuk mencari data siswa yang sudah ada berdasarkan NIS
  const findExistingStudent = (nis: string) => {
      return existingStudents.find(s => s.nis === nis);
  };

  const parseRawData = (text: string) => {
    try {
      const rows = text.trim().split(/\r\n|\n/);
      
      if (rows.length === 0) {
        setError("Data kosong.");
        setPreviewData([]);
        return;
      }

      const parsedStudents: Student[] = rows.map((row, index) => {
        // Format Updated: NIS [tab] Nama Siswa [tab] KELAS [tab] Nama Ortu [tab] No HP [tab] Alamat
        const cols = row.split(/[\t;]+/).map(c => c.trim().replace(/^"|"$/g, ''));
        
        // Minimal ada NIS
        if (cols.length < 1) return null;

        const nis = cols[0];
        const name = cols[1] || '';
        const classNameInput = cols[2] || ''; // Kolom Kelas Baru
        const parentName = cols[3] || '';
        const parentPhone = cols[4] || '';
        const address = cols[5] || '';

        // Cek apakah siswa sudah ada di database
        const existing = findExistingStudent(nis);

        if (existing) {
            // Update data kontak siswa yang sudah ada, update kelas juga jika ada input
            return {
                ...existing,
                className: classNameInput || existing.className,
                parentName: parentName || existing.parentName,
                parentPhone: parentPhone || existing.parentPhone,
                address: address || existing.address
            };
        } else {
            // Jika siswa belum ada, buat baru
            return {
                id: `guard-imp-${Date.now()}-${index}`,
                nis: nis,
                name: name || 'Siswa Baru',
                className: classNameInput || CLASS_NAMES[0], // Gunakan input kelas atau default
                gender: 'L', // Default
                status: 'Aktif',
                parentName,
                parentPhone,
                address
            } as Student;
        }
      }).filter(item => item !== null) as Student[];

      setPreviewData(parsedStudents);
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
            <Upload className="text-green-600" size={20} />
            Import Data Kontak Wali Murid
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
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border ${inputType === 'paste' ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        Copy-Paste (Excel)
                    </button>
                    <button 
                        onClick={() => {
                            setInputType('file');
                            fileInputRef.current?.click();
                        }}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border ${inputType === 'file' ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        Upload CSV
                    </button>
                    <input type="file" ref={fileInputRef} accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-4 text-xs text-yellow-800">
                    <div className="font-bold mb-1 flex items-center gap-1"><AlertCircle size={12}/> Format Kolom (Urutan):</div>
                    <div className="font-mono bg-white px-2 py-1 rounded border border-yellow-200 mb-1">
                        NIS [tab] Nama [tab] Kelas [tab] Ortu [tab] HP [tab] Alamat
                    </div>
                    <p className="mt-1">
                        Tips: Cukup pastikan <strong>NIS</strong> benar untuk mengupdate data siswa.
                    </p>
                </div>

                <textarea
                    className="flex-1 w-full border border-gray-300 rounded-lg p-3 font-mono text-xs focus:ring-2 focus:ring-green-500 outline-none resize-none"
                    placeholder={`21221005\tAfifa\tX PPLG 1\tBpk. Budi\t0812xxx\tJl. Melati No. 5\n21221006\tAilen\tX TJKT 2\tIbu Siti\t0856xxx\tDesa Bojong`}
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
                                <th className="px-3 py-2 border-b">NIS</th>
                                <th className="px-3 py-2 border-b">Nama</th>
                                <th className="px-3 py-2 border-b">Kelas</th>
                                <th className="px-3 py-2 border-b">Ortu/HP</th>
                                <th className="px-3 py-2 border-b">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {previewData.length > 0 ? (
                                previewData.map((s, i) => {
                                    const exists = existingStudents.some(ex => ex.nis === s.nis);
                                    return (
                                        <tr key={i}>
                                            <td className="px-3 py-2 font-mono text-gray-500">{s.nis}</td>
                                            <td className="px-3 py-2 font-medium">{s.name}</td>
                                            <td className="px-3 py-2">
                                                <span className="bg-gray-100 px-1 py-0.5 rounded">{s.className}</span>
                                            </td>
                                            <td className="px-3 py-2 text-gray-500">
                                                <div>{s.parentName}</div>
                                                <div className="text-[9px]">{s.parentPhone}</div>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {exists ? (
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Update</span>
                                                ) : (
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Baru</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400 italic">
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
                previewData.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
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
