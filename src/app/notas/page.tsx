'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
    MoreHorizontal,
    FileText,
    CheckSquare,
    Search,
    Mic,
    Calendar,
    Undo2,
    Redo2,
    Sparkles,
    List,
    ListOrdered,
    Plus,
    AlignLeft,
    AlignCenter,
    AlignRight,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToDocument, setDocument } from '@/lib/firebase/firestore';

export default function NotasPage() {
    const { user } = useAuth();
    const [notes, setNotes] = useState<any[]>([
        { id: '1', title: 'Nota sin título', content: '', snippet: 'Empieza a escribir...', date: 'Justo ahora', isActive: true, hasTask: false, tasksCompleted: 0, tasksTotal: 0 }
    ]);
    const [activeNoteId, setActiveNoteId] = useState<string>('1');
    const [isListVisibleOnMobile, setIsListVisibleOnMobile] = useState(false);
    
    const titleRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [textColor, setTextColor] = useState('#000000');

    // Notebooks logic
    const [notebooks, setNotebooks] = useState<any[]>([]);
    const [selectedNotebook, setSelectedNotebook] = useState<any>(null);
    const [isNotebookDropdownOpen, setIsNotebookDropdownOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        
        // Cargar cuadernos
        const unsubCuadernos = subscribeToDocument(user.uid, 'cuadernos/data', (data) => {
            if (data && data.items) {
                setNotebooks(data.items);
                if (data.items.length > 0 && !selectedNotebook) setSelectedNotebook(data.items[0]);
            }
        });

        // Cargar notas
        const unsubNotas = subscribeToDocument(user.uid, 'notas/data', (data) => {
            if (data && data.items && data.items.length > 0) {
                // Solo inicializar si es la primera carga y no has editado nada localmente recién
                setNotes(data.items);
                
                // Actualizar la vista del editor si tenemos la nota activa y el DOM está listo
                if (activeNoteId && titleRef.current && editorRef.current) {
                    const actNote = data.items.find((n: any) => n.id === activeNoteId);
                    if (actNote) {
                       // Sólo actualizamos si es diferente (para no perder el foco)
                       if (titleRef.current.value !== actNote.title) titleRef.current.value = actNote.title;
                       if (editorRef.current.innerHTML !== actNote.content && actNote.content) editorRef.current.innerHTML = actNote.content;
                    }
                }
            } else {
                saveToFirebase([{ id: '1', title: 'Nota sin título', content: '', snippet: 'Empieza a escribir...', date: 'Hoy', isActive: true, hasTask: false }]);
            }
        });

        return () => {
            unsubCuadernos();
            unsubNotas();
        };
    }, [user, activeNoteId]);

    const saveToFirebase = async (updatedNotes: any[]) => {
        if (!user) return;
        try {
            await setDocument(user.uid, 'notas/data', { items: updatedNotes });
        } catch (error) {
            console.error("Error saving notes:", error);
        }
    };

    // Auto-save logic
    const [saveStatus, setSaveStatus] = useState<'Guardado' | 'Guardando...' | 'Sin guardar'>('Guardado');
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const triggerSave = useCallback(() => {
        setSaveStatus('Guardando...');

        if (editorRef.current && titleRef.current) {
            const currentTitle = titleRef.current.value.trim() || 'Nota sin título';
            const currentContentHtml = editorRef.current.innerHTML || '';
            const currentText = editorRef.current.innerText || '';
            const cleanText = currentText.replace(/\n/g, ' ').trim();
            const snippet = cleanText.length > 50 ? cleanText.substring(0, 50) + '...' : (cleanText || 'Empieza a escribir...');

            setNotes(prev => {
                const updated = prev.map(n => n.id === activeNoteId ? { ...n, title: currentTitle, snippet: snippet, content: currentContentHtml } : n);
                saveToFirebase(updated);
                return updated;
            });
        }

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            setSaveStatus('Guardado');
        }, 800);
    }, [activeNoteId, user]);

    const handleContentChange = () => {
        setSaveStatus('Sin guardar');
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            triggerSave();
        }, 1500); // 1.5 seconds of inactivity
    };

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    const formatDoc = (cmd: string, value?: string) => {
        document.execCommand(cmd, false, value);
        editorRef.current?.focus();
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setTextColor(color);
        formatDoc('foreColor', color);
    };

    const triggerColorPicker = () => {
        colorInputRef.current?.click();
    };

    const insertChecklist = () => {
        const checkboxHtml = `<div><input type="checkbox" style="margin-right: 8px;" /> &nbsp;</div>`;
        formatDoc('insertHTML', checkboxHtml);
    };

    const handleInsertFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);

        if (file.type.startsWith('image/')) {
            // Usando resize: both nativo para que la imagen se pueda redimensionar desde la esquina
            const imgHtml = `<span style="display: inline-block; margin: 8px 0; max-width: 100%; vertical-align: top;"><span style="display: block; resize: both; overflow: hidden; width: 300px; height: auto; min-width: 50px; min-height: 50px; max-width: 100%; border: 1px dashed transparent; border-radius: 8px; transition: border-color 0.2s;" onmouseover="this.style.borderColor='#94a3b8'" onmouseout="this.style.borderColor='transparent'"><img src="${url}" alt="${file.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" /></span></span>&nbsp;`;
            formatDoc('insertHTML', imgHtml);
        } else {
            const linkHtml = ` <a href="${url}" download="${file.name}" style="color: #4a72ff; text-decoration: underline; background: #f0f4ff; padding: 4px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; margin: 4px 0;">📎 ${file.name}</a> `;
            formatDoc('insertHTML', linkHtml);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex w-full h-full relative">
            {/* Middle Column: Note List */}
            <div className={`${isListVisibleOnMobile ? 'flex' : 'hidden'} md:flex absolute md:relative inset-0 md:inset-auto z-10 w-full md:w-80 h-full border-r border-gray-200 bg-white flex-col shrink-0`}>
                <div className="p-4 flex items-center justify-between border-b border-gray-100">
                    <h1 className="text-xl font-medium text-gray-800 flex items-center gap-2">
                        Notas
                        <span className="text-sm text-gray-400 font-normal">{notes.length}</span>
                    </h1>
                    <div className="flex items-center gap-1 text-gray-500">
                        <button className="p-1.5 hover:bg-gray-100 rounded-md"><FileText className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-md"><Search className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-md"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            onClick={() => {
                                setActiveNoteId(note.id);
                                setIsListVisibleOnMobile(false);
                            }}
                            className={`p-4 rounded-xl cursor-pointer transition-colors border ${note.id === activeNoteId
                                ? 'border-blue-400 bg-white shadow-sm ring-1 ring-blue-400'
                                : 'border-transparent hover:bg-gray-50'
                                }`}
                        >
                            <h3 className="font-semibold text-gray-900 text-[15px] mb-1 truncate">{note.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3 min-h-[40px]">
                                {note.snippet}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                                {note.hasTask ? (
                                    <div className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                        <CheckSquare className="w-3 h-3" />
                                        <span>{note.tasksCompleted}/{note.tasksTotal}</span>
                                    </div>
                                ) : (
                                    <span>{note.date}</span>
                                )}
                                {note.hasTask && <span>{note.date}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Note Editor */}
            <div className={`${!isListVisibleOnMobile ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white h-full relative`}>
                {/* Editor Toolbar */}
                <div className="h-14 border-b border-gray-200 flex items-center justify-between px-2 sm:px-6 shrink-0 gap-2 overflow-x-auto" style={{scrollbarWidth: 'none'}}>
                    <div className="flex items-center gap-1 sm:gap-2 text-sm text-gray-500 shrink-0">
                        <button 
                            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full mr-1 shrink-0"
                            onClick={() => setIsListVisibleOnMobile(true)}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <span className="hidden sm:inline hover:text-gray-800 cursor-pointer text-gray-400">«</span>
                        <span className="hidden sm:inline hover:text-gray-800 cursor-pointer text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8M9 9 3 3m6 6V4.2M9 9H4.2" /></svg></span>
                        <span className="hidden sm:inline w-px h-4 bg-gray-200 mx-2" />
                        <div className="relative shrink-0">
                            <button
                                onClick={() => setIsNotebookDropdownOpen(!isNotebookDropdownOpen)}
                                className="flex items-center gap-1 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded transition-colors cursor-pointer text-gray-500 font-medium whitespace-nowrap"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                                <span className="max-w-[70px] sm:max-w-none truncate inline-block">{selectedNotebook ? selectedNotebook.name : 'Cuaderno'}</span>
                                <span className="text-[10px] ml-1">▼</span>
                            </button>

                            {isNotebookDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                                    {notebooks.length === 0 ? (
                                        <div className="px-3 py-2 text-xs text-gray-400">No hay cuadernos disponibles</div>
                                    ) : (
                                        notebooks.map(nb => (
                                            <button
                                                key={nb.id}
                                                onClick={() => { setSelectedNotebook(nb); setIsNotebookDropdownOpen(false); }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors truncate flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                                                {nb.name}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        <span className="shrink-0">›</span>
                        <span className="text-gray-800 whitespace-nowrap hidden sm:inline">Nota sin título</span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
                        <span className={`text-xs font-medium hidden sm:block transition-colors duration-300 ${saveStatus === 'Guardado' ? 'text-gray-400' : saveStatus === 'Guardando...' ? 'text-blue-500 animate-pulse' : 'text-orange-400'}`}>
                            {saveStatus}
                        </span>
                        <button onClick={triggerSave} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                            Guardar
                        </button>
                        <button className="bg-[#4a72ff] hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap">
                            <span className="hidden sm:inline">Compartir</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        </button>
                        <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full shrink-0">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Formatting Toolbar */}
                <div className="h-12 border-b border-gray-100 flex items-center px-3 sm:px-6 gap-2 sm:gap-3 text-gray-400 shrink-0 overflow-x-auto text-sm w-full" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium relative"
                    >
                        <Plus className="w-4 h-4" /> Insertar <span className="text-[10px] ml-0.5">▼</span>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleInsertFile}
                            className="hidden"
                        />
                    </button>

                    <div className="w-px h-4 bg-gray-200 mx-1" />

                    <button className="hover:text-gray-600" onClick={() => formatDoc('undo')}><Undo2 className="w-4 h-4" /></button>
                    <button className="hover:text-gray-600" onClick={() => formatDoc('redo')}><Redo2 className="w-4 h-4" /></button>

                    <div className="w-px h-4 bg-gray-200 mx-1" />

                    {/* Color Picker Button (gradient circle) */}
                    <div className="relative flex items-center">
                        <button
                            onClick={triggerColorPicker}
                            className="flex items-center gap-1 hover:bg-gray-100 p-1 rounded hover:text-gray-600 transition-colors"
                        >
                            <div className="w-4 h-4 rounded-full border-2 border-gray-200 p-0.5"><div className="w-full h-full rounded-full bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-300"></div></div>
                            <span className="text-[10px]">▼</span>
                        </button>
                        <input
                            type="color"
                            ref={colorInputRef}
                            value={textColor}
                            onChange={handleColorChange}
                            className="opacity-0 absolute top-full left-0 w-8 h-8 pointer-events-none"
                        />
                    </div>

                    {/* Rich text formatters */}
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => formatDoc('bold')} className="hover:text-gray-800 hover:bg-gray-100 p-1 rounded font-bold text-gray-600 transition-colors">B</button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => formatDoc('italic')} className="hover:text-gray-800 hover:bg-gray-100 p-1 rounded italic font-serif text-gray-600 transition-colors">I</button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => formatDoc('underline')} className="hover:text-gray-800 hover:bg-gray-100 p-1 rounded underline text-gray-600 transition-colors">U</button>

                    {/* Font Size Button ('A' with arrow) */}
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                            const val = document.queryCommandValue('fontSize');
                            let newSize = '3';
                            if (val === '3' || val === '') newSize = '5';
                            else if (val === '5') newSize = '2';
                            else newSize = '3';
                            formatDoc('fontSize', newSize);
                        }}
                        className="hover:text-gray-800 hover:bg-gray-100 p-1 flex items-center gap-1 rounded text-gray-600 transition-colors relative"
                    >
                        <span className="font-semibold text-lg leading-none">A</span>
                        <span className="text-[9px] ml-0.5">▼</span>
                    </button>

                    <div className="w-px h-4 bg-gray-200 mx-1" />

                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => formatDoc('justifyLeft')} className="hover:text-gray-800 hover:bg-gray-100 p-1 rounded text-gray-600 transition-colors"><AlignLeft className="w-4 h-4" /></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => formatDoc('justifyCenter')} className="hover:text-gray-800 hover:bg-gray-100 p-1 rounded text-gray-600 transition-colors"><AlignCenter className="w-4 h-4" /></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => formatDoc('justifyRight')} className="hover:text-gray-800 hover:bg-gray-100 p-1 rounded text-gray-600 transition-colors"><AlignRight className="w-4 h-4" /></button>

                    <div className="w-px h-4 bg-gray-200 mx-1" />

                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => formatDoc('insertUnorderedList')} className="hover:text-gray-800 hover:bg-gray-100 p-1 rounded text-gray-600 transition-colors"><List className="w-4 h-4" /></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => formatDoc('insertOrderedList')} className="hover:text-gray-800 hover:bg-gray-100 p-1 rounded text-gray-600 transition-colors"><ListOrdered className="w-4 h-4" /></button>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={insertChecklist} className="hover:text-gray-800 hover:bg-gray-100 p-1 rounded text-gray-600 transition-colors"><CheckSquare className="w-4 h-4" /></button>

                    <div className="w-px h-4 bg-gray-200 mx-1" />

                    <button className="flex items-center gap-1 hover:text-gray-600">
                        Más <span className="text-[10px]">▼</span>
                    </button>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 overflow-y-auto p-12 lg:px-24 flex flex-col" onClick={(e) => { if (e.target === e.currentTarget) editorRef.current?.focus() }}>
                    <input
                        type="text"
                        ref={titleRef}
                        defaultValue=""
                        onInput={handleContentChange}
                        className="w-full text-4xl font-bold text-gray-900 border-none outline-none mb-8 placeholder-gray-300 bg-transparent shrink-0"
                        placeholder="Título de la nota"
                    />

                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleContentChange}
                        className="w-full flex-1 outline-none text-gray-800 text-lg empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-2 [&_li]:mb-1"
                        data-placeholder="Empieza a escribir..."
                    />
                </div>

                {/* Helper bottom toolbar mock */}
                <div className="absolute bottom-4 left-6 flex items-center gap-2 text-gray-400 text-xs">
                    <span>Añadir etiqueta</span>
                </div>
            </div>
        </div>
    );
}
