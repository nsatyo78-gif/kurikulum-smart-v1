
import React, { useState, useMemo } from 'react';
import { Student, Teacher } from '../types';
import { Search, Phone, User, UserCheck, Users, HeartHandshake, Filter, MessageCircle, ChevronDown, ChevronUp, MapPin, Home, Pencil, Plus, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { CLASS_NAMES } from '../constants';

interface GuardianManagerProps {
  students: Student[];
  teachers: Teacher[];
  onEditStudent: (student: Student) => void;
  onAddStudent: () => void;
  onImport?: () => void; // Untuk Wali Murid
  onImportDuties?: () => void; // Untuk Guru Mentor
}

export const GuardianManager: React.FC<GuardianManagerProps> = ({ students, teachers, onEditStudent, onAddStudent, onImport, onImportDuties }) => {
  const [activeTab, setActiveTab] = useState<'parents' | 'mentors'>('parents');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  
  // State for accordion functionality in Mentor Tab
  const [expandedMentorId, setExpandedMentorId] = useState<string | null>(null);

  // Filter Logic for Parents
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.nis.includes(searchTerm) ||
                          (s.parentName && s.parentName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = selectedClass === 'Semua Kelas' || s.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Filter Logic for Mentor Teachers (Guru Wali)
  // Include teachers who are explicitly assigned as mentors OR have the legacy duty
  const mentorTeachers = useMemo(() => {
      return teachers.filter(t => {
        const hasMentees = students.some(s => s.mentorId === t.id);
        const hasDuty = t.additionalDuties.some(duty => duty.type === 'GuruWali');
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        return (hasMentees || hasDuty) && matchesSearch;
      });
  }, [teachers, students, searchTerm]);

  const handleWhatsApp = (phone: string | undefined, name: string, role: 'parent' | 'mentor') => {
    if (!phone) {
        alert('Nomor telepon tidak tersedia.');
        return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const text = role === 'parent' 
        ? `Assalamu'alaikum Bpk/Ibu ${name}, saya dari SMK Negeri 1 Purbalingga ingin menyampaikan informasi terkait putra/putri Anda...`
        : `Assalamu'alaikum Bpk/Ibu ${name}, mohon koordinasinya terkait siswa bimbingan Anda...`;
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const toggleExpand = (teacherId: string) => {
      setExpandedMentorId(expandedMentorId === teacherId ? null : teacherId);
  };

  const handleImportClick = () => {
      if (activeTab === 'parents' && onImport) {
          onImport();
      } else if (activeTab === 'mentors' && onImportDuties) {
          onImportDuties();
      }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-green-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <HeartHandshake className="text-green-600" /> Pusat Koordinasi Siswa
            </h2>
            <p className="text-sm text-gray-500">Layanan cepat tanggap wali murid dan guru pendamping (mentor).</p>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
             <button 
                onClick={() => setActiveTab('parents')}
                className={`px-4 py-2 text-sm font-semibold transition-all rounded-md flex items-center gap-2 ${
                    activeTab === 'parents' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Users size={16} /> Data Wali Murid
            </button>
            <button 
                onClick={() => setActiveTab('mentors')}
                className={`px-4 py-2 text-sm font-semibold transition-all rounded-md flex items-center gap-2 ${
                    activeTab === 'mentors' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <UserCheck size={16} /> Guru Wali (Mentor)
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-1 gap-4 w-full">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder={activeTab === 'parents' ? "Cari siswa, NIS, atau nama orang tua..." : "Cari nama guru mentor..."}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeTab === 'parents' && (
                    <div className="w-full md:w-64">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <select 
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none appearance-none bg-white"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                <option value="Semua Kelas">Semua Kelas</option>
                                {CLASS_NAMES.map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex gap-2">
                {((activeTab === 'parents' && onImport) || (activeTab === 'mentors' && onImportDuties)) && (
                    <button 
                        onClick={handleImportClick}
                        className="flex items-center gap-2 bg-white text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors shadow-sm"
                        title={activeTab === 'parents' ? "Import Data Ortu" : "Import SK Pembagian Tugas"}
                    >
                        <FileSpreadsheet size={16} /> {activeTab === 'parents' ? 'Import Ortu' : 'Import Tugas'}
                    </button>
                )}
                {activeTab === 'parents' && (
                    <button 
                        onClick={onAddStudent}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                        <Plus size={16} /> Tambah Data
                    </button>
                )}
            </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
            {activeTab === 'parents' ? (
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Identitas Siswa</th>
                            <th className="px-6 py-4">Kelas</th>
                            <th className="px-6 py-4">Alamat & Domisili</th>
                            <th className="px-6 py-4">Nama Orang Tua / Wali</th>
                            <th className="px-6 py-4 text-right">Aksi & Kontak</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{student.name}</div>
                                        <div className="text-xs text-gray-400 font-mono">{student.nis}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border border-gray-200">
                                            {student.className}
                                        </span>
                                    </td>
                                     <td className="px-6 py-4 max-w-[200px]">
                                        <div className="flex items-start gap-2">
                                            <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span className={`text-xs ${!student.address ? 'text-red-400 italic' : 'text-gray-600'} line-clamp-2`}>
                                                {student.address || 'Alamat belum diisi'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400" />
                                            <span className={`font-medium ${!student.parentName ? 'text-red-400 italic' : ''}`}>
                                                {student.parentName || 'Belum diisi'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => onEditStudent(student)}
                                                className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                                title="Edit Data Siswa & Wali"
                                            >
                                                <Pencil size={14} /> Edit Data
                                            </button>
                                            {student.parentPhone ? (
                                                <button 
                                                    onClick={() => handleWhatsApp(student.parentPhone, student.parentName || 'Wali Murid', 'parent')}
                                                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                >
                                                    <MessageCircle size={14} /> Hubungi
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic py-1.5 px-2">No. HP -</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                    Data tidak ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            ) : (
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4 w-10"></th>
                            <th className="px-6 py-4">Nama Guru Mentor</th>
                            <th className="px-6 py-4">Status Penugasan</th>
                            <th className="px-6 py-4 text-center">Jml Siswa</th>
                            <th className="px-6 py-4 text-right">Kontak Guru</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {mentorTeachers.length > 0 ? (
                            mentorTeachers.map((teacher) => {
                                // Prioritize Direct Assignment
                                const directMentees = students.filter(s => s.mentorId === teacher.id);
                                
                                // Fallback for display info
                                const guruWaliDuty = teacher.additionalDuties.find(d => d.type === 'GuruWali');
                                const targetClass = guruWaliDuty?.description || '';
                                
                                const isExpanded = expandedMentorId === teacher.id;
                                const hasDirect = directMentees.length > 0;

                                return (
                                    <React.Fragment key={teacher.id}>
                                        <tr 
                                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-indigo-50/50' : ''}`}
                                            onClick={() => toggleExpand(teacher.id)}
                                        >
                                            <td className="px-6 py-4 text-center">
                                                {isExpanded ? <ChevronUp size={16} className="text-indigo-600" /> : <ChevronDown size={16} className="text-gray-400" />}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{teacher.name}</div>
                                                <div className="text-xs text-gray-400 font-mono">{teacher.nip}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {hasDirect ? (
                                                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 text-xs">
                                                        <UserCheck size={12} />
                                                        Aktif (Checklist)
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200 text-xs" title={`SK: ${targetClass}`}>
                                                        <AlertCircle size={12} />
                                                        Belum ada siswa
                                                    </div>
                                                )}
                                                {targetClass && <span className="text-[10px] text-gray-400 ml-2">(SK: {targetClass})</span>}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${directMentees.length > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
                                                    {directMentees.length} Siswa
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {teacher.phone ? (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleWhatsApp(teacher.phone, teacher.name, 'mentor');
                                                        }}
                                                        className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                    >
                                                        <Phone size={14} /> Hubungi
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No. HP Tidak Ada</span>
                                                )}
                                            </td>
                                        </tr>
                                        {/* EXPANDED ROW FOR STUDENTS LIST */}
                                        {isExpanded && (
                                            <tr className="bg-indigo-50/30">
                                                <td colSpan={5} className="p-0">
                                                    <div className="p-6 border-y border-indigo-100">
                                                        <h4 className="font-bold text-indigo-800 text-sm mb-4 flex items-center gap-2">
                                                            <Users size={16} /> Daftar Siswa Binaan
                                                        </h4>
                                                        
                                                        {directMentees.length > 0 ? (
                                                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                                                <table className="w-full text-left text-xs">
                                                                    <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                                                                        <tr>
                                                                            <th className="px-4 py-3">NIS & Nama</th>
                                                                            <th className="px-4 py-3">Kelas</th>
                                                                            <th className="px-4 py-3">Alamat Lengkap</th>
                                                                            <th className="px-4 py-3">Orang Tua/Wali</th>
                                                                            <th className="px-4 py-3 text-right">Aksi</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-100">
                                                                        {directMentees.map(student => (
                                                                            <tr key={student.id} className="hover:bg-gray-50">
                                                                                <td className="px-4 py-3 align-top">
                                                                                    <div className="font-bold text-gray-900">{student.name}</div>
                                                                                    <div className="text-gray-500 font-mono">{student.nis}</div>
                                                                                </td>
                                                                                <td className="px-4 py-3 align-top">
                                                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold">{student.className}</span>
                                                                                </td>
                                                                                <td className="px-4 py-3 align-top">
                                                                                    <div className="flex items-start gap-2 max-w-[200px]">
                                                                                        <Home size={12} className="mt-0.5 text-gray-400 flex-shrink-0" />
                                                                                        <span className={`text-gray-600 leading-snug ${!student.address ? 'text-red-400 italic' : ''}`}>{student.address || 'Belum diisi'}</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-4 py-3 align-top">
                                                                                     <div className="flex flex-col gap-1">
                                                                                         <div className="flex items-center gap-2">
                                                                                            <User size={12} className="text-gray-400" />
                                                                                            <span className={`font-medium text-gray-700 ${!student.parentName ? 'text-red-400 italic' : ''}`}>{student.parentName || 'Belum diisi'}</span>
                                                                                         </div>
                                                                                         <div className="flex items-center gap-2">
                                                                                             <Phone size={12} className="text-gray-400" />
                                                                                             <span className="text-gray-500">{student.parentPhone || '-'}</span>
                                                                                         </div>
                                                                                     </div>
                                                                                </td>
                                                                                <td className="px-4 py-3 text-right align-top">
                                                                                    <div className="flex justify-end gap-2">
                                                                                        <button 
                                                                                            onClick={() => onEditStudent(student)}
                                                                                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1.5 rounded text-xs font-bold transition-colors inline-flex items-center gap-1"
                                                                                            title="Lengkapi Data"
                                                                                        >
                                                                                            <Pencil size={12} />
                                                                                        </button>
                                                                                        {student.parentPhone && (
                                                                                            <button 
                                                                                                onClick={() => handleWhatsApp(student.parentPhone, student.parentName || 'Wali Murid', 'parent')}
                                                                                                className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded text-xs font-bold transition-colors inline-flex items-center gap-1"
                                                                                            >
                                                                                                <MessageCircle size={12} /> WA
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 italic">
                                                                Belum ada siswa yang di-checklist untuk mentor ini.
                                                                <br/>
                                                                <span className="text-xs">Silakan buka menu <strong>Data Siswa</strong>, pilih siswa, dan atur mentor.</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                    Tidak ada guru yang ditugaskan sebagai Guru Wali (Mentor).
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
};
