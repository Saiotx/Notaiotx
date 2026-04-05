'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToDocument, setDocument } from '@/lib/firebase/firestore';

export default function CalendarioPage() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventType, setNewEventType] = useState('Evento'); // 'Evento' | 'Recordatorio'

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToDocument(user.uid, 'calendario/data', (data) => {
            if (data && data.items) {
                setEvents(data.items);
            } else {
                // Mock some initial data based on current month
                const year = new Date().getFullYear();
                const month = new Date().getMonth();
                const mockEvents = [
                    { id: 1, title: 'Reunión de equipo', date: new Date(year, month, 15).toISOString(), type: 'Evento' },
                    { id: 2, title: 'Llamar a cliente', date: new Date(year, month, 18).toISOString(), type: 'Recordatorio' }
                ];
                setEvents(mockEvents);
                setDocument(user.uid, 'calendario/data', { items: mockEvents });
            }
        });

        return () => unsubscribe();
    }, [user]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    // Wrap Sunday to 6, Monday to 0... standard mapping.
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const openModal = (day: number) => {
        setSelectedDate(day);
        setIsModalOpen(true);
    };

    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEventTitle.trim() || !selectedDate || !user) return;

        const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
        const newEvent = {
            id: Date.now(),
            title: newEventTitle,
            date: eventDate.toISOString(),
            type: newEventType
        };

        const updated = [...events, newEvent];
        setEvents(updated);
        
        try {
            await setDocument(user.uid, 'calendario/data', { items: updated });
        } catch (error) {
            console.error("Error saving event", error);
        }

        setNewEventTitle('');
        setIsModalOpen(false);
    };

    const deleteEvent = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!user) return;
        
        const updated = events.filter(ev => ev.id !== id);
        setEvents(updated);
        
        try {
            await setDocument(user.uid, 'calendario/data', { items: updated });
        } catch (error) {
            console.error("Error deleting event", error);
        }
    };

    // Helper to get events for a specific day
    const getEventsForDay = (day: number) => {
        return events.filter(ev => {
            const d = new Date(ev.date);
            return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
        });
    };

    return (
        <div className="flex-1 w-full h-full bg-[#f8f9fa] flex flex-col pt-6 sm:pt-8 relative">
            <div className="px-4 sm:px-8 lg:px-12 mb-4 sm:mb-6 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Calendario</h1>
                    <div className="flex items-center gap-2 sm:gap-4 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                        <button onClick={prevMonth} className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-md transition-colors"><ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" /></button>
                        <span className="font-medium text-gray-700 min-w-[100px] sm:min-w-[140px] text-center capitalize text-sm sm:text-base">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={nextMonth} className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-md transition-colors"><ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" /></button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 px-4 sm:px-8 lg:px-12 overflow-hidden flex flex-col pb-8">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">
                    {/* Weekdays header */}
                    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 shrink-0">
                        {dayNames.map(day => (
                            <div key={day} className="py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-500 tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
                        {Array.from({ length: startOffset }).map((_, i) => (
                            <div key={`empty-${i}`} className="border-r border-b border-gray-100 bg-gray-50/50 min-h-[80px] sm:min-h-[100px]" />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                            const dayEvents = getEventsForDay(day);

                            return (
                                <div
                                    key={day}
                                    onClick={() => openModal(day)}
                                    className={`border-r border-b border-gray-100 min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 hover:bg-gray-50 cursor-pointer transition-colors relative group ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}
                                >
                                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                                        <span className={`text-xs sm:text-sm font-medium w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-500 text-white' : 'text-gray-700'}`}>
                                            {day}
                                        </span>
                                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
                                    </div>

                                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] sm:max-h-[120px] custom-scrollbar">
                                        {dayEvents.map(ev => (
                                            <div
                                                key={ev.id}
                                                className={`text-[9px] sm:text-xs px-1 sm:px-2 py-1 sm:py-1.5 rounded-md truncate font-medium flex items-center justify-between group/event ${ev.type === 'Evento' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}
                                                title={ev.title}
                                            >
                                                <span className="truncate">{ev.title}</span>
                                                <button
                                                    onClick={(e) => deleteEvent(e, ev.id)}
                                                    className="opacity-0 group-hover/event:opacity-100 text-gray-500 hover:text-red-500 transition-opacity shrink-0 md:ml-1 md:touch-auto touch-manipulation"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Fill remaining cells */}
                        {Array.from({ length: Math.max(0, 35 - (startOffset + daysInMonth)) }).map((_, i) => (
                            <div key={`end-empty-${i}`} className="border-r border-b border-gray-100 bg-gray-50/50 min-h-[80px] sm:min-h-[100px]" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-semibold text-gray-800">
                                Nuevo para el {selectedDate} {monthNames[currentDate.getMonth()]}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
                        </div>

                        <form onSubmit={handleSaveEvent} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Ej: Cumpleaños de María"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer p-2 border border-emerald-100 bg-emerald-50 rounded-lg flex-1">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="Evento"
                                            checked={newEventType === 'Evento'}
                                            onChange={(e) => setNewEventType(e.target.value)}
                                            className="accent-emerald-600"
                                        />
                                        <CalendarIcon className="w-4 h-4 text-emerald-600" />
                                        <span className="text-emerald-900 font-medium">Evento</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer p-2 border border-orange-100 bg-orange-50 rounded-lg flex-1">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="Recordatorio"
                                            checked={newEventType === 'Recordatorio'}
                                            onChange={(e) => setNewEventType(e.target.value)}
                                            className="accent-orange-600"
                                        />
                                        <Clock className="w-4 h-4 text-orange-600" />
                                        <span className="text-orange-900 font-medium">Aviso</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#00a82d] hover:bg-[#008f26] rounded-lg transition-colors shadow-sm">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
