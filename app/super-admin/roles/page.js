"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, XCircle, Shield, Check } from "lucide-react";
import { toast } from "react-toastify";

const RESOURCES = ['dashboard', 'listings', 'bookings', 'slots', 'users', 'payments', 'reviews', 'coupons', 'settings', 'reports'];
const ACTIONS = ['create', 'read', 'update', 'delete', 'manage'];

export default function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "", permissions: [], isActive: true });

    useEffect(() => { fetchRoles(); }, []);

    const fetchRoles = async () => {
        try {
            const res = await fetch("/api/super-admin/roles");
            const data = await res.json();
            if (Array.isArray(data)) setRoles(data);
        } catch (error) { toast.error("Failed to fetch roles"); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editMode ? `/api/super-admin/roles/${currentId}` : "/api/super-admin/roles";
            const res = await fetch(url, {
                method: editMode ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success(editMode ? "Role updated" : "Role created");
                setShowModal(false); resetForm(); fetchRoles();
            } else {
                const data = await res.json();
                toast.error(data.error || "Operation failed");
            }
        } catch (error) { toast.error("An error occurred"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this role?")) return;
        try {
            const res = await fetch(`/api/super-admin/roles/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Role deleted"); fetchRoles(); }
            else { const data = await res.json(); toast.error(data.error); }
        } catch (error) { toast.error("Failed to delete"); }
    };

    const openEdit = (item) => {
        setFormData({ name: item.name, description: item.description || "", permissions: item.permissions || [], isActive: item.isActive });
        setCurrentId(item._id); setEditMode(true); setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: "", description: "", permissions: [], isActive: true });
        setEditMode(false); setCurrentId(null);
    };

    const togglePermission = (resource, action) => {
        const perms = [...formData.permissions];
        const idx = perms.findIndex(p => p.resource === resource);

        if (idx === -1) {
            perms.push({ resource, actions: [action] });
        } else {
            const actions = perms[idx].actions;
            if (actions.includes(action)) {
                perms[idx].actions = actions.filter(a => a !== action);
                if (perms[idx].actions.length === 0) perms.splice(idx, 1);
            } else {
                perms[idx].actions.push(action);
            }
        }
        setFormData({ ...formData, permissions: perms });
    };

    const hasPermission = (resource, action) => {
        const perm = formData.permissions.find(p => p.resource === resource);
        return perm?.actions?.includes(action) || false;
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
                    <p className="text-slate-500 mt-1">Configure access control for different user types</p>
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /><span>Add Role</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <div key={role._id} className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all ${role.isSystem ? 'border-purple-200 bg-purple-50/30' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Shield size={24} /></div>
                            <div className="flex gap-1">
                                {!role.isSystem && (
                                    <>
                                        <button onClick={() => openEdit(role)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(role._id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                                    </>
                                )}
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">{role.name}</h3>
                        <p className="text-xs text-slate-400 font-mono mb-2">{role.slug}</p>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{role.description || "No description"}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            {role.isSystem && <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">System</span>}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${role.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{role.isActive ? 'Active' : 'Inactive'}</span>
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{role.permissions?.length || 0} resources</span>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">{editMode ? "Edit Role" : "New Role"}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Role Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Manager" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                                    <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Can manage listings and bookings" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Permissions Matrix</label>
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Resource</th>
                                                {ACTIONS.map(action => (
                                                    <th key={action} className="px-3 py-3 text-center text-xs font-bold text-slate-500 uppercase">{action}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {RESOURCES.map(resource => (
                                                <tr key={resource} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium text-slate-700 capitalize">{resource}</td>
                                                    {ACTIONS.map(action => (
                                                        <td key={action} className="px-3 py-3 text-center">
                                                            <button type="button" onClick={() => togglePermission(resource, action)} className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${hasPermission(resource, action) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                                                {hasPermission(resource, action) && <Check size={14} />}
                                                            </button>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-emerald-600" />
                                <span className="text-sm font-medium text-slate-700">Active</span>
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-slate-600 font-medium border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700">Save Role</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
