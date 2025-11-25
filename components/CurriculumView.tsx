import React, { useState } from 'react';
import { CURRICULUM_DATA_X, CURRICULUM_DATA_XI, CURRICULUM_DATA_XII } from '../constants';
import { BookOpen, Info } from 'lucide-react';

export const CurriculumView: React.FC = () => {
  // State untuk menyimpan tab mana yang aktif (X, XI, atau XII)
  const [activeGrade, setActiveGrade] = useState<'X' | 'XI' | 'XII'>('X');

  // Helper untuk mengambil data berdasarkan tab aktif
  const getData = () => {
    switch (activeGrade) {
        case 'X': return CURRICULUM_DATA_X;
        case 'XI': return CURRICULUM_DATA_XI;
        case 'XII': return CURRICULUM_DATA_XII;
        default: return CURRICULUM_DATA_X;
    }
  };

  const currentData = getData();

  // Helper untuk Judul Halaman
  const getGradeTitle = () => {
      switch(activeGrade) {
          case 'X': return 'Kelas X (Fase E)';
          case 'XI': return 'Kelas XI (Fase F)';
          case 'XII': return 'Kelas XII (Fase F) - Program 3 Tahun';
      }
  };

  // Helper untuk Judul Tabel
  const getTableTitle = () => {
      switch(activeGrade) {
          case 'X': return 'Tabel 1. Struktur Kurikulum Kelas X SMK/MAK';
          case 'XI': return 'Tabel 2. Struktur Kurikulum Kelas XI SMK/MAK';
          case 'XII': return 'Tabel 3. Struktur Kurikulum Kelas XII SMK/MAK';
      }
  };

  // Helper untuk Teks Asumsi Minggu Efektif
  const assumptionText = activeGrade === 'XII' 
    ? 'Asumsi 1 tahun = 32 minggu dan 1 JP = 45 menit' 
    : 'Asumsi 1 tahun = 36 minggu dan 1 JP = 45 menit';

  return (
    <div className="space-y-6">
      {/* Header Section dengan Tombol Navigasi */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> Struktur Kurikulum
            </h2>
            <p className="text-teal-100 text-sm mt-1">SMK Negeri 1 Purbalingga - {getGradeTitle()}</p>
        </div>
        
        {/* Tombol Tab Navigasi */}
        <div className="flex bg-teal-800/30 p-1 rounded-lg overflow-hidden">
             <button 
                onClick={() => setActiveGrade('X')}
                className={`px-6 py-2 text-sm font-semibold transition-all rounded-md ${
                    activeGrade === 'X' ? 'bg-white text-teal-700 shadow-md' : 'text-teal-100 hover:bg-white/10 hover:text-white'
                }`}
            >
                Kelas X
            </button>
            <button 
                onClick={() => setActiveGrade('XI')}
                className={`px-6 py-2 text-sm font-semibold transition-all rounded-md ${
                    activeGrade === 'XI' ? 'bg-white text-teal-700 shadow-md' : 'text-teal-100 hover:bg-white/10 hover:text-white'
                }`}
            >
                Kelas XI
            </button>
            <button 
                onClick={() => setActiveGrade('XII')}
                className={`px-6 py-2 text-sm font-semibold transition-all rounded-md ${
                    activeGrade === 'XII' ? 'bg-white text-teal-700 shadow-md' : 'text-teal-100 hover:bg-white/10 hover:text-white'
                }`}
            >
                Kelas XII
            </button>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h3 className="font-bold text-gray-800 text-lg">{getTableTitle()}</h3>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <Info size={14} /> {assumptionText}
                </p>
            </div>
            <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold uppercase border border-teal-200">
                Tahun Ajaran 2025/2026
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-1/2">Mata Pelajaran</th>
                <th className="px-6 py-4 text-center w-1/6">Alokasi Intrakurikuler <br/><span className="text-[10px] font-normal text-gray-500">Per Tahun (JP)</span></th>
                <th className="px-6 py-4 text-center w-1/6">Alokasi Kokurikuler (P5) <br/><span className="text-[10px] font-normal text-gray-500">Per Tahun (JP)</span></th>
                <th className="px-6 py-4 text-center w-1/6 bg-gray-200/50">Total JP <br/><span className="text-[10px] font-normal text-gray-500">Per Tahun</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.map((section, idx) => (
                <React.Fragment key={idx}>
                  {/* Section Header (e.g., MATA PELAJARAN UMUM) */}
                  <tr className="bg-gray-50/80">
                    <td colSpan={4} className="px-6 py-2 font-bold text-teal-700 text-xs uppercase tracking-wider border-y border-gray-200">
                      {section.title}
                    </td>
                  </tr>
                  
                  {/* Rows Item */}
                  {section.items.map((item, itemIdx) => (
                    <tr 
                        key={itemIdx} 
                        className={`hover:bg-gray-50 transition-colors ${item.isTotal ? 'bg-gray-50 font-bold border-t-2 border-gray-300' : ''} ${item.isHeader ? 'bg-blue-50 font-bold' : ''}`}
                    >
                      <td className={`px-6 py-3 ${item.isHeader || item.isTotal ? 'font-bold text-gray-800' : 'text-gray-700 pl-8'}`}>
                        {item.name}
                      </td>
                      <td className="px-6 py-3 text-center text-gray-600">{item.intra}</td>
                      <td className="px-6 py-3 text-center text-gray-600">{item.p5}</td>
                      <td className="px-6 py-3 text-center font-bold text-gray-900 bg-gray-50/50">{item.total}</td>
                    </tr>
                  ))}

                  {/* Subtotal Row */}
                  {section.subTotal && (
                    <tr className="bg-teal-50/50 font-bold border-t border-teal-100">
                      <td className="px-6 py-3 text-teal-900 pl-8">{section.subTotal.name}</td>
                      <td className="px-6 py-3 text-center text-teal-900">{section.subTotal.intra}</td>
                      <td className="px-6 py-3 text-center text-teal-900">{section.subTotal.p5}</td>
                      <td className="px-6 py-3 text-center text-teal-900 bg-teal-100/30">{section.subTotal.total}</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};