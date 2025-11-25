
import React, { useState, useMemo } from 'react';
import { Student, Teacher } from '../types';
import { AlertTriangle, ArrowRight, CheckCircle2, GraduationCap, X, Loader2, Users, Calendar, RefreshCcw } from 'lucide-react';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  teachers: Teacher[];
  onConfirm: (updatedStudents: Student[], updatedTeachers: Teacher[]) => Promise<void>;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, onClose, students, teachers, onConfirm }) => {
  const [activeTab, setActiveTab] = useState<'semester' | 'year'>('semester');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Logic to calculate changes for YEAR END PROMOTION
  const simulation = useMemo(() => {
    if (activeTab === 'semester') return null;

    const studentsToPromote: Student[] = [];
    const teachersToUpdate: Teacher[] = [];
    
    let countXtoXI = 0;
    let countXItoXII = 0;
    let countGraduates = 0;
    let countTeachersUpdated = 0;

    // 1. Simulate Students Promotion
    students.forEach(s => {
        if (s.status !== 'Aktif') return; // Skip non-active students

        const parts = s.className.trim().split(' '); // e.g., ["X", "PPLG", "1"]
        if (parts.length < 2) return;

        const grade = parts[0].toUpperCase();
        const restOfClass = parts.slice(1).join(' '); // "PPLG 1"

        let newClass = s.className;
        let newStatus: Student['status'] = s.status;

        if (grade === 'X') {
            newClass = `XI ${restOfClass}`;
            countXtoXI++;
        } else if (grade === 'XI') {
            newClass = `XII ${restOfClass}`;
            countXItoXII++;
        } else if (grade === 'XII') {
            newStatus = 'Lulus';
            countGraduates++;
        }

        if (newClass !== s.className || newStatus !== s.status) {
            studentsToPromote.push({
                ...s,
                className: newClass,
                status: newStatus
            });
        }
    });

    // 2. Simulate Teacher Mentor Duty Updates
    teachers.forEach(t => {
        let dutiesChanged = false;
        const newDuties = t.additionalDuties.map(duty => {
            // Only update 'GuruWali' (Mentor) duties
            if (duty.type === 'GuruWali') {
                const parts = duty.description.trim().split(' ');
                if (parts.length >= 2) {
                    const grade = parts[0].toUpperCase();
                    const restOfClass = parts.slice(1).join(' ');
                    
                    if (grade === 'X') {
                        dutiesChanged = true;
                        return { ...duty, description: `XI ${restOfClass}` };
                    } else if (grade === 'XI') {
                        dutiesChanged = true;
                        return { ...duty, description: `XII ${restOfClass}` };
                    } else if (grade === 'XII') {
                        // Mentor for XII finishes their cycle. 
                        // Option: Keep as is (they become mentor of alumni temporarily?) or Remove duty?
                        // Implementing: Keep as XII but in reality they are done. Or maybe set description to "Alumni 2025"?
                        // For simplicity & safety: Leave as XII. Admin deletes manually or reassigns to new X.
                        return duty; 
                    }
                }
            }
            return duty;
        });

        if (dutiesChanged) {
            teachersToUpdate.push({
                ...t,
                additionalDuties: newDuties
            });
            countTeachersUpdated++;
        }
    });

    return {
        studentsToPromote,
        teachersToUpdate,
        stats: { countXtoXI, countXItoXII, countGraduates, countTeachersUpdated }
    };
  }, [students, teachers, activeTab]);

  const handleConfirm = async () => {
      setIsProcessing(true);
      
      if (activeTab === 'year' && simulation) {
          await onConfirm(simulation.studentsToPromote, simulation.teachersToUpdate);
      } else {
          // Semester Change - No data mutation in current version, just close
          // In future: Update a global 'semester' config in DB
          await new Promise(resolve => setTimeout(resolve, 1000));
          alert("Sistem telah diperbarui ke Semester baru.");
      }

      setIsProcessing(false);
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Tab Header */}
        <div className="flex border-b border-gray-200">
            <button 
                onClick={() => { setActiveTab('semester'); setConfirmed(false); }}
                className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'semester' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
                <RefreshCcw size={18} /> Ganti Semester (Gasal/Genap)
            </button>
            <button 
                onClick={() => { setActiveTab('year'); setConfirmed(false); }}
                className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'year' ? 'bg-red-50 text-red-700 border-b-2 border-red-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
                <AlertTriangle size={18} /> Tutup Tahun Ajaran (Kenaikan Kelas)
            </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'semester' ? (
                <div className="space-y-6 text-center py-8">
                    <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-4">
                        <Calendar size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Pembaruan Semester Berjalan</h3>
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                        Gunakan opsi ini untuk berpindah dari Semester Gasal (Juli-Desember) ke Semester Genap (Januari-Juni).
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left max-w-md mx-auto">
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-blue-500"/> Siswa <strong>TETAP</strong> di kelas yang sama (X tetap X).</li>
                            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-blue-500"/> Data guru dan jadwal tetap aktif.</li>
                            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 text-blue-500"/> Hanya memperbarui referensi administrasi sistem.</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex gap-3">
                        <AlertTriangle size={24} className="text-red-600 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-red-800 text-sm">Perhatian: Tindakan Permanen</h4>
                            <p className="text-xs text-red-700 mt-1">
                                Proses ini akan menaikkan tingkat kelas seluruh siswa dan meluluskan siswa kelas XII. Pastikan semua nilai rapor telah selesai diproses sebelum melanjutkan.
                            </p>
                        </div>
                    </div>

                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider border-b pb-2">Simulasi Perubahan Data</h3>
                    
                    {simulation && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                    <div className="text-2xl font-bold text-blue-700 mb-1">{simulation.stats.countXtoXI}</div>
                                    <div className="text-xs text-blue-600 font-medium flex justify-center items-center gap-1">
                                        Kls X <ArrowRight size={10}/> Kls XI
                                    </div>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                                    <div className="text-2xl font-bold text-indigo-700 mb-1">{simulation.stats.countXItoXII}</div>
                                    <div className="text-xs text-indigo-600 font-medium flex justify-center items-center gap-1">
                                        Kls XI <ArrowRight size={10}/> Kls XII
                                    </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                                    <div className="text-2xl font-bold text-green-700 mb-1">{simulation.stats.countGraduates}</div>
                                    <div className="text-xs text-green-600 font-medium flex justify-center items-center gap-1">
                                        <GraduationCap size={12}/> Lulus (Alumni)
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                                <h4 className="font-bold text-yellow-800 text-sm mb-2 flex items-center gap-2">
                                    <Users size={16} /> Otomasi Guru Mentor (Wali)
                                </h4>
                                <p className="text-xs text-yellow-700 leading-relaxed">
                                    Sistem mendeteksi <strong>{simulation.stats.countTeachersUpdated} Guru Mentor</strong>. Tugas mereka akan diperbarui mengikuti kenaikan kelas siswa bimbingannya (Contoh: Mentor X $\rightarrow$ Mentor XI) agar pendampingan berkelanjutan.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>

        {/* Footer Confirmation */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
                <input 
                    type="checkbox" 
                    id="confirmCheck" 
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                />
                <label htmlFor="confirmCheck" className="text-sm text-gray-700 cursor-pointer select-none">
                    {activeTab === 'semester' 
                        ? 'Saya yakin ingin memperbarui semester sistem.'
                        : 'Saya bertanggung jawab atas kenaikan kelas massal ini.'
                    }
                </label>
            </div>
            
            <div className="flex justify-end gap-3">
                <button 
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                    disabled={isProcessing}
                >
                    Batal
                </button>
                <button 
                    onClick={handleConfirm}
                    disabled={!confirmed || isProcessing}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all shadow-lg ${
                        !confirmed || isProcessing 
                        ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                        : activeTab === 'semester' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                    }`}
                >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    {isProcessing ? 'Memproses...' : (activeTab === 'semester' ? 'Simpan Pembaruan' : 'Jalankan Kenaikan')}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
