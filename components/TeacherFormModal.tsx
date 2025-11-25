

import React, { useState, useEffect } from 'react';
import { Teacher, DutyType, EmployeeStatus, AdditionalDuty } from '../types';
import { X, Plus, Trash2, Save } from 'lucide-react';

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
  initialData?: Teacher | null;
}

const DUTY_TYPES: DutyType[] = [
  'KepalaSekolah', 
  'WakaKurikulum', 
  'WakaHumas', 
  'WakaKesiswaan', 
  'WakaSarpras',
  'Kakomli', 'Staf', 'WaliKelas', 'GuruWali', 
  'Koordinator', 'PembinaEkskul', 'KoordinatorKokurikuler', 'KepalaLab', 
  'Bendahara', 'TimPengembang', 'WMM', 'Lainnya'
];

const EMPLOYEE_STATUSES: EmployeeStatus[] = ['PNS', 'PPPK', 'GTT', 'Guru Kontrak', 'Guru Tamu'];

export const TeacherFormModal: React.FC<TeacherFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '',
    nip: '',
    status: 'PNS',
    subjects: [],
    maxHours: 24,
    teachingHours: 0,
    additionalDuties: []
  });

  const [subjectsString, setSubjectsString] = useState('');

  // Duty Form State
  const [newDuty, setNewDuty] = useState<AdditionalDuty>({
    type: 'Lainnya',
    description: '',
    equivalentHours: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSubjectsString(initialData.subjects.join(', '));
    } else {
      // Reset for add mode
      setFormData({
        name: '',
        nip: '',
        status: 'PNS',
        subjects: [],
        maxHours: 24,
        teachingHours: 0,
        additionalDuties: []
      });
      setSubjectsString('');
    }
  }, [initialData, isOpen]);

  const handleAddDuty = () => {
    if (!newDuty.description) return;
    setFormData(prev => ({
      ...prev,
      additionalDuties: [...(prev.additionalDuties || []), newDuty]
    }));
    setNewDuty({ type: 'Lainnya', description: '', equivalentHours: 0 });
  };

  const handleRemoveDuty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalDuties: prev.additionalDuties?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subjects = subjectsString.split(',').map(s => s.trim()).filter(s => s);
    
    const teacherToSave: Teacher = {
      id: initialData?.id || `t${Date.now()}`,
      name: formData.name || '',
      nip: formData.nip || '-',
      status: formData.status as EmployeeStatus || 'GTT',
      subjects: subjects,
      maxHours: Number(formData.maxHours) || 24,
      teachingHours: Number(formData.teachingHours) || 0,
      additionalDuties: formData.additionalDuties || []
    };

    onSave(teacherToSave);
    onClose();
  };

  // Helper untuk placeholder dinamis
  const getDutyPlaceholder = (type: DutyType) => {
      if (type === 'WaliKelas') return 'Masukkan Nama Kelas (Wajib sama persis, misal: X RPL 1)';
      if (type === 'GuruWali') return 'Masukkan Nama Kelas Binaan (misal: X RPL 1)';
      if (type === 'PembinaEkskul') return 'Nama Ekstrakurikuler (misal: Pramuka)';
      return 'Keterangan Tugas Tambahan';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto py-10">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Edit Data Guru' : 'Tambah Guru Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap & Gelar</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh: Budi Santoso, S.Pd"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIP (Jika Ada)</label>
              <input
                type="text"
                value={formData.nip}
                onChange={e => setFormData({...formData, nip: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="-"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Kepegawaian</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as EmployeeStatus})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {EMPLOYEE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mengajar (Tatap Muka)</label>
              <div className="flex items-center gap-2">
                <input
                    type="number"
                    min="0"
                    required
                    value={formData.teachingHours}
                    onChange={e => setFormData({...formData, teachingHours: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="text-sm text-gray-500">JP</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran Diampu</label>
            <input
              type="text"
              value={subjectsString}
              onChange={e => setSubjectsString(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Pisahkan dengan koma. Contoh: Matematika, PKWU"
            />
          </div>

          {/* Duties Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                Tugas Tambahan & Ekuivalensi
            </h3>
            
            <div className="space-y-2 mb-4">
                {formData.additionalDuties?.map((duty, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200 shadow-sm">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium w-32 truncate">{duty.type === 'GuruWali' ? 'Guru Mentor' : duty.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="flex-1 text-sm text-gray-700">{duty.description}</span>
                        <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100">{duty.equivalentHours} JP</span>
                        <button type="button" onClick={() => handleRemoveDuty(idx)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {(!formData.additionalDuties || formData.additionalDuties.length === 0) && (
                    <p className="text-xs text-gray-400 italic">Belum ada tugas tambahan.</p>
                )}
            </div>

            <div className="grid grid-cols-12 gap-2 items-end border-t border-gray-200 pt-3">
                <div className="col-span-12 md:col-span-4">
                    <label className="text-[10px] text-gray-500">Jenis Tugas</label>
                    <select 
                        value={newDuty.type}
                        onChange={e => setNewDuty({...newDuty, type: e.target.value as DutyType})}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-2"
                    >
                        {DUTY_TYPES.map(d => (
                             <option key={d} value={d}>
                                 {d === 'GuruWali' ? 'Guru Wali (Mentor)' : d.replace(/([A-Z])/g, ' $1').trim()}
                             </option>
                        ))}
                    </select>
                </div>
                <div className="col-span-9 md:col-span-6">
                    <label className="text-[10px] text-gray-500">Keterangan / Target (Kelas)</label>
                    <input 
                        type="text"
                        value={newDuty.description}
                        onChange={e => setNewDuty({...newDuty, description: e.target.value})}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-2"
                        placeholder={getDutyPlaceholder(newDuty.type)}
                    />
                </div>
                <div className="col-span-3 md:col-span-2">
                    <label className="text-[10px] text-gray-500">Jam (JP)</label>
                    <div className="flex gap-1">
                        <input 
                            type="number"
                            min="0"
                            value={newDuty.equivalentHours}
                            onChange={e => setNewDuty({...newDuty, equivalentHours: Number(e.target.value)})}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-2"
                        />
                        <button type="button" onClick={handleAddDuty} className="bg-blue-600 text-white rounded px-3 hover:bg-blue-700 flex justify-center items-center">
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic">
                * Untuk <strong>Wali Kelas</strong> dan <strong>Guru Wali (Mentor)</strong>, pastikan keterangan diisi <strong>Nama Kelas</strong> agar terintegrasi dengan Data Siswa.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={16} />
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};