'use client';

import { useState, useEffect } from 'react';
import { Book, Plus, MoreHorizontal, FileText } from 'lucide-react';
import Link from 'next/link';

export default function CuadernosPage() {
    const [notebooks, setNotebooks] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newNotebookName, setNewNotebookName] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('app_notebooks');
        if (stored) {
            setNotebooks(JSON.parse(stored));
        } else {
            // Default notebooks
            const defaultNb = [
                { id: '1', name: 'Primer Cuaderno', notesCount: 1, lastUpdated: 'Hoy' },
                { id: '2', name: 'Ideas Personales', notesCount: 0, lastUpdated: 'Ayer' }
            ];
            setNotebooks(defaultNb);
            localStorage.setItem('app_notebooks', JSON.stringify(defaultNb));
        }
    }, []);

    const handleAddNotebook = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNotebookName.trim()) {
            setIsAdding(false);
            return;
        }
        const newNb = {
            id: Date.now().toString(),
            name: newNotebookName,
            notesCount: 0,
            lastUpdated: 'Justo ahora'
        };
        const updated = [newNb, ...notebooks];
        setNotebooks(updated);
        localStorage.setItem('app_notebooks', JSON.stringify(updated));
        setNewNotebookName('');
        setIsAdding(false);
    };

    return (
        <div className="flex-1 w-full h-full bg-[#f8f9fa] flex flex-col pt-8">
            <div className="px-16 mb-6 shrink-0 flex items-center justify-between">
                <h1 className="text-3xl font-semibold text-gray-800 flex items-baseline gap-3">
                    Cuadernos
                    <span className="text-sm font-normal text-gray-400">{notebooks.length}</span>
                </h1>

                <button
                    onClick={() => { setIsAdding(true); setTimeout(() => document.getElementById('new-notebook-input')?.focus(), 10); }}
                    className="bg-[#00a82d] hover:bg-[#008f26] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Cuaderno
                </button>
            </div>

            <div className="flex-1 px-16 overflow-y-auto pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {isAdding && (
                        <div className="border-2 border-green-400 bg-white rounded-xl p-6 flex flex-col gap-4 shadow-md relative">
                            <form onSubmit={handleAddNotebook}>
                                <div className="flex items-center gap-3 text-gray-800 font-semibold mb-2">
                                    <Book className="w-5 h-5 text-green-500" />
                                    <input
                                        id="new-notebook-input"
                                        type="text"
                                        value={newNotebookName}
                                        onChange={(e) => setNewNotebookName(e.target.value)}
                                        onBlur={() => { if (!newNotebookName) setIsAdding(false); }}
                                        placeholder="Nombre del cuaderno..."
                                        className="bg-transparent border-none outline-none w-full text-lg"
                                    />
                                </div>
                            </form>
                            <p className="text-sm text-gray-500">0 notas</p>
                        </div>
                    )}

                    {notebooks.map(nb => (
                        <Link href="/notas" key={nb.id} className="border border-gray-200 hover:border-gray-300 rounded-xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all group relative bg-white cursor-pointer block">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 text-gray-800 font-semibold text-lg">
                                    <Book className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                                    <span className="truncate pr-4">{nb.name}</span>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded-md text-gray-400 transition-all shadow-sm bg-white absolute right-4 top-5 border border-transparent hover:border-gray-200">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>

                            <hr className="border-gray-50" />

                            <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                                <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {nb.notesCount} notas</span>
                                <span className="text-gray-400 text-xs">Actualizado {nb.lastUpdated}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
