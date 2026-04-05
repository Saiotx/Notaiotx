'use client';

import { useState } from 'react';
import { Plus, ListFilter, ArrowDownUp, FileText, Check, Trash2 } from 'lucide-react';

export default function TareasPage() {
    const tabs = ['Mis tareas', 'Notas', 'Hoy', 'Asignado'];
    const [activeTab, setActiveTab] = useState(tabs[0]);

    const [tasks, setTasks] = useState<any[]>([
        { id: 1, title: 'Comprar leche', dueDate: 'Mañana', assignedNote: 'Compras', assignedTo: 'Yo', completed: false },
        { id: 2, title: 'Terminar el informe mensual', dueDate: 'Hoy', assignedNote: 'Trabajo', assignedTo: 'Yo', completed: false }
    ]);
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'Hoy') return task.dueDate === 'Hoy' && !task.completed;
        return !task.completed;
    });

    const completedTasks = tasks.filter(t => t.completed);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            setTasks([{
                id: Date.now(),
                title: newTaskTitle,
                dueDate: 'Hoy',
                assignedNote: 'Sin nota',
                assignedTo: 'Yo',
                completed: false
            }, ...tasks]);
        }
        setNewTaskTitle('');
        setIsAdding(false);
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="flex-1 w-full h-full bg-white flex flex-col pt-8">

            {/* Header Area */}
            <div className="px-12 mb-6 shrink-0">
                <h1 className="text-3xl font-semibold text-gray-800 flex items-baseline gap-3 mb-6">
                    Tareas
                    <span className="text-sm font-normal text-gray-400">{filteredTasks.length}</span>
                </h1>

                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    {/* Tabs */}
                    <div className="flex items-center gap-6 text-sm font-medium">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-2 relative transition-colors ${activeTab === tab
                                    ? 'text-gray-800'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <span className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-gray-800 rounded-t-full"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setIsAdding(true); setTimeout(() => document.getElementById('new-task-input')?.focus(), 10); }}
                            className="flex items-center gap-2 px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm text-gray-700"
                        >
                            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                                <Plus className="w-3 h-3 text-purple-600" />
                            </div>
                            Tarea Nueva
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                            <ListFilter className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                            <ArrowDownUp className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 px-12 overflow-y-auto pb-12">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="sticky top-0 bg-white z-10 border-b border-gray-100">
                        <tr className="text-gray-500 bg-[#f8f9fa] border-y border-gray-100">
                            <th className="py-2.5 px-4 font-medium w-1/3 rounded-tl-lg">Título</th>
                            <th className="py-2.5 px-4 font-medium w-1/4">Fecha de vencimiento</th>
                            <th className="py-2.5 px-4 font-medium w-1/5">Nota asignada</th>
                            <th className="py-2.5 px-4 font-medium w-1/5 rounded-tr-lg">Asignado a</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isAdding && (
                            <tr className="border-b border-gray-100 bg-purple-50/30">
                                <td colSpan={4} className="py-2 px-4">
                                    <form onSubmit={handleAddTask} className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0"></div>
                                        <input
                                            id="new-task-input"
                                            type="text"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            onBlur={() => { if (!newTaskTitle) setIsAdding(false); }}
                                            placeholder="Escribe el nombre de la tarea y pulsa Enter..."
                                            className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-gray-800 placeholder-gray-400"
                                        />
                                    </form>
                                </td>
                            </tr>
                        )}

                        {filteredTasks.length === 0 && !isAdding && (
                            <tr className="border-b border-gray-50">
                                <td colSpan={4} className="py-12 text-center text-gray-500 text-sm">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                            <Check className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <p>No hay tareas pendientes en esta vista.</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {filteredTasks.map((task) => (
                            <tr key={task.id} className="group hover:bg-gray-50 transition-colors border-b border-gray-50">
                                <td className="py-3 px-4 flex items-center gap-3">
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className="w-4 h-4 rounded-full border border-gray-300 group-hover:border-purple-500 hover:bg-purple-50 transition-colors shrink-0 flex items-center justify-center"
                                    >
                                    </button>
                                    <span className="text-gray-800 text-[15px]">{task.title}</span>
                                </td>
                                <td className="py-3 px-4 text-gray-400">{task.dueDate}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-1.5 text-gray-500 cursor-pointer hover:text-gray-800">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span className="truncate">{task.assignedNote}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-gray-400 flex justify-between items-center pr-8">
                                    <span>{task.assignedTo}</span>
                                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {/* Completed tasks section */}
                        {completedTasks.length > 0 && (
                            <>
                                <tr>
                                    <td colSpan={4} className="pt-8 pb-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">
                                        Completadas ({completedTasks.length})
                                    </td>
                                </tr>
                                {completedTasks.map((task) => (
                                    <tr key={task.id + '-completed'} className="group hover:bg-gray-50 transition-colors border-b border-gray-50 opacity-60">
                                        <td className="py-3 px-4 flex items-center gap-3">
                                            <button
                                                onClick={() => toggleTask(task.id)}
                                                className="w-4 h-4 rounded-full bg-purple-500 border-none shrink-0 flex items-center justify-center"
                                            >
                                                <Check className="w-3 h-3 text-white" />
                                            </button>
                                            <span className="text-gray-500 text-[15px] line-through">{task.title}</span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 line-through">{task.dueDate}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1.5 text-gray-400 cursor-pointer">
                                                <FileText className="w-3.5 h-3.5" />
                                                <span className="truncate">{task.assignedNote}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 flex justify-between items-center pr-8">
                                            <span className="line-through">{task.assignedTo}</span>
                                            <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
