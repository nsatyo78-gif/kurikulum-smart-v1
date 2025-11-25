
export enum StaffRole {
  TEACHER = 'Guru',
  ADMIN = 'Admin',
  HEAD_OF_PROGRAM = 'Kaprodi'
}

export enum ReportStatus {
  PENDING = 'Belum Dikumpulkan',
  SUBMITTED = 'Sudah Dikumpulkan',
  VERIFIED = 'Terverifikasi',
  REJECTED = 'Ditolak'
}

export type DutyType = 
  | 'KepalaSekolah'
  | 'WakaKurikulum'
  | 'WakaHumas'
  | 'WakaKesiswaan'
  | 'WakaSarpras'
  | 'WaliKelas' 
  | 'GuruWali' 
  | 'Kakomli'
  | 'Staf'
  | 'Koordinator'
  | 'PembinaEkskul' 
  | 'KoordinatorKokurikuler'
  | 'KepalaLab'
  | 'Bendahara'
  | 'TimPengembang'
  | 'WMM'
  | 'Lainnya';

export type EmployeeStatus = 'PNS' | 'PPPK' | 'Guru Tamu' | 'GTT' | 'Guru Kontrak';

export interface AdditionalDuty {
  type: DutyType;
  description: string; // e.g., "X RPL 1" or "Pramuka"
  equivalentHours: number;
}

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  status: EmployeeStatus; 
  subjects: string[];
  maxHours: number;
  teachingHours: number; 
  additionalDuties: AdditionalDuty[];
  phone?: string; // Added phone number
}

export interface ScheduleSlot {
  id: string;
  day: string;
  period: number;
  className: string;
  subject: string;
  teacherId: string;
  roomId?: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  className: string;
  gender: 'L' | 'P';
  status: 'Aktif' | 'Lulus' | 'Mutasi' | 'Keluar';
  parentName?: string; 
  parentPhone?: string; 
  address?: string; // Added address
  mentorId?: string; // ID Guru Wali (Mentor) Individual
}

export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  allocation?: string; 
  notes?: string; 
}

export interface PKLAssignment {
  id: string;
  studentName: string;
  companyName: string;
  teacherId: string; 
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'Pending';
  monitoringUrl?: string; // Link bukti jurnal kegiatan monitoring guru
  lastMonitoringDate?: string;
}

export interface DUDI {
  id: string;
  name: string;
  field: string; 
  jurusanIds?: string[]; // Array of major codes (e.g., ['TJKT', 'PPLG'])
  address: string;
  contactPerson: string;
  phone: string;
  quota: number;
  website?: string;
  email?: string;
  npwp?: string;
  coordinates?: { lat: string; lng: string }; 
}

export type ReportCategory = 'Administrasi' | 'Kinerja' | 'Supervisi' | 'Lainnya';

export interface Report {
  id: string;
  teacherId: string;
  title: string;
  category: ReportCategory;
  dueDate: string;
  status: ReportStatus;
  submissionLink?: string; // Main submission link (deprecated in favor of evidenceUrl but kept for compatibility)
  evidenceUrl?: string; // Link to physical evidence (GDrive, PDF, Photo)
  supervisionNotes?: string; // Notes from the principal/supervisor
  supervisionScore?: number; // Score 0-100
  lastUpdated?: string;
}

export interface GeneratedScheduleItem {
  day: string;
  period: number;
  className: string;
  subject: string;
  teacherName: string;
}

export interface CurriculumItem {
  name: string;
  intra: number | string;
  p5: number | string;
  total: number | string;
  isHeader?: boolean;
  isTotal?: boolean;
}

export interface CurriculumSection {
  title: string;
  items: CurriculumItem[];
  subTotal?: CurriculumItem;
}
