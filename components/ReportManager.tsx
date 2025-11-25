
import React, { useState } from 'react';
import { Report, Teacher, ReportStatus, ReportCategory } from '../types';
import { updateReportInDB } from '../services/database';
import { SCHOOL_LOGO } from '../constants';
import { FileCheck, Clock, AlertCircle, CheckCircle, ExternalLink, Search, ListFilter, User, X, Calendar, FileText, Link, ShieldCheck, PenTool, ClipboardCheck, Award, Info, Save, Printer } from 'lucide-react';

interface ReportManagerProps {
  reports: Report[];
  teachers: Teacher[];
}

export const ReportManager: React.FC<ReportManagerProps> = ({ reports, teachers }) => {
  // Local state untuk optimis UI, tapi data utama dari App.tsx props
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'All'>('All');
  const [filterTeacherId, setFilterTeacherId] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [supervisionNotes, setSupervisionNotes] = useState('');
  const [supervisionScore, setSupervisionScore] = useState<number | ''>('');
  
  // Tab di dalam Modal (Guru vs Supervisor vs Print)
  const [modalTab, setModalTab] = useState<'upload' | 'supervision' | 'print'>('upload');

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.VERIFIED: return 'bg-green-100 text-green-800 border-green-200';
      case ReportStatus.SUBMITTED: return 'bg-blue-100 text-blue-800 border-blue-200';
      case ReportStatus.REJECTED: return 'bg-red-100 text-red-800 border-red-200';
      case ReportStatus.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.VERIFIED: return <CheckCircle size={14} className="animate-bounce" />;
      case ReportStatus.SUBMITTED: return <Clock size={14} />;
      case ReportStatus.REJECTED: return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getCategoryBadge = (category: ReportCategory) => {
      switch(category) {
          case 'Administrasi': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'Kinerja': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
          case 'Supervisi': return 'bg-orange-100 text-orange-700 border-orange-200';
          default: return 'bg-gray-100 text-gray-600';
      }
  };

  const filteredReports = reports.filter(report => {
      const matchesStatus = filterStatus === 'All' || report.status === filterStatus;
      const matchesTeacher = filterTeacherId === 'All' || report.teacherId === filterTeacherId;
      
      const teacher = teachers.find(t => t.id === report.teacherId);
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (teacher && teacher.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesTeacher && matchesSearch;
  });

  const getCountByStatus = (status: ReportStatus) => reports.filter(r => r.status === status).length;

  const handleOpenReport = (report: Report) => {
      setSelectedReport(report);
      setEvidenceUrl(report.evidenceUrl || '');
      setSupervisionNotes(report.supervisionNotes || '');
      setSupervisionScore(report.supervisionScore || '');
      
      // Default tab based on status
      if (report.status === ReportStatus.VERIFIED) {
          setModalTab('print');
      } else {
          setModalTab('upload');
      }
  };

  const handleSaveEvidence = async () => {
      if (!selectedReport) return;
      
      const updatedReport = {
          ...selectedReport,
          evidenceUrl: evidenceUrl,
          status: ReportStatus.SUBMITTED
      };

      // Update Local (Optimistic) - App.tsx will refresh eventually
      Object.assign(selectedReport, updatedReport);
      
      // Update DB
      await updateReportInDB(updatedReport);
      
      alert(`Berhasil menyimpan link bukti fisik.`);
      setSelectedReport(null);
  };

  const handleSaveSupervision = async () => {
      if (!selectedReport) return;
      
      const updatedReport = {
          ...selectedReport,
          supervisionNotes: supervisionNotes,
          supervisionScore: Number(supervisionScore),
          status: ReportStatus.VERIFIED
      };

      // Update Local (Optimistic)
      Object.assign(selectedReport, updatedReport);

      // Update DB
      await updateReportInDB(updatedReport);

      alert(`Berhasil menyimpan validasi supervisi.`);
      setModalTab('print'); // Langsung pindah ke tab print setelah verifikasi
  };

  const handlePrintCertificate = () => {
      window.print();
  };

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                    <div className="text-gray-500 text-xs font-medium uppercase">Belum Dikumpulkan</div>
                    <div className="text-2xl font-bold text-yellow-600 mt-1">
                        {reports.filter(r => r.status === ReportStatus.PENDING).length}
                    </div>
                </div>
                <div className="bg-yellow-50 p-2 rounded-full text-yellow-600"><Clock size={20} /></div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                    <div className="text-gray-500 text-xs font-medium uppercase">Sudah Dikumpulkan</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                        {reports.filter(r => r.status === ReportStatus.SUBMITTED).length}
                    </div>
                </div>
                <div className="bg-blue-50 p-2 rounded-full text-blue-600"><FileCheck size={20} /></div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                    <div className="text-gray-500 text-xs font-medium uppercase">Terverifikasi (Valid)</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                        {reports.filter(r => r.status === ReportStatus.VERIFIED).length}
                    </div>
                </div>
                <div className="bg-green-50 p-2 rounded-full text-green-600"><CheckCircle size={20} /></div>
            </div>
             <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                    <div className="text-gray-500 text-xs font-medium uppercase">Perlu Perbaikan</div>
                    <div className="text-2xl font-bold text-red-600 mt-1">
                        {reports.filter(r => r.status === ReportStatus.REJECTED).length}
                    </div>
                </div>
                <div className="bg-red-50 p-2 rounded-full text-red-600"><AlertCircle size={20} /></div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden no-print">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FileCheck className="text-purple-600" /> Laporan & Supervisi Guru
                </h2>
                <p className="text-sm text-gray-500 mt-1">Kelengkapan administrasi, laporan kinerja, dan integritas data supervisi.</p>
            </div>
            
            {/* Filter Bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row gap-4">
                 <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Cari judul laporan atau nama guru..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                     {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <ListFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <select 
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none appearance-none bg-white cursor-pointer min-w-[160px]"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as ReportStatus | 'All')}
                        >
                            <option value="All">Semua Status</option>
                            <option value={ReportStatus.PENDING}>Belum ({getCountByStatus(ReportStatus.PENDING)})</option>
                            <option value={ReportStatus.SUBMITTED}>Sudah ({getCountByStatus(ReportStatus.SUBMITTED)})</option>
                            <option value={ReportStatus.VERIFIED}>Verified ({getCountByStatus(ReportStatus.VERIFIED)})</option>
                            <option value={ReportStatus.REJECTED}>Ditolak ({getCountByStatus(ReportStatus.REJECTED)})</option>
                        </select>
                    </div>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <select 
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none appearance-none bg-white cursor-pointer min-w-[160px] max-w-[200px]"
                            value={filterTeacherId}
                            onChange={(e) => setFilterTeacherId(e.target.value)}
                        >
                            <option value="All">Semua Guru</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                    <tr>
                        <th className="px-6 py-4">Guru / NIP</th>
                        <th className="px-6 py-4">Judul & Kategori</th>
                        <th className="px-6 py-4">Bukti Fisik</th>
                        <th className="px-6 py-4">Status & Nilai</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredReports.length > 0 ? (
                        filteredReports.map(report => {
                            const teacher = teachers.find(t => t.id === report.teacherId);
                            return (
                                <tr key={report.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 align-top">
                                        <div className="font-bold">{teacher?.name || 'Unknown'}</div>
                                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{teacher?.nip}</div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="font-medium text-gray-800 mb-1">{report.title}</div>
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadge(report.category || 'Lainnya')}`}>
                                                {report.category || 'Umum'}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                <Calendar size={10} /> {report.dueDate}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        {report.evidenceUrl ? (
                                            <a href={report.evidenceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 w-fit px-2 py-1 rounded text-xs font-medium border border-blue-100">
                                                <Link size={12} /> Buka Link
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic flex items-center gap-1">
                                                <AlertCircle size={12} /> Belum ada
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border w-fit ${getStatusColor(report.status)}`}>
                                                {getStatusIcon(report.status)}
                                                {report.status}
                                            </span>
                                            {report.supervisionScore !== undefined && report.supervisionScore !== null && (
                                                <div className="flex items-center gap-1 text-xs text-gray-600 font-medium ml-1">
                                                    <Award size={12} className="text-orange-500" />
                                                    Nilai: {report.supervisionScore}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right align-top">
                                        <button 
                                            onClick={() => handleOpenReport(report)}
                                            className="bg-white border border-gray-200 hover:bg-purple-50 hover:border-purple-200 text-gray-600 hover:text-purple-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm"
                                        >
                                            Detail & Supervisi
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                                Tidak ada laporan yang ditemukan sesuai filter.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
        </div>

        {/* Modal Detail / Supervisi */}
        {selectedReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 print:p-0 print:static print:bg-white print:block">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 print:shadow-none print:w-full print:max-w-none print:rounded-none">
                    
                    {/* Header Modal - Hidden when printing */}
                    <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 print:hidden">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={18} className="text-purple-600" /> 
                            {selectedReport.title}
                        </h3>
                        <div className="flex gap-2">
                             {selectedReport.status === ReportStatus.VERIFIED && (
                                <button 
                                    onClick={handlePrintCertificate}
                                    className="bg-gray-800 text-white px-3 py-1 rounded text-xs font-bold hover:bg-gray-700 flex items-center gap-1"
                                >
                                    <Printer size={12}/> Cetak Bukti
                                </button>
                            )}
                            <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Tabs - Hidden when printing */}
                    <div className="flex border-b border-gray-200 print:hidden">
                        <button 
                            onClick={() => setModalTab('upload')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${modalTab === 'upload' ? 'border-purple-600 text-purple-700 bg-purple-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                        >
                           <Link size={16} /> Guru: Upload Bukti
                        </button>
                        <button 
                            onClick={() => setModalTab('supervision')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${modalTab === 'supervision' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                        >
                           <ShieldCheck size={16} /> Supervisor: Validasi
                        </button>
                         {selectedReport.status === ReportStatus.VERIFIED && (
                            <button 
                                onClick={() => setModalTab('print')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${modalTab === 'print' ? 'border-gray-800 text-gray-900 bg-gray-100' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                            >
                            <FileCheck size={16} /> Bukti Final
                            </button>
                         )}
                    </div>

                    <div className="p-6 print:p-0">
                        {modalTab === 'print' ? (
                            // TAMPILAN CETAK (BERITA ACARA)
                            <div className="font-serif text-black p-4">
                                {/* KOP SURAT */}
                                <div className="flex items-center gap-4 border-b-4 border-double border-black pb-4 mb-6">
                                    <img src={SCHOOL_LOGO} alt="Logo" className="w-20 h-20 object-contain grayscale contrast-150" />
                                    <div className="text-center flex-1">
                                        <h4 className="text-sm font-bold uppercase tracking-wide">Pemerintah Provinsi Jawa Tengah</h4>
                                        <h4 className="text-sm font-bold uppercase tracking-wide">Dinas Pendidikan dan Kebudayaan</h4>
                                        <h2 className="text-2xl font-bold uppercase tracking-widest mt-1">SMK Negeri 1 Purbalingga</h2>
                                        <p className="text-xs mt-1">Jl. Mayjen Sungkono, Selabaya, Kec. Kalimanah, Kabupaten Purbalingga, Jawa Tengah 53371</p>
                                    </div>
                                </div>

                                <div className="text-center mb-8">
                                    <h3 className="text-lg font-bold uppercase underline underline-offset-4">TANDA TERIMA LAPORAN & HASIL SUPERVISI</h3>
                                    <p className="text-sm font-bold mt-1">Nomor: 800 / {selectedReport.id.substring(0, 4)} / 2025</p>
                                </div>

                                <p className="mb-4 text-justify leading-relaxed">
                                    Berdasarkan hasil pemeriksaan kelengkapan administrasi dan supervisi kinerja guru, Kepala SMK Negeri 1 Purbalingga menerangkan bahwa:
                                </p>

                                <table className="w-full mb-6 text-sm">
                                    <tbody>
                                        <tr>
                                            <td className="w-40 py-2 font-bold">Nama Guru</td>
                                            <td className="w-4">:</td>
                                            <td className="font-bold">{teachers.find(t => t.id === selectedReport.teacherId)?.name}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2">NIP</td>
                                            <td>:</td>
                                            <td>{teachers.find(t => t.id === selectedReport.teacherId)?.nip}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2">Judul Laporan</td>
                                            <td>:</td>
                                            <td>{selectedReport.title}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2">Kategori</td>
                                            <td>:</td>
                                            <td>{selectedReport.category}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="border border-black p-4 mb-6 bg-gray-50 print:bg-white">
                                    <h4 className="font-bold text-center border-b border-black pb-2 mb-2">HASIL VERIFIKASI & SUPERVISI</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-xs uppercase">Nilai Kinerja</div>
                                            <div className="text-3xl font-bold">{selectedReport.supervisionScore || '-'}</div>
                                            <div className="text-xs">Skala 0-100</div>
                                        </div>
                                        <div className="text-center border-l border-black pl-4">
                                            <div className="text-xs uppercase">Status</div>
                                            <div className="text-xl font-bold mt-1 uppercase">TERVERIFIKASI</div>
                                            <div className="text-xs mt-1">Tgl: {new Date(selectedReport.lastUpdated || '').toLocaleDateString('id-ID')}</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-2 border-t border-black border-dashed">
                                        <p className="text-xs font-bold">Catatan Supervisi:</p>
                                        <p className="text-sm italic">"{selectedReport.supervisionNotes || 'Tidak ada catatan khusus.'}"</p>
                                    </div>
                                </div>

                                <p className="mb-4 text-justify text-sm">
                                    Dokumen ini merupakan bukti sah bahwa guru yang bersangkutan telah memenuhi kewajiban pelaporan administrasi/kinerja sesuai dengan standar yang ditetapkan.
                                </p>

                                <div className="flex justify-between mt-12 px-8">
                                    <div className="text-center">
                                        <p>Purbalingga, {new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
                                        <p className="mb-20">Guru Yang Bersangkutan</p>
                                        <p className="font-bold underline">{teachers.find(t => t.id === selectedReport.teacherId)?.name}</p>
                                        <p className="text-xs">NIP. {teachers.find(t => t.id === selectedReport.teacherId)?.nip}</p>
                                    </div>
                                    <div className="text-center">
                                        <p>&nbsp;</p>
                                        <p className="mb-20">Kepala Sekolah / Supervisor</p>
                                        <p className="font-bold underline">Maryono, S.Pd., M.Si.</p>
                                        <p className="text-xs">NIP. 19660701 200012 1 002</p>
                                    </div>
                                </div>

                                <div className="mt-8 text-[10px] text-gray-500 text-center border-t pt-2">
                                    Dokumen ini dicetak secara otomatis melalui Sistem Informasi Manajemen Kurikulum Pintar AI.
                                    <br/>ID Laporan: {selectedReport.id}
                                </div>
                            </div>
                        ) : modalTab === 'upload' ? (
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 flex gap-2">
                                    <Info className="flex-shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <strong>Instruksi Guru:</strong>
                                        <p className="mt-1">Lampirkan link dokumen (Google Drive, PDF Online, atau Folder Share) sebagai bukti fisik laporan kinerja/administrasi.</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Bukti Fisik (URL)</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                            <input 
                                                type="url" 
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                                placeholder="https://drive.google.com/..."
                                                value={evidenceUrl}
                                                onChange={(e) => setEvidenceUrl(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button 
                                        onClick={handleSaveEvidence}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 shadow-sm flex items-center gap-2"
                                    >
                                        <Save size={16} /> Simpan & Ajukan
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-orange-50 p-3 rounded-lg text-xs text-orange-800 flex gap-2">
                                    <ShieldCheck className="flex-shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <strong>Instruksi Supervisor (Kepala Sekolah/Waka):</strong>
                                        <p className="mt-1">Periksa link bukti fisik yang diajukan guru. Berikan catatan perbaikan jika perlu, atau berikan nilai dan validasi jika sudah sesuai.</p>
                                    </div>
                                </div>

                                {evidenceUrl ? (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200">
                                        <FileText size={16} className="text-gray-500"/>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-xs text-gray-500">Link Bukti Fisik:</div>
                                            <a href={evidenceUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 truncate hover:underline block">
                                                {evidenceUrl}
                                            </a>
                                        </div>
                                        <a href={evidenceUrl} target="_blank" rel="noreferrer" className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-100">
                                            Buka
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-center p-4 bg-gray-100 rounded text-gray-500 text-sm italic">
                                        Guru belum melampirkan bukti fisik.
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Supervisi</label>
                                    <textarea 
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                                        placeholder="Catatan perbaikan atau apresiasi..."
                                        value={supervisionNotes}
                                        onChange={(e) => setSupervisionNotes(e.target.value)}
                                    />
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="w-32">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nilai (0-100)</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            max="100"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                            value={supervisionScore}
                                            onChange={(e) => setSupervisionScore(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="flex-1 pt-6">
                                         <button 
                                            onClick={handleSaveSupervision}
                                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <ClipboardCheck size={16} /> Verifikasi & Nilai
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
