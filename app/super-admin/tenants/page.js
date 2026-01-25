"use client";

import { useState, useEffect } from "react";
import { Building2, CheckCircle, XCircle, Clock, Play, Pause, Eye, Edit2, Search, Filter } from "lucide-react";
import { toast } from "react-toastify";

export default function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchTenants(); }, []);

    const fetchTenants = async () => {
        try {
            const res = await fetch("/api/super-admin/tenants");
            const data = await res.json();
            if (Array.isArray(data)) setTenants(data);
        } catch (error) { toast.error("Failed to fetch tenants"); }
        finally { setLoading(false); }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/super-admin/tenants/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                toast.success(`Tenant ${status}`);
                fetchTenants();
            }
        } catch (error) { toast.error("Failed to update tenant"); }
    };

    const handleUpdatePlan = async (id, plan) => {
        try {
            const res = await fetch(`/api/super-admin/tenants/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            });
            if (res.ok) {
                toast.success(`Plan updated to ${plan}`);
                fetchTenants();
                setShowModal(false);
            }
        } catch (error) { toast.error("Failed to update plan"); }
    };

    const handleUpdateModules = async (id, modules) => {
        try {
            const res = await fetch(`/api/super-admin/tenants/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ modules }),
            });
            if (res.ok) {
                toast.success("Modules properties updated");
                fetchTenants();
                setShowModal(false);
            }
        } catch (error) { toast.error("Failed to update modules"); }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle size={14} className="text-emerald-600" />;
            case 'pending': return <Clock size={14} className="text-amber-600" />;
            case 'suspended': return <Pause size={14} className="text-red-600" />;
            default: return null;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'suspended': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const filteredTenants = tenants.filter(t => {
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.slug.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Tenant Management</h1>
                <p className="text-slate-500 mt-1">Manage all registered tenants on the platform</p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total', count: tenants.length, color: 'bg-slate-100 text-slate-700' },
                    { label: 'Active', count: tenants.filter(t => t.status === 'active').length, color: 'bg-emerald-100 text-emerald-700' },
                    { label: 'Pending', count: tenants.filter(t => t.status === 'pending').length, color: 'bg-amber-100 text-amber-700' },
                    { label: 'Suspended', count: tenants.filter(t => t.status === 'suspended').length, color: 'bg-red-100 text-red-700' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                        <span className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.count}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tenants..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    {['all', 'active', 'pending', 'suspended'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Tenant</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Slug</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Plan</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Created</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredTenants.map((tenant) => (
                            <tr key={tenant._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                            {tenant.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{tenant.name}</p>
                                            {tenant.email && <p className="text-xs text-slate-500">{tenant.email}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500 font-mono text-sm">{tenant.slug}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusStyle(tenant.status)}`}>
                                        {getStatusIcon(tenant.status)}
                                        {tenant.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold capitalize border border-slate-200">
                                        {tenant.plan}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(tenant.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {tenant.status === 'pending' && (
                                        <button onClick={() => handleUpdateStatus(tenant._id, 'active')} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline">Approve</button>
                                    )}
                                    {tenant.status === 'active' && (
                                        <button onClick={() => handleUpdateStatus(tenant._id, 'suspended')} className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline">Suspend</button>
                                    )}
                                    {tenant.status === 'suspended' && (
                                        <button onClick={() => handleUpdateStatus(tenant._id, 'active')} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline">Activate</button>
                                    )}
                                    <button onClick={() => { setSelectedTenant(tenant); setShowModal(true); }} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showModal && selectedTenant && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">Edit Tenant</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">Tenant Name</p>
                                <p className="font-semibold text-slate-900">{selectedTenant.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Slug</p>
                                <p className="font-mono text-slate-900">{selectedTenant.slug}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Plan</label>
                                <select
                                    defaultValue={selectedTenant.plan}
                                    onChange={(e) => handleUpdatePlan(selectedTenant._id, e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="free">Free</option>
                                    <option value="basic">Basic</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Modules</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['turfs', 'hotels', 'events', 'gym', 'wellness', 'bookings', 'payments', 'reviews', 'coupons'].map(module => (
                                        <label key={module} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                            <input
                                                type="checkbox"
                                                checked={selectedTenant.modules?.includes(module)}
                                                onChange={(e) => {
                                                    const newModules = e.target.checked
                                                        ? [...(selectedTenant.modules || []), module]
                                                        : (selectedTenant.modules || []).filter(m => m !== module);
                                                    setSelectedTenant({ ...selectedTenant, modules: newModules });
                                                }}
                                                className="rounded text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm font-medium text-slate-700 capitalize">{module}</span>
                                        </label>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleUpdateModules(selectedTenant._id, selectedTenant.modules)}
                                    className="mt-2 w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
                                >
                                    Update Modules
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                                <div className="flex gap-2">
                                    {['active', 'pending', 'suspended'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleUpdateStatus(selectedTenant._id, status)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${selectedTenant.status === status ? getStatusStyle(status) : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
