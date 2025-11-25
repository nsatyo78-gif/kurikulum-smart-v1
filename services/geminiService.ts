import { GoogleGenAI, Type } from "@google/genai";
import { Teacher, GeneratedScheduleItem } from "../types";

// Support for Vite (import.meta.env) and standard process.env
// Note: In Netlify with Vite, variables must start with VITE_
const apiKey = ((import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) || process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateScheduleSuggestion = async (
  teachers: Teacher[],
  classes: string[],
  days: string[]
): Promise<GeneratedScheduleItem[]> => {
  // 1. Validasi API Key
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  // UPGRADE: Menggunakan Model Gemini 3 Pro untuk penalaran kompleks (Scheduling CSP)
  const model = "gemini-3-pro-preview";
  
  // Optimasi Payload: Kirim data guru yang memiliki jam mengajar saja
  // Kita ambil batch yang lebih besar (misal 40 guru aktif teratas) agar AI bisa memproses dengan baik
  // tanpa terkena timeout HTTP karena response yang terlalu besar.
  const activeTeachers = teachers
    .filter(t => t.teachingHours > 0)
    .sort((a, b) => b.teachingHours - a.teachingHours) // Prioritaskan guru dengan jam banyak
    .slice(0, 40); 

  // Ambil sampel kelas yang representatif (misal 12 kelas dari berbagai jurusan)
  // Untuk full automation seluruh sekolah, disarankan dilakukan per angkatan/batch.
  const targetClasses = classes.slice(0, 15); 

  const teacherData = activeTeachers.map(t => ({
    name: t.name,
    subjects: t.subjects,
    load: t.teachingHours // Memberi tahu AI beban jam guru
  }));

  const prompt = `
    Bertindaklah sebagai ahli pembuat jadwal sekolah (School Scheduler) profesional. 
    Tugas Anda adalah menyusun Jadwal Pelajaran (Roster) dalam format JSON.
    
    Data Guru & Beban Mengajar: 
    ${JSON.stringify(teacherData)}
    
    Daftar Kelas yang harus dijadwalkan: 
    ${JSON.stringify(targetClasses)}
    
    Hari Efektif: ${JSON.stringify(days)}
    Slot Jam Per Hari: [1, 2, 3, 4, 5, 6, 7, 8]

    CONSTRAINT (ATURAN WAJIB):
    1. NO CONFLICT: Satu guru TIDAK BOLEH mengajar di dua kelas berbeda pada (Hari, Jam) yang sama.
    2. DISTRIBUSI: Sebar jam mengajar guru secara merata, jangan menumpuk di satu hari jika memungkinkan.
    3. VALIDITAS: Guru hanya boleh mengajar mata pelajaran yang sesuai dengan datanya.
    4. KELAS: Pastikan setiap slot jadwal memiliki teacherName, className, subject, day, dan period yang valid.

    Output HANYA JSON Array murni.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Mengaktifkan Thinking Budget agar AI 'berpikir' untuk menyelesaikan konflik jadwal
        thinkingConfig: { thinkingBudget: 2048 }, 
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              period: { type: Type.INTEGER },
              className: { type: Type.STRING },
              subject: { type: Type.STRING },
              teacherName: { type: Type.STRING }
            }
          }
        }
      }
    });

    let text = response.text;
    if (!text) return [];

    // 3. Sanitasi Output: Hapus markdown block jika ada
    text = text.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(text) as GeneratedScheduleItem[];
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw error;
  }
};

export const generatePKLLetter = async (
  teacherName: string,
  studentName: string,
  companyName: string,
  dates: string
): Promise<string> => {
  // FALLBACK: Jika API Key tidak ada, gunakan Template Manual (Offline Mode)
  if (!apiKey) {
    const today = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
    return `
PEMERINTAH PROVINSI JAWA TENGAH
DINAS PENDIDIKAN DAN KEBUDAYAAN
SMK NEGERI 1 PURBALINGGA
Jl. Mayjen Sungkono, Selabaya, Kec. Kalimanah, Kab. Purbalingga 53371
================================================================================

                            SURAT TUGAS
                       Nomor: 800 / .... / 2025

Yang bertanda tangan di bawah ini:

Nama       : Maryono, S.Pd., M.Si.
NIP        : 19660701 200012 1 002
Jabatan    : Kepala Sekolah
Unit Kerja : SMK Negeri 1 Purbalingga

Memberikan tugas kepada:

Nama       : ${teacherName}
Jabatan    : Guru Pembimbing PKL

Untuk melaksanakan monitoring dan pembimbingan Praktik Kerja Lapangan (PKL) 
terhadap siswa sebagai berikut:

Nama Siswa : ${studentName}
Tempat PKL : ${companyName}
Waktu      : ${dates}

Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab.

Ditetapkan di: Purbalingga
Pada Tanggal : ${today}

Kepala Sekolah,


Maryono, S.Pd., M.Si.
NIP. 19660701 200012 1 002
    `.trim();
  }

  const model = "gemini-2.5-flash";
  const prompt = `
    Buatkan surat tugas resmi untuk guru pembimbing PKL (Praktik Kerja Lapangan) di SMK Negeri 1 Purbalingga.
    
    Data Sekolah:
    - Nama: SMK Negeri 1 Purbalingga
    - Alamat: Jl. Mayjen Sungkono, Selabaya, Kec. Kalimanah, Kab. Purbalingga
    - Kepala Sekolah: Maryono, S.Pd., M.Si.
    - NIP Kepala Sekolah: 19660701 200012 1 002
    
    Data Tugas:
    - Guru Pembimbing: ${teacherName}
    - Siswa yang Dibimbing: ${studentName}
    - Lokasi PKL: ${companyName}
    - Waktu Pelaksanaan: ${dates}
    
    Instruksi:
    - Format surat dinas resmi dengan Kop Surat (teks saja).
    - Sertakan Nomor Surat (dikosongkan/titik-titik).
    - Isi surat menyatakan penugasan guru tersebut untuk melakukan monitoring dan bimbingan PKL.
    - Bagian tanda tangan di kanan bawah lengkap dengan nama dan NIP Kepala Sekolah.
    - Gunakan bahasa Indonesia yang formal dan baku.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Gagal membuat surat.";
  } catch (error) {
    console.error("Error generating letter:", error);
    return "Terjadi kesalahan saat menghubungi AI.";
  }
};