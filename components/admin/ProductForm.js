"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function ProductForm({ productId }) {
    const router = useRouter();
    const isEditing = !!productId;
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        compareAtPrice: "",
        category: "",
        stock: 0,
        isTrackStock: true,
        sku: "",
        isActive: true,
        images: [],
    });

    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        if (isEditing) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/admin/products/${productId}`);
            const data = await res.json();
            if (res.ok) {
                setFormData({
                    ...data,
                    price: data.price || "",
                    compareAtPrice: data.compareAtPrice || "",
                    images: data.images || []
                });
            } else {
                toast.error("Failed to load product");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error loading product");
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEditing ? `/api/admin/products/${productId}` : "/api/admin/products";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
                    stock: Number(formData.stock)
                }),
            });

            if (res.ok) {
                toast.success(isEditing ? "Product updated" : "Product created");
                router.push("/admin/products");
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to save product");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const addImage = () => {
        if (!imageUrl) return;
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, { url: imageUrl, alt: formData.name }]
        }));
        setImageUrl("");
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    if (fetching) return <div className="p-8 text-center">Loading...</div>;

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{isEditing ? "Edit Product" : "New Product"}</h1>
                        <p className="text-slate-500 text-sm mt-1">{isEditing ? "Update product details" : "Add a new item to text inventory"}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={() => router.push("/admin/products")} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
                        <Save size={18} /> {loading ? "Saving..." : "Save Product"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="font-bold text-lg text-slate-900 mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="e.g. Pro Football Widget"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all min-h-[120px]"
                                    placeholder="Describe the product..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="font-bold text-lg text-slate-900 mb-4">Media</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        className="flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="https://example.com/image.jpg"
                                        value={imageUrl}
                                        onChange={e => setImageUrl(e.target.value)}
                                    />
                                    <button type="button" onClick={addImage} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                                        Add
                                    </button>
                                </div>
                            </div>

                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-4 mt-4">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group bg-slate-50">
                                            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 p-1 bg-white/90 text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {formData.images.length === 0 && (
                                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 bg-slate-50/50">
                                    <ImageIcon size={32} className="mb-2 opacity-50" />
                                    <p className="text-sm">No images added yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="font-bold text-lg text-slate-900 mb-4">Pricing</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Compare at Price</label>
                                <input
                                    type="number"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="0.00"
                                    value={formData.compareAtPrice}
                                    onChange={e => setFormData({ ...formData, compareAtPrice: e.target.value })}
                                />
                                <p className="text-xs text-slate-500 mt-1">Leave empty if not on sale</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="font-bold text-lg text-slate-900 mb-4">Inventory & details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="e.g. Equipment"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="Stock Keeping Unit"
                                    value={formData.sku}
                                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <label className="text-sm font-medium text-slate-700">Track Stock</label>
                                <input
                                    type="checkbox"
                                    checked={formData.isTrackStock}
                                    onChange={e => setFormData({ ...formData, isTrackStock: e.target.checked })}
                                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                />
                            </div>

                            {formData.isTrackStock && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="0"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="font-bold text-lg text-slate-900 mb-4">Status</h2>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    checked={formData.isActive}
                                    onChange={() => setFormData({ ...formData, isActive: true })}
                                    className="text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-slate-700">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    checked={!formData.isActive}
                                    onChange={() => setFormData({ ...formData, isActive: false })}
                                    className="text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-slate-700">Draft</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
