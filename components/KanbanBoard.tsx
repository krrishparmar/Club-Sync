import React, { useState } from 'react';
import { Task, Member, TaskStatus } from '../types';
import { Plus, User, Calendar, ArrowRight, ArrowLeft, X, Trash2, Save, AlignLeft, AlertCircle } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  members: Member[];
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, members, onUpdateTask, onAddTask, onDeleteTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low'|'medium'|'high'>('medium');
  
  // Edit State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const columns: { id: TaskStatus; label: string; accent: string }[] = [
    { id: 'todo', label: 'To Do', accent: 'bg-white/10' },
    { id: 'doing', label: 'In Progress', accent: 'bg-indigo-500/20' },
    { id: 'done', label: 'Done', accent: 'bg-emerald-500/20' },
  ];

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      description: '',
      status: 'todo',
      assigneeId: null,
      dueDate: new Date().toISOString().split('T')[0],
      priority: newTaskPriority,
    };
    onAddTask(newTask);
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setIsAdding(false);
  };

  const moveTask = (task: Task, direction: 'forward' | 'backward', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening edit modal
    const statusOrder: TaskStatus[] = ['todo', 'doing', 'done'];
    const currentIndex = statusOrder.indexOf(task.status);
    const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < statusOrder.length) {
      onUpdateTask({ ...task, status: statusOrder[newIndex] });
    }
  };

  const handleDelete = () => {
    if (deleteConfirmationId) {
      onDeleteTask(deleteConfirmationId);
      setDeleteConfirmationId(null);
      setEditingTask(null);
    }
  };

  const handleSaveEdit = () => {
    if (editingTask) {
      onUpdateTask(editingTask);
      setEditingTask(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
      case 'medium': return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]';
      case 'low': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Mission Board</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)] font-medium"
        >
          <Plus size={20} />
          New Mission
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500">
           <div className="bg-[#0f172a] p-4 rounded-[14px] flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="What needs to be done?"
              className="flex-1 bg-transparent text-white border-none focus:ring-0 placeholder-gray-500 text-lg outline-none"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              autoFocus
            />
            <select 
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="bg-white/10 text-white rounded-lg px-3 py-2 text-sm border-none focus:ring-0 [&>option]:bg-slate-800"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleAddTask} className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform">Add</button>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white px-4">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 h-full min-w-[1000px]">
          {columns.map((col) => (
            <div key={col.id} className="flex-1 flex flex-col rounded-3xl glass-panel p-4 min-w-[300px]">
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="font-bold text-gray-300 uppercase tracking-widest text-xs flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.id === 'todo' ? 'bg-gray-400' : col.id === 'doing' ? 'bg-indigo-400' : 'bg-emerald-400'}`}></span>
                  {col.label}
                </h3>
                <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/5">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto kanban-scroll space-y-3 pr-2">
                {tasks.filter(t => t.status === col.id).map(task => {
                  const assignee = members.find(m => m.id === task.assigneeId);
                  return (
                    <div 
                      key={task.id} 
                      onClick={() => setEditingTask(task)}
                      className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group relative cursor-pointer"
                    >
                       {/* Neon Glow on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors pointer-events-none"></div>

                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{task.priority}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {task.status !== 'todo' && (
                            <button onClick={(e) => moveTask(task, 'backward', e)} className="p-1 hover:bg-white/20 rounded-lg text-gray-400 hover:text-white transition-colors" title="Move Back">
                              <ArrowLeft size={16} />
                            </button>
                          )}
                           {task.status !== 'done' && (
                            <button onClick={(e) => moveTask(task, 'forward', e)} className="p-1 hover:bg-white/20 rounded-lg text-gray-400 hover:text-white transition-colors" title="Move Forward">
                              <ArrowRight size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-gray-100 mb-4 text-base leading-snug">{task.title}</h4>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          {assignee ? (
                            <div className="flex items-center gap-2" title={assignee.name}>
                               <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                                 {assignee.name.charAt(0)}
                               </div>
                               <span className="text-xs text-gray-400">{assignee.name.split(' ')[0]}</span>
                            </div>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-gray-500"><User size={12}/> Unassigned</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={12} />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && !deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEditingTask(null)}>
          <div className="w-full max-w-2xl glass-panel rounded-3xl p-8 relative shadow-2xl border border-white/10 bg-[#0f172a]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400"><AlignLeft size={24}/></span>
                Edit Mission
              </h2>
              <button onClick={() => setEditingTask(null)} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Title</label>
                <input 
                  type="text" 
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:outline-none text-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                   <select 
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask({...editingTask, priority: e.target.value as any})}
                      className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:outline-none [&>option]:bg-slate-800"
                   >
                     <option value="low">Low Priority</option>
                     <option value="medium">Medium Priority</option>
                     <option value="high">High Priority</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Due Date</label>
                   <input 
                      type="date" 
                      value={editingTask.dueDate}
                      onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                      className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
                   />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Assignee</label>
                <select 
                    value={editingTask.assigneeId || ''}
                    onChange={(e) => setEditingTask({...editingTask, assigneeId: e.target.value || null})}
                    className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:outline-none [&>option]:bg-slate-800"
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:outline-none min-h-[100px]"
                  placeholder="Add details about this mission..."
                />
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-white/10">
                 <button 
                  onClick={() => setDeleteConfirmationId(editingTask.id)}
                  className="flex items-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-colors font-medium text-sm"
                 >
                   <Trash2 size={18} /> Delete Mission
                 </button>
                 <div className="flex gap-3">
                   <button onClick={() => setEditingTask(null)} className="px-6 py-3 rounded-xl text-gray-300 hover:bg-white/10 font-bold transition-colors">
                     Cancel
                   </button>
                   <button onClick={handleSaveEdit} className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                     <Save size={18} /> Save Changes
                   </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
           <div className="w-full max-w-sm glass-panel rounded-3xl p-6 text-center border border-rose-500/30 bg-[#0f172a] shadow-2xl shadow-rose-900/20">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Mission?</h3>
              <p className="text-gray-400 mb-6 text-sm">This action cannot be undone. The task will be permanently removed from the board.</p>
              
              <div className="flex gap-3">
                 <button 
                   onClick={() => setDeleteConfirmationId(null)}
                   className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleDelete}
                   className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors shadow-lg shadow-rose-500/20"
                 >
                   Delete
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;