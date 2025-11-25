
import React, { useState } from 'react';
import { BookCopy, Clock, Calculator, Info, LayoutList, BookOpen, Briefcase } from 'lucide-react';

interface SubjectData {
  name: string;
  jp: number;
  category: 'Umum' | 'Kejuruan' | 'Pilihan' | 'Mulok' | 'PKL';
}

// KELAS X: Format Lama (Total 50 JP)
const SUBJECTS_X: SubjectData[] = [
  { name: 'Pendidikan Agama Islam dan Budi Pekerti', jp: 3, category: 'Umum' },
  { name: 'Pendidikan Pancasila', jp: 2, category: 'Umum' },
  { name: 'Bahasa Indonesia', jp: 4, category: 'Umum' },
  { name: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', jp: 3, category: 'Umum' },
  { name: 'Sejarah', jp: 2, category: 'Umum' },
  { name: 'Seni dan Budaya', jp: 2, category: 'Umum' },
  { name: 'Matematika', jp: 4, category: 'Kejuruan' },
  { name: 'Bahasa Inggris', jp: 4, category: 'Kejuruan' },
  { name: 'Informatika', jp: 4, category: 'Kejuruan' },
  { name: 'Projek Ilmu Pengetahuan Alam dan Sosial', jp: 6, category: 'Kejuruan' },
  { name: 'Dasar-Dasar Program Keahlian', jp: 12, category: 'Kejuruan' },
  { name: 'Muatan Lokal', jp: 2, category: 'Mulok' },
  { name: 'Coding dan AI', jp: 2, category: 'Pilihan' },
];

// KELAS XI: Format Baru (Total 48 JP)
const SUBJECTS_XI: SubjectData[] = [
  { name: 'Pendidikan Agama dan Budi Pekerti', jp: 3, category: 'Umum' },
  { name: 'Pendidikan Pancasila', jp: 2, category: 'Umum' },
  { name: 'Bahasa Indonesia', jp: 3, category: 'Umum' },
  { name: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', jp: 2, category: 'Umum' },
  { name: 'Sejarah', jp: 2, category: 'Umum' },
  { name: 'Matematika', jp: 3, category: 'Kejuruan' },
  { name: 'Bahasa Inggris', jp: 4, category: 'Kejuruan' },
  { name: 'Konsentrasi Keahlian', jp: 18, category: 'Kejuruan' },
  { name: 'Kreativitas, Inovasi, dan Kewirausahaan', jp: 5, category: 'Kejuruan' },
  { name: 'Bahasa Jepang (Pilihan)', jp: 2, category: 'Pilihan' },
  { name: 'Seni (Pilihan)', jp: 2, category: 'Pilihan' },
  { name: 'Muatan Lokal', jp: 2, category: 'Mulok' },
];

const SUBJECTS_XII: SubjectData[] = [
  { name: 'Pendidikan Agama dan Budi Pekerti', jp: 3, category: 'Umum' },
  { name: 'Pendidikan Pancasila', jp: 2, category: 'Umum' },
  { name: 'Bahasa Indonesia', jp: 3, category: 'Umum' },
  { name: 'Matematika', jp: 3, category: 'Kejuruan' },
  { name: 'Bahasa Inggris', jp: 4, category: 'Kejuruan' },
  { name: 'Konsentrasi Keahlian', jp: 22, category: 'Kejuruan' },
  { name: 'Kreativitas, Inovasi, dan Kewirausahaan', jp: 5, category: 'Kejuruan' },
  { name: 'Mapel Pilihan', jp: 4, category: 'Pilihan' },
  { name: 'Muatan Lokal', jp: 2, category: 'Mulok' },
  { name: 'Mapel PKL', jp: 46, category: 'PKL' },
];

export const SubjectManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'X' | 'XI' | 'XII'>('X');

  let currentSubjects: SubjectData[] = SUBJECTS_X;
  if (activeTab === 'XI') currentSubjects = SUBJECTS_XI;
  if (activeTab === 'XII') currentSubjects = SUBJECTS_XII;
  
  // Hitung total JP (exclude PKL karena biasanya sistem blok)
  const totalJP = currentSubjects
    .filter(s => s.category !== 'PKL')
    .reduce((acc, curr) => acc + curr.jp, 0);

  const pklJP = currentSubjects.find(s => s.category === 'PKL')?.jp || 0;

  const getCategoryColor = (category: string) => {
      switch(category) {
          case 'Umum': return 'bg-blue-50 text-blue-700 border-blue-100';
          case 'Kejuruan': return 'bg-orange-50 text-orange-700 border-orange-100';
          case 'Pilihan': return 'bg-purple-50 text-purple-700 border-purple-100';
          case 'Mulok': return 'bg-teal-50 text-teal-700 border-teal-100';
          case 'PKL': return 'bg-green-50 text-green-700 border-green-100';
          default: return 'bg-gray-50 text-gray-700';
      }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-cyan-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BookCopy className="text-cyan-600" /> Daftar Mata Pelajaran & Jam
            </h2>
            <p className="text-sm text-gray-500">Alokasi waktu pembelajaran per minggu untuk manajemen jadwal kelas.</p>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg overflow-hidden">
             <button 
                onClick={() => setActiveTab('X')}
                className={`px-4 py-2 text-sm font-semibold transition-all rounded-md flex items-center gap-2 ${
                    activeTab === 'X' ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                Kelas X (50 JP)
            </button>
            <button 
                onClick={() => setActiveTab('XI')}
                className={`px-4 py-2 text-sm font-semibold transition-all rounded-md flex items-center gap-2 ${
                    activeTab === 'XI' ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                Kelas XI (48 JP)
            </button>
            <button 
                onClick={() => setActiveTab('XII')}
                className={`px-4 py-2 text-sm font-semibold transition-all rounded-md flex items-center gap-2 ${
                    activeTab === 'XII' ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                Kelas XII (48 JP)
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-cyan-50 border border-cyan-100 p-4 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-white rounded-full text-cyan-600 shadow-sm">
                    <BookOpen size={24} />
                </div>
                <div>
                    <div className="text-sm text-cyan-800 font-medium">Total Mata Pelajaran</div>
                    <div className="text-2xl font-bold text-cyan-900">{currentSubjects.length} Mapel</div>
                </div>
             </div>
             
             <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-white rounded-full text-indigo-600 shadow-sm">
                    <Clock size={24} />
                </div>
                <div>
                    <div className="text-sm text-indigo-800 font-medium">Beban Tatap Muka</div>
                    <div className="text-2xl font-bold text-indigo-900">{totalJP} JP <span className="text-xs font-normal text-indigo-600">/ Minggu</span></div>
                </div>
             </div>

             {pklJP > 0 ? (
                 <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-white rounded-full text-green-600 shadow-sm">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-green-800 font-medium">Alokasi PKL</div>
                        <div className="text-2xl font-bold text-green-900">{pklJP} JP <span className="text-xs font-normal text-green-600">(Sistem Blok)</span></div>
                    </div>
                 </div>
             ) : (
                 <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-white rounded-full text-orange-600 shadow-sm">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-orange-800 font-medium">Durasi Belajar</div>
                        <div className="text-2xl font-bold text-orange-900">{totalJP * 45} <span className="text-xs font-normal text-orange-600">Menit / Minggu</span></div>
                    </div>
                 </div>
             )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4 w-12 text-center">No</th>
                <th className="px-6 py-4">Mata Pelajaran</th>
                <th className="px-6 py-4 text-center">Kategori</th>
                <th className="px-6 py-4 text-center w-32">JP / Minggu</th>
                <th className="px-6 py-4 w-48">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentSubjects.map((subject, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 text-center font-mono text-xs text-gray-400">{index + 1}</td>
                  <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 text-sm">{subject.name}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getCategoryColor(subject.category)}`}>
                          {subject.category}
                      </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-lg font-bold ${subject.category === 'PKL' ? 'text-green-600' : 'text-gray-800'}`}>{subject.jp}</span>
                        <span className="text-xs text-gray-500 font-medium">JP</span>
                      </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 italic">
                      {subject.category === 'PKL' 
                        ? 'Dilaksanakan sistem blok' 
                        : `${subject.jp} x 45 Menit`}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                    <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-700 uppercase text-xs">
                        Total Jam Pelajaran Tatap Muka (Mingguan)
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className="bg-gray-800 text-white px-3 py-1 rounded-lg font-bold">
                            {totalJP} JP
                        </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 italic">
                        Diluar alokasi PKL
                    </td>
                </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-4 bg-yellow-50 border-t border-yellow-100 flex gap-3 text-xs text-yellow-800">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <div>
                <strong>Pedoman Penyusunan Jadwal:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Data ini digunakan sebagai acuan dasar pembagian jam mengajar guru agar tidak melebihi beban kurikulum.</li>
                    <li>1 JP setara dengan 45 menit.</li>
                    <li>Mapel <strong>Pilihan</strong> dan <strong>Muatan Lokal</strong> dapat disesuaikan dengan ketersediaan guru.</li>
                    {activeTab === 'XII' && <li><strong>PKL Kelas XII</strong> dilaksanakan selama 6 bulan (sistem blok), sehingga tidak masuk dalam jadwal mingguan reguler saat periode PKL berlangsung.</li>}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};
