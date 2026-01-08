
import { db } from '../App.tsx';
import { Notification, User } from '../types.ts';

export const notifyStudents = async (
  targetClasses: string[], 
  title: string, 
  message: string, 
  type: 'material' | 'task' | 'grade' | 'registration', 
  studentId?: string
) => {
  try {
    let targets: any[] = [];
    
    if (studentId) {
      // Jika ada studentId spesifik, ambil satu user saja
      const user = await db.getSingle('users', studentId);
      if (user) targets = [user];
    } else if (targetClasses.length > 0) {
      // Jika berbasis kelas, ambil user per kelas (lebih efisien)
      const allStudents = await db.getByQuery('users', 'role', 'STUDENT');
      targets = allStudents.filter((s: any) => targetClasses.includes(s.classId || ''));
    }

    for (const s of targets) {
      const newNotif: Partial<Notification> = {
        userId: s.id,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toLocaleString('id-ID')
      };
      await db.add('elearning_notifications', newNotif);
    }
  } catch (err) {
    console.error("Failed to notify students:", err);
  }
};

export const notifyAdmins = async (title: string, message: string) => {
  try {
    const adminList = await db.getByQuery('users', 'role', 'ADMIN');

    for (const admin of adminList) {
      const newNotif: Partial<Notification> = {
        userId: admin.id,
        title,
        message,
        type: 'registration',
        read: false,
        createdAt: new Date().toLocaleString('id-ID')
      };
      await db.add('elearning_notifications', newNotif);
    }
  } catch (err) {
    console.error("Failed to notify admins:", err);
  }
};
