import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Calendar, Briefcase, FileText, Menu, X, BookOpenText, GraduationCap, Building2, Loader2, MapPin, Phone, ArrowRight, PlusCircle, CheckCircle2, Clock, AlertTriangle, ChevronRight, Sparkles, FileSpreadsheet, LogOut, ShieldCheck, ChevronDown, GraduationCap as GraduationIcon } from 'lucide-react';
import { TeacherList } from './components/TeacherList';
import { ScheduleManager } from './components/ScheduleManager';
import { PKLManager } from './components/PKLManager';
import { DUDIManager } from './components/DUDIManager';
import { ReportManager } from './components/ReportManager';
import { RoomManager } from './components/RoomManager';
import { TeacherFormModal } from './components/TeacherFormModal';
import { StudentFormModal } from './components/StudentFormModal';
import { StudentImportModal } from './components/StudentImportModal';
import { TeacherImportModal } from './components/TeacherImportModal';
import { DUDIImportModal } from './components/DUDIImportModal';
import { PKLImportModal } from './components/PKLImportModal';
import { GuardianImportModal } from './components/GuardianImportModal';
import { DutyImportModal } from './components/DutyImportModal';
import { PromotionModal } from './components/PromotionModal';
import { CurriculumView } from './components/CurriculumView';
import { StudentList } from './components/StudentList';
import { GuardianManager } from './components/GuardianManager';
import { LoginPage } from './components/LoginPage';
import { SCHOOL_LOGO, MOCK_ROOMS } from './constants';
import { ScheduleSlot, Teacher, Student, DUDI, PKLAssignment, Report, Room, ReportStatus, AdditionalDuty } from './types';
import { 
    fetchTeachers, fetchStudents, fetchDUDI, fetchPKLAssignments, fetchSchedule, fetchReports,
    addTeacherToDB, updateTeacherInDB, deleteTeacherFromDB, addStudentToDB, updateStudentInDB, addStudentsBulkToDB, deleteStudentFromDB,
    addDudiToDB, addPKLAssignmentToDB, saveScheduleToDB, addTeachersBulkToDB, addDudiBulkToDB, addPKLAssignmentsBulkToDB,
    updateStudentsBulkInDB, updateTeachersBulkInDB, deleteDudiFromDB, deletePKLAssignmentFromDB
} from './services/database';

enum Tab {
  DASHBOARD = 'Dashboard',
  CURRICULUM = 'Struktur Kurikulum',
  TEACHERS = 'Data Guru',
  STUDENTS = 'Data Siswa',
  GUARDIAN = 'Pusat Koordinasi',
  ROOMS = 'Data Ruangan',
  SCHEDULE = 'Jadwal',
  DUDI = 'Mitra Industri',
  PKL = 'PKL',
  REPORTS = 'Laporan'
}

const SECURE_TOKEN = "NTIwMnRhYmVodXJ1Zw==";

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [pklList, setPklList] = useState<PKLAssignment[]>([]);
  const [dudiList, setDudiList] = useState<DUDI[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [reports, setReports] = useState<Report[]>([]);

  // Modal States
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [showStudentImportModal, setShowStudentImportModal] = useState(false);
  const [showTeacherImportModal, setShowTeacherImportModal] = useState(false);
  const [showDUDIImportModal, setShowDUDIImportModal] = useState(false);
  const [showPKLImportModal, setShowPKLImportModal] = useState(false);
  const [showGuardianImportModal, setShowGuardianImportModal] = useState(false);
  const [showDutyImportModal, setShowDutyImportModal] = useState(false);
  
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  // Cek sesi login saat aplikasi dibuka
  useEffect(() => {
    const session = sessionStorage.getItem('kurikulum_auth');
    if (session === 'true') {
        setIsAuthenticated(true);
    }
  }, []);

  // Fetch Data only if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch all data in parallel
            const [tData, sData, dData, pData, schData, rData] = await Promise.all([
                fetchTeachers(),
                fetchStudents(),
                fetchDUDI(),
                fetchPKLAssignments(),
                fetchSchedule(),
                fetchReports()
            ]);
            
            setTeachers(tData);
            setStudents(sData);
            setDudiList(dData);
            setPklList(pData);
            setSchedule(schData);
            setReports(rData);
        } catch (error) {
            console.error("Failed to load data from Supabase/Local", error);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, [isAuthenticated]);

  const verifyPassword = (input: string) => {
    try {
        const reversed = input.split('').reverse().join('');
        const encoded = btoa(reversed);
        return encoded === SECURE_TOKEN;
    } catch (e) {
        console.error("Auth Error", e);
        return false;
    }
  };

  const handleLogin = async (password: string) => {
      const isValid = verifyPassword(password);
      if (isValid) {
          setIsAuthenticated(true);
          sessionStorage.setItem('kurikulum_auth', 'true');
          return true;
      }
      return false;
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      sessionStorage.removeItem('kurikulum_auth');
      setActiveTab(Tab.DASHBOARD); 
  };

  // Handlers (CRUD Logic)
  const handleAddTeacher = async (newTeacher: Teacher) => {
      const isEdit = teachers.some(t => t.id === newTeacher.id);
      if (isEdit) {
          setTeachers(prev => prev.map(t => t.id === newTeacher.id ? newTeacher : t));
          await updateTeacherInDB(newTeacher);
      } else {
          setTeachers(prev => [...prev, newTeacher]);
          await addTeacherToDB(newTeacher);
      }
      setShowTeacherModal(false);
      setEditingTeacher(null);
  };

  const handleEditTeacher = (teacher: Teacher) => {
      setEditingTeacher(teacher);
      setShowTeacherModal(true);
  };

  const handleDeleteTeacher = async (id: string) => {
      // eslint-disable-next-line no-restricted-globals
      if (confirm('Apakah Anda yakin ingin menghapus data guru ini? Data yang dihapus tidak dapat dikembalikan.')) {
          setTeachers(prev => prev.filter(t => t.id !== id));
          await deleteTeacherFromDB(id);
      }
  };

  const handleImportTeachers = async (newTeachers: Teacher[]) => {
    setTeachers(prev => [...prev, ...newTeachers]);
    await addTeachersBulkToDB(newTeachers);
    setShowTeacherImportModal(false);
  };

  const handleImportDuties = async (updates: { teacherId: string, duty: AdditionalDuty }[]) => {
      const updatedTeachers = [...teachers];
      const promises: Promise<boolean>[] = [];

      updates.forEach(({ teacherId, duty }) => {
          const teacherIndex = updatedTeachers.findIndex(t => t.id === teacherId);
          if (teacherIndex !== -1) {
              const teacher = updatedTeachers[teacherIndex];
              const newDuties = [...teacher.additionalDuties, duty];
              
              const updatedTeacher = { ...teacher, additionalDuties: newDuties };
              updatedTeachers[teacherIndex] = updatedTeacher;
              
              promises.push(updateTeacherInDB(updatedTeacher));
          }
      });

      setTeachers(updatedTeachers);
      await Promise.all(promises);
      setShowDutyImportModal(false);
  };

  const handleSaveStudent = async (student: Student) => {
      const isEdit = students.some(s => s.id === student.id);
      if (isEdit) {
          setStudents(prev => prev.map(s => s.id === student.id ? student : s));
          await updateStudentInDB(student);
      } else {
          setStudents(prev => [...prev, student]);
          await addStudentToDB(student);
      }
      setShowStudentModal(false);
      setEditingStudent(null);
  };

  const handleEditStudent = (student: Student) => {
      setEditingStudent(student);
      setShowStudentModal(true);
  };

  const handleDeleteStudent = async (id: string) => {
      // eslint-disable-next-line no-restricted-globals
      if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
          setStudents(prev => prev.filter(s => s.id !== id));
          await deleteStudentFromDB(id);
      }
  };

  const handleImportStudents = async (newStudents: Student[]) => {
      setStudents(prev => [...prev, ...newStudents]);
      await addStudentsBulkToDB(newStudents);
      setShowStudentImportModal(false);
  };

  const handleImportGuardians = async (importedData: Student[]) => {
      const updatedStudents = [...students];
      const newStudentsToAdd: Student[] = [];

      importedData.forEach(imported => {
          const index = updatedStudents.findIndex(s => s.nis === imported.nis);
          if (index !== -1) {
              updatedStudents[index] = {
                  ...updatedStudents[index],
                  parentName: imported.parentName,
                  parentPhone: imported.parentPhone,
                  address: imported.address
              };
              updateStudentInDB(updatedStudents[index]); // Update single record DB
          } else {
              updatedStudents.push(imported);
              newStudentsToAdd.push(imported);
          }
      });

      setStudents(updatedStudents);
      if (newStudentsToAdd.length > 0) {
          await addStudentsBulkToDB(newStudentsToAdd);
      }
      setShowGuardianImportModal(false);
  };

  // Bulk update handler for things like Mass Mentor Assignment
  const handleBulkUpdateStudents = async (updatedStudents: Student[]) => {
      // 1. Update Local State
      const updatedMap = new Map(updatedStudents.map(s => [s.id, s]));
      const finalStudents = students.map(s => updatedMap.get(s.id) || s);
      setStudents(finalStudents);

      // 2. Update DB
      await updateStudentsBulkInDB(updatedStudents);
  };

  const handleUpdateSchedule = async (newSchedule: ScheduleSlot[]) => {
      setSchedule(newSchedule);
      await saveScheduleToDB(newSchedule);
  };

  const handleAddPKL = async (assignment: PKLAssignment) => {
      setPklList(prev => [...prev, assignment]);
      await addPKLAssignmentToDB(assignment);
  };

  const handleDeletePKL = async (id: string) => {
      // eslint-disable-next-line no-restricted-globals
      if (confirm('Hapus data plotting PKL ini?')) {
          setPklList(prev => prev.filter(p => p.id !== id));
          await deletePKLAssignmentFromDB(id);
      }
  };

  const handleImportPKL = async (newAssignments: PKLAssignment[]) => {
      setPklList(prev => [...prev, ...newAssignments]);
      await addPKLAssignmentsBulkToDB(newAssignments);
      setShowPKLImportModal(false);
  };

  const handleAddDUDI = async (dudi: DUDI) => {
      setDudiList(prev => [...prev, dudi]);
      await addDudiToDB(dudi);
  };

  const handleDeleteDUDI = async (id: string) => {
      // eslint-disable-next-line no-restricted-globals
      if (confirm('Hapus data Mitra Industri ini?')) {
          setDudiList(prev => prev.filter(d => d.id !== id));
          await deleteDudiFromDB(id);
      }
  };

  const handleImportDUDI = async (newDudiList: DUDI[]) => {
      setDudiList(prev => [...prev, ...newDudiList]);
      await addDudiBulkToDB(newDudiList);
      setShowDUDIImportModal(false);
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
      setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
  };

  // Logic for Promotion
  const handleConfirmPromotion = async (updatedStudents: Student[], updatedTeachers: Teacher[]) => {
      // 1. Update Local State for Students
      const updatedStudentsMap = new Map(updatedStudents.map(s => [s.id, s]));
      const finalStudents = students.map(s => updatedStudentsMap.get(s.id) || s);
      setStudents(finalStudents);

      // 2. Update Local State for Teachers
      const updatedTeachersMap = new Map(updatedTeachers.map(t => [t.id, t]));
      const finalTeachers = teachers.map(t => updatedTeachersMap.get(t.id) || t);
      setTeachers(finalTeachers);

      // 3. Persist to DB
      await updateStudentsBulkInDB(updatedStudents);
      await updateTeachersBulkInDB(updatedTeachers);

      alert(`Sukses! Tahun ajaran telah ditutup. Siswa telah naik kelas dan tugas guru mentor telah diperbarui.`);
  };

  const renderContent = () => {
      if (isLoading) {
          return (
              <div className="flex flex-col items-center justify-center h-full min-h-[500px] animate-fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <img src={SCHOOL_LOGO} alt="Loading" className="w-20 h-20 relative z-10 animate-bounce" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mt-6">Memuat Data Sekolah...</h3>
                  <p className="text-gray-500 text-sm mt-1">Sinkronisasi dengan Database Kurikulum</p>
              </div>
          );
      }

      switch (activeTab) {
          case Tab.DASHBOARD:
              // ... (Dashboard content remains same, abbreviated for brevity)
              const pendingReports = reports.filter(r => r.status === ReportStatus.PENDING).length;
              const submittedReports = reports.filter(r => r.status === ReportStatus.SUBMITTED).length;
              const totalReports = reports.length || 1; 
              const reportProgress = Math.round(((submittedReports + reports.filter(r => r.status === ReportStatus.VERIFIED).length) / totalReports) * 100);
              const pklActive = pklList.filter(p => p.status === 'Active').length;
              const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

              return (
                  <div className="space-y-8 animate-fade-in pb-10">
                      {/* Hero Section */}
                      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                          {/* Decorative Background Elements */}
                          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-blue-200 text-xs font-medium mb-3">
                                    <Calendar size={12} /> {today}
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Kurikulum Smart Innovative</h1>
                                <p className="text-blue-200 max-w-xl text-sm md:text-base leading-relaxed">
                                  Sistem Informasi Manajemen Sekolah Terpadu. Pantau statistik, kelola jadwal, dan administrasi pembelajaran yang efisien dan transparan.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button onClick={() => setActiveTab(Tab.SCHEDULE)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-900/50 flex items-center gap-2">
                                        <Clock size={16} /> Jadwal Hari Ini
                                    </button>
                                    <button onClick={() => setActiveTab(Tab.REPORTS)} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 backdrop-blur-md">
                                        <FileText size={16} /> Cek Laporan
                                    </button>
                                </div>
                            </div>
                            
                            {/* Hero Stat & Action */}
                            <div className="hidden lg:flex flex-col gap-4 items-end">
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl w-64">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-blue-200 text-xs uppercase font-bold tracking-wider">Guru Active</span>
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-1">{teachers.length}</div>
                                    <div className="text-xs text-white/60">Total Staff Pengajar</div>
                                </div>
                                <button 
                                    onClick={() => setShowPromotionModal(true)}
                                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-900/50 flex items-center gap-2 w-fit animate-pulse"
                                >
                                    <AlertTriangle size={14} /> Manajemen Tahun Ajaran
                                </button>
                            </div>
                          </div>
                      </div>
                      
                      {/* Stats Grid - Modern Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {[
                              { label: 'Total Siswa', value: students.filter(s => s.status === 'Aktif').length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', tab: Tab.STUDENTS },
                              { label: 'Siswa PKL', value: pklActive, icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50', tab: Tab.PKL },
                              { label: 'Ruang Kelas', value: rooms.length, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50', tab: Tab.ROOMS }
                          ].map((stat, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => setActiveTab(stat.tab)}
                                className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer group"
                              >
                                  <div className="flex justify-between items-start mb-4">
                                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                          <stat.icon size={24} />
                                      </div>
                                      <div className={`text-xs font-bold px-2 py-1 rounded-md bg-slate-50 text-slate-500 group-hover:bg-slate-100 transition-colors`}>
                                          View
                                      </div>
                                  </div>
                                  <div className="text-3xl font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">{stat.value}</div>
                                  <div className="text-sm font-medium text-slate-400">{stat.label}</div>
                              </div>
                          ))}
                      </div>
                      
                      {/* Quick Actions & Status (Abbreviated) */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                                <Sparkles className="text-amber-500 fill-amber-500" size={20} /> Akses Cepat
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button onClick={() => { setEditingTeacher(null); setShowTeacherModal(true); }} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all group">
                                    <div className="bg-white p-3 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                        <PlusCircle size={24} className="text-blue-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-700">Tambah Guru</span>
                                </button>
                                <button onClick={() => { setEditingStudent(null); setShowStudentModal(true); }} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 transition-all group">
                                    <div className="bg-white p-3 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                        <GraduationCap size={24} className="text-purple-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600 group-hover:text-purple-700">Siswa Baru</span>
                                </button>
                                <button onClick={() => setActiveTab(Tab.SCHEDULE)} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-slate-50 hover:bg-orange-50 border border-slate-100 hover:border-orange-200 transition-all group">
                                    <div className="bg-white p-3 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                        <Calendar size={24} className="text-orange-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600 group-hover:text-orange-700">Edit Jadwal</span>
                                </button>
                                 <button onClick={() => setActiveTab(Tab.REPORTS)} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all group">
                                    <div className="bg-white p-3 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                        <ShieldCheck size={24} className="text-emerald-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600 group-hover:text-emerald-700">Validasi</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col">
                            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                                <FileText className="text-slate-400" size={20} /> Status Laporan
                            </h3>
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-3xl font-bold text-slate-800">{reportProgress}%</span>
                                    <span className="text-sm font-medium text-slate-400 mb-1">Target Tercapai</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${reportProgress}%` }}></div>
                                </div>
                                <div className="mt-6 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Menunggu</span>
                                        <span className="font-bold text-slate-700">{pendingReports}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Terkumpul</span>
                                        <span className="font-bold text-slate-700">{submittedReports}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                      </div>
                  </div>
              );
          case Tab.CURRICULUM:
              return <CurriculumView />;
          case Tab.TEACHERS:
              return (
                  <TeacherList 
                      teachers={teachers} 
                      onAddTeacher={() => { setEditingTeacher(null); setShowTeacherModal(true); }}
                      onEditTeacher={handleEditTeacher}
                      onDeleteTeacher={handleDeleteTeacher}
                      onImport={() => setShowTeacherImportModal(true)}
                  />
              );
          case Tab.STUDENTS:
              return (
                  <StudentList 
                      students={students}
                      teachers={teachers}
                      onAddStudent={() => { setEditingStudent(null); setShowStudentModal(true); }}
                      onImport={() => setShowStudentImportModal(true)}
                      onEditStudent={handleEditStudent}
                      onBulkUpdate={handleBulkUpdateStudents}
                      onDeleteStudent={handleDeleteStudent}
                  />
              );
          case Tab.GUARDIAN:
              return (
                <GuardianManager 
                    students={students} 
                    teachers={teachers} 
                    onEditStudent={handleEditStudent} 
                    onAddStudent={() => { setEditingStudent(null); setShowStudentModal(true); }} 
                    onImport={() => setShowGuardianImportModal(true)} 
                    onImportDuties={() => setShowDutyImportModal(true)}
                />
              );
          case Tab.ROOMS:
              return <RoomManager rooms={rooms} schedule={schedule} onUpdateRoom={handleUpdateRoom} />;
          case Tab.SCHEDULE:
              return <ScheduleManager teachers={teachers} currentSchedule={schedule} onUpdateSchedule={handleUpdateSchedule} />;
          case Tab.PKL:
              return <PKLManager 
                pklList={pklList} 
                teachers={teachers} 
                dudiList={dudiList} 
                schedule={schedule} 
                students={students} 
                onAddAssignment={handleAddPKL} 
                onImport={() => setShowPKLImportModal(true)}
                onDeletePKL={handleDeletePKL}
              />;
          case Tab.DUDI:
              return <DUDIManager 
                dudiList={dudiList} 
                pklList={pklList} 
                onAddDudi={handleAddDUDI} 
                onImport={() => setShowDUDIImportModal(true)} 
                onDeleteDUDI={handleDeleteDUDI}
              />;
          case Tab.REPORTS:
              return <ReportManager reports={reports} teachers={teachers} />;
          default:
              return null;
      }
  };

  // ... (Sidebar and Main Layout remain mostly same)
  const navItems = [
    { id: Tab.DASHBOARD, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: Tab.CURRICULUM, icon: <BookOpenText size={20} />, label: 'Struktur Kurikulum' },
    { id: Tab.TEACHERS, icon: <Users size={20} />, label: 'Data Guru' },
    { id: Tab.STUDENTS, icon: <GraduationCap size={20} />, label: 'Data Siswa' },
    { id: Tab.GUARDIAN, icon: <Phone size={20} />, label: 'Pusat Koordinasi' },
    { id: Tab.ROOMS, icon: <MapPin size={20} />, label: 'Data Ruangan' },
    { id: Tab.SCHEDULE, icon: <Calendar size={20} />, label: 'Jadwal Pelajaran' },
    { id: Tab.DUDI, icon: <Building2 size={20} />, label: 'Mitra Industri' },
    { id: Tab.PKL, icon: <Briefcase size={20} />, label: 'Manajemen PKL' },
    { id: Tab.REPORTS, icon: <FileText size={20} />, label: 'Laporan & Admin' },
  ];

  if (!isAuthenticated) {
      return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Modern Dark Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col shadow-xl`}>
        <div className="h-24 flex items-center px-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl shadow-lg shadow-blue-900/20">
                    <img src={SCHOOL_LOGO} alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <div>
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none">Smart Innovative</h1>
                    <span className="text-xs text-slate-400 font-medium">SMK N 1 Purbalingga</span>
                </div>
            </div>
            <button className="ml-auto lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-4 mt-2">Menu Utama</div>
            {navItems.slice(0, 2).map(item => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}`}>
                    <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.icon}</span>
                    {item.label}
                    {activeTab === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </button>
            ))}

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-4 mt-8">Data Master</div>
            {navItems.slice(2, 6).map(item => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}`}>
                    <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.icon}</span>
                    {item.label}
                    {activeTab === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </button>
            ))}

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-4 mt-8">Operasional</div>
            {navItems.slice(6).map(item => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}`}>
                    <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.icon}</span>
                    {item.label}
                    {activeTab === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                <LogOut size={20} /> Keluar Sistem
             </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        {/* Mobile Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 lg:hidden sticky top-0 z-30">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-500 hover:text-slate-700"><Menu size={24} /></button>
            <span className="ml-4 font-bold text-slate-800 truncate">{activeTab}</span>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
                {renderContent()}
            </div>
        </div>
      </main>
      
      {/* Modals */}
      <TeacherFormModal isOpen={showTeacherModal} onClose={() => setShowTeacherModal(false)} onSave={handleAddTeacher} initialData={editingTeacher} />
      <StudentFormModal isOpen={showStudentModal} onClose={() => {setShowStudentModal(false); setEditingStudent(null);}} onSave={handleSaveStudent} initialData={editingStudent} />
      <StudentImportModal isOpen={showStudentImportModal} onClose={() => setShowStudentImportModal(false)} onSave={handleImportStudents} />
      <TeacherImportModal isOpen={showTeacherImportModal} onClose={() => setShowTeacherImportModal(false)} onSave={handleImportTeachers} />
      <DUDIImportModal isOpen={showDUDIImportModal} onClose={() => setShowDUDIImportModal(false)} onSave={handleImportDUDI} />
      <PKLImportModal isOpen={showPKLImportModal} onClose={() => setShowPKLImportModal(false)} onSave={handleImportPKL} teachers={teachers} />
      <GuardianImportModal isOpen={showGuardianImportModal} onClose={() => setShowGuardianImportModal(false)} onSave={handleImportGuardians} existingStudents={students} />
      <DutyImportModal isOpen={showDutyImportModal} onClose={() => setShowDutyImportModal(false)} onSave={handleImportDuties} teachers={teachers} />
      
      <PromotionModal 
        isOpen={showPromotionModal} 
        onClose={() => setShowPromotionModal(false)} 
        students={students} 
        teachers={teachers} 
        onConfirm={handleConfirmPromotion}
      />
    </div>
  );
};

export default App;