'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutTemplate, Plus, FileText, Briefcase, Coffee, CheckSquare, Trash2 } from 'lucide-react';

export default function PlantillasPage() {
    const defaultTemplates = [
        { id: 1, name: 'Reunión de Equipo', type: 'Trabajo', color: 'bg-emerald-500', icon: Briefcase, desc: 'Estructura para actas de reunión y decisiones.' },
        { id: 2, name: 'Planificador Semanal', type: 'Productividad', color: 'bg-blue-500', icon: CheckSquare, desc: 'Prioridades, metas y bloqueo de tiempo.' },
        { id: 3, name: 'Diario de Reflexión', type: 'Personal', color: 'bg-orange-400', icon: Coffee, desc: 'Espacio para capturar pensamientos al final del día.' },
        { id: 4, name: 'Nota Vacía', type: 'General', color: 'bg-gray-400', icon: FileText, desc: 'Comprueba esta estructura vacía para inspiración libre.' }
    ];

    const [templates, setTemplates] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const router = useRouter();

    const useTemplate = (template: any) => {
        let content = '';
        if (template.name === 'Reunión de Equipo') {
            content = '<h2>Asistentes</h2><ul class="list-disc ml-6 mb-2"><li></li></ul><h2>Orden del día</h2><ul class="list-disc ml-6 mb-2"><li></li></ul><h2>Decisiones</h2><ul class="list-disc ml-6 mb-2"><li></li></ul>';
        } else if (template.name === 'Planificador Semanal') {
            content = '<h2>Prioridades</h2><ol class="list-decimal ml-6 mb-2"><li></li></ol><h2>Lunes</h2><ul class="list-disc ml-6 mb-2"><li></li></ul><h2>Martes</h2><ul class="list-disc ml-6 mb-2"><li></li></ul>';
        } else if (template.name === 'Diario de Reflexión') {
            content = '<h2>¿Qué ha ido bien hoy?</h2><p><br></p><h2>¿Qué podría mejorar?</h2><p><br></p><h2>Comentarios</h2><p><br></p>';
        } else {
            content = `<h2>${template.name}</h2><p>Empieza a escribir aquí...</p>`;
        }

        localStorage.setItem('app_active_template', JSON.stringify({
            title: template.name,
            content: content
        }));
        router.push('/notas');
    };

    useEffect(() => {
        const stored = localStorage.getItem('app_templates');
        if (stored) {
            setTemplates(JSON.parse(stored));
        } else {
            setTemplates(defaultTemplates.map(t => ({ ...t, iconName: t.icon.displayName || 'FileText' })));
        }
    }, [])

    const getIcon = (iconName: string, id: number) => {
        if (id <= 4) {
            return defaultTemplates.find(t => t.id === id)?.icon || FileText;
        }
        return LayoutTemplate;
    };

    const handleCreateTemplate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        const newTemplate = {
            id: Date.now(),
            name: newTitle,
            type: 'Personalizado',
            color: 'bg-purple-500',
            iconName: 'LayoutTemplate',
            desc: 'Tu propia plantilla personalizada creada manualmente.'
        };

        const updated = [...templates, newTemplate];
        setTemplates(updated);
        localStorage.setItem('app_templates', JSON.stringify(updated));

        setNewTitle('');
        setIsAdding(false);
    };

    const deleteTemplate = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (id <= 4) return; // Don't delete defaults
        const updated = templates.filter(t => t.id !== id);
        setTemplates(updated);
        localStorage.setItem('app_templates', JSON.stringify(updated));
    };

    return (
        <div className="flex-1 w-full h-full bg-[#f8f9fa] flex flex-col pt-8">
            <div className="px-12 mb-8 shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-3">
                        <LayoutTemplate className="w-8 h-8 text-[#00a82d]" />
                        Plantillas
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Ahorra tiempo empezando con una estructura prediseñada.</p>
                </div>
            </div>

            <div className="flex-1 px-12 overflow-y-auto pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                    {/* Create New Button */}
                    <div
                        onClick={() => { setIsAdding(true); setTimeout(() => document.getElementById('template-input')?.focus(), 10); }}
                        className="border-2 border-dashed border-gray-300 hover:border-[#00a82d] bg-white hover:bg-emerald-50/20 rounded-2xl flex flex-col items-center justify-center min-h-[230px] cursor-pointer transition-all group shadow-sm hover:shadow"
                    >
                        {!isAdding ? (
                            <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-[#00a82d]">
                                <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-[15px]">Crear nueva plantilla</span>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateTemplate} className="w-full px-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                                <input
                                    id="template-input"
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="Nombre de la plantilla..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a82d] text-center font-medium"
                                />
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-semibold text-gray-600 transition-colors">Cancelar</button>
                                    <button type="submit" className="flex-1 px-3 py-1.5 bg-[#00a82d] hover:bg-[#008f26] rounded-md text-xs font-semibold text-white transition-colors">Guardar</button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Pre-made and Custom Templates */}
                    {templates.map(template => {
                        const IconComponent = getIcon(template.iconName, template.id);
                        const isCustom = template.id > 4;

                        return (
                            <div key={template.id} onClick={() => useTemplate(template)} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative flex flex-col min-h-[230px] cursor-pointer">

                                {isCustom && (
                                    <button
                                        onClick={(e) => deleteTemplate(e, template.id)}
                                        className="absolute top-3 right-3 p-1.5 bg-white/50 backdrop-blur-sm hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-all z-20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}

                                <div className={`h-[100px] ${template.color} flex items-center justify-center relative overflow-hidden shrink-0`}>
                                    <IconComponent className="w-10 h-10 text-white/90 relative z-10" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm ${isCustom ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {template.type}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-[15px] mb-1.5 line-clamp-1">{template.name}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium flex-1 line-clamp-3">
                                        {template.desc}
                                    </p>

                                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-center">
                                        <span className="text-xs font-bold text-[#00a82d] opacity-0 group-hover:opacity-100 transition-opacity">Usar plantilla →</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
}
