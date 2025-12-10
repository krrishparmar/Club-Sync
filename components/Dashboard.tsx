import React, { useState } from 'react';
import { AppState } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Sparkles, Activity, Users, CheckSquare, Zap } from 'lucide-react';
import { generateClubInsights } from '../services/geminiService';

interface DashboardProps {
  data: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Computed Stats
  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter(t => t.status === 'done').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const totalSessions = data.sessions.length;
  // Let's calc avg attendance per session
  const sessionAttendance = data.sessions.map(s => {
    const presentCount = data.attendance.filter(a => a.sessionId === s.id && a.status === 'present').length;
    const totalMembers = data.members.length;
    return {
      name: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      attendance: totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0
    };
  });

  const memberAttendance = data.members.map(m => {
      const records = data.attendance.filter(a => a.memberId === m.id);
      const present = records.filter(a => a.status === 'present').length;
      return {
          name: m.name.split(' ')[0], // First name for chart
          attendanceCount: present
      }
  }).sort((a,b) => b.attendanceCount - a.attendanceCount).slice(0, 5); // Top 5

  const handleGenerateInsights = async () => {
    setLoadingInsights(true);
    const result = await generateClubInsights(data);
    setInsights(result);
    setLoadingInsights(false);
  };

  const Card = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:bg-white/5 transition-colors">
      <div className={`absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity ${colorClass}`}>
        <Icon size={64} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-2 rounded-lg bg-white/5 ${colorClass}`}>
             <Icon size={18} />
          </div>
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        </div>
        <div className="text-4xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-gray-500 font-mono">{subtext}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          title="Active Members" 
          value={data.members.length} 
          subtext="Total registered"
          icon={Users}
          colorClass="text-indigo-400"
        />
        <Card 
          title="Task Completion" 
          value={`${taskCompletionRate}%`} 
          subtext={`${completedTasks}/${totalTasks} tasks done`}
          icon={CheckSquare}
          colorClass="text-emerald-400"
        />
        <Card 
          title="Sessions Held" 
          value={totalSessions} 
          subtext="This semester"
          icon={Activity}
          colorClass="text-cyan-400"
        />
        <Card 
          title="Avg Turnout" 
          value={`${Math.round(sessionAttendance.reduce((acc, curr) => acc + curr.attendance, 0) / (sessionAttendance.length || 1))}%`} 
          subtext="Attendance rate"
          icon={Zap}
          colorClass="text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <div className="glass-panel p-6 rounded-3xl h-[350px] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity size={18} className="text-indigo-400"/>
            Attendance Trend
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionAttendance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#9ca3af'}} stroke="transparent" />
                <YAxis tick={{fontSize: 12, fill: '#9ca3af'}} stroke="transparent" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: '#fff' 
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="attendance" stroke="#818cf8" strokeWidth={3} dot={{r: 4, fill: '#818cf8', strokeWidth: 0}} activeDot={{r: 6, fill: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Active Members Chart */}
        <div className="glass-panel p-6 rounded-3xl h-[350px] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
             <Users size={18} className="text-pink-400"/>
             Top Contributors
          </h3>
           <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberAttendance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fill: '#9ca3af'}} stroke="transparent" />
                <Tooltip 
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: '#fff' 
                  }}
                />
                <Bar dataKey="attendanceCount" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gemini AI Insights Section */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="bg-[#0f172a] rounded-[23px] h-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-3xl"></div>
          
          <div className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl shadow-lg shadow-orange-500/20">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Studio Insights</h2>
                  <p className="text-gray-400 text-sm">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>
              <button
                onClick={handleGenerateInsights}
                disabled={loadingInsights}
                className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                {loadingInsights ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Report
                  </>
                )}
              </button>
            </div>

            <div className="bg-black/30 rounded-2xl p-6 border border-white/10 min-h-[120px]">
              {insights ? (
                <div className="prose prose-invert prose-sm max-w-none">
                   <div className="whitespace-pre-wrap font-light tracking-wide">{insights}</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-indigo-300/50 h-full py-4 gap-2">
                  <Sparkles size={32} className="opacity-50" />
                  <p className="font-light">Unlock data-driven strategies for your club.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;