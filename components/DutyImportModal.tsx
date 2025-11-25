
import React, { useState, useRef } from 'react';
import { Teacher, DutyType, AdditionalDuty } from '../types';
import { X, Upload, AlertCircle, Check, RefreshCw, AlertTriangle } from 'lucide-react';

interface DutyImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: { teacherId: string, duty: AdditionalDuty }[]) => void;
  teachers: Teacher[];
}

export const DutyImportModal: React.FC<DutyImportModalProps> = ({ isOpen, onClose, onSave, teachers }) => {
  const [inputType, setInputType] = useState<'paste' | 'file'>('paste');
  const [rawText, setRawText] = useState('');
  const [previewData, setPreviewData] = useState<{ teacherName: string, teacherId: string, duty: AdditionalDuty, status: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const findTeacher = (name: string) => {
      const normalized = name.toLowerCase().trim();
      // Coba match exact
      let found = teachers.find(t => t.name.toLowerCase().trim() === normalized);
      // Coba match contains jika exact gagal
      if (!found) {
          found = teachers.find(t => t.name.toLowerCase().includes(normalized));
      }
      return found;
  };

  const parseRawData = (text: string) => {
    try {
      const rows = text.trim().split(/\r\n|\n/);
      
      if (rows.length === 0) {
        setError("Data kosong.");
        setPreviewData([]);
        return;
      }

      const parsedItems = rows.map((row, index) => {
        // Format: Nama Guru [tab] Jenis Tugas [tab] Kelas/Keterangan [tab] Jam (Opsional)
        const cols = row.split(/[\t;]+/).map(c => c.trim().replace(/^"|"$/g, ''));
        
        if (cols.length < 2) return null;

        const teacherName = cols[0];
        const typeRaw = cols[1].toLowerCase();
        const description = cols[2] || '';
        const hours = parseInt(cols[3] || '2'); // Default 2 JP untuk tugas tambahan

        let type: DutyType = 'Lainnya';
        if (typeRaw.includes('wali kelas')) type = 'WaliKelas';
        else if (typeRaw.includes('mentor') || typeRaw.includes('guru wali')) type = 'GuruWali';
        else if (typeRaw.includes('pembina')) type = 'PembinaEkskul';
        else if (typeRaw.includes('kakomli') || typeRaw.includes('kaprodi')) type = 'Kakomli';
        else if (typeRaw.includes('waka')) {
            if (typeRaw.includes('kurikulum')) type = 'WakaKurikulum';
            else if (typeRaw.includes('humas')) type = 'WakaHumas';
            else if (typeRaw.includes('kesiswaan')) type = 'WakaKesiswaan';
            else if (typeRaw.includes('sarpras')) type = 'WakaSarpras';
        }

        const teacher = findTeacher(teacherName);

        return {
            id: index,
            teacherName,
            teacherId: teacher ? teacher.id : '',
            duty: {
                type,
                description,
                equivalentHours: hours
            },
            status: teacher ? 'Ready' : 'Guru Tidak Ditemukan'
        };
      }).filter(item => item !== null);

      setPreviewData(parsedItems as any);
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
    const validUpdates = previewData
        .filter(d => d.teacherId)
        .map(d => ({ teacherId: d.teacherId, duty: d.duty }));
    
    if (validUpdates.length > 0) {
      onSave(validUpdates);
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
            <Upload className="text-indigo-600" size={20} />
            Import Pembagian Tugas Guru (SK)
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
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border ${inputType === 'paste' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        Copy-Paste (Excel)
                    </button>
                    <button 
                        onClick={() => {
                            setInputType('file');
                            fileInputRef.current?.click();
                        }}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border ${inputType === 'file' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        Upload CSV
                    </button>
                    <input type="file" ref={fileInputRef} accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-4 text-xs text-yellow-800">
                    <div className="font-bold mb-1 flex items-center gap-1"><AlertCircle size={12}/> Format Kolom:</div>
                    <div className="font-mono bg-white px-2 py-1 rounded border border-yellow-200 mb-1">
                        Nama Guru [tab] Jenis Tugas [tab] Kelas/Ket [tab] Jam
                    </div>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>Jenis Tugas:</strong> "Wali Kelas", "Mentor", "Pembina", "Waka", "Kakomli".</li>
                        <li><strong>Kelas:</strong> Tulis nama kelas persis, misal "X RPL 1".</li>
                    </ul>
                </div>

                <textarea
                    className="flex-1 w-full border border-gray-300 rounded-lg p-3 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none whitespace-pre"
                    placeholder={`Budi Santoso\tWali Kelas\tX RPL 1\t2\nSiti Aminah\tMentor\tX RPL 1\t2\nAgus\tPembina\tPramuka\t2`}
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
                                <th className="px-3 py-2 border-b">Guru</th>
                                <th className="px-3 py-2 border-b">Tugas Baru</th>
                                <th className="px-3 py-2 border-b">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {previewData.length > 0 ? (
                                previewData.map((d, i) => (
                                    <tr key={i} className={d.teacherId ? 'bg-white' : 'bg-red-50'}>
                                        <td className="px-3 py-2 font-medium">{d.teacherName}</td>
                                        <td className="px-3 py-2">
                                            <div className="font-bold text-indigo-700 text-[10px] uppercase">{d.duty.type}</div>
                                            <div className="text-gray-500">{d.duty.description}</div>
                                        </td>
                                        <td className="px-3 py-2">
                                            {d.teacherId ? (
                                                <span className="text-green-600 font-bold text-[10px] flex items-center gap-1"><Check size={10}/> OK</span>
                                            ) : (
                                                <span className="text-red-500 font-bold text-[10px] flex items-center gap-1"><AlertTriangle size={10}/> 404</span>
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
            disabled={previewData.filter(d => d.teacherId).length === 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 shadow-sm ${
                previewData.filter(d => d.teacherId).length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <Check size={16} />
            Simpan Pembagian Tugas
          </button>
        </div>
      </div>
    </div>
  );
};
