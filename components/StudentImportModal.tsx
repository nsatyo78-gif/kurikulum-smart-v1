
import React, { useState, useRef } from 'react';
import { Student } from '../types';
import { X, Upload, FileText, AlertCircle, Check, Download, RefreshCw, Info } from 'lucide-react';
import { CLASS_NAMES } from '../constants';

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (students: Student[]) => void;
}

export const StudentImportModal: React.FC<StudentImportModalProps> = ({ isOpen, onClose, onSave }) => {
  const [inputType, setInputType] = useState<'paste' | 'file'>('paste');
  const [rawText, setRawText] = useState('');
  const [previewData, setPreviewData] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<'Simple' | 'Dapodik' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper untuk membersihkan string dari tanda petik Excel
  const cleanStr = (str: string) => str ? str.trim().replace(/^"|"$/g, '') : '';

  const parseRawData = (text: string) => {
    try {
      // Split baris (Support Windows/Unix line endings)
      const rows = text.trim().split(/\r\n|\n/);
      
      if (rows.length === 0) {
        setError("Data kosong.");
        setPreviewData([]);
        setDetectedFormat(null);
        return;
      }

      // Deteksi Format berdasarkan jumlah kolom baris pertama
      const firstRowCols = rows[0].split(/[\t;]+/).map(cleanStr);
      let isDapodikFormat = false;

      // Logika Deteksi: Jika kolom > 15, kemungkinan besar format Dapodik/Lengkap
      if (firstRowCols.length > 15) {
          isDapodikFormat = true;
          setDetectedFormat('Dapodik');
      } else {
          setDetectedFormat('Simple');
      }

      const parsedStudents: Student[] = rows.map((row, index) => {
        const cols = row.split(/[\t;]+/).map(cleanStr);
        
        // Skip baris header jika terdeteksi (misal ada kata 'Nama' atau 'NIPD')
        if (cols[1]?.toLowerCase() === 'nama' || cols[2]?.toLowerCase() === 'nipd' || cols[0]?.toLowerCase() === 'no') {
            return null;
        }

        // === FORMAT DAPODIK (WIDE) ===
        // Mapping berdasarkan urutan kolom standar Dapodik di gambar:
        // 0: No, 1: Nama, 2: NIPD, 3: JK, 4: NISN ... 
        // 9: Alamat, 10: RT, 11: RW, 12: Dusun, 13: Kelurahan ... 
        // 19: HP ... 24: Ayah ... 29: Ibu ... 39/40: Rombel (Lokasi rombel bisa geser, kita pakai pencarian cerdas)
        
        if (isDapodikFormat) {
            // Validasi minimal
            if (!cols[1]) return null; // Tidak ada nama

            const name = cols[1];
            const nis = cols[2] || cols[4] || `NO-NIS-${index}`; // Prioritas NIPD, lalu NISN
            
            // Normalisasi Gender
            const jkRaw = cols[3]?.toUpperCase();
            const gender = (jkRaw === 'L' || jkRaw === 'LAKI-LAKI') ? 'L' : 'P';

            // Cari Alamat Lengkap (Gabungan)
            const alamatJalan = cols[9] || '';
            const dusun = cols[12] ? `Dusun ${cols[12]}` : '';
            const desa = cols[13] ? `Desa ${cols[13]}` : '';
            const kec = cols[14] ? `Kec. ${cols[14]}` : '';
            const fullAddress = `${alamatJalan} ${dusun} ${desa} ${kec}`.trim();

            // Cari Nomor HP (Kolom 19 biasanya)
            // Fallback cari kolom yang mirip format HP jika kolom 19 kosong/salah
            let hp = cols[19] || ''; 

            // Cari Orang Tua (Ayah col 24, Ibu col 29). Prioritas Ayah.
            const parentName = cols[24] || cols[29] || '';

            // Cari Rombel/Kelas secara Cerdas
            // Loop kolom untuk mencari string yang mirip format kelas (X, XI, XII)
            // Biasanya Rombel ada di sekitar kolom 30-45
            let className = CLASS_NAMES[0];
            const classPattern = /^(X|XI|XII)\s/i; // Regex deteksi kelas
            
            // Cek kolom spesifik dulu (biasanya index 39 di dapodik baru)
            if (cols[39] && classPattern.test(cols[39])) {
                className = cols[39];
            } else {
                // Jika tidak ketemu, cari di seluruh kolom
                const foundClass = cols.find(c => classPattern.test(c));
                if (foundClass) className = foundClass;
            }

            // Kapitalisasi Kelas agar rapi
            className = className.toUpperCase();

            return {
                id: `imp-dapo-${Date.now()}-${index}`,
                nis: nis,
                name: name,
                className: className,
                gender: gender,
                status: 'Aktif',
                address: fullAddress,
                parentName: parentName,
                parentPhone: hp
            } as Student;
        } 
        
        // === FORMAT SIMPLE (Copy Paste Excel Biasa) ===
        // Format: NIS [tab] Nama [tab] Kelas [tab] L/P
        else {
            if (cols.length < 2) return null;
            
            const nis = cols[0];
            const name = cols[1];
            
            // Try to match class, default to first available
            let className = cols[2] || CLASS_NAMES[0];
            
            const genderRaw = cols[3]?.toUpperCase();
            const gender = (genderRaw === 'L' || genderRaw === 'LAKI-LAKI') ? 'L' : 'P';

            return {
                id: `import-${Date.now()}-${index}`,
                nis: nis || `ERR-${index}`,
                name: name || 'Tanpa Nama',
                className: className,
                gender: gender,
                status: 'Aktif'
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
      setRawText(text); // Show in text area
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
      // Reset
      setRawText('');
      setPreviewData([]);
      setDetectedFormat(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Upload className="text-green-600" size={20} />
            Import Data Siswa
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Left: Input Area */}
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

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 text-xs text-blue-800 space-y-2">
                    <div className="font-bold flex items-center gap-1"><Info size={14}/> Format yang Didukung:</div>
                    
                    <div className="pl-4 border-l-2 border-blue-200">
                        <p className="font-bold mb-1 text-blue-900">1. Format Dapodik (Wide)</p>
                        <p>Copy semua kolom dari Excel Dapodik (No, Nama, NIPD, ... s.d Rombel).</p>
                        <p className="opacity-75 mt-1">Sistem otomatis mendeteksi: NIPD, Nama, Kelas, HP, Nama Ortu, Alamat.</p>
                    </div>

                    <div className="pl-4 border-l-2 border-blue-200">
                         <p className="font-bold mb-1 text-blue-900">2. Format Simple</p>
                         <p className="font-mono bg-white px-1 rounded border border-blue-200 w-fit">NIS [tab] Nama [tab] Kelas [tab] L/P</p>
                    </div>
                </div>

                <textarea
                    className="flex-1 w-full border border-gray-300 rounded-lg p-3 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none whitespace-pre"
                    placeholder={`Paste data Excel di sini...`}
                    value={rawText}
                    onChange={handlePasteChange}
                ></textarea>
            </div>

            {/* Right: Preview Area */}
            <div className="w-full md:w-1/2 p-6 flex flex-col bg-gray-50/50 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-700 text-sm">Preview Data ({previewData.length})</h3>
                        {detectedFormat && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${detectedFormat === 'Dapodik' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                Format: {detectedFormat}
                            </span>
                        )}
                    </div>
                    {previewData.length > 0 && (
                        <button onClick={() => {setRawText(''); setPreviewData([]); setDetectedFormat(null);}} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                            <RefreshCw size={10} /> Reset
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 text-gray-600 font-bold sticky top-0">
                            <tr>
                                <th className="px-3 py-2 border-b">NIS/NIPD</th>
                                <th className="px-3 py-2 border-b">Nama</th>
                                <th className="px-3 py-2 border-b">Kelas</th>
                                <th className="px-3 py-2 border-b">Ortu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {previewData.length > 0 ? (
                                previewData.map((student, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-mono text-gray-500">{student.nis}</td>
                                        <td className="px-3 py-2">
                                            <div className="font-medium text-gray-900">{student.name}</div>
                                            <div className="text-[10px] text-gray-400">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">
                                                {student.className}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-gray-500">
                                            <div className="truncate max-w-[100px]">{student.parentName || '-'}</div>
                                            <div className="text-[9px] text-gray-400">{student.parentPhone}</div>
                                        </td>
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
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
            Simpan {previewData.length > 0 ? `(${previewData.length} Siswa)` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
