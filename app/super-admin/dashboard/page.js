"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "../../../lib/currency";
import { DollarSign, Users, Calendar, CheckCircle, XCircle } from "lucide-react";

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState(null);
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTenants = async () => {
        try {
            const tenantsRes = await fetch("/api/super-admin/tenants");
            const tenantsData = await tenantsRes.json();
            if (Array.isArray(tenantsData)) {
                setTenants(tenantsData);
            } else {
                console.error("Tenants data is not an array:", tenantsData);
                setTenants([]);
            }
        } catch (error) {
            console.error("Failed to fetch tenants", error);
        }
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const statsRes = await fetch("/api/super-admin/analytics");
                const statsData = await statsRes.json();
                setStats(statsData);
                await fetchTenants();
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleUpdateTenantStatus = async (tenantId, newStatus) => {
        try {
            const res = await fetch(`/api/super-admin/tenants/${tenantId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                // Refresh the tenants list
                await fetchTenants();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update tenant status");
            }
        } catch (error) {
            console.error("Failed to update tenant status", error);
            alert("Failed to update tenant status");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, color, bgInfo }) => (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${bgInfo} text-white shadow-sm`}>
                    <Icon size={24} className={color} />
                </div>
            </div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {value}
            </h3>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-8">
            <header className="mb-8 md:mb-10">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    Global Platform Overview
                </h1>
                <p className="text-slate-500 mt-1">Monitor performance across all tenants</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    icon={DollarSign}
                    color="text-emerald-600"
                    bgInfo="bg-emerald-100"
                />
                <StatCard
                    title="Active Tenants"
                    value={stats?.tenantCount || 0}
                    icon={Users}
                    color="text-blue-600"
                    bgInfo="bg-blue-100"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats?.totalBookings || 0}
                    icon={Calendar}
                    color="text-purple-600"
                    bgInfo="bg-purple-100"
                />
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900">Manage Tenants</h2>
                    <p className="text-sm text-slate-500 mt-1">View and manage tenant accounts</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {Array.isArray(tenants) && tenants.length > 0 ? (
                                tenants.map((tenant) => (
                                    <tr key={tenant._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900">{tenant.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm font-mono">{tenant.slug}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${tenant.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {tenant.status === 'active' ? <CheckCircle size={12} /> : <div className="w-2 h-2 rounded-full bg-amber-500" />}
                                                {tenant.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold capitalize border border-slate-200">
                                                {tenant.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            {tenant.status !== 'active' && (
                                                <button
                                                    onClick={() => handleUpdateTenantStatus(tenant._id, 'active')}
                                                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors hover:underline"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {tenant.status !== 'suspended' && (
                                                <button
                                                    onClick={() => handleUpdateTenantStatus(tenant._id, 'suspended')}
                                                    className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors hover:underline"
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No tenants found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
