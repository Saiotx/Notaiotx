"use client";

import { Pencil, CheckSquare, Maximize2, MoreHorizontal, FileText, Home, X, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToDocument, setDocument } from '@/lib/firebase/firestore';

export default function InicioPage() {
  const { user } = useAuth();
  
  // Notas state
  const [notes, setNotes] = useState<any[]>([]);
  const [quickNoteText, setQuickNoteText] = useState("");

  // Bloc de notas state
  const [scratchpadText, setScratchpadText] = useState("");
  const [scratchpadColor, setScratchpadColor] = useState("bg-[#fef5cc]");
  const [isScratchpadExpanded, setIsScratchpadExpanded] = useState(false);
  const [postIts, setPostIts] = useState<any[]>([]);
  
  // Ref para evitar ciclos de guardado infinitos en scratchpad
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToDocument(user.uid, 'dashboard/data', (data) => {
      if (data) {
        setNotes(data.quickNotes || []);
        setPostIts(data.postIts || []);
        // Solo actualizar texto si no hay un timeout (el usuario no está escribiendo localmente)
        if (!typingTimeoutRef.current && data.scratchpadText !== undefined) {
           setScratchpadText(data.scratchpadText);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const saveToFirebase = async (updates: any) => {
    if (!user) return;
    try {
      await setDocument(user.uid, 'dashboard/data', updates);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleScratchpadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setScratchpadText(text);
    
    // Auto-save debounced
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      saveToFirebase({ scratchpadText: text });
      typingTimeoutRef.current = null;
    }, 1000);
  };

  const saveQuickNote = () => {
    if (!quickNoteText.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      title: "Nota rápida",
      snippet: quickNoteText,
      date: new Date().toLocaleDateString()
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveToFirebase({ quickNotes: updatedNotes });
    setQuickNoteText("");
  };

  const deleteNote = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const updatedNotes = notes.filter((n) => n.id !== id);
    setNotes(updatedNotes);
    saveToFirebase({ quickNotes: updatedNotes });
  };

  const savePostIt = () => {
    if (!scratchpadText.trim()) return;
    const newPostIt = {
      id: Date.now().toString(),
      text: scratchpadText,
      color: scratchpadColor,
      date: new Date().toLocaleDateString()
    };
    const updatedPostIts = [newPostIt, ...postIts];
    setPostIts(updatedPostIts);
    setScratchpadText("");
    
    saveToFirebase({ 
      postIts: updatedPostIts,
      scratchpadText: ""
    });
    
    setIsScratchpadExpanded(false);
  };

  const deletePostIt = (id: string) => {
    const updatedPostIts = postIts.filter((p) => p.id !== id);
    setPostIts(updatedPostIts);
    saveToFirebase({ postIts: updatedPostIts });
  };

  return (
    <div className="flex-1 w-full h-full bg-[#f8f9fa] overflow-y-auto px-16 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
          <Home className="w-8 h-8" />
        </h1>
        <Link href="/notas" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow text-gray-500 hover:text-gray-800 transition-all">
          <Pencil className="w-5 h-5 pointer-events-none" />
        </Link>
      </div>


      {/* Widgets Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Notes Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[320px]">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
            <Link href="/notas" className="font-semibold text-gray-800 hover:text-green-600 transition-colors flex items-center gap-2">Notas</Link>
            <div className="flex items-center gap-3 text-gray-400">
              <button className="hover:text-green-600 text-green-500 transition-colors" onClick={saveQuickNote} title="Guardar Nota Rápida"><FileText className="w-5 h-5" /></button>
            </div>
          </div>
          {/* Quick Note Input */}
          <div className="px-5 pt-3">
            <input 
              type="text" 
              placeholder="Escribe una nota rápida aquí..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-green-400 focus:bg-white transition-colors"
              value={quickNoteText}
              onChange={(e) => setQuickNoteText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveQuickNote(); }}
            />
          </div>
          <div className="p-5 flex-1 overflow-x-auto flex gap-4 custom-scrollbar">
            {notes.map((note) => (
              <div key={note.id} className="relative w-56 shrink-0 h-full border border-gray-100 rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow cursor-pointer bg-white group block">
                <button 
                  onClick={(e) => deleteNote(e, note.id)} 
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-semibold text-green-600 uppercase tracking-wider mb-2">Notas rápidas</span>
                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-1 whitespace-pre-wrap">
                  {note.snippet || " "}
                </p>
                <span className="text-[11px] text-gray-400 mt-auto">{note.date}</span>
              </div>
            ))}
            {notes.length === 0 && (
               <div className="w-full flex items-center justify-center text-gray-400 text-sm">
                 Aún no has guardado ninguna nota rápida.
               </div>
            )}
          </div>
        </div>

        {/* Scratchpad Widget */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col transition-all ${isScratchpadExpanded ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[320px] overflow-hidden'}`}>
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
            <span className="font-semibold text-gray-800">Bloc de notas</span>
            <div className="flex items-center gap-4">
              {/* Color Picker */}
              <div className="flex items-center gap-1">
                <button onClick={() => setScratchpadColor('bg-[#fef5cc]')} className={`w-4 h-4 rounded-full bg-[#fef5cc] border-2 cursor-pointer ${scratchpadColor==='bg-[#fef5cc]'?'border-gray-500':'border-transparent'}`} title="Amarillo" />
                <button onClick={() => setScratchpadColor('bg-[#d4edda]')} className={`w-4 h-4 rounded-full bg-[#d4edda] border-2 cursor-pointer ${scratchpadColor==='bg-[#d4edda]'?'border-gray-500':'border-transparent'}`} title="Verde" />
                <button onClick={() => setScratchpadColor('bg-[#cde4f0]')} className={`w-4 h-4 rounded-full bg-[#cde4f0] border-2 cursor-pointer ${scratchpadColor==='bg-[#cde4f0]'?'border-gray-500':'border-transparent'}`} title="Azul" />
                <button onClick={() => setScratchpadColor('bg-[#f8d7da]')} className={`w-4 h-4 rounded-full bg-[#f8d7da] border-2 cursor-pointer ${scratchpadColor==='bg-[#f8d7da]'?'border-gray-500':'border-transparent'}`} title="Rosa" />
              </div>
              
              <button 
                title="Guardar Post-it" 
                className="flex items-center gap-1 text-sm bg-gray-900 text-white px-2 py-1 rounded-md hover:bg-gray-800 transition-colors"
                onClick={savePostIt}
              >
                <Save className="w-4 h-4" /> 
                <span className="hidden sm:inline">Guardar</span>
              </button>

              <button className="text-gray-400 hover:text-gray-600" onClick={() => setIsScratchpadExpanded(!isScratchpadExpanded)}>
                 {isScratchpadExpanded ? <X className="w-5 h-5" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="px-5 pb-5 flex-1 pt-4">
            <div className={`w-full h-full rounded-lg p-5 transition-colors ${scratchpadColor}`}>
              <textarea
                value={scratchpadText}
                onChange={handleScratchpadChange}
                className="w-full h-full bg-transparent border-none outline-none resize-none placeholder-gray-500/50 text-gray-800 text-sm sm:text-base"
                placeholder="Empieza a escribir..."
              />
            </div>
          </div>
        </div>

      </div>

      {/* Grid de Post-its Guardados */}
      {postIts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Post-its</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {postIts.map((post) => (
              <div key={post.id} className={`rounded-xl p-4 shadow-sm flex flex-col h-48 relative group transition-transform hover:-translate-y-1 hover:shadow-md ${post.color}`}>
                <button 
                  onClick={() => deletePostIt(post.id)}
                  className="absolute top-2 right-2 text-gray-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Borrar Post-it"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <p className="text-gray-800 text-sm whitespace-pre-wrap flex-1 overflow-y-auto custom-scrollbar pr-2 mb-2">
                  {post.text}
                </p>
                <span className="text-[10px] text-gray-500 mt-auto">{post.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlay Backdrop for Modal Modal */}
      {isScratchpadExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsScratchpadExpanded(false)}
        />
      )}

    </div>
  );
}
