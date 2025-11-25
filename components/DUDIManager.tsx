import React, { useState } from 'react';
import { DUDI, PKLAssignment } from '../types';
import { Building2, MapPin, Users, Phone, Search, Plus, User, LayoutGrid, List, Briefcase, FileSpreadsheet, Trash2 } from 'lucide-react';

interface DUDIManagerProps {
  dudiList: DUDI[];
  pklList: PKLAssignment[];
  onAddDudi: (dudi: DUDI) => void;
  onImport?: () => void;
  onDeleteDUDI?: (id: string) => void;
}

export const DUDIManager: React.FC<DUDIManagerProps> = ({ dudiList, pklList, onAddDudi, onImport, onDeleteDUDI }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [newDudi, setNewDudi] = useState<Partial<DUDI>>({
    name: '',
    field: '',
    address: '',
    contactPerson: '',
    phone: '',
    quota: 5
  });

  const filteredDudi = dudiList.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.field.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper untuk menghitung jumlah siswa yang sedang PKL di DUDI ini
  const getFilledQuota = (companyName: string) => {
    return pklList.filter(p => p.companyName.toLowerCase() === companyName.toLowerCase() && p.status === 'Active').length;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDudi.name) {
      onAddDudi({
        id: `dudi-${Date.now()}`,
        name: newDudi.name!,
        field: newDudi.field || '-',
        address: newDudi.address || '-',
        contactPerson: newDudi.contactPerson || '-',
        phone: newDudi.phone || '-',
        quota: Number(newDudi.quota) || 0
      });
      setShowModal(false);
      setNewDudi({ name: '', field: '', address: '', contactPerson: '', phone: '', quota: 5 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-indigo-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="text-indigo-600" /> Mitra Industri (DUDI)
            </h2>
            <p className="text-sm text-gray-500">Manajemen data perusahaan pasangan untuk PKL dan penyaluran lulusan.</p>
          </div>
          <div className="flex gap-2">
            {onImport && (
                <button 
                    onClick={onImport}
                    className="flex items-center gap-2 bg-white text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors shadow-sm"
                    title="Import Excel"
                >
                    <FileSpreadsheet size={16} /> Import
                </button>
            )}
            <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
                <Plus size={16} /> Tambah Mitra
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Cari nama perusahaan atau bidang usaha..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex bg-white rounded-lg border border-gray-300 p-1">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <LayoutGrid size={18} />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <List size={18} />
                </button>
            </div>
        </div>

        <div className="p-6">
            {filteredDudi.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Building2 size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Belum ada data mitra industri.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDudi.map(dudi => {
                        const filled = getFilledQuota(dudi.name);
                        const percentage = Math.min(100, (filled / dudi.quota) * 100);
                        
                        return (
                            <div key={dudi.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all group relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <Building2 size={24} />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold uppercase px-2 py-1 rounded-full">
                                            {dudi.field}
                                        </span>
                                        {onDeleteDUDI && (
                                            <button 
                                                onClick={() => onDeleteDUDI(dudi.id)}
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded"
                                                title="Hapus Data"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg mb-1">{dudi.name}</h3>
                                <div className="text-xs text-gray-500 flex items-start gap-1.5 mb-4 min-h-[32px]">
                                    <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                                    {dudi.address}
                                </div>
                                
                                <div className="border-t border-gray-100 pt-3 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User size={14} className="text-gray-400" />
                                        <span>{dudi.contactPerson}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={14} className="text-gray-400" />
                                        <span>{dudi.phone}</span>
                                    </div>
                                </div>

                                <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between text-xs font-medium mb-1.5">
                                        <span className="text-gray-500">Kuota Terisi</span>
                                        <span className={`${percentage >= 100 ? 'text-red-600' : 'text-indigo-600'}`}>
                                            {filled} / {dudi.quota} Siswa
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div 
                                            className={`h-1.5 rounded-full ${percentage >= 100 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-4 py-3">Nama Perusahaan</th>
                                <th className="px-4 py-3">Bidang</th>
                                <th className="px-4 py-3">Alamat</th>
                                <th className="px-4 py-3">Kontak</th>
                                <th className="px-4 py-3 text-center">Kuota</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredDudi.map(dudi => {
                                const filled = getFilledQuota(dudi.name);
                                return (
                                    <tr key={dudi.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{dudi.name}</td>
                                        <td className="px-4 py-3 text-gray-500">{dudi.field}</td>
                                        <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{dudi.address}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs">
                                                <div className="font-medium">{dudi.contactPerson}</div>
                                                <div className="text-gray-400">{dudi.phone}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${filled >= dudi.quota ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {filled} / {dudi.quota}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {onDeleteDUDI && (
                                                <button 
                                                    onClick={() => onDeleteDUDI(dudi.id)}
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>

      {/* Add DUDI Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Tambah Mitra Industri</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nama Perusahaan</label>
                        <input type="text" required className="w-full border rounded-lg px-3 py-2 text-sm" value={newDudi.name} onChange={e => setNewDudi({...newDudi, name: e.target.value})} placeholder="PT..." />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Bidang Usaha</label>
                        <input type="text" required className="w-full border rounded-lg px-3 py-2 text-sm" value={newDudi.field} onChange={e => setNewDudi({...newDudi, field: e.target.value})} placeholder="IT, Otomotif, dll" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Alamat</label>
                        <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={newDudi.address} onChange={e => setNewDudi({...newDudi, address: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Kontak Person</label>
                            <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={newDudi.contactPerson} onChange={e => setNewDudi({...newDudi, contactPerson: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">No. HP/Telp</label>
                            <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={newDudi.phone} onChange={e => setNewDudi({...newDudi, phone: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Kuota PKL</label>
                        <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={newDudi.quota} onChange={e => setNewDudi({...newDudi, quota: Number(e.target.value)})} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                        <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};