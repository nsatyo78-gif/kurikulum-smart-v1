
import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { CLASS_NAMES } from '../constants';
import { X, Save, UserPlus, Phone, User, MapPin } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  initialData?: Student | null; // Tambahan untuk mode Edit
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    nis: '',
    name: '',
    className: CLASS_NAMES[0],
    gender: 'L',
    status: 'Aktif',
    address: '',
    parentName: '',
    parentPhone: ''
  });

  // Load data jika mode Edit
  useEffect(() => {
    if (initialData) {
        setFormData(initialData);
    } else {
        setFormData({
            nis: '',
            name: '',
            className: CLASS_NAMES[0],
            gender: 'L',
            status: 'Aktif',
            address: '',
            parentName: '',
            parentPhone: ''
        });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nis) return;

    const studentToSave: Student = {
      id: initialData?.id || `s${Date.now()}`, // Gunakan ID lama jika edit, buat baru jika tambah
      nis: formData.nis,
      name: formData.name,
      className: formData.className || CLASS_NAMES[0],
      gender: formData.gender as 'L' | 'P',
      status: formData.status as 'Aktif' | 'Lulus' | 'Mutasi' | 'Keluar',
      address: formData.address || '',
      parentName: formData.parentName || '',
      parentPhone: formData.parentPhone || ''
    };

    onSave(studentToSave);
    
    if (!initialData) {
        // Reset form hanya jika tambah baru
        setFormData({
            nis: '',
            name: '',
            className: CLASS_NAMES[0],
            gender: 'L',
            status: 'Aktif',
            address: '',
            parentName: '',
            parentPhone: ''
        });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200 my-8">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <UserPlus className="text-blue-600" size={20} />
            {initialData ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Section: Data Akademik */}
          <div className="space-y-4 border-b border-gray-100 pb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data Akademik</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                    <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={e => setFormData({...formData, nis: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    placeholder="Contoh: 21221005"
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="Nama Siswa"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas (Rombel)</label>
                <select
                value={formData.className}
                onChange={e => setFormData({...formData, className: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                >
                {CLASS_NAMES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="gender" 
                                value="L" 
                                checked={formData.gender === 'L'} 
                                onChange={() => setFormData({...formData, gender: 'L'})}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">Laki-laki</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="gender" 
                                value="P" 
                                checked={formData.gender === 'P'} 
                                onChange={() => setFormData({...formData, gender: 'P'})}
                                className="text-pink-600 focus:ring-pink-500"
                            />
                            <span className="text-sm">Perempuan</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Kesiswaan</label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    >
                        <option value="Aktif">Aktif</option>
                        <option value="Mutasi">Mutasi (Pindah)</option>
                        <option value="Keluar">Keluar (Drop Out)</option>
                        <option value="Lulus">Lulus</option>
                    </select>
                </div>
              </div>
          </div>

          {/* Section: Data Kontak & Wali */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                Data Kontak & Wali <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full lowercase font-normal">Penting untuk koordinasi</span>
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Orang Tua / Wali</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={formData.parentName}
                            onChange={e => setFormData({...formData, parentName: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                            placeholder="Nama Bapak/Ibu"
                        />
                    </div>
                </div>
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. HP / WhatsApp</label>
                    <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={formData.parentPhone}
                            onChange={e => setFormData({...formData, parentPhone: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                            placeholder="0812xxxx (Wajib Aktif)"
                        />
                    </div>
                </div>
             </div>

             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Domisili</label>
                 <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                    <textarea 
                        rows={2}
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                        placeholder="Alamat lengkap (RT/RW, Desa, Kecamatan)..."
                    />
                 </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
            >
              <Save size={16} />
              {initialData ? 'Simpan Perubahan' : 'Simpan Siswa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};