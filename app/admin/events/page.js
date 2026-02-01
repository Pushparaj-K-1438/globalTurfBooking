"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Calendar, MapPin, Users, Clock, X, Ticket } from "lucide-react";
import { toast } from "react-toastify";

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const initialFormState = {
        title: "", description: "", type: "event",
        priceConfig: { basePrice: 0, pricingModel: "per_event" },
        location: { address: "", city: "" },
        capacity: 50, eventDate: "", startTime: "10:00", endTime: "18:00",
        category: "conference", images: []
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => { fetchEvents(); }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/admin/events");
            const data = await res.json();
            setEvents(res.ok && Array.isArray(data) ? data : []);
        } catch { setEvents([]); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editMode ? `/api/admin/events/${currentId}` : "/api/admin/events";
        const res = await fetch(url, {
            method: editMode ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, type: "event" }),
        });
        if (res.ok) {
            toast.success(editMode ? "Event updated" : "Event created");
            setShowForm(false); fetchEvents();
        } else toast.error("Operation failed");
    };

    const handleEdit = (e) => {
        setFormData({
            title: e.title, description: e.description || "", type: "event",
            priceConfig: e.priceConfig || { basePrice: e.price, pricingModel: "per_event" },
            location: e.location || {}, capacity: e.capacity || 50,
            eventDate: e.eventDate?.split('T')[0] || "", startTime: e.startTime || "10:00",
            endTime: e.endTime || "18:00", category: e.category || "conference", images: e.images || []
        });
        setCurrentId(e._id); setEditMode(true); setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Delete this event?")) {
            const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Deleted"); fetchEvents(); }
        }
    };

    const categories = ["conference", "wedding", "party", "concert", "exhibition", "corporate"];
    const getCategoryColor = (c) => ({ conference: "bg-blue-100 text-blue-700", wedding: "bg-pink-100 text-pink-700", party: "bg-purple-100 text-purple-700", concert: "bg-orange-100 text-orange-700", exhibition: "bg-teal-100 text-teal-700", corporate: "bg-slate-100 text-slate-700" }[c] || "bg-slate-100");

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div><h1 className="text-2xl font-bold">Events & Venues</h1><p className="text-slate-500">Manage events</p></div>
                <button onClick={() => { setFormData(initialFormState); setEditMode(false); setShowForm(true); }} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg"><Plus size={18} /> Create Event</button>
            </header>
            <div className="mb-6 relative max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="Search events..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500/20" />
            </div>
            {events.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-dashed border-2 border-slate-200"><Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" /><h3 className="font-semibold">No events</h3></div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.filter(e => e.title?.toLowerCase().includes(searchTerm.toLowerCase())).map(event => (
                        <div key={event._id} className="bg-white rounded-2xl overflow-hidden border hover:shadow-lg transition-all">
                            <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 relative flex items-center justify-center">
                                {event.images?.[0] ? <img src={event.images[0]} alt="" className="w-full h-full object-cover" /> : <Ticket size={48} className="text-white/50" />}
                                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold capitalize ${getCategoryColor(event.category)}`}>{event.category}</span>
                                <span className="absolute bottom-3 right-3 bg-white/90 px-3 py-1 rounded-full font-bold">₹{event.priceConfig?.basePrice || event.price}</span>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                                <div className="space-y-1 text-sm text-slate-600 mb-4">
                                    <div className="flex items-center gap-2"><Calendar size={14} />{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBD'}</div>
                                    <div className="flex items-center gap-2"><Clock size={14} />{event.startTime} - {event.endTime}</div>
                                    <div className="flex items-center gap-2"><Users size={14} />{event.capacity} guests</div>
                                </div>
                                <div className="flex gap-2 pt-4 border-t">
                                    <button onClick={() => handleEdit(event)} className="flex-1 py-2 border rounded-lg text-sm hover:border-purple-500 hover:text-purple-600 flex items-center justify-center gap-1"><Edit2 size={14} />Edit</button>
                                    <button onClick={() => handleDelete(event._id)} className="w-10 flex items-center justify-center border rounded-lg hover:border-red-300 hover:text-red-500"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="font-bold">{editMode ? 'Edit Event' : 'Create Event'}</h2>
                            <button onClick={() => setShowForm(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <input type="text" required placeholder="Event name" className="w-full border rounded-lg px-4 py-2.5" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <select className="border rounded-lg px-4 py-2.5" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input type="number" placeholder="Price" className="border rounded-lg px-4 py-2.5" value={formData.priceConfig.basePrice} onChange={e => setFormData({ ...formData, priceConfig: { ...formData.priceConfig, basePrice: +e.target.value } })} />
                                <input type="date" className="border rounded-lg px-4 py-2.5" value={formData.eventDate} onChange={e => setFormData({ ...formData, eventDate: e.target.value })} />
                                <input type="number" placeholder="Capacity" className="border rounded-lg px-4 py-2.5" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: +e.target.value })} />
                                <input type="time" className="border rounded-lg px-4 py-2.5" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                                <input type="time" className="border rounded-lg px-4 py-2.5" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                            </div>
                            <textarea rows="2" placeholder="Description" className="w-full border rounded-lg px-4 py-2.5" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            <input type="text" placeholder="City" className="w-full border rounded-lg px-4 py-2.5" value={formData.location.city} onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })} />
                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg">{editMode ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
