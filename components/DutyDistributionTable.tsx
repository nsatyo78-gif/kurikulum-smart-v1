
import React, { useMemo, useRef } from 'react';
import { Teacher, ScheduleSlot } from '../types';
import { CLASS_NAMES } from '../constants';
import { FileSpreadsheet, Printer, Info, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

interface Props {
  teachers: Teacher[];
  schedule: ScheduleSlot[];
}

const parseClass = (name: string) => {
  const parts = name.split(' ');
  return {
    grade: parts[0],
    major: parts[1],
    index: parts[2],
    fullName: name
  };
};

export const DutyDistributionTable: React.FC<Props> = ({ teachers, schedule }) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const sortedTeachers = useMemo(() => {
    return [...teachers].sort((a, b) => a.name.localeCompare(b.name));
  }, [teachers]);

  // Structure for headers - Dynamic based on CLASS_NAMES
  const structure = useMemo(() => {
    const grades = ['X', 'XI', 'XII'];
    const data: any = {};

    grades.forEach(grade => {
      data[grade] = {};
      const classesInGrade = CLASS_NAMES.filter(c => c.startsWith(grade));
      
      classesInGrade.forEach(cls => {
        const { major, index, fullName } = parseClass(cls);
        if (!data[grade][major]) {
          data[grade][major] = [];
        }
        data[grade][major].push({ index, fullName });
      });
    });
    return data;
  }, []);

  const getMajorsForGrade = (grade: string) => {
      const majors = new Set<string>();
      CLASS_NAMES.filter(c => c.startsWith(grade)).forEach(c => {
          majors.add(parseClass(c).major);
      });
      return Array.from(majors);
  };

  const allClasses = CLASS_NAMES;
  const classesX = CLASS_NAMES.filter(c => c.startsWith('X '));
  const classesXI = CLASS_NAMES.filter(c => c.startsWith('XI '));
  const classesXII = CLASS_NAMES.filter(c => c.startsWith('XII '));

  const getScheduledHoursInClass = (teacherId: string, className: string, subjectName?: string) => {
    return schedule.filter(s => {
        const matchTeacher = s.teacherId === teacherId;
        const matchClass = s.className === className;
        const matchSubject = subjectName ? s.subject.toLowerCase().includes(subjectName.toLowerCase()) || subjectName.toLowerCase().includes(s.subject.toLowerCase()) : true;
        return matchTeacher && matchClass && matchSubject;
    }).length;
  };

  const getClassTotalHours = (className: string) => {
    return schedule.filter(s => s.className === className).length;
  };

  const getCurriculumStandard = (grade: string) => {
    if (grade === 'X') return 50;
    return 48;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-start gap-4">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileSpreadsheet size={28} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">Matriks Pembagian Tugas Mengajar</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Analisis beban kerja guru per kelas dan validasi struktur kurikulum.
                </p>
             </div>
          </div>
          <div className="flex gap-3">
             <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Ajaran</span>
                <span className="text-sm font-bold text-gray-800">2025 / 2026</span>
             </div>
             <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-gray-200"
             >
                <Printer size={18} /> Cetak Laporan
            </button>
          </div>
        </div>
        
        {/* Legend / Info Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-6 text-xs text-gray-600">
            <div className="flex items-center gap-2">
                <Info size={14} className="text-blue-500" />
                <span><strong>Jml Jam:</strong> Target jam mengajar (Data Guru).</span>
            </div>
            <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-500" />
                <span><strong>JML (Kanan):</strong> Realisasi jam yang sudah diplot.</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
                 <span className="w-2 h-2 rounded-full bg-rose-400"></span> Kelas X
                 <span className="w-2 h-2 rounded-full bg-amber-400 ml-2"></span> Kelas XI
                 <span className="w-2 h-2 rounded-full bg-emerald-400 ml-2"></span> Kelas XII
            </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col" ref={tableRef}>
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"> 
            <table className="w-full border-collapse text-[11px] whitespace-nowrap">
                <thead>
                    {/* Header Row 1: Grade Groups */}
                    <tr className="uppercase text-xs font-bold text-white tracking-wide">
                        <th rowSpan={3} className="bg-slate-800 border-r border-slate-700 p-3 w-10 sticky left-0 z-30">No</th>
                        <th rowSpan={3} className="bg-slate-800 border-r border-slate-700 p-3 w-64 text-left sticky left-10 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">Nama Guru</th>
                        <th rowSpan={3} className="bg-slate-800 border-r border-slate-700 p-3 w-48 text-left sticky left-[266px] z-30">Mata Pelajaran</th>
                        <th rowSpan={3} className="bg-slate-700 border-r border-slate-600 p-3 w-12 text-center text-yellow-400 sticky left-[458px] z-30 shadow-[4px_0_8px_rgba(0,0,0,0.15)]">Beban<br/>Jam</th>
                        
                        <th colSpan={classesX.length} className="bg-rose-600 border-r border-rose-700 py-2">Kelas X (Fase E)</th>
                        <th colSpan={classesXI.length} className="bg-amber-500 border-r border-amber-600 py-2">Kelas XI (Fase F)</th>
                        <th colSpan={classesXII.length} className="bg-emerald-600 border-r border-emerald-700 py-2">Kelas XII (Fase F)</th>
                        
                        <th rowSpan={3} className="bg-slate-800 p-3 w-12 text-white">Total</th>
                    </tr>

                    {/* Header Row 2: Majors */}
                    <tr className="text-center font-bold text-[10px]">
                         {getMajorsForGrade('X').map(major => (
                            <th key={`X-${major}`} colSpan={structure['X'][major].length} className="bg-rose-50 text-rose-800 border-b border-r border-rose-200 py-1.5">{major}</th>
                        ))}
                         {getMajorsForGrade('XI').map(major => (
                            <th key={`XI-${major}`} colSpan={structure['XI'][major].length} className="bg-amber-50 text-amber-800 border-b border-r border-amber-200 py-1.5">{major}</th>
                        ))}
                         {getMajorsForGrade('XII').map(major => (
                            <th key={`XII-${major}`} colSpan={structure['XII'][major].length} className="bg-emerald-50 text-emerald-800 border-b border-r border-emerald-200 py-1.5">{major}</th>
                        ))}
                    </tr>

                    {/* Header Row 3: Class Indices */}
                    <tr className="text-center font-bold text-[10px]">
                        {allClasses.map(cls => {
                            const { grade, index } = parseClass(cls);
                            let bgClass = grade === 'X' ? 'bg-rose-100 text-rose-900 border-rose-200' 
                                        : grade === 'XI' ? 'bg-amber-100 text-amber-900 border-amber-200' 
                                        : 'bg-emerald-100 text-emerald-900 border-emerald-200';
                            return (
                                <th key={cls} className={`border-b border-r py-1.5 min-w-[30px] ${bgClass}`}>{index}</th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {sortedTeachers.map((teacher, idx) => {
                        const targetTM = teacher.teachingHours;
                        const subjectsToRender = teacher.subjects.length > 0 ? teacher.subjects : ['-'];
                        
                        return (
                             <React.Fragment key={teacher.id}>
                                {subjectsToRender.map((subject, subIdx) => {
                                    let rowTotal = 0;
                                    const dutiesText = teacher.additionalDuties.length > 0 
                                        ? teacher.additionalDuties.map(d => d.type === 'GuruWali' ? 'Mentor' : d.type.replace(/([A-Z])/g, ' $1').trim()).join(', ')
                                        : '';

                                    // Row Background Logic (Alternating for readability based on teacher block)
                                    const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

                                    return (
                                        <tr key={`${teacher.id}-${subIdx}`} className={`${rowBg} hover:bg-blue-50/80 transition-colors group`}>
                                            
                                            {/* Sticky Columns Group */}
                                            {subIdx === 0 && (
                                                <>
                                                    <td rowSpan={subjectsToRender.length} className={`p-3 text-center text-gray-500 sticky left-0 z-20 border-r border-gray-200 align-top ${rowBg} font-mono`}>{idx + 1}</td>
                                                    <td rowSpan={subjectsToRender.length} className={`p-3 px-4 sticky left-10 z-20 border-r border-gray-200 align-top ${rowBg} shadow-[2px_0_5px_rgba(0,0,0,0.05)]`}>
                                                        <div className="font-bold text-gray-800 text-xs">{teacher.name}</div>
                                                        {dutiesText && (
                                                            <div className="inline-block mt-1 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[9px] border border-indigo-100 font-medium">
                                                                {dutiesText}
                                                            </div>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                            
                                            {/* Subject Name - Sticky but lower z-index */}
                                            <td className={`p-3 px-4 border-r border-gray-200 text-gray-700 sticky left-[266px] z-10 ${rowBg}`}>
                                                {subject}
                                            </td>

                                            {/* Target Hours - Sticky with shadow separation */}
                                            {subIdx === 0 && (
                                                <td rowSpan={subjectsToRender.length} className={`p-3 text-center border-r border-gray-200 font-bold sticky left-[458px] z-20 align-top ${rowBg} shadow-[4px_0_8px_rgba(0,0,0,0.05)] text-gray-900`}>
                                                    {targetTM}
                                                </td>
                                            )}
                                            
                                            {/* Gap filler for rowspan rows if needed, or simply empty cells for subIdx > 0 handled implicitly */}
                                            {subIdx > 0 && <td className={`sticky left-[458px] z-20 border-r border-gray-200 ${rowBg} shadow-[4px_0_8px_rgba(0,0,0,0.05)]`}></td>}

                                            {/* Class Matrix Cells */}
                                            {allClasses.map(cls => {
                                                const jp = getScheduledHoursInClass(teacher.id, cls, subject);
                                                rowTotal += jp;
                                                const { grade } = parseClass(cls);
                                                
                                                // Subtle vertical borders for grade sections
                                                let borderClass = 'border-r border-gray-100';
                                                if (cls.endsWith(' 2') && grade === 'PM') borderClass = 'border-r border-gray-300'; // Example visual separator logic if needed
                                                
                                                // Background hint for grades
                                                let cellBg = '';
                                                if (jp > 0) {
                                                    cellBg = grade === 'X' ? 'bg-rose-50 text-rose-700 font-bold' 
                                                           : grade === 'XI' ? 'bg-amber-50 text-amber-700 font-bold' 
                                                           : 'bg-emerald-50 text-emerald-700 font-bold';
                                                } else {
                                                    cellBg = 'text-gray-300';
                                                }

                                                return (
                                                    <td key={cls} className={`p-1.5 text-center text-[10px] ${borderClass} ${cellBg}`}>
                                                        {jp > 0 ? jp : ''}
                                                    </td>
                                                )
                                            })}

                                            {/* Row Total (Realization) */}
                                            <td className={`p-1.5 text-center font-bold border-l border-gray-300 ${rowTotal > 0 ? 'text-blue-700 bg-blue-50' : 'text-gray-300'}`}>
                                                {rowTotal > 0 ? rowTotal : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                             </React.Fragment>
                        );
                    })}
                </tbody>
                
                {/* Validation Footer */}
                <tfoot className="sticky bottom-0 z-40">
                    <tr className="bg-gray-800 text-white font-bold text-[10px] shadow-lg">
                        <td colSpan={4} className="p-3 text-right sticky left-0 z-40 bg-gray-800 border-r border-gray-700">
                            VALIDASI BEBAN KURIKULUM (JP)
                        </td>
                         {allClasses.map(cls => {
                             const total = getClassTotalHours(cls);
                             const grade = parseClass(cls).grade;
                             const target = getCurriculumStandard(grade);
                             const isOk = total === target;
                             const isUnder = total < target;
                             
                             let statusColor = isOk ? 'bg-emerald-600 text-white' : isUnder ? 'bg-amber-500 text-black' : 'bg-rose-500 text-white';

                             return (
                                 <td key={cls} className={`border-r border-gray-700 p-2 text-center relative group ${statusColor}`}>
                                     <div className="flex items-center justify-center gap-1">
                                        {total}
                                        {/* {isOk ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />} */}
                                     </div>
                                     {/* Tooltip on hover */}
                                     {!isOk && (
                                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[9px] rounded hidden group-hover:block whitespace-nowrap">
                                             Target: {target}
                                         </div>
                                     )}
                                 </td>
                             )
                         })}
                         <td className="bg-gray-900"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
      </div>
    </div>
  );
};
