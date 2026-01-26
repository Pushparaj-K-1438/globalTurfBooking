"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Package, Search, MoveRight } from "lucide-react";
import { toast } from "react-toastify";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/admin/products");
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Product deleted");
                fetchProducts();
            } else {
                toast.error("Failed to delete product");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-slate-500">Loading products...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Products</h1>
                    <p className="text-slate-500 mt-1">Manage inventory and ecommerce items</p>
                </div>
                <Link href="/admin/products/new" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                    <Plus size={18} /> Add Product
                </Link>
            </header>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white shadow-sm"
                />
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Package size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No products found</h3>
                    <p className="text-slate-500 mb-6">Get started by creating your first product.</p>
                    <Link href="/admin/products/new" className="text-emerald-600 font-medium hover:underline inline-flex items-center gap-1">
                        Create Product <MoveRight size={16} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="aspect-[4/3] bg-slate-100 relative">
                                {product.images?.[0]?.url ? (
                                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Package size={40} />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/admin/products/${product._id}`} className="p-2 bg-white text-slate-600 rounded-lg shadow-sm hover:text-emerald-600">
                                        <Edit2 size={16} />
                                    </Link>
                                    <button onClick={() => handleDelete(product._id)} className="p-2 bg-white text-slate-600 rounded-lg shadow-sm hover:text-red-600">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                {!product.isActive && (
                                    <div className="absolute top-3 left-3 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                        Inactive
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 mb-1">{product.name}</h3>
                                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{product.description}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-lg font-bold text-emerald-600">₹{product.price}</span>
                                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase">
                                        {product.category || 'Uncategorized'}
                                    </span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                                    <span>Stock: {product.isTrackStock ? product.stock : 'Unlimited'}</span>
                                    <span>SKU: {product.sku || '-'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
