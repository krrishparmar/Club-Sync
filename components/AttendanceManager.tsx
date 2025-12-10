import React, { useState, useMemo } from 'react';
import { Session, Member, AttendanceRecord } from '../types';
import { Calendar as CalendarIcon, Users, Check, X, Download, Plus, Zap, AlertCircle, History } from 'lucide-react';

interface AttendanceManagerProps {
  sessions: Session[];
  members: Member[];
  attendance: AttendanceRecord[];
  onMarkAttendance: (sessionId: string, memberId: string, status: 'present' | 'absent') => void;
  onAddSession: (session: Session) => void;
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  sessions,
  members,
  attendance,
  onMarkAttendance,
  onAddSession
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(sessions[0]?.id || null);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');
  const [viewingMemberId, setViewingMemberId] = useState<string | null>(null);

  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  const viewingMember = members.find(m => m.id === viewingMemberId);

  // Derive stats for current session
  const stats = useMemo(() => {
    if (!selectedSession) return { present: 0, absent: 0, percentage: 0 };
    const sessionRecords = attendance.filter(a => a.sessionId === selectedSession.id);
    const presentCount = sessionRecords.filter(a => a.status === 'present').length;
    const totalMembers = members.length;
    return {
      present: presentCount,
      absent: totalMembers - presentCount,
      percentage: totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0
    };
  }, [selectedSession, attendance, members]);

  // Derive stats for specific member
  const memberStats = useMemo(() => {
    if (!viewingMemberId) return null;
    
    const totalSessionsCount = sessions.length;
    // Calculate total presence across all sessions
    const memberAttendanceRecords = attendance.filter(a => a.memberId === viewingMemberId && a.status === 'present');
    const presentCount = memberAttendanceRecords.length;
    const percentage = totalSessionsCount > 0 ? Math.round((presentCount / totalSessionsCount) * 100) : 0;
    
    // Generate history list
    const history = sessions.map(session => {
        const record = attendance.find(a => a.sessionId === session.id && a.memberId === viewingMemberId);
        return {
            session,
            status: record?.status || 'absent'
        };
    }).sort((a, b) => new Date(b.session.date).getTime() - new Date(a.session.date).getTime()); // Newest first

    return { percentage, presentCount, totalSessionsCount, history };
  }, [viewingMemberId, sessions, attendance]);


  const handleAddSession = () => {
    if (!newSessionTitle || !newSessionDate) return;
    const newSession: Session = {
      id: Math.random().toString(36).substr(2, 9),
      title: newSessionTitle,
      date: newSessionDate,
      type: 'General'
    };
    onAddSession(newSession);
    setSelectedSessionId(newSession.id);
    setIsAddingSession(false);
    setNewSessionTitle('');
    setNewSessionDate('');
  };

  const exportCSV = () => {
    if (!selectedSession) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Member Name,Role,Status,Session Date,Session Title\n";
    
    members.forEach(member => {
      const record = attendance.find(a => a.sessionId === selectedSession.id && a.memberId === member.id);
      const status = record?.status || 'absent'; 
      csvContent += `${member.name},${member.role},${status},${selectedSession.date},${selectedSession.title}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${selectedSession.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatus = (memberId: string) => {
    const record = attendance.find(a => a.sessionId === selectedSessionId && a.memberId === memberId);
    return record?.status;
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 relative">
      {/* Sidebar: Session List */}
      <div className="w-full md:w-80 glass-panel rounded-3xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-white tracking-wide">Sessions</h3>
          <button 
            onClick={() => setIsAddingSession(!isAddingSession)}
            className="p-2 hover:bg-white/10 rounded-xl text-indigo-400 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {isAddingSession && (
          <div className="p-4 bg-white/5 border-b border-white/10 space-y-3">
             <input
              type="text"
              placeholder="Session Title"
              className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:border-indigo-500 focus:outline-none placeholder-gray-600"
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
            />
            <input
              type="date"
              className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
              value={newSessionDate}
              onChange={(e) => setNewSessionDate(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={handleAddSession} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-500">Save</button>
              <button onClick={() => setIsAddingSession(false)} className="flex-1 bg-white/10 text-gray-300 py-2 rounded-lg text-sm hover:bg-white/20">Cancel</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.map(session => (
            <div
              key={session.id}
              onClick={() => setSelectedSessionId(session.id)}
              className={`p-4 rounded-2xl cursor-pointer transition-all ${
                selectedSessionId === session.id 
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-white/20 border shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="font-bold text-gray-200">{session.title}</div>
              <div className="text-xs text-gray-500 flex items-center gap-2 mt-2">
                <CalendarIcon size={12} />
                {new Date(session.date).toLocaleDateString()}
                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-gray-300 border border-white/5">{session.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main: Attendance Sheet */}
      <div className="flex-1 glass-panel rounded-3xl flex flex-col overflow-hidden">
        {selectedSession ? (
          <>
            <div className="p-8 border-b border-white/5 relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{selectedSession.title}</h2>
                  <p className="text-indigo-300 text-sm mt-1 flex items-center gap-2">
                    <CalendarIcon size={14}/>
                    {new Date(selectedSession.date).toDateString()}
                  </p>
                </div>
                <button 
                  onClick={exportCSV}
                  className="flex items-center gap-2 text-xs font-bold text-white hover:text-indigo-300 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all"
                >
                  <Download size={14} />
                  Export CSV
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 relative z-10">
                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 flex flex-col items-center">
                  <div className="text-2xl font-bold text-emerald-400">{stats.present}</div>
                  <div className="text-[10px] text-emerald-200/70 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                    <Check size={10} /> Present
                  </div>
                </div>
                <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 flex flex-col items-center">
                  <div className="text-2xl font-bold text-rose-400">{stats.absent}</div>
                   <div className="text-[10px] text-rose-200/70 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                    <X size={10} /> Absent
                  </div>
                </div>
                <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 flex flex-col items-center">
                  <div className="text-2xl font-bold text-indigo-400">{stats.percentage}%</div>
                   <div className="text-[10px] text-indigo-200/70 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                    <Zap size={10} /> Turnout
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Member</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members.map(member => {
                    const status = getStatus(member.id);
                    return (
                      <tr 
                        key={member.id} 
                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                        onClick={() => setViewingMemberId(member.id)}
                      >
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                              {member.name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-200 group-hover:text-white transition-colors">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            member.role === 'Lead' 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                            : 'bg-white/5 text-gray-400 border border-white/5'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex justify-center gap-3">
                             <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMarkAttendance(selectedSession.id, member.id, 'present');
                                }}
                                className={`p-2 rounded-lg transition-all border ${
                                  status === 'present' 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                                    : 'text-gray-600 border-transparent hover:bg-white/10 hover:text-gray-300'
                                }`}
                                title="Mark Present"
                             >
                               <Check size={18} />
                             </button>
                             <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMarkAttendance(selectedSession.id, member.id, 'absent');
                                }}
                                className={`p-2 rounded-lg transition-all border ${
                                  status === 'absent' 
                                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]' 
                                    : 'text-gray-600 border-transparent hover:bg-white/10 hover:text-gray-300'
                                }`}
                                title="Mark Absent"
                             >
                               <X size={18} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
            <div className="p-6 rounded-full bg-white/5">
                <Users size={48} className="opacity-50" />
            </div>
            <p className="font-light tracking-wide">Select a session to view attendance</p>
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      {viewingMember && memberStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setViewingMemberId(null)}>
            <div className="w-full max-w-md glass-panel rounded-3xl p-6 relative shadow-2xl border border-white/10 bg-[#0f172a]" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => setViewingMemberId(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                
                <div className="flex flex-col items-center mb-6">
                     <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg shadow-indigo-500/30 mb-4">
                        {viewingMember.name.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{viewingMember.name}</h3>
                    <span className="text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full text-xs font-bold mt-2 border border-indigo-500/20 uppercase tracking-wider">
                        {viewingMember.role}
                    </span>
                    <span className="text-gray-500 text-xs mt-1">Joined {new Date(viewingMember.joinedAt).toLocaleDateString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center hover:bg-white/10 transition-colors">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Attendance</span>
                        <span className={`text-4xl font-bold ${memberStats.percentage >= 75 ? 'text-emerald-400' : memberStats.percentage >= 50 ? 'text-yellow-400' : 'text-rose-400'}`}>
                            {memberStats.percentage}%
                        </span>
                    </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center hover:bg-white/10 transition-colors">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Sessions</span>
                        <span className="text-4xl font-bold text-white">
                            {memberStats.presentCount}<span className="text-gray-500 text-xl">/{memberStats.totalSessionsCount}</span>
                        </span>
                    </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <History size={14} /> Recent Activity
                    </h4>
                    {memberStats.history.length > 0 ? (
                      memberStats.history.map((item) => (
                        <div key={item.session.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex-1">
                                <div className="text-sm font-bold text-gray-200">{item.session.title}</div>
                                <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                  {new Date(item.session.date).toLocaleDateString()}
                                  <span className="w-0.5 h-0.5 bg-gray-600 rounded-full"></span>
                                  {item.session.type}
                                </div>
                            </div>
                            <div className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border uppercase tracking-wide ${
                                item.status === 'present' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                                {item.status === 'present' ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                                {item.status === 'present' ? 'Present' : 'Absent'}
                            </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 text-sm py-4">No sessions yet.</div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;