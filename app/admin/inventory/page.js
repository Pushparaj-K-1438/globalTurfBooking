"use client";

import { useState, useEffect } from "react";
import { Package, Search, AlertTriangle, TrendingUp, TrendingDown, Edit2, Save, X, Filter } from "lucide-react";
import { toast } from "react-toastify";

export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editStock, setEditStock] = useState(0);
    const [filterLowStock, setFilterLowStock] = useState(false);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(res.ok && Array.isArray(data) ? data : []);
        } catch { setProducts([]); }
        finally { setLoading(false); }
    };

    const updateStock = async (id) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stock: editStock })
            });
            if (res.ok) {
                toast.success("Stock updated");
                fetchProducts();
                setEditingId(null);
            } else toast.error("Update failed");
        } catch { toast.error("Error updating stock"); }
    };

    const filteredProducts = products
        .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(p => !filterLowStock || (p.stock || 0) < 10);

    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStockCount = products.filter(p => (p.stock || 0) < 10).length;
    const outOfStockCount = products.filter(p => (p.stock || 0) === 0).length;

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-cyan-600 border-t-transparent rounded-full" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold">Inventory Management</h1>
                <p className="text-slate-500">Track and manage your product stock levels</p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl border">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-cyan-100 rounded-lg"><Package size={20} className="text-cyan-600" /></div>
                        <span className="text-sm text-slate-500">Total Products</span>
                    </div>
                    <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg"><TrendingUp size={20} className="text-green-600" /></div>
                        <span className="text-sm text-slate-500">Total Stock</span>
                    </div>
                    <p className="text-2xl font-bold">{totalStock}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 rounded-lg"><AlertTriangle size={20} className="text-amber-600" /></div>
                        <span className="text-sm text-slate-500">Low Stock</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{lowStockCount}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-lg"><TrendingDown size={20} className="text-red-600" /></div>
                        <span className="text-sm text-slate-500">Out of Stock</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white border pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-cyan-500/20" />
                </div>
                <button onClick={() => setFilterLowStock(!filterLowStock)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${filterLowStock ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                    <Filter size={16} /> {filterLowStock ? 'Showing Low Stock' : 'Filter Low Stock'}
                </button>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Product</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">SKU</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Price</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredProducts.length > 0 ? filteredProducts.map(product => (
                            <tr key={product._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">
                                            {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-full h-full p-3 text-slate-400" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{product.name}</p>
                                            <p className="text-xs text-slate-500">{product.category || 'Uncategorized'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{product.sku || '-'}</td>
                                <td className="px-6 py-4 font-medium">₹{product.price}</td>
                                <td className="px-6 py-4">
                                    {editingId === product._id ? (
                                        <input type="number" className="w-20 border rounded px-2 py-1 text-center" value={editStock} onChange={e => setEditStock(+e.target.value)} autoFocus />
                                    ) : (
                                        <span className={`font-bold ${(product.stock || 0) === 0 ? 'text-red-600' : (product.stock || 0) < 10 ? 'text-amber-600' : 'text-slate-900'}`}>{product.stock || 0}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {(product.stock || 0) === 0 ? (
                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Out of Stock</span>
                                    ) : (product.stock || 0) < 10 ? (
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Low Stock</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">In Stock</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {editingId === product._id ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => updateStock(product._id)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"><Save size={16} /></button>
                                            <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => { setEditingId(product._id); setEditStock(product.stock || 0); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><Edit2 size={16} /></button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">No products found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
