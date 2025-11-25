import React, { useState, useMemo } from 'react';
import { Student, Teacher } from '../types';
import { CLASS_NAMES, MAJORS_LIST } from '../constants';
import { Users, Search, Filter, Plus, FileSpreadsheet, UserCheck, HeartHandshake, GraduationCap, Building2, Pencil, CheckSquare, Save, X, Trash2 } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  teachers: Teacher[];
  onAddStudent: () => void;
  onImport: () => void;
  onEditStudent?: (student: Student) => void;
  onDeleteStudent?: (id: string) => void;
  onBulkUpdate?: (students: Student[]) => void;
}

export const StudentList: React.FC<StudentListProps> = ({ students, teachers, onAddStudent, onImport, onEditStudent, onDeleteStudent, onBulkUpdate }) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedWali, setSelectedWali] = useState<string>('All');
  const [selectedMentor, setSelectedMentor] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('Aktif');

  // Selection State
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [bulkMentorId, setBulkMentorId] = useState<string>('');

  // --- Derived Data for Dropdowns ---

  const availableClasses = useMemo(() => {
      if (selectedMajor === 'All') return CLASS_NAMES;
      return CLASS_NAMES.filter(cls => cls.includes(selectedMajor));
  }, [selectedMajor]);

  const waliKelasTeachers = useMemo(() => {
      return teachers.filter(t => t.additionalDuties.some(d => d.type === 'WaliKelas'));
  }, [teachers]);

  const sortedTeachers = useMemo(() => {
      return [...teachers].sort((a, b) => a.name.localeCompare(b.name));
  }, [teachers]);

  // --- Filtering Logic ---
  
  const filteredStudents = useMemo(() => {
      return students.filter(student => {
          const matchesSearch = 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            student.nis.includes(searchTerm);

          const matchesMajor = selectedMajor === 'All' || student.className.includes(selectedMajor);
          const matchesClass = selectedClass === 'All' || student.className === selectedClass;
          const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;

          let matchesWali = true;
          if (selectedWali !== 'All') {
              const teacher = teachers.find(t => t.id === selectedWali);
              const duty = teacher?.additionalDuties.find(d => d.type === 'WaliKelas');
              if (duty) {
                  matchesWali = student.className === duty.description;
              } else {
                  matchesWali = false;
              }
          }

          let matchesMentor = true;
          if (selectedMentor !== 'All') {
              matchesMentor = student.mentorId === selectedMentor;
          }

          return matchesSearch && matchesMajor && matchesClass && matchesWali && matchesMentor && matchesStatus;
      });
  }, [students, teachers, searchTerm, selectedMajor, selectedClass, selectedWali, selectedMentor, selectedStatus]);

  // Statistics
  const maleCount = filteredStudents.filter(s => s.gender === 'L').length;
  const femaleCount = filteredStudents.filter(s => s.gender === 'P').length;

  // Selection Handlers
  const handleSelectAll = () => {
      if (selectedStudentIds.size === filteredStudents.length) {
          setSelectedStudentIds(new Set());
      } else {
          const allIds = new Set(filteredStudents.map(s => s.id));
          setSelectedStudentIds(allIds);
      }
  };

  const handleSelectOne = (id: string) => {
      const newSet = new Set(selectedStudentIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedStudentIds(newSet);
  };

  const handleBulkSave = () => {
      if (!onBulkUpdate || !bulkMentorId) return;
      
      const studentsToUpdate = students
          .filter(s => selectedStudentIds.has(s.id))
          .map(s => ({ ...s, mentorId: bulkMentorId }));
      
      onBulkUpdate(studentsToUpdate);
      setSelectedStudentIds(new Set());
      setBulkMentorId('');
      alert(`${studentsToUpdate.length} siswa berhasil di-update mentornya.`);
  };

  // Helper functions
  const getWaliKelasName = (className: string) => {
    const teacher = teachers.find(t => 
        t.additionalDuties.some(duty => 
            duty.type === 'WaliKelas' && 
            duty.description.trim().toLowerCase() === className.trim().toLowerCase()
        )
    );
    return teacher ? teacher.name : null;
  };

  const getMentorName = (student: Student) => {
      if (student.mentorId) {
          const teacher = teachers.find(t => t.id === student.mentorId);
          return teacher ? teacher.name : 'Unknown ID';
      }
      return null;
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'Aktif': return 'bg-green-100 text-green-700 border-green-200';
          case 'Lulus': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'Mutasi': return 'bg-orange-100 text-orange-700 border-orange-200';
          case 'Keluar': return 'bg-red-100 text-red-700 border-red-200';
          default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
  };

  const handleResetFilters = () => {
      setSearchTerm('');
      setSelectedMajor('All');
      setSelectedClass('All');
      setSelectedWali('All');
      setSelectedMentor('All');
      setSelectedStatus('Aktif');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-blue-600" /> Data Siswa Terpadu
            </h2>
            <p className="text-sm text-gray-500">Kelola data murid, filter, dan atur Guru Wali (Mentor) secara massal.</p>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={onImport}
                className="flex items-center gap-2 bg-white text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors shadow-sm"
                title="Import dari Excel/CSV"
             >
                <FileSpreadsheet size={16} /> Import
            </button>
            <button 
                onClick={onAddStudent}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
                <Plus size={16} /> Tambah Siswa
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-4">
            {/* Row 1: Search & Major */}
            <div className="flex flex-col md:flex-row gap-4">
                 <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari nama atau NIS siswa..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="w-full md:w-48">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <select 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="Aktif">Siswa Aktif</option>
                            <option value="All">Semua Status</option>
                            <option value="Mutasi">Mutasi</option>
                            <option value="Keluar">Keluar</option>
                            <option value="Lulus">Lulus</option>
                        </select>
                    </div>
                </div>

                <div className="w-full md:w-64">
                    <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <select 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer"
                            value={selectedMajor}
                            onChange={(e) => {
                                setSelectedMajor(e.target.value);
                                setSelectedClass('All');
                            }}
                        >
                            <option value="All">Semua Konsentrasi</option>
                            {MAJORS_LIST.map(major => (
                                <option key={major.code} value={major.code}>{major.code} - {major.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Row 2: Class, Wali, Mentor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="All">Semua Rombel / Kelas</option>
                        {availableClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                        ))}
                    </select>
                </div>

                <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer"
                        value={selectedWali}
                        onChange={(e) => {
                            setSelectedWali(e.target.value);
                            setSelectedMentor('All'); 
                        }}
                    >
                        <option value="All">Filter: Wali Kelas</option>
                        {waliKelasTeachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.additionalDuties.find(d => d.type === 'WaliKelas')?.description})</option>
                        ))}
                    </select>
                </div>

                <div className="relative">
                    <HeartHandshake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer"
                        value={selectedMentor}
                        onChange={(e) => {
                            setSelectedMentor(e.target.value);
                            setSelectedWali('All'); 
                        }}
                    >
                        <option value="All">Filter: Guru Mentor</option>
                        {/* List teachers who are actually assigned as mentors */}
                        {teachers.filter(t => students.some(s => s.mentorId === t.id)).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            {(selectedMajor !== 'All' || selectedClass !== 'All' || selectedWali !== 'All' || selectedMentor !== 'All' || selectedStatus !== 'Aktif' || searchTerm) && (
                <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-gray-500">
                        Menampilkan: <span className="font-bold text-gray-700">{selectedStatus}</span>
                        {selectedClass !== 'All' && `, Kelas ${selectedClass}`}
                    </span>
                    <button onClick={handleResetFilters} className="text-red-600 hover:text-red-800 font-medium hover:underline">
                        Reset Semua Filter
                    </button>
                </div>
            )}
        </div>

        {/* Stats Bar */}
        <div className="p-4 bg-blue-50/50 border-b border-blue-100 flex flex-col md:flex-row gap-4 justify-between items-center text-sm">
             <div className="flex gap-4 md:gap-6 flex-wrap items-center">
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={filteredStudents.length > 0 && selectedStudentIds.size === filteredStudents.length}
                        onChange={handleSelectAll}
                    />
                    <span className="font-medium text-gray-700 select-none">Pilih Semua ({filteredStudents.length})</span>
                </div>
                <div className="h-4 w-px bg-blue-200 mx-2 hidden md:block"></div>
                <div className="font-medium text-gray-600">Laki-laki: <span className="font-bold text-blue-700">{maleCount}</span></div>
                <div className="font-medium text-gray-600">Perempuan: <span className="font-bold text-pink-700">{femaleCount}</span></div>
             </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4 w-10 text-center">
                    <CheckSquare size={16} className="mx-auto text-gray-400"/>
                </th>
                <th className="px-6 py-4">NIS & Nama</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Guru Mentor (Wali)</th>
                <th className="px-6 py-4">Wali Kelas</th>
                <th className="px-6 py-4 text-center">L/P</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const waliName = getWaliKelasName(student.className);
                    const mentorName = getMentorName(student);
                    const statusBadge = getStatusBadge(student.status);
                    const isSelected = selectedStudentIds.has(student.id);
                    
                    return (
                        <tr key={student.id} className={`transition-colors group ${isSelected ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4 text-center">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={isSelected}
                                onChange={() => handleSelectOne(student.id)}
                            />
                        </td>
                        <td className="px-6 py-4">
                            <div className="font-mono text-gray-500 text-xs">{student.nis}</div>
                            <div className="font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border border-gray-200">
                                {student.className}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                             <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}>
                                 {student.status}
                             </span>
                        </td>
                        <td className="px-6 py-4">
                             {mentorName ? (
                                <span className="text-indigo-700 text-xs font-medium bg-indigo-50 px-2 py-1 rounded border border-indigo-100 flex items-center gap-1 w-fit">
                                    <HeartHandshake size={10} /> {mentorName}
                                </span>
                            ) : (
                                <span className="text-gray-400 text-xs italic border border-dashed border-gray-300 px-2 py-0.5 rounded">Belum ada</span>
                            )}
                        </td>
                        <td className="px-6 py-4">
                            {waliName ? (
                                <span className="text-blue-700 text-xs font-medium">{waliName}</span>
                            ) : (
                                <span className="text-gray-300 text-xs italic">-</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className={`font-bold ${student.gender === 'L' ? 'text-blue-600' : 'text-pink-600'}`}>
                                {student.gender}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-1">
                                {onEditStudent && (
                                    <button 
                                        onClick={() => onEditStudent(student)}
                                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                        title="Edit Data / Ubah Status"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                )}
                                {onDeleteStudent && (
                                    <button 
                                        onClick={() => onDeleteStudent(student.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                        title="Hapus Siswa"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                             </div>
                        </td>
                        </tr>
                    );
                  })
              ) : (
                  <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-400 italic">
                          Tidak ada data siswa yang ditemukan.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Bar for Bulk Assignment */}
      {selectedStudentIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white/90 backdrop-blur-md border border-indigo-200 shadow-2xl rounded-2xl p-2 pl-6 flex items-center gap-4 ring-4 ring-indigo-500/10">
                  <div className="flex flex-col">
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{selectedStudentIds.size} Siswa Dipilih</span>
                      <span className="text-[10px] text-gray-500">Siap untuk plotting mentor</span>
                  </div>
                  
                  <div className="h-8 w-px bg-gray-200"></div>

                  <div className="flex items-center gap-2">
                      <select 
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-64 p-2.5"
                        value={bulkMentorId}
                        onChange={(e) => setBulkMentorId(e.target.value)}
                      >
                          <option value="">-- Pilih Guru Mentor --</option>
                          {sortedTeachers.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                      </select>
                      <button 
                        onClick={handleBulkSave}
                        disabled={!bulkMentorId}
                        className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 flex items-center gap-2 transition-all ${bulkMentorId ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30' : 'bg-gray-300 cursor-not-allowed'}`}
                      >
                          <Save size={16} /> Atur Mentor
                      </button>
                      <button 
                        onClick={() => setSelectedStudentIds(new Set())}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Batal Pilih"
                      >
                          <X size={20} />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};