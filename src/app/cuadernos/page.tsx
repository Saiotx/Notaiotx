'use client';

import { useState, useEffect } from 'react';
import { Book, Plus, MoreHorizontal, FileText } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { subscribeToDocument, setDocument } from '@/lib/firebase/firestore';

export default function CuadernosPage() {
    const { user } = useAuth();
    const [notebooks, setNotebooks] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newNotebookName, setNewNotebookName] = useState('');

    useEffect(() => {
        if (!user) return;
        
        const unsubscribe = subscribeToDocument(user.uid, 'cuadernos/data', (data) => {
            if (data && data.items) {
                setNotebooks(data.items);
            } else {
                // Default notebooks si no hay datos
                const defaultNb = [
                    { id: '1', name: 'Primer Cuaderno', notesCount: 1, lastUpdated: 'Hoy' },
                    { id: '2', name: 'Ideas Personales', notesCount: 0, lastUpdated: 'Ayer' }
                ];
                setNotebooks(defaultNb);
                setDocument(user.uid, 'cuadernos/data', { items: defaultNb });
            }
        });

        return () => unsubscribe();
    }, [user]);

    const saveToFirebase = async (updated: any[]) => {
        if (!user) return;
        try {
            await setDocument(user.uid, 'cuadernos/data', { items: updated });
        } catch (error) {
            console.error("Error saving notebooks:", error);
        }
    };

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
        saveToFirebase(updated);
        setNewNotebookName('');
        setIsAdding(false);
    };

    return (
        <div className="flex-1 w-full h-full bg-[#f8f9fa] flex flex-col pt-6 sm:pt-8">
            <div className="px-4 sm:px-8 xl:px-16 mb-4 sm:mb-6 shrink-0 flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-baseline gap-3">
                    Cuadernos
                </h1>

                <button
                    onClick={() => { setIsAdding(true); setTimeout(() => document.getElementById('new-notebook-input')?.focus(), 10); }}
                    className="bg-[#00a82d] hover:bg-[#008f26] text-white px-4 py-2 sm:px-5 sm:py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nuevo Cuaderno</span>
                    <span className="sm:hidden">Nuevo</span>
                </button>
            </div>

            <div className="flex-1 px-4 sm:px-8 xl:px-16 overflow-y-auto pb-12">
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
                                <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded-md text-gray-400 transition-all shadow-sm bg-white md:absolute md:right-4 md:top-5 md:border md:border-transparent hover:border-gray-200">
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
