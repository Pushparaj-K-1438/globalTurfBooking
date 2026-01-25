"use client";

import { useState, useEffect } from "react";
import { FileText, Search, Filter, Download, RefreshCw, User, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        resource: '',
        status: '',
        startDate: '',
        endDate: ''
    });
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [filterOptions, setFilterOptions] = useState({ actions: [], resources: [] });

    useEffect(() => {
        fetchLogs();
    }, [pagination.page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', pagination.page);
            params.set('limit', 50);

            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.set(key, value);
            });

            const res = await fetch(`/api/super-admin/audit-logs?${params.toString()}`);
            const data = await res.json();

            if (data.logs) {
                setLogs(data.logs);
                setPagination(data.pagination);
                setFilterOptions(data.filters || { actions: [], resources: [] });
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        setPagination({ ...pagination, page: 1 });
        fetchLogs();
    };

    const exportLogs = async () => {
        // Export as CSV
        const csvContent = [
            ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP Address'].join(','),
            ...logs.map(log => [
                new Date(log.createdAt).toISOString(),
                log.userId?.email || 'System',
                log.action,
                log.resource,
                log.status,
                log.ipAddress || 'N/A'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const getStatusBadge = (status) => {
        if (status === 'success') {
            return <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium"><CheckCircle size={12} /> Success</span>;
        }
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"><XCircle size={12} /> Failed</span>;
    };

    const getActionColor = (action) => {
        const colors = {
            create: 'bg-emerald-100 text-emerald-700',
            update: 'bg-blue-100 text-blue-700',
            delete: 'bg-red-100 text-red-700',
            login: 'bg-purple-100 text-purple-700',
            logout: 'bg-slate-100 text-slate-700'
        };
        return colors[action] || 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
                    <p className="text-slate-500">Track all security-relevant activities</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button onClick={exportLogs} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Filters:</span>
                    </div>

                    <select
                        value={filters.action}
                        onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        <option value="">All Actions</option>
                        {filterOptions.actions.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>

                    <select
                        value={filters.resource}
                        onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        <option value="">All Resources</option>
                        {filterOptions.resources.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        <option value="">All Status</option>
                        <option value="success">Success</option>
                        <option value="failure">Failure</option>
                    </select>

                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />

                    <button onClick={applyFilters} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                        Apply
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                        <p>No audit logs found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Timestamp</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Action</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Resource</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock size={14} className="text-slate-400" />
                                                <span className="text-slate-900 font-medium">
                                                    {new Date(log.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-slate-500">
                                                    {new Date(log.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                                    <User size={14} className="text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{log.userId?.name || 'System'}</p>
                                                    <p className="text-xs text-slate-500">{log.userId?.email || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-900 capitalize">{log.resource}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(log.status)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-500 font-mono">{log.ipAddress || 'N/A'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                        <p className="text-sm text-slate-500">
                            Showing {logs.length} of {pagination.total} logs
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                disabled={pagination.page === 1}
                                className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-100"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm text-slate-600">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-100"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
