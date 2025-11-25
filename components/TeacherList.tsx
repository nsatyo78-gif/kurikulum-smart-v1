
import React, { useState, useEffect } from 'react';
import { Teacher, DutyType, EmployeeStatus } from '../types';
import { User, BookOpen, Shield, Star, Users, Award, Briefcase, GraduationCap, BadgeCheck, Building2, UserCheck, Crown, Wallet, PenTool, ClipboardList, Plus, Pencil, Trash2, Printer, X, FileText, Info, Calendar, FileSpreadsheet, Search } from 'lucide-react';
import { SCHOOL_LOGO } from '../constants';

interface TeacherListProps {
  teachers: Teacher[];
  onAddTeacher: () => void;
  onEditTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onImport?: () => void;
}

const JATENG_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Coat_of_arms_of_Central_Java.svg/1910px-Coat_of_arms_of_Central_Java.svg.png";

export const TeacherList: React.FC<TeacherListProps> = ({ teachers, onAddTeacher, onEditTeacher, onDeleteTeacher, onImport }) => {
  const [selectedTeacherForSK, setSelectedTeacherForSK] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State configuration for printing
  const [printConfig, setPrintConfig] = useState({
    semester: 'Gasal' as 'Gasal' | 'Genap',
    academicYearStart: new Date().getFullYear(),
    printDate: new Date().toISOString().split('T')[0],
    skNumber: ''
  });

  // Helper untuk mendapatkan warna inisial (Avatar)
  const getAvatarColor = (name: string) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  // Helper badge tugas
  const getDutyBadge = (type: DutyType) => {
    switch (type) {
      case 'KepalaSekolah': return { label: 'Kepala Sekolah', color: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20', icon: <Crown size={12} /> };
      case 'WakaKurikulum': 
      case 'WakaHumas': 
      case 'WakaKesiswaan': 
      case 'WakaSarpras': return { label: type.replace('Waka', 'Waka '), color: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', icon: <Shield size={12} /> };
      case 'Kakomli': return { label: 'Kakomli', color: 'bg-rose-50 text-rose-700 ring-rose-600/20', icon: <Briefcase size={12} /> };
      case 'WaliKelas': return { label: 'Wali Kelas', color: 'bg-blue-50 text-blue-700 ring-blue-600/20', icon: <Users size={12} /> };
      default: return { label: type.replace(/([A-Z])/g, ' $1').trim(), color: 'bg-slate-50 text-slate-600 ring-slate-500/20', icon: <Award size={12} /> };
    }
  };

  // Helper status badge
  const getStatusBadge = (status: EmployeeStatus) => {
      switch(status) {
          case 'PNS': return { color: 'bg-sky-50 text-sky-700 border-sky-100', icon: <BadgeCheck size={14} /> };
          case 'PPPK': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <UserCheck size={14} /> };
          case 'GTT': return { color: 'bg-slate-50 text-slate-600 border-slate-100', icon: <User size={14} /> };
          default: return { color: 'bg-gray-50 text-gray-600 border-gray-100', icon: <User size={14} /> };
      }
  }

  const handlePrintSK = () => {
      window.print();
  };

  const handleOpenSK = (teacher: Teacher) => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    let defaultSem: 'Gasal' | 'Genap' = 'Gasal';
    let defaultYear = year;

    if (month < 6) { 
        defaultSem = 'Genap';
        defaultYear = year - 1;
    } else { 
        defaultSem = 'Gasal';
        defaultYear = year;
    }

    setPrintConfig({
        semester: defaultSem,
        academicYearStart: defaultYear,
        printDate: now.toISOString().split('T')[0],
        skNumber: ''
    });
    setSelectedTeacherForSK(teacher);
  };

  const filteredTeachers = teachers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.nip.includes(searchTerm));

  // Derived Values for Report
  const academicYearString = `${printConfig.academicYearStart}/${printConfig.academicYearStart + 1}`;
  const formattedPrintDate = new Date(printConfig.printDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
  });

  return (
    <>
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                 <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Data Guru & Karyawan</h2>
                 <p className="text-slate-500 mt-1">Kelola data pengajar, beban kerja, dan tugas tambahan.</p>
            </div>
            <div className="flex flex-wrap gap-3">
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari nama atau NIP..." 
                        className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-full md:w-64 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 {onImport && (
                    <button 
                        onClick={onImport}
                        className="flex items-center gap-2 bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
                    >
                        <FileSpreadsheet size={18} /> Import
                    </button>
                )}
                <button 
                    onClick={onAddTeacher}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus size={18} /> Tambah Guru
                </button>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-bold">Nama & NIP</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold">Mata Pelajaran</th>
                            <th className="px-6 py-4 font-bold text-center">Beban Mengajar</th>
                            <th className="px-6 py-4 font-bold">Tugas Tambahan</th>
                            <th className="px-6 py-4 font-bold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredTeachers.map((teacher) => {
                             const dutiesHours = teacher.additionalDuties.reduce((acc, curr) => acc + curr.equivalentHours, 0);
                             const totalHours = teacher.teachingHours + dutiesHours;
                             const statusBadge = getStatusBadge(teacher.status);

                             return (
                                 <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors group">
                                     <td className="px-6 py-4">
                                         <div className="flex items-center gap-4">
                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${getAvatarColor(teacher.name)}`}>
                                                 {getInitials(teacher.name)}
                                             </div>
                                             <div>
                                                 <div className="font-bold text-slate-800">{teacher.name}</div>
                                                 <div className="text-xs text-slate-400 font-mono mt-0.5">{teacher.nip}</div>
                                             </div>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}>
                                            {statusBadge.icon} {teacher.status}
                                        </div>
                                     </td>
                                     <td className="px-6 py-4 max-w-xs">
                                         <div className="flex flex-wrap gap-1.5">
                                            {teacher.subjects.length > 0 ? (
                                                teacher.subjects.map((subj, idx) => (
                                                    <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md border border-slate-200">{subj}</span>
                                                ))
                                            ) : (
                                                <span className="text-slate-300 text-xs italic">Belum ada mapel</span>
                                            )}
                                         </div>
                                     </td>
                                     <td className="px-6 py-4 text-center">
                                         <div className="flex flex-col items-center">
                                             <span className={`text-lg font-bold ${totalHours >= 24 ? 'text-emerald-600' : 'text-amber-500'}`}>{totalHours}</span>
                                             <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Jam</span>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            {teacher.additionalDuties.length > 0 ? teacher.additionalDuties.map((duty, idx) => {
                                                const badge = getDutyBadge(duty.type);
                                                return (
                                                    <div key={idx} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium w-fit ring-1 ring-inset ${badge.color}`}>
                                                        {badge.icon} {badge.label}
                                                        <span className="opacity-60 ml-1">({duty.description})</span>
                                                    </div>
                                                )
                                            }) : <span className="text-slate-300 text-xs">-</span>}
                                        </div>
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                         <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button onClick={() => handleOpenSK(teacher)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Cetak SK">
                                                 <FileText size={18} />
                                             </button>
                                             <button onClick={() => onEditTeacher(teacher)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                 <Pencil size={18} />
                                             </button>
                                             <button onClick={() => onDeleteTeacher(teacher.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                                 <Trash2 size={18} />
                                             </button>
                                         </div>
                                     </td>
                                 </tr>
                             )
                        })}
                    </tbody>
                </table>
            </div>
            {filteredTeachers.length === 0 && (
                <div className="p-10 text-center text-slate-400">
                    <User size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Tidak ada data guru yang ditemukan.</p>
                </div>
            )}
        </div>
    </div>
    
    {/* Modal Cetak SK */}
    {selectedTeacherForSK && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:p-0 print:static print:bg-white">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:max-h-none print:rounded-none animate-fade-in">
                
                {/* Header Modal - Hidden when printing */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-2xl print:hidden">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <Printer size={20} className="text-blue-600"/> Konfigurasi SK KBM
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">Sesuaikan nomor SK dan periode sebelum mencetak.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handlePrintSK} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
                            <Printer size={16}/> Cetak Dokumen
                        </button>
                        <button onClick={() => setSelectedTeacherForSK(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                 {/* Config Form (Hidden Print) */}
                 <div className="p-6 bg-slate-50 border-b border-slate-100 print:hidden grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                         <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nomor SK</label>
                         <input 
                            type="text" 
                            value={printConfig.skNumber} 
                            onChange={(e) => setPrintConfig({...printConfig, skNumber: e.target.value})}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                            placeholder="Contoh: 800/..."
                         />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tahun Awal</label>
                         <input 
                            type="number" 
                            value={printConfig.academicYearStart} 
                            onChange={(e) => setPrintConfig({...printConfig, academicYearStart: Number(e.target.value)})}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                         />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Semester</label>
                         <select 
                            value={printConfig.semester} 
                            onChange={(e) => setPrintConfig({...printConfig, semester: e.target.value as 'Gasal' | 'Genap'})}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                         >
                            <option value="Gasal">Gasal</option>
                            <option value="Genap">Genap</option>
                         </select>
                     </div>
                 </div>

                {/* Konten Surat (Preview Area) */}
                <div className="p-10 print:p-0 text-black font-serif leading-relaxed relative">
                    
                    {/* LAMPIRAN HEADER - POJOK KANAN ATAS */}
                    <div className="absolute top-2 right-10 text-xs font-serif text-right leading-tight hidden print:block">
                        Lampiran Keputusan Kepala SMK Negeri 1 Purbalingga<br/>
                        Nomor : {printConfig.skNumber || '800 / ..... / .....'}<br/>
                        Tanggal : {formattedPrintDate}
                    </div>
                    {/* Spacer for screen view to mimic print layout */}
                    <div className="flex justify-end mb-4 print:hidden">
                        <div className="text-xs font-serif text-right leading-tight border border-dashed border-gray-300 p-2 bg-gray-50">
                            Lampiran Keputusan Kepala SMK Negeri 1 Purbalingga<br/>
                            Nomor : {printConfig.skNumber || '800 / ..... / .....'}<br/>
                            Tanggal : {formattedPrintDate}
                        </div>
                    </div>

                    {/* KOP SURAT */}
                    <div className="flex items-center justify-between border-b-4 border-double border-black pb-4 mb-6">
                        {/* Kiri: Logo Jateng */}
                        <div className="w-24 flex justify-center">
                            <img src={JATENG_LOGO} alt="Logo Jateng" className="h-24 w-auto object-contain grayscale contrast-150" />
                        </div>

                        {/* Tengah: Teks */}
                        <div className="text-center flex-1 mx-4">
                            <h4 className="text-base font-bold uppercase tracking-wide">Pemerintah Provinsi Jawa Tengah</h4>
                            <h4 className="text-base font-bold uppercase tracking-wide">Dinas Pendidikan dan Kebudayaan</h4>
                            <h2 className="text-2xl font-bold uppercase tracking-widest mt-1">SMK Negeri 1 Purbalingga</h2>
                            <p className="text-[11px] mt-1 leading-tight">Jalan Mayor Jenderal Sungkono, Kec. Kalimanah, Kab Purbalingga, Jawa Tengah, Kode Pos 53371</p>
                            <p className="text-[11px] leading-tight">Telepon 0281-891550 Faksimile 0281 - 895265, Pos-el info@smkn1pbg.sch.id</p>
                        </div>

                        {/* Kanan: Logo SMK */}
                        <div className="w-24 flex justify-center">
                            <img src={SCHOOL_LOGO} alt="Logo Sekolah" className="h-24 w-auto object-contain grayscale contrast-150" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h3 className="text-lg font-bold uppercase underline underline-offset-4">SURAT KEPUTUSAN</h3>
                        <p className="text-sm font-bold mt-1">Nomor: {printConfig.skNumber || '800 / ..... / .....'}</p>
                        <h4 className="text-md font-bold uppercase mt-2">TENTANG PEMBAGIAN TUGAS MENGAJAR DAN TUGAS TAMBAHAN</h4>
                        <h4 className="text-md font-bold uppercase">SEMESTER {printConfig.semester.toUpperCase()} TAHUN AJARAN {academicYearString}</h4>
                    </div>

                    {/* KONSIDERAN */}
                    <div className="mb-6 text-sm text-justify">
                        <div className="flex mb-2">
                            <div className="w-32 font-bold align-top">Menimbang</div>
                            <div className="flex-1 pl-2 align-top">
                                : Bahwa dalam rangka memperlancar pelaksanaan Kegiatan Belajar Mengajar (KBM) dan tugas-tugas lain di SMK Negeri 1 Purbalingga Tahun Pelajaran {academicYearString}, maka perlu menetapkan pembagian tugas mengajar dan tugas tambahan.
                            </div>
                        </div>
                        <div className="flex mb-2">
                            <div className="w-32 font-bold align-top">Mengingat</div>
                            <div className="flex-1 pl-2 align-top">
                                <ol className="list-decimal list-outside ml-4 space-y-1">
                                    <li>
                                        : Permendikdasmen Nomor 13 Tahun 2025 tentang Perubahan Atas Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 12 Tahun 2024 Tentang Kurikulum Pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, Dan Jenjang Pendidikan Menengah;
                                    </li>
                                    <li>
                                        Peraturan Kepala Dinas Pendidikan dan Kebudayaan Provinsi Jawa Tengah nomor: 400.3.1107209 tentang Pedoman Penyusunan Kalender Pendidikan Tahun Ajaran 2025/2026;
                                    </li>
                                    <li>
                                        Keputusan Gubernur Jawa Tengah Nomor : 821.31812022 tanggal 07 Januari 2022 tentang Pengangkatan Kepala Sekolah Pada Dinas Pendidikan dan Kebudayaan Provinsi Jawa Tengah.
                                    </li>
                                </ol>
                            </div>
                        </div>
                        <div className="flex mt-4">
                            <div className="w-32 font-bold align-top">Memutuskan</div>
                            <div className="flex-1 pl-2"></div>
                        </div>
                        <div className="flex">
                            <div className="w-32 font-bold align-top">Menetapkan</div>
                            <div className="flex-1 pl-2 align-top">
                                : Keputusan Kepala SMK Negeri 1 Purbalingga tentang Pembagian Tugas Mengajar dan Tugas Tambahan Guru Semester {printConfig.semester} Tahun Pelajaran {academicYearString}.
                            </div>
                        </div>
                    </div>

                    <p className="mb-4 mt-6 text-justify font-bold border-t border-black pt-4">
                        Kepala SMK Negeri 1 Purbalingga menugaskan kepada:
                    </p>

                    <table className="w-full mb-6">
                        <tbody>
                            <tr>
                                <td className="w-40 py-1 font-bold">Nama</td>
                                <td className="w-4">:</td>
                                <td className="font-bold">{selectedTeacherForSK.name}</td>
                            </tr>
                            <tr>
                                <td className="py-1">NIP</td>
                                <td>:</td>
                                <td>{selectedTeacherForSK.nip}</td>
                            </tr>
                            <tr>
                                <td className="py-1">Status Kepegawaian</td>
                                <td>:</td>
                                <td>{selectedTeacherForSK.status}</td>
                            </tr>
                        </tbody>
                    </table>

                    <p className="mb-4 text-justify">
                        Untuk melaksanakan tugas mengajar dan tugas tambahan dengan rincian beban kerja sebagai berikut:
                    </p>

                    {/* Tabel Rincian Tugas */}
                    <table className="w-full border-collapse border border-black mb-6 text-sm">
                        <thead>
                            <tr className="bg-gray-100 print:bg-white">
                                <th className="border border-black p-2 text-center w-12">No</th>
                                <th className="border border-black p-2 text-left">Uraian Tugas</th>
                                <th className="border border-black p-2 text-center w-40">Keterangan</th>
                                <th className="border border-black p-2 text-center w-24">Beban (JP)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* 1. Tugas Utama (Mengajar) */}
                            <tr>
                                <td className="border border-black p-2 text-center align-top">1</td>
                                <td className="border border-black p-2 align-top">
                                    <strong>Melaksanakan KBM (Tatap Muka)</strong><br/>
                                    <span className="text-xs italic">Mapel: {selectedTeacherForSK.subjects.join(', ')}</span>
                                </td>
                                <td className="border border-black p-2 text-center align-top">Guru Mapel</td>
                                <td className="border border-black p-2 text-center align-top font-bold">{selectedTeacherForSK.teachingHours}</td>
                            </tr>

                            {/* 2. Tugas Tambahan */}
                            {selectedTeacherForSK.additionalDuties.map((duty, idx) => (
                                <tr key={idx}>
                                    <td className="border border-black p-2 text-center align-top">{idx + 2}</td>
                                    <td className="border border-black p-2 align-top">
                                        <strong>{duty.type === 'GuruWali' ? 'Guru Wali (Mentor)' : duty.type.replace(/([A-Z])/g, ' $1').trim()}</strong><br/>
                                        <span className="text-xs">{duty.description}</span>
                                    </td>
                                    <td className="border border-black p-2 text-center align-top">Tugas Tambahan</td>
                                    <td className="border border-black p-2 text-center align-top font-bold">{duty.equivalentHours}</td>
                                </tr>
                            ))}

                            {/* Total */}
                            <tr className="bg-gray-100 print:bg-white font-bold">
                                <td colSpan={3} className="border border-black p-2 text-right">Total Beban Kerja (JP / Minggu)</td>
                                <td className="border border-black p-2 text-center">
                                    {selectedTeacherForSK.teachingHours + selectedTeacherForSK.additionalDuties.reduce((acc, curr) => acc + curr.equivalentHours, 0)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <p className="mb-8 text-justify">
                        Keputusan ini berlaku sejak tanggal ditetapkan dengan ketentuan apabila dikemudian hari terdapat kekeliruan akan dibetulkan sebagaimana mestinya.
                    </p>

                    {/* Tanda Tangan */}
                    <div className="flex justify-end mt-10">
                        <div className="text-center w-64">
                            <p>Ditetapkan di: Purbalingga</p>
                            <p>Pada Tanggal: {formattedPrintDate}</p>
                            <p className="font-bold mb-20 mt-4">Kepala Sekolah</p>
                            <p className="font-bold underline underline-offset-2">Maryono, S.Pd., M.Si.</p>
                            <p>NIP. 19660701 200012 1 002</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )}
    </>
  );
};
