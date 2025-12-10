import React, { useState } from 'react';
import { AppState, Task, Session } from './types';
import { INITIAL_DATA } from './services/mockData';
import KanbanBoard from './components/KanbanBoard';
import AttendanceManager from './components/AttendanceManager';
import Dashboard from './components/Dashboard';
import { LayoutDashboard, CheckSquare, CalendarDays, Users, Menu, Sparkles, LogIn, Lock, Mail } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'attendance'>('dashboard');
  const [data, setData] = useState<AppState>(INITIAL_DATA);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Simple mock login validation
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Please enter both email and password');
    }
  };

  // Task Handlers
  const updateTask = (updatedTask: Task) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }));
  };

  const addTask = (newTask: Task) => {
    setData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  };

  const deleteTask = (taskId: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  };

  // Session Handlers
  const addSession = (newSession: Session) => {
    setData(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession]
    }));
  };

  // Attendance Handlers
  const markAttendance = (sessionId: string, memberId: string, status: 'present' | 'absent') => {
    setData(prev => {
      const existingIndex = prev.attendance.findIndex(a => a.sessionId === sessionId && a.memberId === memberId);
      let newAttendance = [...prev.attendance];
      
      if (existingIndex >= 0) {
        newAttendance[existingIndex] = { sessionId, memberId, status };
      } else {
        newAttendance.push({ sessionId, memberId, status });
      }
      
      return { ...prev, attendance: newAttendance };
    });
  };

  const NavItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all duration-300 ${
        activeTab === id 
          ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/10 backdrop-blur-md' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium tracking-wide">{label}</span>
    </button>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated blobs from index.html will show through */}
        
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
            <Sparkles className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">ClubSync</h1>
          <p className="text-gray-400 mb-8">Next-gen management for your squad.</p>
          
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail size={20} />
              </div>
              <input 
                  type="email" 
                  placeholder="Email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <Lock size={20} />
              </div>
              <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            
            {error && <p className="text-rose-400 text-sm font-medium animate-in slide-in-from-top-1">{error}</p>}
            
            <button 
                type="submit"
                className="group relative w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform duration-200 mt-2"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <span className="relative z-10 flex items-center gap-2">
                    <LogIn size={20} />
                    Sign In
                </span>
            </button>
          </form>
          
          <p className="mt-6 text-xs text-gray-500">
            Protected by ClubSync Identity
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-gray-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 glass-panel border-r-0 m-4 rounded-3xl p-6 z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">ClubSync</h1>
        </div>

        <nav className="flex-1 space-y-3">
          <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
          <NavItem id="tasks" label="Task Board" icon={CheckSquare} />
          <NavItem id="attendance" label="Attendance" icon={CalendarDays} />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
           <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center shadow-inner">
                <span className="font-bold text-white">A</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Admin User</p>
                <p className="text-xs text-gray-400">Club Lead</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden glass-panel m-4 rounded-2xl p-4 flex justify-between items-center z-20">
           <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <h1 className="text-lg font-bold text-white">ClubSync</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
            <Menu size={24} />
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[80px] left-4 right-4 glass-panel rounded-2xl z-30 p-4 space-y-2 border border-white/10 shadow-2xl">
             <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
             <NavItem id="tasks" label="Task Board" icon={CheckSquare} />
             <NavItem id="attendance" label="Attendance" icon={CalendarDays} />
          </div>
        )}

        {/* View Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-0 md:pt-4">
          <div className="max-w-7xl mx-auto h-full pb-8">
            {activeTab === 'dashboard' && <Dashboard data={data} />}
            {activeTab === 'tasks' && (
              <KanbanBoard 
                tasks={data.tasks} 
                members={data.members} 
                onUpdateTask={updateTask}
                onAddTask={addTask}
                onDeleteTask={deleteTask}
              />
            )}
            {activeTab === 'attendance' && (
              <AttendanceManager 
                sessions={data.sessions}
                members={data.members}
                attendance={data.attendance}
                onMarkAttendance={markAttendance}
                onAddSession={addSession}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;