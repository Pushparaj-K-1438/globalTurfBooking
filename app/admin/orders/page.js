"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Package, CheckCircle, XCircle, Clock, Eye, AlertCircle, Download, RefreshCw, Truck, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/orders");
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.details || errData.error || `Error ${res.status}`);
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);
            } else if (data.orders && Array.isArray(data.orders)) {
                setOrders(data.orders);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Order ${newStatus}`);
                fetchOrders();
            } else {
                toast.error("Failed to update order status");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'shipped': return 'bg-purple-100 text-purple-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return <CheckCircle size={14} />;
            case 'pending': return <Clock size={14} />;
            case 'cancelled': return <XCircle size={14} />;
            case 'processing': return <Package size={14} />;
            case 'shipped': return <Truck size={14} />;
            default: return null;
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch =
            o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || o.status?.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status?.toLowerCase() === 'pending').length,
        processing: orders.filter(o => o.status?.toLowerCase() === 'processing').length,
        shipped: orders.filter(o => o.status?.toLowerCase() === 'shipped').length,
        delivered: orders.filter(o => o.status?.toLowerCase() === 'delivered').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
                    <p className="text-slate-500 mt-1">Manage customer orders and fulfillment</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchOrders}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                        <Download size={16} /> Export
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                {[
                    { label: 'Total', count: stats.total, color: 'bg-slate-100 text-slate-700', icon: ShoppingBag },
                    { label: 'Pending', count: stats.pending, color: 'bg-amber-100 text-amber-700', icon: Clock },
                    { label: 'Processing', count: stats.processing, color: 'bg-blue-100 text-blue-700', icon: Package },
                    { label: 'Shipped', count: stats.shipped, color: 'bg-purple-100 text-purple-700', icon: Truck },
                    { label: 'Delivered', count: stats.delivered, color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 ${stat.color.split(' ')[0]} rounded-lg flex items-center justify-center`}>
                                <stat.icon size={20} className={stat.color.split(' ')[1]} />
                            </div>
                            <span className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.count}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-500 mt-2 block">{stat.label}</span>
                    </div>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>Failed to load orders: {error}</span>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-center gap-4 shadow-sm">
                <div className="flex-1 min-w-[200px] relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by order ID, customer name, or email..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter size={16} className="text-slate-400" />
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Order ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Items</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm font-medium text-slate-900">{order.orderId}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900">{order.customerName}</div>
                                        <div className="text-xs text-slate-500">{order.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-900">
                                            {order.items?.length || 0} item(s)
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {order.items?.slice(0, 2).map(i => i.name || i.productId?.name).join(', ')}
                                            {order.items?.length > 2 && '...'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">₹{order.totalAmount}</div>
                                        <div className="text-xs text-slate-500">{order.paymentStatus || 'Pending'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {order.status?.toLowerCase() === 'pending' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order._id, 'processing')}
                                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 bg-blue-50 rounded hover:bg-blue-100"
                                                >
                                                    Process
                                                </button>
                                            )}
                                            {order.status?.toLowerCase() === 'processing' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order._id, 'shipped')}
                                                    className="text-xs font-medium text-purple-600 hover:text-purple-700 px-2 py-1 bg-purple-50 rounded hover:bg-purple-100"
                                                >
                                                    Ship
                                                </button>
                                            )}
                                            {order.status?.toLowerCase() === 'shipped' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order._id, 'delivered')}
                                                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 px-2 py-1 bg-emerald-50 rounded hover:bg-emerald-100"
                                                >
                                                    Deliver
                                                </button>
                                            )}
                                            <button className="text-xs font-medium text-slate-600 hover:text-slate-700 px-2 py-1 bg-slate-50 rounded hover:bg-slate-100">
                                                <Eye size={14} className="inline mr-1" /> View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <ShoppingBag size={32} className="text-slate-300" />
                                            <p>No orders found</p>
                                            <p className="text-sm">Orders will appear here when customers make purchases</p>
                                        </div>
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
