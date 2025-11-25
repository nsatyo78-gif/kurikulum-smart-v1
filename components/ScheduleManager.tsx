
import React, { useState, useEffect } from 'react';
import { Teacher, ScheduleSlot } from '../types';
import { DAYS_OF_WEEK, PERIODS as DEFAULT_PERIODS, CLASS_NAMES, MOCK_ROOMS } from '../constants';
import { generateScheduleSuggestion } from '../services/geminiService';
import { Calendar, Sparkles, Loader2, Clock, Printer, User, Users, Building2, MapPin, ChevronDown, AlertTriangle, CheckCircle2, BarChart3, Settings, Save, X, Info, Plus, Trash2, RefreshCw, Coffee } from 'lucide-react';

interface ScheduleManagerProps {
  teachers: Teacher[];
  currentSchedule: ScheduleSlot[];
  onUpdateSchedule: (newSchedule: ScheduleSlot[]) => void;
}

const DEFAULT_TIME_LABELS: Record<number, string> = {
    0: '06:45 - 07:00 (Literasi)',
    1: '07:00 - 07:45',
    2: '07:45 - 08:30',
    3: '08:30 - 09:15',
    4: '09:15 - 10:00',
    4.5: '10:00 - 10:15 (ISTIRAHAT)',
    5: '10:15 - 11:00',
    6: '11:00 - 11:45',
    7: '12:30 - 13:15',
    8: '13:15 - 14:00',
    9: '14:00 - 14:45',
    10: '14:45 - 15:30'
};

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({ teachers, currentSchedule, onUpdateSchedule }) => {
  const [viewMode, setViewMode] = useState<'class' | 'teacher' | 'room' | 'specific_room' | 'validation'>('class');
  
  const [selectedClass, setSelectedClass] = useState(CLASS_NAMES[0]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(MOCK_ROOMS[0]?.id || '');

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [conflictCount, setConflictCount] = useState(0);

  // --- CONFIG STATE ---
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  // Active Periods (Urutan Baris)
  const [activePeriods, setActivePeriods] = useState<number[]>(DEFAULT_PERIODS);
  const [timeLabels, setTimeLabels] = useState<Record<number, string>>(DEFAULT_TIME_LABELS);
  
  // Temp State for Modal
  const [tempPeriods, setTempPeriods] = useState<number[]>([]);
  const [tempLabels, setTempLabels] = useState<Record<number, string>>({});
  const [newPeriodInput, setNewPeriodInput] = useState<string>('');

  useEffect(() => {
      if (teachers.length > 0 && !selectedTeacherId) {
          setSelectedTeacherId(teachers[0].id);
      }
  }, [teachers]);

  useEffect(() => {
      let count = 0;
      currentSchedule.forEach((slot) => {
          const roomConflict = currentSchedule.find(s => 
              s.id !== slot.id && 
              s.roomId === slot.roomId && 
              s.day === slot.day && 
              s.period === slot.period &&
              s.roomId
          );

          const teacherConflict = currentSchedule.find(s => 
              s.id !== slot.id && 
              s.teacherId === slot.teacherId && 
              s.day === slot.day && 
              s.period === slot.period
          );

          if (roomConflict || teacherConflict) count++;
      });
      setConflictCount(count);
  }, [currentSchedule]);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setAiFeedback(null);
    try {
      const suggestions = await generateScheduleSuggestion(teachers, CLASS_NAMES, DAYS_OF_WEEK);
      
      if (suggestions.length > 0) {
        const newSlots: ScheduleSlot[] = suggestions.map((s, idx) => {
            const teacher = teachers.find(t => t.name === s.teacherName);
            return {
                id: `ai-gen-${Date.now()}-${idx}`,
                day: s.day,
                period: s.period,
                className: s.className,
                subject: s.subject,
                teacherId: teacher ? teacher.id : 'unknown'
            };
        });
        
        const updatedSchedule = [...currentSchedule];
        newSlots.forEach(newSlot => {
             const existingIdx = updatedSchedule.findIndex(
                 ex => ex.day === newSlot.day && ex.period === newSlot.period && ex.className === newSlot.className
             );
             if (existingIdx >= 0) {
                 updatedSchedule[existingIdx] = newSlot;
             } else {
                 updatedSchedule.push(newSlot);
             }
        });
        
        onUpdateSchedule(updatedSchedule);
        setAiFeedback(`Berhasil membuat ${suggestions.length} plot jadwal baru!`);
      } else {
          setAiFeedback("AI tidak memberikan saran jadwal. Coba lagi.");
      }
    } catch (e: any) {
      if (e.message === 'API_KEY_MISSING') {
        setAiFeedback("Gagal: API Key tidak ditemukan.");
      } else {
        setAiFeedback("Gagal terhubung ke AI Service.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
      window.print();
  };

  // --- CONFIG HANDLERS ---
  const handleOpenSettings = () => {
      setTempPeriods([...activePeriods]);
      setTempLabels({...timeLabels});
      setShowTimeSettings(true);
  };

  const handleSaveSettings = () => {
      // Sort periods numerically
      const sorted = [...tempPeriods].sort((a, b) => a - b);
      setActivePeriods(sorted);
      setTimeLabels(tempLabels);
      setShowTimeSettings(false);
  };

  const handleAddPeriod = () => {
      // Use parseFloat to allow decimals like 4.5 for breaks
      const p = parseFloat(newPeriodInput);
      if (!isNaN(p) && !tempPeriods.includes(p)) {
          const newArr = [...tempPeriods, p].sort((a,b) => a-b);
          setTempPeriods(newArr);
          // Auto-suggest label if decimal
          if (p % 1 !== 0) {
              setTempLabels(prev => ({...prev, [p]: 'ISTIRAHAT'}));
          }
          setNewPeriodInput('');
      }
  };

  const handleDeletePeriod = (p: number) => {
      setTempPeriods(tempPeriods.filter(item => item !== p));
  };

  const handleLabelChange = (p: number, val: string) => {
      setTempLabels({...tempLabels, [p]: val});
  };

  const isBreakOrSpecial = (period: number, label: string) => {
      // Check if period is decimal OR label contains keywords
      if (period % 1 !== 0) return true;
      if (!label) return false;
      const lower = label.toLowerCase();
      return lower.includes('istirahat') || lower.includes('upacara') || lower.includes('literasi') || lower.includes('doa') || lower.includes('jumat');
  };

  // Render Isi Slot Jadwal
  const getSlotContent = (day: string, period: number) => {
    const label = timeLabels[period] || '';
    const isDecimalRow = period % 1 !== 0;
    
    // Special handling for 'Istirahat' or custom non-lesson slots
    if (isBreakOrSpecial(period, label)) {
        return (
            <div className={`w-full h-full flex items-center justify-center border border-dashed border-gray-300 rounded-lg ${isDecimalRow ? 'bg-slate-200/70 min-h-[40px]' : 'bg-gray-100/50 min-h-[80px]'}`}>
                <span className={`font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ${isDecimalRow ? 'text-xs' : 'text-[10px] transform -rotate-12'}`}>
                    {isDecimalRow && <Coffee size={14} />}
                    {label.replace(/\(.*\)/, '') || 'JEDA'}
                </span>
            </div>
        );
    }

    let slot: ScheduleSlot | undefined;
    let displayTitle = '';
    let displaySubtitle = '';
    let cardBorderColor = '';
    let subtitleColor = '';

    if (viewMode === 'class') {
        slot = currentSchedule.find(s => s.day === day && s.period === period && s.className === selectedClass);
        if (slot) {
            const teacher = teachers.find(t => t.id === slot!.teacherId);
            displayTitle = slot.subject;
            displaySubtitle = teacher ? teacher.name : 'Guru Tidak Dikenal';
            cardBorderColor = 'border-blue-500';
            subtitleColor = 'text-blue-600';
        }
    } else if (viewMode === 'teacher') {
        slot = currentSchedule.find(s => s.day === day && s.period === period && s.teacherId === selectedTeacherId);
        if (slot) {
            displayTitle = slot.className;
            displaySubtitle = slot.subject;
            cardBorderColor = 'border-emerald-500';
            subtitleColor = 'text-emerald-600';
        }
    } else if (viewMode === 'specific_room') {
        slot = currentSchedule.find(s => s.day === day && s.period === period && s.roomId === selectedRoomId);
        if (slot) {
            const teacher = teachers.find(t => t.id === slot!.teacherId);
            const shortName = teacher ? teacher.name.split(',')[0] : 'Guru?';
            displayTitle = slot.className;
            displaySubtitle = `${slot.subject} (${shortName})`;
            cardBorderColor = 'border-orange-500';
            subtitleColor = 'text-orange-600';
        }
    }

    let isConflict = false;
    if (slot) {
        const roomConflict = currentSchedule.find(s => 
            s.id !== slot!.id && 
            s.roomId === slot!.roomId && 
            s.day === day && 
            s.period === period &&
            s.roomId
        );
        const teacherConflict = currentSchedule.find(s => 
            s.id !== slot!.id && 
            s.teacherId === slot!.teacherId && 
            s.day === day && 
            s.period === period
        );
        if (roomConflict || teacherConflict) isConflict = true;
    }

    if (!slot) {
        return (
             <div className="group w-full h-full min-h-[80px] rounded-lg border border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/20 flex flex-col items-center justify-center transition-all cursor-default relative overflow-hidden bg-white/50">
                <span className="text-gray-300 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">KOSONG</span>
            </div>
        );
    }
    
    const room = MOCK_ROOMS.find(r => r.id === slot?.roomId);
    
    return (
      <div className={`relative w-full h-full min-h-[80px] p-2.5 rounded-lg border-l-[3px] shadow-sm hover:shadow-md transition-all flex flex-col justify-between 
        ${isConflict ? 'bg-red-50 border-l-red-500 border-red-200' : `bg-white ${cardBorderColor} border-gray-100`} 
        print:border print:border-black`}>
        
        {isConflict && (
            <div className="absolute top-1 right-1 text-red-500 animate-pulse">
                <AlertTriangle size={12} />
            </div>
        )}

        <div className="flex flex-col gap-0.5">
            <div className={`font-bold text-[11px] leading-snug line-clamp-2 ${isConflict ? 'text-red-700' : 'text-gray-900'}`}>
                {displayTitle}
            </div>
            <div className={`text-[10px] font-medium leading-tight line-clamp-2 ${isConflict ? 'text-red-600' : subtitleColor}`}>
                {displaySubtitle}
            </div>
        </div>
        
        <div className={`mt-2 pt-1 border-t flex items-center justify-between ${isConflict ? 'border-red-100' : 'border-gray-50'}`}>
            <div className="text-[9px] text-gray-400 font-mono">JP {period}</div>
            {room && viewMode !== 'specific_room' && (
                 <div className={`flex items-center gap-1 text-[8px] font-bold px-1 py-0.5 rounded border 
                    ${isConflict ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    <MapPin size={8} /> {room.name}
                 </div>
            )}
        </div>
      </div>
    );
  };

  const renderRoomView = () => {
      return (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-xs">
                  <thead>
                      <tr>
                          <th className="p-3 border-b border-r bg-gray-50 text-left min-w-[150px] sticky left-0 z-10 font-bold text-gray-700">Ruangan</th>
                          {activePeriods.map(p => (
                              <th key={p} className="p-2 border-b border-r bg-gray-50 text-center min-w-[70px]">
                                  <div className="font-bold text-gray-700">JP {p}</div>
                                  <div className="text-[8px] font-normal text-gray-400 no-print mt-0.5 truncate max-w-[60px] mx-auto" title={timeLabels[p]}>{timeLabels[p] || '-'}</div>
                              </th>
                          ))}
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                      {MOCK_ROOMS.map(room => {
                          return (
                              <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="p-3 border-r font-medium sticky left-0 bg-white z-10 group-hover:bg-gray-50 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                      <div className="text-gray-900 font-bold">{room.name}</div>
                                      <div className="text-[10px] text-gray-500">{room.type}</div>
                                  </td>
                                  {activePeriods.map(p => {
                                      const slots = currentSchedule.filter(s => s.day === selectedDay && s.period === p && s.roomId === room.id);
                                      if (slots.length > 0) {
                                          const isDoubleBooked = slots.length > 1;
                                          return (
                                              <td key={p} className={`p-1 border-r border-gray-100 text-center relative group-cell ${isDoubleBooked ? 'bg-red-50' : ''}`}>
                                                  {slots.map((slot) => {
                                                      const teacher = teachers.find(t => t.id === slot.teacherId);
                                                      const shortTeacherName = teacher ? teacher.name.split(',')[0] : 'Unknown';
                                                      return (
                                                          <div key={slot.id} className={`mb-1 border rounded p-1 flex flex-col items-center justify-center min-h-[40px] ${isDoubleBooked ? 'bg-red-100 border-red-300 text-red-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
                                                                <div className="font-bold text-[9px]">{slot.className}</div>
                                                                <div className="text-[8px] truncate w-full px-1" title={teacher?.name}>{shortTeacherName}</div>
                                                          </div>
                                                      )
                                                  })}
                                              </td>
                                          );
                                      }
                                      // Render break cell if period is decimal
                                      if (p % 1 !== 0) {
                                          return <td key={p} className="bg-slate-100 border-r border-gray-200"></td>;
                                      }
                                      return (
                                          <td key={p} className="p-1 border-r border-gray-100 text-center bg-gray-50/30">
                                              <span className="text-gray-200 text-[10px]">-</span>
                                          </td>
                                      );
                                  })}
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      );
  };

  const getHeaderTitle = () => {
      switch(viewMode) {
          case 'class': return `Jadwal Pelajaran Kelas ${selectedClass}`;
          case 'teacher': return `Jadwal Mengajar: ${teachers.find(t => t.id === selectedTeacherId)?.name || ''}`;
          case 'specific_room': return `Jadwal Ruangan: ${MOCK_ROOMS.find(r => r.id === selectedRoomId)?.name || ''}`;
          case 'room': return `Status Penggunaan Ruangan - ${selectedDay}`;
          default: return 'Jadwal Pelajaran';
      }
  };

  return (
    <div className="space-y-6">
      {/* Header Aplikasi */}
      <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 print:bg-white print:text-black print:shadow-none print:border-b-2 print:border-black print:rounded-none print:p-0 print:mb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 print:hidden" /> 
            {getHeaderTitle()}
          </h2>
          <p className="text-indigo-100 text-sm mt-1 print:text-black">SMK Negeri 1 Purbalingga - Tahun Ajaran 2025/2026</p>
        </div>
        
        <div className="flex gap-2 no-print">
            <button
                onClick={handleOpenSettings}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
                <Settings size={18} /> Atur Waktu / Sesi
            </button>
            <button
                onClick={handlePrint}
                className="px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
                <Printer size={18} /> Cetak
            </button>
            
            {viewMode !== 'room' && viewMode !== 'validation' && (
                <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        isGenerating 
                        ? 'bg-indigo-500 cursor-not-allowed text-indigo-200' 
                        : 'bg-white text-indigo-700 hover:bg-indigo-50'
                    }`}
                >
                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles className="w-4 h-4 text-yellow-500" />}
                    {isGenerating ? 'Berpikir...' : 'AI Auto-Schedule'}
                </button>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
        
        {/* Control Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6 border-b border-gray-100 pb-4 no-print">
          <div className="bg-gray-100 p-1 rounded-lg flex items-center flex-wrap">
              <button onClick={() => setViewMode('class')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${viewMode === 'class' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Users size={16} /> Per Kelas</button>
              <button onClick={() => setViewMode('teacher')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${viewMode === 'teacher' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><User size={16} /> Per Guru</button>
              <button onClick={() => setViewMode('specific_room')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${viewMode === 'specific_room' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><MapPin size={16} /> Jadwal Ruang</button>
              <button onClick={() => setViewMode('room')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${viewMode === 'room' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Building2 size={16} /> Monitor Ruang</button>
          </div>

          <div className="h-6 w-px bg-gray-300 mx-2 hidden md:block"></div>

          <div className="flex-1 w-full md:w-auto">
              {viewMode === 'class' && (
                  <div className="relative w-full md:w-64">
                    <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                        {CLASS_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
              )}
              {/* Other selectors omitted for brevity but would be here */}
          </div>
        </div>

        {/* Status Bar */}
        {conflictCount > 0 && (
           <div className="bg-red-50 text-red-800 p-3 mb-4 rounded-lg border border-red-200 flex items-center gap-2 animate-pulse no-print">
              <AlertTriangle size={18} className="text-red-600" />
              <span className="font-bold text-sm">Ditemukan {conflictCount} Jadwal Bentrok!</span>
          </div>
        )}

        {/* Main View */}
        {viewMode === 'room' ? (
            renderRoomView()
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-2">
                <thead>
                <tr>
                    <th className="p-3 bg-gray-800 text-white rounded-lg text-center text-sm font-bold w-24 print:bg-white print:text-black print:border print:border-black">
                        Sesi / Jam
                    </th>
                    {DAYS_OF_WEEK.map(day => (
                    <th key={day} className="p-3 bg-gray-50 rounded-lg text-center text-sm font-bold text-gray-600 min-w-[150px] print:bg-white print:border print:border-black">
                        {day}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {activePeriods.map((period) => (
                    <tr key={period}>
                    <td className={`text-center rounded-lg border align-middle p-2 print:border-black ${period % 1 !== 0 ? 'bg-slate-200 border-slate-300' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="font-bold text-lg text-gray-700">{period}</div>
                        <div className="text-[10px] text-gray-500 mt-1 bg-white rounded border border-gray-200 px-1 py-0.5 font-mono">
                            {timeLabels[period] || (period % 1 !== 0 ? 'ISTIRAHAT' : '00:00')}
                        </div>
                    </td>
                    {DAYS_OF_WEEK.map(day => (
                        <td key={`${day}-${period}`} className="p-0 align-top h-full">
                            {getSlotContent(day, period)}
                        </td>
                    ))}
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
      </div>

      {/* Modal Pengaturan Waktu */}
      {showTimeSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                  <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Clock size={20} /> Konfigurasi Jam Pelajaran</h3>
                      <button onClick={() => setShowTimeSettings(false)} className="hover:bg-indigo-700 p-1 rounded"><X size={20}/></button>
                  </div>
                  
                  <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex gap-2 items-center">
                        <div className="flex-1">
                            <span className="text-xs font-bold text-indigo-800 uppercase">Tambah Baris (Jam Ke)</span>
                            <div className="flex gap-2 mt-1">
                                <input 
                                    type="number" 
                                    step="0.1"
                                    className="w-full border border-indigo-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Contoh: 0, 4.5 (Istirahat), 11..."
                                    value={newPeriodInput}
                                    onChange={(e) => setNewPeriodInput(e.target.value)}
                                />
                                <button onClick={handleAddPeriod} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-indigo-700 flex items-center gap-1">
                                    <Plus size={16} /> Tambah
                                </button>
                            </div>
                            <p className="text-[10px] text-indigo-600 mt-1">Tips: Gunakan pecahan (misal 4.5) untuk menyisipkan istirahat di antara jam 4 dan 5.</p>
                        </div>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1">
                      <div className="space-y-2">
                          {tempPeriods.map(p => (
                              <div key={p} className={`flex items-center gap-2 p-2 rounded border group ${p % 1 !== 0 ? 'bg-slate-100 border-slate-300' : 'bg-gray-50 border-gray-200'}`}>
                                  <div className="w-12 h-10 flex items-center justify-center font-bold text-gray-700 bg-white border border-gray-300 rounded shadow-sm">
                                      {p}
                                  </div>
                                  <div className="flex-1">
                                      <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder="Label Waktu (Contoh: 07:00-07:45)"
                                        value={tempLabels[p] || ''}
                                        onChange={(e) => handleLabelChange(p, e.target.value)}
                                      />
                                  </div>
                                  <button 
                                    onClick={() => handleDeletePeriod(p)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Hapus Baris Ini"
                                  >
                                      <Trash2 size={18} />
                                  </button>
                              </div>
                          ))}
                          {tempPeriods.length === 0 && (
                              <div className="text-center py-8 text-gray-400 italic">Belum ada jam pelajaran diatur. Tambahkan di atas.</div>
                          )}
                      </div>
                  </div>
                  
                  <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                      <button onClick={() => setShowTimeSettings(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Batal</button>
                      <button onClick={handleSaveSettings} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-bold flex items-center gap-2"><Save size={16}/> Simpan Pengaturan</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
