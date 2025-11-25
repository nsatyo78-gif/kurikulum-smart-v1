import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Teacher, Student, DUDI, PKLAssignment, ScheduleSlot, Report } from '../types';
import { MOCK_TEACHERS, MOCK_STUDENTS, MOCK_DUDI, MOCK_PKL, MOCK_SCHEDULE, MOCK_REPORTS } from '../constants';

// ============================================================================
// KONFIGURASI DATABASE (SUPABASE)
// ============================================================================

// Priority: Environment Variables (Netlify/Vite) -> Hardcoded Fallback
// NOTE: Di Netlify Dashboard > Site settings > Environment variables, tambahkan:
// Key: VITE_SUPABASE_URL, Value: URL Project Supabase Anda
// Key: VITE_SUPABASE_KEY, Value: Anon/Public Key Supabase Anda

const HARDCODED_URL = "https://ihysnosogzyvjbsoqdbm.supabase.co";
const HARDCODED_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloeXNub3NvZ3p5dmpic29xZGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Nzg4NTgsImV4cCI6MjA3OTQ1NDg1OH0.57bTQS3vxratD23MMUvwyr7LTwvL3gdxn2Atrk8kK3Q";

const SUPABASE_URL = ((import.meta as any).env && (import.meta as any).env.VITE_SUPABASE_URL) || HARDCODED_URL;
const SUPABASE_ANON_KEY = ((import.meta as any).env && (import.meta as any).env.VITE_SUPABASE_KEY) || HARDCODED_KEY;

let supabase: SupabaseClient | null = null;

// Cek koneksi
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (error) {
        console.warn("⚠️ Gagal inisialisasi Supabase client:", error);
    }
}

// Helper untuk format error agar terbaca di console
const logError = (context: string, error: any) => {
    // Convert object error to string if possible to avoid [object Object]
    const errMsg = error?.message || JSON.stringify(error, null, 2);
    console.warn(`⚠️ ${context}:`, errMsg);
};

// ============================================================================
// GENERIC FETCH HELPER
// ============================================================================
const fetchFromSupabase = async <T>(
    tableName: string, 
    mockData: T[], 
    options: { orderBy?: string } = {}
): Promise<T[]> => {
    // Jika supabase belum init, langsung kembalikan mock
    if (!supabase) return mockData;

    try {
        let query = supabase.from(tableName).select('*');
        if (options.orderBy) {
            query = query.order(options.orderBy);
        }

        const { data, error } = await query;

        if (error) {
            // Log warning tapi jangan throw error, kembalikan mock data agar app tetap jalan
            logError(`Fetch Error (${tableName}) - Using Mock Data`, error);
            return mockData;
        }

        // Jika tabel kosong, kembalikan mock data (untuk demo)
        if (!data || data.length === 0) {
            // console.log(`Info: Table ${tableName} is empty, using mock data.`);
            return mockData;
        }

        return data as T[];
    } catch (e) {
        logError(`Network/Unknown Error (${tableName})`, e);
        return mockData;
    }
};

// ============================================================================
// FETCH FUNCTIONS (READ)
// ============================================================================

export const fetchTeachers = () => fetchFromSupabase<Teacher>('teachers', MOCK_TEACHERS, { orderBy: 'name' });
export const fetchStudents = () => fetchFromSupabase<Student>('students', MOCK_STUDENTS, { orderBy: 'name' });
export const fetchDUDI = () => fetchFromSupabase<DUDI>('dudi', MOCK_DUDI, { orderBy: 'name' });
export const fetchSchedule = () => fetchFromSupabase<ScheduleSlot>('schedule', MOCK_SCHEDULE);
export const fetchPKLAssignments = () => fetchFromSupabase<PKLAssignment>('pkl_assignments', MOCK_PKL);
export const fetchReports = () => fetchFromSupabase<Report>('reports', MOCK_REPORTS);

// ============================================================================
// CRUD FUNCTIONS (CREATE, UPDATE, DELETE)
// ============================================================================

// --- TEACHER ---
export const addTeacherToDB = async (teacher: Teacher): Promise<Teacher | null> => {
    if (supabase) {
        const { data, error } = await supabase
            .from('teachers')
            .insert(teacher)
            .select()
            .single();
        
        if (error) {
            logError('addTeacher', error);
            return null;
        }
        return data;
    }
    return teacher;
};

export const addTeachersBulkToDB = async (teachers: Teacher[]): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('teachers').insert(teachers);
        if (error) {
            logError('addTeachersBulk', error);
            return false;
        }
    }
    return true;
};

export const updateTeacherInDB = async (teacher: Teacher): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase
            .from('teachers')
            .update({
                name: teacher.name,
                nip: teacher.nip,
                status: teacher.status,
                subjects: teacher.subjects,
                maxHours: teacher.maxHours,
                teachingHours: teacher.teachingHours,
                additionalDuties: teacher.additionalDuties,
                phone: teacher.phone
            })
            .eq('id', teacher.id);
            
        if (error) {
            logError('updateTeacher', error);
            return false;
        }
    }
    return true;
};

// Feature: Promotion Teacher Bulk Update
export const updateTeachersBulkInDB = async (teachers: Teacher[]): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('teachers').upsert(teachers);
        if (error) {
            logError('updateTeachersBulk', error);
            return false;
        }
    }
    return true;
};

export const deleteTeacherFromDB = async (id: string): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('teachers').delete().eq('id', id);
        if (error) {
            logError('deleteTeacher', error);
            return false;
        }
    }
    return true;
};

// --- STUDENT ---
export const addStudentToDB = async (student: Student): Promise<Student | null> => {
    if (supabase) {
        const { data, error } = await supabase
            .from('students')
            .insert(student)
            .select()
            .single();
            
        if (error) {
            logError('addStudent', error);
            return null;
        }
        return data;
    }
    return student;
};

export const updateStudentInDB = async (student: Student): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase
            .from('students')
            .update({
                nis: student.nis,
                name: student.name,
                className: student.className,
                gender: student.gender,
                status: student.status,
                parentName: student.parentName,
                parentPhone: student.parentPhone,
                address: student.address
            })
            .eq('id', student.id);
            
        if (error) {
            logError('updateStudent', error);
            return false;
        }
    }
    return true;
};

export const addStudentsBulkToDB = async (students: Student[]): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('students').insert(students);
        if (error) {
            logError('addStudentsBulk', error);
            return false;
        }
    }
    return true;
};

// Feature: Promotion Student Bulk Update
export const updateStudentsBulkInDB = async (students: Student[]): Promise<boolean> => {
    if (supabase) {
        // upsert works as update if ID matches primary key
        const { error } = await supabase.from('students').upsert(students);
        if (error) {
            logError('updateStudentsBulk', error);
            return false;
        }
    }
    return true;
};

export const deleteStudentFromDB = async (id: string): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) {
            logError('deleteStudent', error);
            return false;
        }
    }
    return true;
};

// --- DUDI ---
export const addDudiToDB = async (dudi: DUDI): Promise<DUDI | null> => {
    if (supabase) {
        const { data, error } = await supabase
            .from('dudi')
            .insert(dudi)
            .select()
            .single();
            
        if (error) {
            logError('addDudi', error);
            return null;
        }
        return data;
    }
    return dudi;
};

export const addDudiBulkToDB = async (dudiList: DUDI[]): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('dudi').insert(dudiList);
        if (error) {
            logError('addDudiBulk', error);
            return false;
        }
    }
    return true;
};

export const deleteDudiFromDB = async (id: string): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('dudi').delete().eq('id', id);
        if (error) {
            logError('deleteDudi', error);
            return false;
        }
    }
    return true;
};

// --- PKL ---
export const addPKLAssignmentToDB = async (pkl: PKLAssignment): Promise<PKLAssignment | null> => {
    if (supabase) {
        const { data, error } = await supabase
            .from('pkl_assignments')
            .insert(pkl)
            .select()
            .single();
            
        if (error) {
            logError('addPKL', error);
            return null;
        }
        return data;
    }
    return pkl;
};

export const addPKLAssignmentsBulkToDB = async (pklList: PKLAssignment[]): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('pkl_assignments').insert(pklList);
        if (error) {
            logError('addPKLAssignmentsBulk', error);
            return false;
        }
    }
    return true;
};

export const updatePKLAssignmentToDB = async (pkl: PKLAssignment): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase
            .from('pkl_assignments')
            .update({
                monitoringUrl: pkl.monitoringUrl,
                lastMonitoringDate: pkl.lastMonitoringDate,
                status: pkl.status
            })
            .eq('id', pkl.id);
            
        if (error) {
            logError('updatePKL', error);
            return false;
        }
    }
    return true;
};

export const deletePKLAssignmentFromDB = async (id: string): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('pkl_assignments').delete().eq('id', id);
        if (error) {
            logError('deletePKL', error);
            return false;
        }
    }
    return true;
};

// --- REPORTS (New) ---
export const updateReportInDB = async (report: Report): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase
            .from('reports')
            .update({
                status: report.status,
                evidenceUrl: report.evidenceUrl,
                supervisionNotes: report.supervisionNotes,
                supervisionScore: report.supervisionScore,
                lastUpdated: new Date().toISOString()
            })
            .eq('id', report.id);

        if (error) {
            logError('updateReport', error);
            return false;
        }
    }
    return true;
};

export const addReportToDB = async (report: Report): Promise<Report | null> => {
     if (supabase) {
        const { data, error } = await supabase
            .from('reports')
            .insert(report)
            .select()
            .single();
            
        if (error) {
            logError('addReport', error);
            return null;
        }
        return data;
    }
    return report;
};

// --- SCHEDULE ---
export const saveScheduleToDB = async (schedule: ScheduleSlot[]): Promise<boolean> => {
    if (supabase) {
        // Karena jadwal sering berubah total saat di-generate ulang,
        // kita menggunakan Upsert untuk ID yang sama.
        const { error } = await supabase.from('schedule').upsert(schedule);
        
        if (error) {
            logError('saveSchedule', error);
            return false;
        }
    }
    return true;
};