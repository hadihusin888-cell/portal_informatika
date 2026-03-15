
export type Role = 'ADMIN' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'PENDING';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  classId?: string; // Untuk Siswa
  assignedClassIds?: string[]; // Untuk Guru (Kelas yang diampu)
  subject?: string; // Untuk Guru (Mata Pelajaran)
  avatar?: string;
  status: UserStatus;
  createdAt?: string;
  password?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  homeroomTeacher?: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'file' | 'link' | 'embed';
  content: string;
  subject: string; // Mapel terkait
  authorId: string; // ID Guru pembuat
  targetClassIds: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'file' | 'link' | 'embed';
  content: string;
  subject: string; // Mapel terkait
  authorId: string; // ID Guru pembuat
  targetClassIds: string[];
  dueDate: string;
  isSubmissionEnabled: boolean;
  createdAt: string;
}

export interface Submission {
  id: string;
  taskId: string;
  studentId: string;
  content: string;
  grade?: number;
  feedback?: string;
  submittedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'material' | 'task' | 'grade' | 'registration';
  createdAt: string;
}

export interface SiteSettings {
  logoUrl: string;
  heroImageUrl: string;
  siteName: string;
}
