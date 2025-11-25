
import React, { useState } from 'react';
import { SCHOOL_LOGO } from '../constants';
import { Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onLogin: (password: string) => Promise<boolean>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    // Add small delay to prevent brute force
    await new Promise(r => setTimeout(r, 500));

    const success = await onLogin(password);
    if (success) {
       // Success handled by parent
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
         
         {/* Left Side (Visual) */}
         <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-900 to-indigo-900 p-10 flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                        <img src={SCHOOL_LOGO} alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">SMK N 1 Purbalingga</span>
                </div>
                <h2 className="text-3xl font-bold leading-tight mb-4">Manajemen Sekolah Terintegrasi & Cerdas.</h2>
                <p className="text-blue-200 text-sm leading-relaxed opacity-90">
                    Platform digital untuk pengelolaan kurikulum, jadwal, dan administrasi pembelajaran yang efisien dan transparan.
                </p>
            </div>

            <div className="relative z-10 text-xs text-blue-300/60">
                v2.5.0 Enterprise Edition
            </div>
         </div>
         
         {/* Right Side (Form) */}
         <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="text-center mb-10">
                <div className="md:hidden flex justify-center mb-6">
                     <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center shadow-sm">
                        <img src={SCHOOL_LOGO} alt="Logo" className="w-10 h-10 object-contain" />
                     </div>
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Kurikulum Smart Innovative</h1>
                <p className="text-sm text-slate-500">Sistem Informasi Manajemen Sekolah</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2 ml-1">Password Admin</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500" size={18} />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(false); }}
                            className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm focus:ring-4 outline-none transition-all ${error ? 'border-red-300 focus:ring-red-100 bg-red-50/50' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-400 hover:border-slate-300'}`}
                            placeholder="Masukkan kode akses..."
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5 font-medium animate-pulse"><ShieldCheck size={14}/> Akses ditolak. Periksa password Anda.</p>}
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <>Masuk Dashboard <ArrowRight size={18} /></>}
                </button>
            </form>

            <div className="mt-10 text-center">
                <p className="text-[10px] text-slate-400">
                    &copy; 2025 SMK Negeri 1 Purbalingga.<br/>
                    Kurikulum Smart Innovative System.
                </p>
            </div>
         </div>
      </div>
    </div>
  );
};
