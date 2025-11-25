
import React, { useState } from 'react';
import { Room, ScheduleSlot } from '../types';
import { MapPin, Users, Search, School, Monitor, FlaskConical, Music, Trophy, Pencil, Save, X, Bookmark, Info } from 'lucide-react';

interface RoomManagerProps {
  rooms: Room[];
  schedule: ScheduleSlot[];
  onUpdateRoom: (room: Room) => void;
}

export const RoomManager: React.FC<RoomManagerProps> = ({ rooms, schedule, onUpdateRoom }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  
  // Edit Modal State
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (room.allocation && room.allocation.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'All' || room.type === filterType;
    return matchesSearch && matchesType;
  });

  // Helper untuk menghitung penggunaan ruangan
  const getRoomUsage = (roomId: string) => {
    // Hitung berapa slot jadwal yang menggunakan ruangan ini
    return schedule.filter(s => s.roomId === roomId).length;
  };

  // Helper icon berdasarkan tipe
  const getRoomIcon = (type: string) => {
      if (type.includes('Laboratorium')) return <Monitor size={20} />;
      if (type.includes('Praktek')) return <FlaskConical size={20} />;
      if (type.includes('Khusus') || type.includes('Musik')) return <Music size={20} />;
      if (type.includes('OR')) return <Trophy size={20} />;
      return <School size={20} />;
  };

  // Helper warna badge tipe
  const getTypeBadgeColor = (type: string) => {
      if (type === 'Teori') return 'bg-blue-50 text-blue-700 border-blue-100';
      if (type === 'Laboratorium') return 'bg-purple-50 text-purple-700 border-purple-100';
      if (type === 'Praktek') return 'bg-orange-50 text-orange-700 border-orange-100';
      return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const handleSaveRoom = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingRoom) {
          onUpdateRoom(editingRoom);
          setEditingRoom(null);
      }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-emerald-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="text-emerald-600" /> Data Ruang Belajar & Laboratorium
            </h2>
            <p className="text-sm text-gray-500">Manajemen peruntukan dan fasilitas ruangan.</p>
          </div>
          <div className="flex gap-2">
             <div className="bg-white px-3 py-1 rounded-lg border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center shadow-sm">
                Total: {rooms.length} Ruangan
             </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Cari nama ruangan atau peruntukan..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="w-full md:w-64">
                 <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                 >
                    <option value="All">Semua Tipe</option>
                    <option value="Teori">Ruang Teori</option>
                    <option value="Laboratorium">Laboratorium</option>
                    <option value="Praktek">Ruang Praktek</option>
                    <option value="Khusus">Ruang Khusus/Lainnya</option>
                 </select>
            </div>
        </div>

        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredRooms.map(room => {
                    const usageCount = getRoomUsage(room.id);
                    const usagePercent = Math.min(100, (usageCount / 50) * 100); 
                    
                    return (
                        <div key={room.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group relative">
                            
                            {/* Tombol Edit */}
                            <button 
                                onClick={() => setEditingRoom(room)}
                                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 rounded-md transition-colors"
                                title="Edit Data Ruang"
                            >
                                <Pencil size={14} />
                            </button>

                            <div className="flex justify-between items-start mb-2">
                                <div className={`p-2 rounded-lg ${getTypeBadgeColor(room.type)}`}>
                                    {getRoomIcon(room.type)}
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <h3 className="font-bold text-gray-800 text-lg leading-tight">{room.name}</h3>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                    room.type === 'Teori' ? 'text-blue-600' : 
                                    room.type === 'Laboratorium' ? 'text-purple-600' : 'text-orange-600'
                                }`}>
                                    {room.type}
                                </span>
                            </div>
                            
                            {/* Allocation Badge */}
                            {room.allocation && (
                                <div className="mb-2">
                                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2 py-1 rounded text-xs font-medium border border-emerald-100 w-full">
                                        <Bookmark size={10} className="flex-shrink-0" />
                                        <span className="truncate">{room.allocation}</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Users size={12} /> Kapasitas: <b>{room.capacity}</b> Siswa
                                </div>
                                {room.notes && (
                                    <div className="flex items-start gap-2 text-xs text-gray-500">
                                        <Info size={12} className="mt-0.5 flex-shrink-0" /> 
                                        <span className="line-clamp-1" title={room.notes}>{room.notes}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 pt-3 mt-3">
                                <div className="flex justify-between text-xs font-medium mb-1">
                                    <span className="text-gray-500">Okupansi Jadwal</span>
                                    <span className={usageCount > 40 ? 'text-red-500' : 'text-emerald-600'}>{usageCount} Jam</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div 
                                        className={`h-1.5 rounded-full transition-all ${usageCount > 40 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                        style={{ width: `${usagePercent}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {filteredRooms.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                    <School size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Tidak ada data ruangan yang ditemukan.</p>
                </div>
            )}
        </div>
      </div>

      {/* Edit Room Modal */}
      {editingRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          <Pencil size={18} className="text-blue-600" /> Edit Data Ruangan
                      </h3>
                      <button onClick={() => setEditingRoom(null)} className="text-gray-400 hover:text-gray-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Nama Ruangan</label>
                          <input 
                            type="text" 
                            required
                            value={editingRoom.name} 
                            onChange={(e) => setEditingRoom({...editingRoom, name: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-medium text-gray-500 mb-1">Tipe</label>
                             <select 
                                value={editingRoom.type}
                                onChange={(e) => setEditingRoom({...editingRoom, type: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                             >
                                <option value="Teori">Teori</option>
                                <option value="Laboratorium">Laboratorium</option>
                                <option value="Praktek">Praktek</option>
                                <option value="Khusus">Khusus</option>
                                <option value="Aula">Aula</option>
                             </select>
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Kapasitas (Siswa)</label>
                              <input 
                                type="number" 
                                required
                                value={editingRoom.capacity} 
                                onChange={(e) => setEditingRoom({...editingRoom, capacity: Number(e.target.value)})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Peruntukan Ruang (Alokasi)</label>
                          <input 
                            type="text" 
                            placeholder="Contoh: Basecamp X PPLG 1, Ruang Moving..."
                            value={editingRoom.allocation || ''} 
                            onChange={(e) => setEditingRoom({...editingRoom, allocation: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Kosongkan jika ruangan umum (moving class).</p>
                      </div>

                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Fungsi & Fasilitas Khusus</label>
                          <textarea 
                            rows={3}
                            placeholder="Contoh: Lab Komputer High Spec, Ada Proyektor, AC..."
                            value={editingRoom.notes || ''} 
                            onChange={(e) => setEditingRoom({...editingRoom, notes: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                          <button 
                            type="button"
                            onClick={() => setEditingRoom(null)} 
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                              Batal
                          </button>
                          <button 
                            type="submit" 
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                          >
                              <Save size={16} /> Simpan
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};