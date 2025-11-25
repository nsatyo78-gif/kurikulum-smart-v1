import React, { useState, useMemo } from 'react';
import { PKLAssignment, Teacher, DUDI, ScheduleSlot, Student } from '../types';
import { generatePKLLetter } from '../services/geminiService';
import { updatePKLAssignmentToDB } from '../services/database';
import { SCHOOL_LOGO } from '../constants';
import { Briefcase, FileText, Mail, Calculator, X, Plus, ChevronDown, ChevronUp, Building2, FileSpreadsheet, Filter, Search, Printer, Send, Loader2, Link, Save, ExternalLink, CheckCircle, Trash2 } from 'lucide-react';

interface PKLManagerProps {
  pklList: PKLAssignment[];
  teachers: Teacher[];
  dudiList: DUDI[];
  schedule: ScheduleSlot[];
  students?: Student[]; // Added students prop for dropdown
  onAddAssignment: (assignment: PKLAssignment) => void;
  onImport?: () => void;
  onDeletePKL?: (id: string) => void;
}

const JATENG_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Coat_of_arms_of_Central_Java.svg/1910px-Coat_of_arms_of_Central_Java.svg.png";

export const PKLManager: React.FC<PKLManagerProps> = ({ pklList, teachers, dudiList, schedule, students = [], onAddAssignment, onImport, onDeletePKL }) => {
  const [selectedAssignment, setSelectedAssignment] = useState<PKLAssignment | null>(null);
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSKModal, setShowSKModal] = useState(false); // State untuk Modal SK
  const [skNumber, setSkNumber] = useState(''); // State untuk Nomor SK Dinamis
  
  // Monitoring Modal State
  const [showMonitoringModal, setShowMonitoringModal] = useState(false);
  const [monitoringUrl, setMonitoringUrl] = useState('');
  const [selectedPKLForMonitoring, setSelectedPKLForMonitoring] = useState<PKLAssignment | null>(null);

  // Expanded Row State
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);

  // State untuk kalkulator
  const [rombelSize, setRombelSize] = useState(36);
  const [divisor, setDivisor] = useState(44);
  const [quotaSearch, setQuotaSearch] = useState('');

  // Form State for New Assignment
  const [selectedMajor, setSelectedMajor] = useState<string>(''); // State untuk filter Jurusan
  const [newAssignment, setNewAssignment] = useState<Partial<PKLAssignment>>({
    studentName: '',
    companyName: '',
    teacherId: '',
    startDate: '2025-01-06',
    endDate: '2025-04-06',
    status: 'Pending'
  });

  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'Unknown';

  // Helper: Hitung JP Tatap Muka di Kelas XII (Rumus Baru)
  const getTeacherXIIHours = (teacherId: string) => {
    // Filter slot jadwal yang dimiliki guru ini DAN kelasnya dimulai dengan "XII"
    const xiiSlots = schedule.filter(s => 
        s.teacherId === teacherId && 
        s.className.startsWith('XII')
    );
    return xiiSlots.length;
  };

  const calculateQuota = (teachingHoursXII: number) => {
      // Logic: (JP XII / Divisor) * RombelSize
      // Divisor default 44, Rombel default 36
      return Math.floor((teachingHoursXII / divisor) * rombelSize);
  };

  const toggleExpand = (teacherId: string) => {
      setExpandedTeacherId(expandedTeacherId === teacherId ? null : teacherId);
  };

  const getStatusBadge = (status: 'Active' | 'Completed' | 'Pending') => {
    switch (status) {
      case 'Active':
        return <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Aktif</span>;
      case 'Completed':
        return <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Selesai</span>;
      case 'Pending':
        return <span className="text-[10px] font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">Pending</span>;
      default:
        return null;
    }
  };

  const handleGenerateLetter = async (assignment: PKLAssignment) => {
    setSelectedAssignment(assignment);
    setIsLoading(true);
    setGeneratedLetter('');
    
    const teacherName = getTeacherName(assignment.teacherId);
    const dates = `${assignment.startDate} s.d ${assignment.endDate}`;
    
    const letter = await generatePKLLetter(teacherName, assignment.studentName, assignment.companyName, dates);
    
    setGeneratedLetter(letter);
    setIsLoading(false);
  };

  const handleSendEmail = () => {
    if (!selectedAssignment) return;
    setIsSendingEmail(true);
    setTimeout(() => {
        setIsSendingEmail(false);
        alert(`✅ Sukses!\nSurat tugas terkirim.`);
    }, 1500);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
      e.preventDefault();
      if (newAssignment.studentName && newAssignment.companyName && newAssignment.teacherId) {
          onAddAssignment({
              id: `pkl-${Date.now()}`,
              studentName: newAssignment.studentName,
              companyName: newAssignment.companyName,
              teacherId: newAssignment.teacherId,
              startDate: newAssignment.startDate || '',
              endDate: newAssignment.endDate || '',
              status: 'Pending'
          });
          setShowAddModal(false);
          // Reset form
          setNewAssignment({ studentName: '', companyName: '', teacherId: '', startDate: '2025-01-06', endDate: '2025-04-06', status: 'Pending' });
          setSelectedMajor('');
      }
  };

  const handleOpenMonitoring = (pkl: PKLAssignment) => {
      setSelectedPKLForMonitoring(pkl);
      setMonitoringUrl(pkl.monitoringUrl || '');
      setShowMonitoringModal(true);
  };

  const handleSaveMonitoring = async () => {
      if (!selectedPKLForMonitoring) return;
      
      const updatedPKL = { 
          ...selectedPKLForMonitoring, 
          monitoringUrl: monitoringUrl,
          lastMonitoringDate: new Date().toISOString()
      };

      // Update Local State (Hack for quick UI update)
      Object.assign(selectedPKLForMonitoring, updatedPKL);
      
      // Update Database
      await updatePKLAssignmentToDB(updatedPKL);
      
      setShowMonitoringModal(false);
      alert("Bukti monitoring berhasil disimpan!");
  };

  const handlePrintSK = () => {
      window.print();
  };

  // Filter guru yang punya jam di kelas XII ATAU sudah punya anak bimbingan
  const relevantTeachers = teachers.filter(t => {
      const hoursXII = getTeacherXIIHours(t.id);
      const hasStudents = pklList.some(p => p.teacherId === t.id);
      const matchesSearch = t.name.toLowerCase().includes(quotaSearch.toLowerCase());
      return (hoursXII > 0 || hasStudents) && matchesSearch;
  });

  // Extract Majors from Class XII Students only
  const availableMajors = useMemo(() => {
    const majors = new Set<string>();
    students.forEach(s => {
        if (s.className.startsWith('XII')) {
            // Extract major code (e.g., "XII PPLG 1" -> "PPLG")
            const parts = s.className.split(' ');
            if (parts.length >= 2) {
                majors.add(parts[1]);
            }
        }
    });
    return Array.from(majors).sort();
  }, [students]);

  // Filter students based on selected Major
  const filteredStudents = useMemo(() => {
      if (!selectedMajor) return [];
      return students.filter(s => 
          s.className.startsWith('XII') && 
          s.className.includes(selectedMajor) &&
          // Optional: Exclude students already assigned? For now, we allow multiple for demo or re-assignment
          // !pklList.some(p => p.studentName === s.name)
          true
      );
  }, [students, selectedMajor, pklList]);


  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Briefcase className="text-orange-600" /> Monitoring Guru Pembimbing
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Hierarki: Guru Pembimbing &rarr; DUDI &rarr; Siswa
                                </p>
                            </div>
                            
                            {/* Controls for Formula */}
                            <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-orange-200 shadow-sm">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Rumus Kuota:</div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span title="Jam Tatap Muka Kelas XII" className="font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">JP XII</span>
                                    <span className="text-gray-400">/</span>
                                    <input 
                                        type="number" 
                                        value={divisor}
                                        onChange={(e) => setDivisor(Number(e.target.value))}
                                        className="w-10 text-center border border-gray-300 rounded py-0.5"
                                    />
                                    <span className="text-gray-400">×</span>
                                    <input 
                                        type="number" 
                                        value={rombelSize}
                                        onChange={(e) => setRombelSize(Number(e.target.value))}
                                        className="w-10 text-center border border-gray-300 rounded py-0.5"
                                    />
                                    <span className="text-gray-400">=</span>
                                    <span className="font-bold text-orange-600">Kuota</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search & Action Bar */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Cari Guru Pembimbing..." 
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                value={quotaSearch}
                                onChange={(e) => setQuotaSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowSKModal(true)}
                                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors shadow-sm"
                                title="Cetak Surat Keputusan (SK)"
                            >
                                <Printer size={16} /> SK Pembimbing
                            </button>
                            {onImport && (
                                <button 
                                    onClick={onImport}
                                    className="flex items-center gap-2 bg-white text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors shadow-sm"
                                    title="Import Plotting"
                                >
                                    <FileSpreadsheet size={16} /> Import
                                </button>
                            )}
                            <button 
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors shadow-sm"
                            >
                                <Plus size={16} /> Input Data
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 w-10"></th>
                                    <th className="px-6 py-3">Guru Pembimbing</th>
                                    <th className="px-6 py-3 text-center">JP XII</th>
                                    <th className="px-6 py-3 text-center bg-orange-50/50 text-orange-800">Kuota</th>
                                    <th className="px-6 py-3 text-center">Terisi</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {relevantTeachers.map(teacher => {
                                    const hoursXII = getTeacherXIIHours(teacher.id);
                                    const quota = calculateQuota(hoursXII);
                                    const studentsAssigned = pklList.filter(p => p.teacherId === teacher.id);
                                    const currentLoad = studentsAssigned.length;
                                    const isExpanded = expandedTeacherId === teacher.id;
                                    const isOver = currentLoad > quota;

                                    // Group students by DUDI
                                    const dudiGroups: Record<string, PKLAssignment[]> = {};
                                    studentsAssigned.forEach(s => {
                                        if (!dudiGroups[s.companyName]) {
                                            dudiGroups[s.companyName] = [];
                                        }
                                        dudiGroups[s.companyName].push(s);
                                    });

                                    return (
                                        <React.Fragment key={teacher.id}>
                                            <tr 
                                                className={`hover:bg-gray-50 cursor-pointer transition-colors ${isExpanded ? 'bg-orange-50/30' : ''}`}
                                                onClick={() => toggleExpand(teacher.id)}
                                            >
                                                <td className="px-6 py-4 text-center">
                                                    {isExpanded ? <ChevronUp size={16} className="text-orange-600"/> : <ChevronDown size={16} className="text-gray-400"/>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{teacher.name}</div>
                                                    <div className="text-xs text-gray-400 font-mono">{teacher.nip}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-mono">
                                                    {hoursXII}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-orange-700 bg-orange-50/30">
                                                    {quota}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold">
                                                    {currentLoad}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {isOver ? (
                                                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded">Overload</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded">Aman</span>
                                                    )}
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-orange-50/10">
                                                    <td colSpan={6} className="p-0">
                                                        <div className="p-4 pl-12 border-y border-orange-100">
                                                            {currentLoad > 0 ? (
                                                                <div className="space-y-4">
                                                                    {Object.entries(dudiGroups).map(([dudiName, groupStudents], idx) => {
                                                                        const dudiInfo = dudiList.find(d => d.name === dudiName);
                                                                        return (
                                                                            <div key={idx} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                                                                {/* DUDI Header */}
                                                                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Building2 size={16} className="text-blue-600" />
                                                                                        <h4 className="font-bold text-gray-800 text-sm">{dudiName}</h4>
                                                                                        <span className="text-xs text-gray-500">({dudiInfo?.address || 'Alamat tidak tersedia'})</span>
                                                                                    </div>
                                                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                                                                        {groupStudents.length} Siswa
                                                                                    </span>
                                                                                </div>
                                                                                
                                                                                {/* Students Table */}
                                                                                <table className="w-full text-left text-xs">
                                                                                    <tbody className="divide-y divide-gray-100">
                                                                                        {groupStudents.map(student => (
                                                                                            <tr key={student.id} className="hover:bg-gray-50">
                                                                                                <td className="px-4 py-2 w-8 text-gray-400 font-mono text-[10px]">{idx + 1}.</td>
                                                                                                <td className="px-4 py-2 font-medium text-gray-900">{student.studentName}</td>
                                                                                                <td className="px-4 py-2 text-gray-500">
                                                                                                    {student.startDate} - {student.endDate}
                                                                                                </td>
                                                                                                <td className="px-4 py-2 text-center">
                                                                                                    {getStatusBadge(student.status)}
                                                                                                </td>
                                                                                                <td className="px-4 py-2 text-right flex justify-end gap-2">
                                                                                                    <button
                                                                                                        onClick={() => handleOpenMonitoring(student)}
                                                                                                        className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border transition-colors ${
                                                                                                            student.monitoringUrl 
                                                                                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                                                                                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                                                                        }`}
                                                                                                        title={student.monitoringUrl ? "Lihat/Edit Jurnal Monitoring" : "Upload Bukti Monitoring"}
                                                                                                    >
                                                                                                        <CheckCircle size={10} /> {student.monitoringUrl ? "Terlampir" : "Upload Jurnal"}
                                                                                                    </button>
                                                                                                    <button 
                                                                                                        onClick={() => handleGenerateLetter(student)}
                                                                                                        className="text-gray-500 hover:text-orange-600 transition-colors flex items-center gap-1"
                                                                                                        title="Buat Surat Tugas"
                                                                                                    >
                                                                                                        <FileText size={12} /> Surat
                                                                                                    </button>
                                                                                                    {onDeletePKL && (
                                                                                                        <button 
                                                                                                            onClick={() => onDeletePKL(student.id)}
                                                                                                            className="text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1"
                                                                                                            title="Hapus Plotting"
                                                                                                        >
                                                                                                            <Trash2 size={12} />
                                                                                                        </button>
                                                                                                    )}
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg text-gray-400 italic">
                                                                    Belum ada DUDI atau siswa yang di-assign ke guru ini.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                {/* Letter Preview Panel */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6 h-fit">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <Mail size={18} /> Preview Surat Tugas
                        </h3>
                        {selectedAssignment && (
                            <button onClick={() => {setSelectedAssignment(null); setGeneratedLetter('');}} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    
                    <div className="p-6 min-h-[300px] max-h-[500px] overflow-y-auto">
                        {!selectedAssignment ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                                <FileText size={48} className="mb-4 opacity-20" />
                                <p className="text-center text-sm">Pilih tombol <FileText size={12} className="inline"/> pada daftar siswa<br/>untuk membuat surat tugas.</p>
                            </div>
                        ) : isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center text-blue-600 py-10 animate-pulse">
                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-sm font-medium">Sedang menyusun surat dengan AI...</p>
                            </div>
                        ) : (
                            <div className="prose prose-sm max-w-none flex flex-col h-full">
                                <div className="whitespace-pre-wrap font-serif text-gray-800 text-sm leading-relaxed border p-4 rounded bg-gray-50 flex-1 overflow-y-auto">
                                    {generatedLetter}
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => window.print()}
                                        className="bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Printer size={16} /> Cetak
                                    </button>
                                    <button 
                                        onClick={handleSendEmail}
                                        disabled={isSendingEmail}
                                        className={`py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm text-white transition-all ${
                                            isSendingEmail 
                                            ? 'bg-blue-400 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        {isSendingEmail ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        {isSendingEmail ? 'Mengirim...' : 'Kirim Email'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Modal Cetak SK Pembimbing */}
        {showSKModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:p-0 print:static print:bg-white">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:max-h-none print:rounded-none print:overflow-visible">
                    
                    {/* Injeksi Style untuk Memaksa Portrait saat Print */}
                    <style>
                        {`
                            @media print {
                                @page {
                                    size: A4 portrait;
                                    margin: 1cm;
                                }
                                body {
                                    -webkit-print-color-adjust: exact;
                                }
                            }
                        `}
                    </style>

                    {/* Modal Header (Hidden in Print) */}
                    <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl print:hidden sticky top-0 z-20">
                        <h3 className="font-bold text-lg text-slate-800">Pratinjau SK Pembimbing PKL</h3>
                        <div className="flex gap-2">
                            <button onClick={handlePrintSK} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
                                <Printer size={16} /> Cetak Dokumen
                            </button>
                            <button onClick={() => setShowSKModal(false)} className="bg-white border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                                Tutup
                            </button>
                        </div>
                    </div>

                    {/* Config Area (Hidden in Print) */}
                    <div className="p-4 bg-slate-50 border-b border-slate-200 print:hidden">
                        <div className="max-w-sm">
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nomor SK</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Contoh: 800 / 001 / 2025"
                                value={skNumber}
                                onChange={(e) => setSkNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* SK Content */}
                    <div className="p-10 print:p-0 text-black font-serif leading-relaxed text-sm relative">
                        
                        {/* LAMPIRAN HEADER - POJOK KANAN ATAS */}
                        <div className="absolute top-2 right-10 text-xs font-serif text-right leading-tight hidden print:block">
                            Lampiran Keputusan Kepala SMK Negeri 1 Purbalingga<br/>
                            Nomor : {skNumber || '800 / ..... / 2025'}<br/>
                            Tanggal : {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                        </div>
                        {/* Spacer for screen view */}
                        <div className="flex justify-end mb-4 print:hidden">
                            <div className="text-xs font-serif text-right leading-tight border border-dashed border-gray-300 p-2 bg-gray-50">
                                Lampiran Keputusan Kepala SMK Negeri 1 Purbalingga<br/>
                                Nomor : {skNumber || '800 / ..... / 2025'}<br/>
                                Tanggal : {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                            </div>
                        </div>

                        {/* KOP SURAT */}
                        <div className="flex items-center justify-between border-b-4 border-double border-black pb-4 mb-6">
                            <div className="w-24 flex justify-center">
                                <img src={JATENG_LOGO} alt="Logo Jateng" className="h-24 w-auto object-contain grayscale contrast-150" />
                            </div>
                            <div className="text-center flex-1 mx-4">
                                <h4 className="text-base font-bold uppercase tracking-wide">Pemerintah Provinsi Jawa Tengah</h4>
                                <h4 className="text-base font-bold uppercase tracking-wide">Dinas Pendidikan dan Kebudayaan</h4>
                                <h2 className="text-2xl font-bold uppercase tracking-widest mt-1">SMK Negeri 1 Purbalingga</h2>
                                <p className="text-[11px] mt-1 leading-tight">Jalan Mayor Jenderal Sungkono, Kec. Kalimanah, Kab Purbalingga, Jawa Tengah, Kode Pos 53371</p>
                                <p className="text-[11px] leading-tight">Telepon 0281-891550 Faksimile 0281 - 895265, Pos-el info@smkn1pbg.sch.id</p>
                            </div>
                            <div className="w-24 flex justify-center">
                                <img src={SCHOOL_LOGO} alt="Logo Sekolah" className="h-24 w-auto object-contain grayscale contrast-150" />
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h3 className="text-lg font-bold uppercase underline underline-offset-4">SURAT KEPUTUSAN</h3>
                            <p className="font-bold mt-1">Nomor: {skNumber || '800 / ..... / 2025'}</p>
                            <h4 className="text-md font-bold uppercase mt-4">TENTANG</h4>
                            <h4 className="text-md font-bold uppercase">PENETAPAN GURU PEMBIMBING PRAKTIK KERJA LAPANGAN (PKL)</h4>
                            <h4 className="text-md font-bold uppercase">TAHUN PELAJARAN 2025/2026</h4>
                        </div>

                        <div className="mb-6">
                            <div className="flex mb-2">
                                <div className="w-32 font-bold">Menimbang</div>
                                <div className="flex-1 text-justify pl-2">: a. Bahwa PKL merupakan bagian integral dari kurikulum SMK;<br/>b. Bahwa perlu ditetapkan guru pembimbing yang kompeten dan memiliki beban mengajar ekuivalen di Kelas XII.</div>
                            </div>
                            <div className="flex mb-2">
                                <div className="w-32 font-bold">Mengingat</div>
                                <div className="flex-1 text-justify pl-2">
                                    <ol className="list-decimal ml-4 space-y-1">
                                        <li>Permendikdasmen Nomor 13 Tahun 2025 tentang Perubahan Atas Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 12 Tahun 2024 Tentang Kurikulum Pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, Dan Jenjang Pendidikan Menengah;</li>
                                        <li>Permendikbud Nomor 50 Tahun 2020 tentang Praktik Kerja Lapangan Bagi Peserta Didik;</li>
                                        <li>Permendikbudristek Nomor 12 Tahun 2024 tentang Kurikulum pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah.</li>
                                    </ol>
                                </div>
                            </div>
                            <div className="flex mt-4">
                                <div className="w-32 font-bold">Memutuskan</div>
                                <div className="flex-1 pl-2"></div>
                            </div>
                            <div className="flex">
                                <div className="w-32 font-bold">Menetapkan</div>
                                <div className="flex-1 text-justify pl-2">: Pembagian tugas guru pembimbing PKL sesuai lampiran surat keputusan ini.</div>
                            </div>
                        </div>

                        {/* LAMPIRAN TABEL */}
                        <div className="mt-8 break-before-auto">
                            <h4 className="font-bold uppercase mb-2">Lampiran SK: Daftar Pembagian Tugas Pembimbingan</h4>
                            <table className="w-full border-collapse border border-black text-xs">
                                <thead>
                                    <tr className="bg-gray-200 text-center font-bold">
                                        <th className="border border-black p-2 w-8">No</th>
                                        <th className="border border-black p-2 w-64">Nama Guru / NIP</th>
                                        <th className="border border-black p-2 w-20">Total JP Kls XII</th>
                                        <th className="border border-black p-2">Daftar Siswa Bimbingan, Kelas & Jurusan, Tempat DUDI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relevantTeachers.map((teacher, idx) => {
                                        const jpXII = getTeacherXIIHours(teacher.id);
                                        const assignedStudents = pklList.filter(p => p.teacherId === teacher.id);
                                        
                                        if (assignedStudents.length === 0) return null;

                                        return (
                                            <tr key={teacher.id} className="break-inside-avoid">
                                                <td className="border border-black p-2 text-center align-top">{idx + 1}</td>
                                                <td className="border border-black p-2 align-top">
                                                    <div className="font-bold">{teacher.name}</div>
                                                    <div>NIP: {teacher.nip}</div>
                                                    <div className="mt-2 italic text-[10px]">Mapel: {teacher.subjects.join(', ')}</div>
                                                </td>
                                                <td className="border border-black p-2 text-center align-top font-bold">
                                                    {jpXII} JP
                                                    <div className="text-[9px] font-normal mt-1">(Dasar Ekuivalensi)</div>
                                                </td>
                                                <td className="border border-black p-1 align-top">
                                                    <table className="w-full text-[10px]">
                                                        <tbody>
                                                            {assignedStudents.map((s, sIdx) => {
                                                                const studentData = students.find(std => std.name === s.studentName);
                                                                const className = studentData?.className || '-';
                                                                return (
                                                                    <tr key={s.id} className="border-b border-gray-300 last:border-0">
                                                                        <td className="p-1 w-6 text-center">{sIdx + 1}.</td>
                                                                        <td className="p-1 font-bold">{s.studentName}</td>
                                                                        <td className="p-1 w-24">{className}</td>
                                                                        <td className="p-1 italic text-gray-600">{s.companyName}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Tanda Tangan */}
                        <div className="flex justify-end mt-12 break-inside-avoid">
                            <div className="text-center w-64">
                                <p>Ditetapkan di: Purbalingga</p>
                                <p>Pada Tanggal: {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                <p className="font-bold mb-20 mt-4">Kepala Sekolah</p>
                                <p className="font-bold underline underline-offset-2">Maryono, S.Pd., M.Si.</p>
                                <p>NIP. 19660701 200012 1 002</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Modal Tambah Penugasan PKL */}
        {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <h3 className="text-lg font-bold text-gray-800">Input Data Monitoring PKL</h3>
                        <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSaveAssignment} className="space-y-4">
                        {/* 1. INPUT GURU */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">1</span>
                                Guru Pembimbing
                            </label>
                            <select 
                                required
                                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newAssignment.teacherId}
                                onChange={e => setNewAssignment({...newAssignment, teacherId: e.target.value})}
                            >
                                <option value="">-- Pilih Guru --</option>
                                {relevantTeachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} (JP XII: {getTeacherXIIHours(t.id)})</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. INPUT DUDI */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">2</span>
                                Mitra Industri (DUDI)
                            </label>
                            <select 
                                required
                                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={newAssignment.companyName}
                                onChange={e => setNewAssignment({...newAssignment, companyName: e.target.value})}
                            >
                                <option value="">-- Pilih DUDI --</option>
                                {dudiList.map(dudi => (
                                    <option key={dudi.id} value={dudi.name}>
                                        {dudi.name} ({dudi.field})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 3. INPUT JURUSAN (Filter) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px]">3</span>
                                Konsentrasi Keahlian (Jurusan)
                            </label>
                             <div className="relative">
                                <Filter size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <select 
                                    className="w-full pl-9 border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={selectedMajor}
                                    onChange={e => {
                                        setSelectedMajor(e.target.value);
                                        setNewAssignment({...newAssignment, studentName: ''}); // Reset student selection
                                    }}
                                >
                                    <option value="">-- Pilih Jurusan --</option>
                                    {availableMajors.map(major => (
                                        <option key={major} value={major}>{major}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 4. INPUT MURID (Integrated) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px]">4</span>
                                Pilih Siswa (Kelas XII)
                            </label>
                            <div className="relative">
                                <select 
                                    required
                                    disabled={!selectedMajor}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none ${!selectedMajor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
                                    value={newAssignment.studentName}
                                    onChange={e => setNewAssignment({...newAssignment, studentName: e.target.value})}
                                >
                                    <option value="">
                                        {selectedMajor ? `-- Pilih Siswa ${selectedMajor} --` : '-- Pilih Jurusan Terlebih Dahulu --'}
                                    </option>
                                    {filteredStudents.map(s => (
                                        <option key={s.id} value={s.name}>
                                            {s.name} ({s.className})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div>
                                <label className="block text-[10px] font-medium text-gray-500 mb-1">Tanggal Mulai</label>
                                <input 
                                    type="date" 
                                    className="w-full border rounded px-2 py-1.5 text-xs" 
                                    value={newAssignment.startDate} 
                                    onChange={e => setNewAssignment({...newAssignment, startDate: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-gray-500 mb-1">Tanggal Selesai</label>
                                <input 
                                    type="date" 
                                    className="w-full border rounded px-2 py-1.5 text-xs" 
                                    value={newAssignment.endDate} 
                                    onChange={e => setNewAssignment({...newAssignment, endDate: e.target.value})} 
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                            <button type="submit" className="px-4 py-2 text-sm bg-orange-600 text-white hover:bg-orange-700 rounded-lg shadow-sm">Simpan Data</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Modal Upload Jurnal Monitoring */}
        {showMonitoringModal && selectedPKLForMonitoring && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                     <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <CheckCircle className="text-green-600" /> Bukti Monitoring PKL
                        </h3>
                        <button onClick={() => setShowMonitoringModal(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-xs text-green-800">
                            <strong>Instruksi Guru Pembimbing:</strong>
                            <p className="mt-1">
                                Silakan lampirkan link bukti kegiatan monitoring (Google Drive berisi foto, logbook siswa, atau dokumen laporan kunjungan).
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Nama Siswa</label>
                            <div className="font-bold text-gray-800 text-sm">{selectedPKLForMonitoring.studentName}</div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">DUDI / Industri</label>
                            <div className="font-bold text-gray-800 text-sm">{selectedPKLForMonitoring.companyName}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link Jurnal Kegiatan / Bukti Foto</label>
                            <div className="relative">
                                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="url" 
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                                    placeholder="https://drive.google.com/..."
                                    value={monitoringUrl}
                                    onChange={(e) => setMonitoringUrl(e.target.value)}
                                />
                            </div>
                            {monitoringUrl && (
                                <a href={monitoringUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1">
                                    <ExternalLink size={10} /> Test Link
                                </a>
                            )}
                        </div>

                         <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                            <button type="button" onClick={() => setShowMonitoringModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                            <button 
                                onClick={handleSaveMonitoring}
                                className="px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg shadow-sm flex items-center gap-2"
                            >
                                <Save size={16} /> Simpan Bukti
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};