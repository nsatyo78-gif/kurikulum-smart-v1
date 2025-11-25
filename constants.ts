
import { Teacher, ScheduleSlot, PKLAssignment, Report, ReportStatus, CurriculumSection, Student, Room, DUDI } from './types';

export const SCHOOL_LOGO = "https://upload.wikimedia.org/wikipedia/id/thumb/a/a4/Logo_SMK_Negeri_1_Purbalingga.png/200px-Logo_SMK_Negeri_1_Purbalingga.png";

// Helper to generate class names based on the user's specific structure
// Updated to support specific list provided by user (Mixing Merdeka & K13 codes)

export const CLASS_NAMES: string[] = [
  // KELAS X (Kurikulum Merdeka)
  'X AKL 1', 'X AKL 2', 'X AKL 3',
  'X MPLB 1', 'X MPLB 2', 'X MPLB 3',
  'X KDS',
  'X KLN',
  'X PM 1', 'X PM 2',
  'X PPLG 1', 'X PPLG 2',
  'X TJKT 1', 'X TJKT 2',

  // KELAS XI (Campuran/Legacy)
  'XI AK 1', 'XI AK 2', 'XI AK 3',
  'XI MP 1', 'XI MP 2', 'XI MP 3',
  'XI TKKR',
  'XI KLN',
  'XI BD',
  'XI BR',
  'XI RPL 1', 'XI RPL 2',
  'XI TKJ 1', 'XI TKJ 2',

  // KELAS XII (Campuran/Legacy)
  'XII AK 1', 'XII AK 2', 'XII AK 3',
  'XII MP 1', 'XII MP 2', 'XII MP 3',
  'XII TKKR',
  'XII KLN',
  'XII BD',
  'XII BR',
  'XII RPL 1', 'XII RPL 2',
  'XII TKJ 1', 'XII TKJ 2'
];

export const MAJORS_LIST = [
  { code: 'AKL', name: 'Akuntansi dan Keuangan Lembaga' },
  { code: 'AK', name: 'Akuntansi (Legacy)' },
  { code: 'MPLB', name: 'Manajemen Perkantoran' },
  { code: 'MP', name: 'Manajemen Perkantoran (Legacy)' },
  { code: 'PM', name: 'Pemasaran' },
  { code: 'BD', name: 'Bisnis Digital' },
  { code: 'BR', name: 'Bisnis Ritel' },
  { code: 'PPLG', name: 'Pengembangan Perangkat Lunak & Gim' },
  { code: 'RPL', name: 'Rekayasa Perangkat Lunak (Legacy)' },
  { code: 'TJKT', name: 'Teknik Jaringan Komp. & Telekom.' },
  { code: 'TKJ', name: 'Teknik Komputer Jaringan (Legacy)' },
  { code: 'KLN', name: 'Kuliner' },
  { code: 'KDS', name: 'Kecantikan dan Spa' },
  { code: 'TKKR', name: 'Tata Kecantikan (Legacy)' },
];

// Helper to create teachers cleanly
const createTeacher = (id: number, name: string, nip: string, status: any, subjectsRaw: string, duties: any[] = [], teachingHours = 24): Teacher => {
  const subjects = subjectsRaw.split(',').map(s => s.trim().replace(/^-$/, '')).filter(s => s);
  // Generate fake phone number for demo
  const phone = `628${Math.floor(1000000000 + Math.random() * 9000000000).toString().substring(0, 10)}`;
  
  return {
    id: `t${id}`,
    name,
    nip,
    status,
    subjects,
    maxHours: 24,
    teachingHours,
    additionalDuties: duties,
    phone: phone
  };
};

export const MOCK_TEACHERS: Teacher[] = [
  // PNS (1-36)
  createTeacher(1, 'Maryono, S.Pd., M.Si.', '196607012000121002', 'PNS', 'Kepala Sekolah', [{type: 'KepalaSekolah', description: 'Kepala Sekolah', equivalentHours: 24}], 0),
  createTeacher(2, 'Dra. Sri Mularsih', '196706201994122001', 'PNS', 'Matematika', [{type: 'WaliKelas', description: 'X MPLB 1', equivalentHours: 2}], 21),
  createTeacher(3, 'Drs. Fiva Widiarto', '196510231996011002', 'PNS', 'Seni Budaya', [{type: 'GuruWali', description: 'X MPLB 1', equivalentHours: 2}], 28),
  createTeacher(4, 'Wahyu Budi Susapti, S.Pd, MM.', '197207291997022002', 'PNS', 'Konsentrasi MP', [{type: 'Kakomli', description: 'Kakomli KDS', equivalentHours: 12}], 24),
  createTeacher(5, 'Marwoto, S.Pd, S.Kom', '196904082000121001', 'PNS', 'Konsentrasi TJKT', [{type: 'GuruWali', description: 'X TJKT 1', equivalentHours: 2}], 18),
  createTeacher(6, 'Sri Endah Swarastuti, S.Pd', '197407022003122004', 'PNS', 'Project IPAS', [{type: 'Staf', description: 'Staf Sarpras Ur. LH', equivalentHours: 4}, {type: 'PembinaEkskul', description: 'KIR', equivalentHours: 2}], 24),
  createTeacher(7, 'Dra. Cukat Budi Rahayu', '196901121994032010', 'PNS', 'Bahasa Inggris', [{type: 'WaliKelas', description: 'X AKL 1', equivalentHours: 2}], 32),
  createTeacher(8, 'Dra. Diah Ayu Supriyanti', '196603261994122004', 'PNS', 'Pendidikan Pancasila', [{type: 'GuruWali', description: 'X AKL 1', equivalentHours: 2}], 24),
  createTeacher(9, 'Justina Trirahaju Leksanawati, S.Pd., M.Si.', '197104162003122006', 'PNS', 'Konsentrasi KLN, Dasar-Dasar KLN', [{type: 'Lainnya', description: 'Direktur LSP P1', equivalentHours: 6}, {type: 'Kakomli', description: 'Kakomli KLN', equivalentHours: 12}], 24),
  createTeacher(10, 'Sri Wahyuni, S.Pd', '197008022002122004', 'PNS', 'Konsentrasi AK, PKWU', [{type: 'WaliKelas', description: 'XI AK 2', equivalentHours: 2}], 24),
  createTeacher(11, 'Dwi Agus Tri M.M., S.Pd', '197102232002122004', 'PNS', 'Matematika', [{type: 'WaliKelas', description: 'XI KLN', equivalentHours: 2}], 10),
  createTeacher(12, 'Sumardi, S.Pd., S.Kom', '197305272003121002', 'PNS', 'Dasar-Dasar TJKT, Konsentrasi TJKT', [{type: 'WakaSarpras', description: 'WKS Sarana Prasarana', equivalentHours: 12}], 18),
  createTeacher(13, 'Agung Pamuji, S.Pd', '197402132005011008', 'PNS', 'Konsentrasi AK', [{type: 'Kakomli', description: 'Kakomli MPLB', equivalentHours: 12}], 27),
  createTeacher(14, 'Retnowati, S.Pd', '197303272005012009', 'PNS', 'Konsentrasi AK, PKWU', [{type: 'Kakomli', description: 'Kakomli AKL & Peminatan', equivalentHours: 12}], 12),
  createTeacher(15, 'Tony Eka Martin Wibowo, S.Si.', '197912092005011004', 'PNS', 'Project IPAS', [{type: 'Staf', description: 'Staf Sarpras Ur. Sarpras', equivalentHours: 4}, {type: 'WaliKelas', description: 'X PM 1', equivalentHours: 2}], 30),
  createTeacher(16, 'Nur Romlah, S.Pd', '197509082008012008', 'PNS', 'Konsentrasi MP', [{type: 'Staf', description: 'Plt Ka Tata Usaha', equivalentHours: 12}], 9),
  createTeacher(17, 'Deddy Suwito, S.Kom', '197209022006041013', 'PNS', 'Konsentrasi PPLG', [{type: 'Koordinator', description: 'Koordinator Tefa', equivalentHours: 12}], 30),
  createTeacher(18, 'Agus Wuryanto, S.Pd', '197503222006041002', 'PNS', 'Bimbingan Konseling', [
    {type: 'Staf', description: 'Staf Sarpras Ur. Sarana', equivalentHours: 4},
    {type: 'Lainnya', description: 'Membimbing 321 Siswa', equivalentHours: 0}
  ], 24),
  createTeacher(19, 'Tri Puji Utami, S.Kom', '198304252009032009', 'PNS', 'Informatika, Dasar-Dasar TJKT, PKWU', [{type: 'GuruWali', description: 'X PPLG 1', equivalentHours: 2}], 26),
  createTeacher(20, 'Puji Pertiwi Sayekti, S.Pd', '196805102005012011', 'PNS', 'Dasar-dasar Manajemen, Konsentrasi MP', [{type: 'WaliKelas', description: 'X MPLB 2', equivalentHours: 2}], 24),
  createTeacher(21, 'Nur Fajriyahti, S.Pd.', '197005212007012014', 'PNS', 'Dasar-dasar Manajemen, Konsentrasi MP', [{type: 'Lainnya', description: 'Peminatan MPLB', equivalentHours: 2}], 18),
  createTeacher(22, 'Srirahayu, S.Pd.', '197408042008012009', 'PNS', 'Konsentrasi AK, Dasar-Dasar AKL', [{type: 'WaliKelas', description: 'XI AK 1', equivalentHours: 2}], 24),
  createTeacher(23, 'Romidin, S.Pd', '197505052008011021', 'PNS', 'Konsentrasi MP, Mapel Pilihan', [{type: 'WakaHumas', description: 'WKS Humas', equivalentHours: 12}], 13),
  createTeacher(24, 'Teguh Cahyono, S.Pd.', '198110232006041010', 'PNS', 'Penjasorkes', [{type: 'WaliKelas', description: 'X TJKT 2', equivalentHours: 2}], 24),
  createTeacher(25, 'Seto Eko Purwanto, S.Si', '197804232010011009', 'PNS', 'Matematika', [{type: 'Staf', description: 'Staf Khusus SDM', equivalentHours: 4}], 24),
  createTeacher(26, 'Nelly Amaliyah, S.Psi', '197907032010012019', 'PNS', 'Bimbingan Konseling', [
    {type: 'Koordinator', description: 'Koord BK', equivalentHours: 12}, 
    {type: 'Staf', description: 'Staf Humas Ur. Kesra', equivalentHours: 4}, 
    {type: 'Lainnya', description: 'BKK', equivalentHours: 2},
    {type: 'Lainnya', description: 'Membimbing 320 Siswa', equivalentHours: 0}
  ], 24),
  createTeacher(27, 'Satyo Nugroho, S.Kom.', '197807142009031006', 'PNS', 'Dasar-Dasar TJKT, PKWU', [{type: 'WakaKurikulum', description: 'WKS Kurikulum', equivalentHours: 12}], 28),
  createTeacher(28, 'Suratno, S.Pd', '198409032010011012', 'PNS', 'Bahasa Jawa', [{type: 'WakaKesiswaan', description: 'WKS Kesiswaan', equivalentHours: 12}], 27),
  createTeacher(29, 'Vektor Realita Aditopo, S.Pd', '198603312011011003', 'PNS', 'Bahasa Indonesia', [{type: 'WaliKelas', description: 'XII KLN', equivalentHours: 2}], 25),
  createTeacher(30, 'Adi Setiawan, S.Pd.', '199012292014021001', 'PNS', 'Dasar-Dasar PPLG, Konsentrasi PPLG', [{type: 'TimPengembang', description: 'TPS', equivalentHours: 4}], 33),
  createTeacher(31, 'Galih Tyas Anjari, S.Pd.', '199201212014022001', 'PNS', 'Mapel Pilihan, Konsentrasi PPLG', [{type: 'Kakomli', description: 'Kakomli PPLG', equivalentHours: 12}], 24),
  createTeacher(32, 'Deti Lestiyorini, S.Pd.', '198912142014022001', 'PNS', 'Informatika, Konsentrasi TJKT', [{type: 'WMM', description: 'WMM', equivalentHours: 6}, {type: 'Lainnya', description: 'Ketua Kopsis', equivalentHours: 2}], 20),
  createTeacher(33, 'Mahzun, S.Pd I', '197601072008011009', 'PNS', 'Pendidikan Agama Islam', [{type: 'PembinaEkskul', description: 'Rohis', equivalentHours: 2}], 24),
  createTeacher(34, 'Sugeng Pitoyo, S.Pd.', '197311032008011002', 'PNS', 'Bahasa Jawa', [{type: 'GuruWali', description: 'X AKL 2', equivalentHours: 2}], 28),
  createTeacher(35, 'Asriyatun, S.Pd', '199208262020122009', 'PNS', 'Konsentrasi AK, Informatika', [{type: 'Staf', description: 'Staf SDM', equivalentHours: 4}, {type: 'WaliKelas', description: 'XII AK 2', equivalentHours: 2}], 12),
  createTeacher(36, 'Nur Laeli, S.Pd', '199704112020122011', 'PNS', 'Konsentrasi AK, Dasar-Dasar AKL, Informatika', [{type: 'Bendahara', description: 'Bendahara BOS', equivalentHours: 6}], 9),

  // PPPK (37-74)
  createTeacher(37, 'Sepudin Zupri, S.Kom', '197010222022211001', 'PPPK', 'Konsentrasi TJKT', [{type: 'Kakomli', description: 'Kakomli TJKT', equivalentHours: 12}], 20),
  createTeacher(38, 'Arif Nurokhman, S.Pd', '198010172022211002', 'PPPK', 'Penjasorkes', [{type: 'Staf', description: 'Staf Sarpras', equivalentHours: 4}, {type: 'WaliKelas', description: 'XI TKJ 2', equivalentHours: 2}, {type: 'PembinaEkskul', description: 'Semapala/Voli', equivalentHours: 2}], 24),
  createTeacher(39, 'Elis Sugiarti, S.Pd.', '198503072022212028', 'PPPK', 'Bahasa Jepang', [{type: 'WaliKelas', description: 'XI TKJ 1', equivalentHours: 2}, {type: 'PembinaEkskul', description: 'Pramuka', equivalentHours: 2}], 28),
  createTeacher(40, 'Sudiyarti, S.Pd', '198511182022212012', 'PPPK', 'Matematika', [{type: 'Staf', description: 'Staf Kurikulum', equivalentHours: 4}, {type: 'WaliKelas', description: 'XII TKJ 2', equivalentHours: 2}], 23),
  createTeacher(41, 'Otiah, S.Pd.', '198802242022212013', 'PPPK', 'Bahasa Indonesia', [{type: 'Staf', description: 'Staf Sarpras', equivalentHours: 4}, {type: 'Koordinator', description: 'Ka. Perpus', equivalentHours: 6}, {type: 'WaliKelas', description: 'XII TKKR', equivalentHours: 2}], 26),
  createTeacher(42, 'Nova Ristya W.P., S.Pd', '198811042022211004', 'PPPK', 'Bimbingan & Konseling', [
    {type: 'PembinaEkskul', description: 'Pembina OSIS', equivalentHours: 2}, 
    {type: 'Lainnya', description: 'BKK', equivalentHours: 2},
    {type: 'Lainnya', description: 'Membimbing 316 Siswa', equivalentHours: 0}
  ], 24),
  createTeacher(43, 'Menik Yuni Hartini, S.Pd.', '198906292022212008', 'PPPK', 'Konsentrasi PM, Digital Marketing', [{type: 'Kakomli', description: 'Kakomli PM', equivalentHours: 12}], 26),
  createTeacher(44, 'Baiq Nur Aisyah, S.Pd.', '198909222022212005', 'PPPK', 'Bahasa Jawa, Seni Budaya', [{type: 'WaliKelas', description: 'X PM 2', equivalentHours: 2}, {type: 'PembinaEkskul', description: 'Karawitan', equivalentHours: 2}], 28),
  createTeacher(45, 'Sulistiono, S.Pd.', '199112202022211007', 'PPPK', 'Pendidikan Pancasila, Sejarah', [{type: 'Staf', description: 'Staf Kesiswaan Ur. TPPK', equivalentHours: 4}, {type: 'Lainnya', description: 'Pengurus Kopsis', equivalentHours: 2}], 32),
  createTeacher(46, 'Isria Rizqona Firdausyi, S.Pd.', '199201312022212011', 'PPPK', 'Sejarah Indonesia', [{type: 'Staf', description: 'Staf SDM', equivalentHours: 4}, {type: 'WaliKelas', description: 'X MPLB 1', equivalentHours: 2}], 32),
  createTeacher(47, 'Hindun Fatmawati, S.Pd.', '199210042022212007', 'PPPK', 'Konsentrasi AK, Mapel Pilihan', [{type: 'WaliKelas', description: 'X AKL 1', equivalentHours: 2}], 29),
  createTeacher(48, 'Ana Nurlatifah, S.Pd.', '199304032022212014', 'PPPK', 'Matematika', [{type: 'Staf', description: 'Staf Kurikulum Ur. KBM', equivalentHours: 4}], 15),
  createTeacher(49, 'Dwi Inayah Rahmawati, M.Pd.', '199311282022212011', 'PPPK', 'Matematika', [{type: 'Bendahara', description: 'Bendahara BOP', equivalentHours: 6}, {type: 'WaliKelas', description: 'XI MP 2', equivalentHours: 2}], 24),
  createTeacher(50, 'Danu Dwi Jatmiko, S.Pd.', '199401192022211003', 'PPPK', 'IPAS', [{type: 'PembinaEkskul', description: 'MPK', equivalentHours: 2}], 30),
  createTeacher(51, 'Restu Afri Widhi Hastutiningsih, S.Pd.', '199604032022212009', 'PPPK', 'Konsentrasi PPLG, PKWU, Informatika', [{type: 'Staf', description: 'Staf Humas Ur. PKL', equivalentHours: 4}, {type: 'WaliKelas', description: 'X PPLG 1', equivalentHours: 2}], 28),
  createTeacher(52, 'Nining Setiani, S.Pd.', '199610102022212008', 'PPPK', 'Dasar-dasar PPLG, Informatika, PKWU', [{type: 'Staf', description: 'Staf Humas Ur. PKL', equivalentHours: 4}, {type: 'WaliKelas', description: 'XII RPL 2', equivalentHours: 2}], 28),
  createTeacher(53, 'Kukuh Pribadi, S.Pd.', '198610232022211006', 'PPPK', 'Mapel Pilihan (Seni Musik)', [{type: 'PembinaEkskul', description: 'Musik', equivalentHours: 2}], 28),
  createTeacher(54, 'Yekti Apriyoni, S.Pd.', '197804272023212002', 'PPPK', 'Sejarah, Pendidikan Pancasila', [{type: 'Staf', description: 'Staf SDM', equivalentHours: 4}, {type: 'WaliKelas', description: 'XI BD', equivalentHours: 2}], 32),
  createTeacher(55, 'Novita Adhimurti, S.Pd.', '197811142023212001', 'PPPK', 'PKWU, Informatika', [{type: 'WaliKelas', description: 'X AKL 3', equivalentHours: 2}], 29),
  createTeacher(56, 'Khamsyatun Yudiana, S.Pd.I.', '198207132023212011', 'PPPK', 'PAI', [{type: 'WaliKelas', description: 'X PPLG 2', equivalentHours: 2}], 33),
  createTeacher(57, 'Nanang Cahyana, S.Pd.Ing.', '198603172023211003', 'PPPK', 'Bahasa Inggris', [{type: 'PembinaEkskul', description: 'English Club', equivalentHours: 2}], 32),
  createTeacher(58, 'Waskito Ismu Hastomo, S.Pd.', '198606092023211007', 'PPPK', 'Informatika, PKWU', [{type: 'Staf', description: 'Staf Tefa/Bendahara', equivalentHours: 4}, {type: 'WaliKelas', description: 'X AKL 2', equivalentHours: 2}, {type: 'PembinaEkskul', description: 'PMR', equivalentHours: 2}], 28),
  createTeacher(59, 'Lely Erawati, S.Pd.', '198708212023212018', 'PPPK', 'Pendidikan Pancasila, Sejarah', [{type: 'WaliKelas', description: 'XI MP 1', equivalentHours: 2}, {type: 'PembinaEkskul', description: 'Pramuka', equivalentHours: 2}], 24),
  createTeacher(60, 'Septian Endro Laksono, S.Pd.', '199009052023211004', 'PPPK', 'Informatika, PKWU', [{type: 'Staf', description: 'Staf Kurikulum/Sarpras', equivalentHours: 4}, {type: 'PembinaEkskul', description: 'Paskas', equivalentHours: 2}], 29),
  createTeacher(61, 'Firmanika Rozaqi, S.Pd.', '199104242023212024', 'PPPK', 'Bahasa Indonesia', [{type: 'WaliKelas', description: 'XI RPL 1', equivalentHours: 2}, {type: 'PembinaEkskul', description: 'Broadcasting', equivalentHours: 2}], 27),
  createTeacher(62, 'Devi Artati, S.Pd.', '199210112023212020', 'PPPK', 'Bahasa Indonesia', [{type: 'WaliKelas', description: 'X AKL 3', equivalentHours: 2}, {type: 'PembinaEkskul', description: 'PMR', equivalentHours: 2}], 30),
  createTeacher(63, 'Soviatun Khasanah, S.Pd.', '199606302023212006', 'PPPK', 'Konsentrasi PM, PKWU, Dasar-Dasar Pemasaran', [{type: 'WMM', description: 'Staf WMM', equivalentHours: 4}, {type: 'WaliKelas', description: 'XII BD', equivalentHours: 2}], 30),
  createTeacher(64, 'Miftah Iskandar, S.Pd.', '198512112023211006', 'PPPK', 'Bahasa Inggris', [{type: 'Staf', description: 'Staf TPS', equivalentHours: 4}, {type: 'WaliKelas', description: 'XII RPL 1', equivalentHours: 2}, {type: 'PembinaEkskul', description: 'English Club', equivalentHours: 2}], 36),
  createTeacher(65, 'Dista Puspitasari Adi, S.Pd.', '198603182024212004', 'PPPK', 'Konsentrasi MP', [{type: 'WaliKelas', description: 'XI MP 3', equivalentHours: 2}], 38),
  createTeacher(66, 'Rita Wijiarti, S.Pd.', '199410172024212021', 'PPPK', 'Dasar-Dasar KDS, Konsentrasi KDS', [{type: 'WaliKelas', description: 'X KDS', equivalentHours: 2}, {type: 'Lainnya', description: 'Peminatan KDS', equivalentHours: 2}], 28),
  createTeacher(67, 'Safa Aulia Astri, S.Sos', '199607212024212021', 'PPPK', 'Bimbingan Konseling', [
    {type: 'Lainnya', description: 'Membimbing 279 Siswa', equivalentHours: 0}
  ], 24),
  createTeacher(68, 'Agus Sutono, S.Pd.', '197406182025211007', 'PPPK', 'PKWU (PKDK)', [{type: 'Staf', description: 'Staf Humas/Sarpras', equivalentHours: 4}, {type: 'PembinaEkskul', description: 'KIK', equivalentHours: 2}], 30),
  createTeacher(69, 'Yanti Karadina, S.Pd.', '197512172025212006', 'PPPK', 'Dasar-Dasar Manajemen, Konsentrasi MP', [{type: 'WaliKelas', description: 'XI MP 2', equivalentHours: 2}], 28),
  createTeacher(70, 'Widia Sukaesih, S.E.', '197810082025212008', 'PPPK', 'Dasar-Dasar Pemasaran, Konsentrasi PM, PKWU', [{type: 'WaliKelas', description: 'XII TKJ 1', equivalentHours: 2}], 30),
  createTeacher(71, 'Triyanto, S.Pd.', '198411252025211021', 'PPPK', 'Penjasorkes', [{type: 'WaliKelas', description: 'X KLN', equivalentHours: 2}, {type: 'PembinaEkskul', description: 'Bola Volly', equivalentHours: 2}], 24),
  createTeacher(72, 'Inayatul Munawaroh, S.Pd.', '199301062025212023', 'PPPK', 'Konsentrasi KDS', [{type: 'WaliKelas', description: 'XII TKKR', equivalentHours: 2}], 6),
  createTeacher(73, 'Danu Setio Aji, S.Pd.', '199310162025211021', 'PPPK', 'Penjasorkes', [{type: 'WaliKelas', description: 'XI BR', equivalentHours: 2}], 22),
  createTeacher(74, 'Hera Dwi Suryandari, S.Pd.', '199312262025212012', 'PPPK', 'Pengelolaan Rapat, Adm. Umum, Kewirausahaan', [{type: 'WaliKelas', description: 'X MPLB 3', equivalentHours: 2}], 30),
  createTeacher(75, 'Slamet Suparman, S.Pd.', '-', 'GTT', 'Informatika, Konsentrasi PM, Bisnis Ritel', [], 30),
  createTeacher(76, 'Devi Dwi Wahyuni, S.Pd.', '-', 'GTT', 'PAI', [{type: 'Lainnya', description: 'Pengurus Kopsis', equivalentHours: 2}, {type: 'WaliKelas', description: 'XI RPL 2', equivalentHours: 2}], 30),
  createTeacher(77, 'Muhammad Idris Afandi, S.S., M.Pd.', '-', 'GTT', 'Bahasa Indonesia', [{type: 'Staf', description: 'Staf Humas', equivalentHours: 4}, {type: 'Lainnya', description: 'BKK', equivalentHours: 2}, {type: 'PembinaEkskul', description: 'Pramuka', equivalentHours: 2}], 7),
  createTeacher(78, 'Rindhi Rezqi Hertindha, M.Pd.', '-', 'Guru Kontrak', 'Bimbingan Konseling', [
    {type: 'Lainnya', description: 'Membimbing 249 Siswa', equivalentHours: 0}
  ], 24),
  createTeacher(79, 'Seli Fadriyah, S.Pd.', '-', 'Guru Kontrak', 'PAI', [{type: 'PembinaEkskul', description: 'Rohis', equivalentHours: 2}], 30),
  createTeacher(80, 'Pia Celestine, S.Pd.', '-', 'Guru Kontrak', 'Peminatan Kuliner', [], 30),
  createTeacher(81, 'Nurhidayah, S.S., M.Pd.', '-', 'Guru Kontrak', 'Bahasa Inggris', [], 36),
  createTeacher(82, 'Prana Prakasita, S.Pd.', '-', 'Guru Kontrak', 'Dasar-Dasar Kuliner, Konsentrasi Kuliner', [], 26),
  createTeacher(83, 'Rita Puspitasari, S.Pd.', '-', 'Guru Kontrak', 'Bahasa Inggris', [], 32)
];

export const MOCK_ROOMS: Room[] = [
    { id: 'r1', name: 'R. 1', type: 'Teori', capacity: 36 },
    { id: 'r2', name: 'R. 2', type: 'Teori', capacity: 36 },
    { id: 'r3', name: 'R. 3', type: 'Teori', capacity: 36 },
    { id: 'r4', name: 'R. 4', type: 'Teori', capacity: 36 },
    { id: 'r6', name: 'R. 6', type: 'Teori', capacity: 36 },
    { id: 'r7', name: 'R. 7', type: 'Teori', capacity: 36 },
    { id: 'r8', name: 'R. 8', type: 'Teori', capacity: 36 },
    { id: 'r9', name: 'R. 9', type: 'Teori', capacity: 36 },
    { id: 'r10', name: 'R. 10', type: 'Teori', capacity: 36 },
    { id: 'r11', name: 'R. 11', type: 'Teori', capacity: 36 },
    { id: 'r12', name: 'R. 12', type: 'Teori', capacity: 36 },
    { id: 'r13', name: 'R. 13', type: 'Teori', capacity: 36 },
    { id: 'r14', name: 'R. 14', type: 'Teori', capacity: 36 },
    { id: 'r15', name: 'R. 15', type: 'Teori', capacity: 36 },
    { id: 'r16', name: 'R. 16', type: 'Teori', capacity: 36 },
    { id: 'r17', name: 'R. 17', type: 'Teori', capacity: 36 },
    { id: 'r18', name: 'R. 18', type: 'Teori', capacity: 36 },
    { id: 'r19', name: 'R. 19', type: 'Teori', capacity: 36 },
    { id: 'r20', name: 'R. 20', type: 'Teori', capacity: 36 },
    { id: 'r21', name: 'R. 21', type: 'Teori', capacity: 36 },
    { id: 'r22', name: 'R. 22', type: 'Teori', capacity: 36 },
    { id: 'r23', name: 'R. 23', type: 'Teori', capacity: 36 },
    { id: 'r24', name: 'R. 24', type: 'Teori', capacity: 36 },
    { id: 'r25', name: 'R. 25', type: 'Teori', capacity: 36 },
    { id: 'r26', name: 'R. 26', type: 'Teori', capacity: 36 },
    { id: 'r27', name: 'R. 27', type: 'Teori', capacity: 36 },
    { id: 'r28', name: 'R. 28', type: 'Teori', capacity: 36 },
    { id: 'r29', name: 'R. 29', type: 'Teori', capacity: 36 },
    { id: 'r30', name: 'R. 30', type: 'Teori', capacity: 36 },
    { id: 'r31', name: 'R. 31', type: 'Teori', capacity: 36 },
    { id: 'r32', name: 'R. 32', type: 'Teori', capacity: 36 },
    { id: 'lab_ak1', name: 'Lab. AK 1', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_ak2', name: 'Lab. AK 2', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_mp1', name: 'Lab. MP 1', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_mp2', name: 'Lab. MP 2', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_komp_pm', name: 'Lab. Komp. PM', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_bd', name: 'Lab. Bisnis Digital', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_br', name: 'Lab. Bisnis Ritel', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_rpl1', name: 'Lab. RPL 1', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_rpl2', name: 'Lab. RPL 2', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_rpl3', name: 'Lab. RPL 3', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_tkj1', name: 'Lab. TKJ 1', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_tkj2', name: 'Lab. TKJ 2', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_tkj3', name: 'Lab. TKJ 3', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_fo', name: 'Lab. Fiber Optic', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_mm', name: 'R. Multimedia', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_bahasa', name: 'Lab. Bahasa', type: 'Laboratorium', capacity: 36 },
    { id: 'lab_ipas', name: 'Lab. IPAS', type: 'Laboratorium', capacity: 36 },
    { id: 'rp_kuliner1', name: 'R. Praktek Kuliner 1', type: 'Praktek', capacity: 36 },
    { id: 'rp_kuliner2', name: 'R. Praktek Kuliner 2', type: 'Praktek', capacity: 36 },
    { id: 'lab_kds1', name: 'Lab. KDS 1', type: 'Praktek', capacity: 36 },
    { id: 'lab_kds2', name: 'Lab. KDS 2', type: 'Praktek', capacity: 36 },
    { id: 'lab_kds3', name: 'Lab. KDS 3', type: 'Praktek', capacity: 36 },
    { id: 'tefa', name: 'TEFA', type: 'Praktek', capacity: 36 },
    { id: 'bc', name: 'BC (Broadcasting)', type: 'Praktek', capacity: 36 },
    { id: 'aula_soedirman', name: 'Aula Jendral Soedirman', type: 'Aula', capacity: 200 },
    { id: 'r_senibudaya', name: 'R. Seni Budaya', type: 'Khusus', capacity: 36 },
    { id: 'r_musik', name: 'R. Musik', type: 'Khusus', capacity: 36 },
    { id: 'r_or', name: 'R. OR', type: 'Khusus', capacity: 36 },
    { id: 'r_osis', name: 'R. OSIS', type: 'Khusus', capacity: 20 },
    { id: 'r_bk', name: 'R. BK', type: 'Khusus', capacity: 10 },
    { id: 'r_lsp', name: 'R. LSP', type: 'Khusus', capacity: 10 },
];

// Helper for random parent data
const getRandomParent = () => {
  const fathers = ['Budi', 'Agus', 'Slamet', 'Joko', 'Heri', 'Eko', 'Bambang', 'Tri'];
  const lastNames = ['Santoso', 'Wibowo', 'Saputra', 'Nugroho', 'Wijaya', 'Pratama'];
  const name = `${fathers[Math.floor(Math.random() * fathers.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  const phone = `628${Math.floor(1000000000 + Math.random() * 9000000000).toString().substring(0, 10)}`;
  return { name, phone };
};

// Helper for random addresses
const getRandomAddress = () => {
    const streets = ['Jl. Jend. Soedirman', 'Jl. Mayjend Sungkono', 'Jl. Letkol Isdiman', 'Jl. DI Panjaitan', 'Jl. MT Haryono'];
    const villages = ['Purbalingga Lor', 'Purbalingga Kidul', 'Penambongan', 'Bancar', 'Kedungmenjangan'];
    return `${streets[Math.floor(Math.random() * streets.length)]} No. ${Math.floor(Math.random() * 50) + 1}, ${villages[Math.floor(Math.random() * villages.length)]}`;
};

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', nis: '0105232633', name: 'AFIFA KHOIRUNNISA', className: 'X AKL 1', gender: 'P', status: 'Aktif', parentName: getRandomParent().name, parentPhone: getRandomParent().phone, address: getRandomAddress() },
  { id: 's2', nis: '0105232634', name: 'AHMAD DANI', className: 'X AKL 1', gender: 'L', status: 'Aktif', parentName: getRandomParent().name, parentPhone: getRandomParent().phone, address: getRandomAddress() },
  { id: 's3', nis: '0105232635', name: 'BUDI SANTOSO', className: 'X PPLG 1', gender: 'L', status: 'Aktif', parentName: getRandomParent().name, parentPhone: getRandomParent().phone, address: getRandomAddress() },
  { id: 's4', nis: '0105232636', name: 'CITRA LESTARI', className: 'X PPLG 1', gender: 'P', status: 'Aktif', parentName: getRandomParent().name, parentPhone: getRandomParent().phone, address: getRandomAddress() },
  { id: 's5', nis: '0105232637', name: 'DEWI SARTIKA', className: 'X TJKT 1', gender: 'P', status: 'Aktif', parentName: getRandomParent().name, parentPhone: getRandomParent().phone, address: getRandomAddress() },
  { id: 's6', nis: '0105232638', name: 'EKO PRASETYO', className: 'X TJKT 1', gender: 'L', status: 'Aktif', parentName: getRandomParent().name, parentPhone: getRandomParent().phone, address: getRandomAddress() },
];

export const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Updated PERIODS to start from 0 and allow for expansion
export const PERIODS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const SCHEDULE_TIMINGS: Record<string, Record<number, string>> = {
  'Senin': { 1: '07:00-07:45', 2: '07:45-08:30', 3: '08:30-09:15', 4: '09:15-10:00', 5: '10:15-11:00', 6: '11:00-11:45', 7: '12:15-13:00', 8: '13:00-13:45', 9: '13:45-14:30', 10: '14:30-15:15' },
  'Selasa': { 1: '07:15-08:00', 2: '08:00-08:45', 3: '08:45-09:30', 4: '09:30-10:15', 5: '10:30-11:15', 6: '11:15-12:00', 7: '12:30-13:15', 8: '13:15-14:00', 9: '14:00-14:45', 10: '14:45-15:30' },
  'Rabu': { 1: '07:15-08:00', 2: '08:00-08:45', 3: '08:45-09:30', 4: '09:30-10:15', 5: '10:30-11:15', 6: '11:15-12:00', 7: '12:30-13:15', 8: '13:15-14:00', 9: '14:00-14:45', 10: '14:45-15:30' },
  'Kamis': { 1: '07:15-08:00', 2: '08:00-08:45', 3: '08:45-09:30', 4: '09:30-10:15', 5: '10:30-11:15', 6: '11:15-12:00', 7: '12:30-13:15', 8: '13:15-14:00', 9: '14:00-14:45', 10: '14:45-15:30' },
  'Jumat': { 1: '07:30-08:15', 2: '08:15-09:00', 3: '09:00-09:45', 4: '10:00-10:45', 5: '10:45-11:30', 6: '13:00-13:45', 7: '13:45-14:30' },
  'Sabtu': { 1: '07:00-07:45', 2: '07:45-08:30', 3: '08:30-09:15', 4: '09:15-10:00', 5: '10:15-11:00', 6: '11:00-11:45', 7: '12:15-13:00', 8: '13:00-13:45' },
};

export const MOCK_DUDI: DUDI[] = [
    { id: 'd1', name: 'PT. Telkom Indonesia', field: 'TJKT', address: 'Jl. Merdeka No. 1, Purwokerto', contactPerson: 'Bpk. Setiawan', phone: '081234567890', quota: 10 },
    { id: 'd2', name: 'CV. Media Kreatif', field: 'PPLG', address: 'Jl. Jend. Soedirman No. 45, Purbalingga', contactPerson: 'Ibu Ratna', phone: '085678901234', quota: 5 },
    { id: 'd3', name: 'Bank Jateng', field: 'AKL', address: 'Jl. Alun-Alun Purbalingga', contactPerson: 'Bpk. Agus', phone: '081345678901', quota: 8 },
    { id: 'd4', name: 'Dinas Kominfo', field: 'TJKT', address: 'Jl. Raya Kalimanah', contactPerson: 'Ibu Dewi', phone: '081567890123', quota: 6 },
    { id: 'd5', name: 'Toko Moro Seneng', field: 'PM', address: 'Jl. Ahmad Yani', contactPerson: 'Ko Handoko', phone: '081123456789', quota: 12 },
];

export const MOCK_PKL: PKLAssignment[] = [];

export const MOCK_SCHEDULE: ScheduleSlot[] = [];

export const MOCK_REPORTS: Report[] = [
    { id: 'r1', teacherId: 't1', title: 'Laporan Supervisi KBM', category: 'Supervisi', dueDate: '2025-02-15', status: 'Sudah Dikumpulkan' as ReportStatus, evidenceUrl: 'https://docs.google.com/document/d/1', supervisionScore: 92, supervisionNotes: 'Sangat Baik' },
    { id: 'r2', teacherId: 't2', title: 'Laporan Wali Kelas Bulan Januari', category: 'Administrasi', dueDate: '2025-01-31', status: 'Terverifikasi' as ReportStatus, evidenceUrl: 'https://docs.google.com/spreadsheet/d/1' },
    { id: 'r3', teacherId: 't3', title: 'Jurnal Mengajar', category: 'Kinerja', dueDate: '2025-02-01', status: 'Belum Dikumpulkan' as ReportStatus },
];

export const CURRICULUM_DATA_X: CurriculumSection[] = [
    {
        title: 'A. MATA PELAJARAN UMUM',
        items: [
            { name: '1. Pendidikan Agama dan Budi Pekerti', intra: 3, p5: 1, total: 4 },
            { name: '2. Pendidikan Pancasila', intra: 2, p5: 1, total: 3 },
            { name: '3. Bahasa Indonesia', intra: 4, p5: 1, total: 5 },
            { name: '4. Pendidikan Jasmani, Olahraga, dan Kesehatan', intra: 3, p5: 1, total: 4 },
            { name: '5. Sejarah', intra: 2, p5: 1, total: 3 },
            { name: '6. Seni Budaya', intra: 2, p5: 1, total: 3 }, // Pilihan
            { name: '7. Muatan Lokal', intra: 2, p5: 0, total: 2 },
        ]
    },
    {
        title: 'B. MATA PELAJARAN KEJURUAN',
        items: [
            { name: '1. Matematika', intra: 4, p5: 0, total: 4 },
            { name: '2. Bahasa Inggris', intra: 4, p5: 0, total: 4 },
            { name: '3. Informatika', intra: 4, p5: 0, total: 4 },
            { name: '4. Projek Ilmu Pengetahuan Alam dan Sosial (IPAS)', intra: 6, p5: 0, total: 6 },
            { name: '5. Dasar-Dasar Program Keahlian', intra: 12, p5: 0, total: 12 },
        ]
    }
];

export const CURRICULUM_DATA_XI: CurriculumSection[] = [
    {
        title: 'A. MATA PELAJARAN UMUM',
        items: [
            { name: '1. Pendidikan Agama dan Budi Pekerti', intra: 3, p5: 1, total: 4 },
            { name: '2. Pendidikan Pancasila', intra: 2, p5: 1, total: 3 },
            { name: '3. Bahasa Indonesia', intra: 3, p5: 1, total: 4 },
            { name: '4. Pendidikan Jasmani, Olahraga, dan Kesehatan', intra: 2, p5: 1, total: 3 },
            { name: '5. Sejarah', intra: 2, p5: 1, total: 3 },
            { name: '6. Muatan Lokal', intra: 2, p5: 0, total: 2 },
        ]
    },
    {
        title: 'B. MATA PELAJARAN KEJURUAN',
        items: [
            { name: '1. Matematika', intra: 3, p5: 0, total: 3 },
            { name: '2. Bahasa Inggris', intra: 4, p5: 0, total: 4 },
            { name: '3. Konsentrasi Keahlian', intra: 18, p5: 0, total: 18 },
            { name: '4. Projek Kreatif dan Kewirausahaan', intra: 5, p5: 0, total: 5 },
            { name: '5. Mata Pelajaran Pilihan', intra: 4, p5: 0, total: 4 },
        ]
    }
];

export const CURRICULUM_DATA_XII: CurriculumSection[] = [
     {
        title: 'A. MATA PELAJARAN UMUM',
        items: [
            { name: '1. Pendidikan Agama dan Budi Pekerti', intra: 3, p5: 1, total: 4 },
            { name: '2. Pendidikan Pancasila', intra: 2, p5: 1, total: 3 },
            { name: '3. Bahasa Indonesia', intra: 3, p5: 1, total: 4 },
            { name: '4. Sejarah', intra: 2, p5: 0, total: 2 }, // Khusus XII biasanya sejarah lanjut atau sejarah indo
            { name: '5. Muatan Lokal', intra: 2, p5: 0, total: 2 },
        ]
    },
    {
        title: 'B. MATA PELAJARAN KEJURUAN',
        items: [
            { name: '1. Matematika', intra: 3, p5: 0, total: 3 },
            { name: '2. Bahasa Inggris', intra: 4, p5: 0, total: 4 },
            { name: '3. Konsentrasi Keahlian', intra: 22, p5: 0, total: 22 },
            { name: '4. Projek Kreatif dan Kewirausahaan', intra: 5, p5: 0, total: 5 },
            { name: '5. Mata Pelajaran Pilihan', intra: 4, p5: 0, total: 4 },
            { name: '6. Praktik Kerja Lapangan (PKL)', intra: 46, p5: 0, total: 46 }, // Sistem Blok
        ]
    }
];
