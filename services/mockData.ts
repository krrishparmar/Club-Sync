import { AppState } from '../types';

export const INITIAL_DATA: AppState = {
  members: [
    { id: 'm1', name: 'Alex Johnson', role: 'Lead', joinedAt: '2023-09-01' },
    { id: 'm2', name: 'Sam Smith', role: 'Member', joinedAt: '2023-09-05' },
    { id: 'm3', name: 'Jordan Lee', role: 'Member', joinedAt: '2023-09-10' },
    { id: 'm4', name: 'Casey Taylor', role: 'Faculty', joinedAt: '2023-08-15' },
    { id: 'm5', name: 'Morgan Davis', role: 'Member', joinedAt: '2023-10-01' },
  ],
  tasks: [
    { id: 't1', title: 'Plan Orientation Event', description: 'Create agenda and book venue', status: 'done', assigneeId: 'm1', dueDate: '2023-10-01', priority: 'high' },
    { id: 't2', title: 'Design Club T-Shirts', description: 'Collect sizes and finalize design', status: 'doing', assigneeId: 'm2', dueDate: '2023-10-15', priority: 'medium' },
    { id: 't3', title: 'Update Website', description: 'Add new member bios', status: 'todo', assigneeId: 'm3', dueDate: '2023-10-20', priority: 'low' },
    { id: 't4', title: 'Budget Approval', description: 'Submit Q4 budget to student council', status: 'todo', assigneeId: 'm1', dueDate: '2023-10-25', priority: 'high' },
  ],
  sessions: [
    { id: 's1', title: 'Introductory Meetup', date: '2023-09-15', type: 'General' },
    { id: 's2', title: 'Workshop: React Basics', date: '2023-09-22', type: 'Workshop' },
    { id: 's3', title: 'Hackathon Prep', date: '2023-10-05', type: 'Event' },
  ],
  attendance: [
    { sessionId: 's1', memberId: 'm1', status: 'present' },
    { sessionId: 's1', memberId: 'm2', status: 'present' },
    { sessionId: 's1', memberId: 'm3', status: 'absent' },
    { sessionId: 's1', memberId: 'm5', status: 'present' },
    { sessionId: 's2', memberId: 'm1', status: 'present' },
    { sessionId: 's2', memberId: 'm2', status: 'absent' },
    { sessionId: 's2', memberId: 'm3', status: 'present' },
    { sessionId: 's2', memberId: 'm5', status: 'absent' },
  ]
};