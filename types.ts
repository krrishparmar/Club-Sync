export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Member {
  id: string;
  name: string;
  role: 'Member' | 'Lead' | 'Faculty';
  joinedAt: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string | null;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Session {
  id: string;
  title: string;
  date: string;
  type: 'General' | 'Event' | 'Workshop';
}

export interface AttendanceRecord {
  sessionId: string;
  memberId: string;
  status: 'present' | 'absent';
}

export interface AppState {
  members: Member[];
  tasks: Task[];
  sessions: Session[];
  attendance: AttendanceRecord[];
}