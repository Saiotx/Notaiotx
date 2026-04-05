'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';

export default function CalendarioPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventType, setNewEventType] = useState('Evento'); // 'Evento' | 'Recordatorio'

    useEffect(() => {
        const stored = localStorage.getItem('app_calendar_events');
        if (stored) {
            setEvents(JSON.parse(stored));
        } else {
            // Mock some initial data based on current month
            const year = new Date().getFullYear();
            const month = new Date().getMonth();
            const mockEvents = [
                { id: 1, title: 'Reunión de equipo', date: new Date(year, month, 15).toISOString(), type: 'Evento' },
                { id: 2, title: 'Llamar a cliente', date: new Date(year, month, 18).toISOString(), type: 'Recordatorio' }
            ];
            setEvents(mockEvents);
            localStorage.setItem('app_calendar_events', JSON.stringify(mockEvents));
        }
    }, []);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    // Wrap Sunday to 6, Monday to 0... standard mapping.
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const openModal = (day: number) => {
        setSelectedDate(day);
        setIsModalOpen(true);
    };

    const handleSaveEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEventTitle.trim() || !selectedDate) return;

        const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
        const newEvent = {
            id: Date.now(),
            title: newEventTitle,
            date: eventDate.toISOString(),
            type: newEventType
        };

        const updated = [...events, newEvent];
        setEvents(updated);
        localStorage.setItem('app_calendar_events', JSON.stringify(updated));

        setNewEventTitle('');
        setIsModalOpen(false);
    };

    const deleteEvent = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        const updated = events.filter(ev => ev.id !== id);
        setEvents(updated);
        localStorage.setItem('app_calendar_events', JSON.stringify(updated));
    };

    // Helper to get events for a specific day
    const getEventsForDay = (day: number) => {
        return events.filter(ev => {
            const d = new Date(ev.date);
            return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
        });
    };

    return (
        <div className="flex-1 w-full h-full bg-[#f8f9fa] flex flex-col pt-8 relative">
            <div className="px-12 mb-6 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="text-3xl font-semibold text-gray-800">Calendario</h1>
                    <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
                        <span className="font-medium text-gray-700 min-w-[140px] text-center capitalize">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 px-12 overflow-hidden flex flex-col pb-8">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">
                    {/* Weekdays header */}
                    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 shrink-0">
                        {dayNames.map(day => (
                            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
                        {Array.from({ length: startOffset }).map((_, i) => (
                            <div key={`empty-${i}`} className="border-r border-b border-gray-100 bg-gray-50/50 min-h-[100px]" />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                            const dayEvents = getEventsForDay(day);

                            return (
                                <div
                                    key={day}
                                    onClick={() => openModal(day)}
                                    className={`border-r border-b border-gray-100 min-h-[100px] p-2 hover:bg-gray-50 cursor-pointer transition-colors relative group ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-500 text-white' : 'text-gray-700'}`}>
                                            {day}
                                        </span>
                                        <Plus className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[120px] custom-scrollbar">
                                        {dayEvents.map(ev => (
                                            <div
                                                key={ev.id}
                                                className={`text-xs px-2 py-1.5 rounded-md truncate font-medium flex items-center justify-between group/event ${ev.type === 'Evento' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}
                                                title={ev.title}
                                            >
                                                <span className="truncate">{ev.title}</span>
                                                <button
                                                    onClick={(e) => deleteEvent(e, ev.id)}
                                                    className="opacity-0 group-hover/event:opacity-100 text-gray-500 hover:text-red-500 transition-opacity shrink-0 ml-1"
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
                            <div key={`end-empty-${i}`} className="border-r border-b border-gray-100 bg-gray-50/50 min-h-[100px]" />
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
