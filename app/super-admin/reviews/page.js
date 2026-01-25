"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle, Flag, MessageSquare, Search, Filter } from "lucide-react";
import { toast } from "react-toastify";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    useEffect(() => { fetchReviews(); }, [statusFilter, pagination.page]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/reviews?status=${statusFilter}&page=${pagination.page}&limit=10`);
            const data = await res.json();
            if (data.reviews) {
                setReviews(data.reviews);
                setPagination(prev => ({ ...prev, totalPages: data.totalPages, total: data.total }));
            }
        } catch (error) { toast.error("Failed to fetch reviews"); }
        finally { setLoading(false); }
    };

    const handleModerate = async (id, status) => {
        try {
            const res = await fetch(`/api/super-admin/reviews/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                toast.success(`Review ${status}`);
                fetchReviews();
            }
        } catch (error) { toast.error("Failed to update review"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this review permanently?")) return;
        try {
            const res = await fetch(`/api/super-admin/reviews/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Review deleted"); fetchReviews(); }
        } catch (error) { toast.error("Failed to delete"); }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
        ));
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'flagged': return 'bg-purple-100 text-purple-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    if (loading && reviews.length === 0) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Review Moderation</h1>
                <p className="text-slate-500 mt-1">Moderate and manage customer reviews across all tenants</p>
            </header>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Status:</span>
                </div>
                {['all', 'pending', 'approved', 'rejected', 'flagged'].map(status => (
                    <button
                        key={status}
                        onClick={() => { setStatusFilter(status); setPagination(p => ({ ...p, page: 1 })); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
                <div className="ml-auto text-sm text-slate-500">{pagination.total} reviews</div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                    {review.userId?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{review.userId?.name || 'Unknown User'}</p>
                                    <p className="text-xs text-slate-500">{review.userId?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusStyle(review.status)}`}>
                                    {review.status}
                                </span>
                                {review.isVerified && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1"><CheckCircle size={10} /> Verified</span>}
                            </div>
                        </div>

                        <div className="mb-3">
                            <p className="text-sm text-slate-500 mb-1">
                                <span className="font-medium text-slate-700">{review.listingId?.title}</span>
                                {review.tenantId && <span> • {review.tenantId.name}</span>}
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="flex">{renderStars(review.overallRating)}</div>
                                <span className="font-bold text-slate-900">{review.overallRating}</span>
                                <span className="text-xs text-slate-400">• {new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {review.title && <h4 className="font-semibold text-slate-900 mb-1">{review.title}</h4>}
                        <p className="text-slate-600 text-sm mb-4">{review.comment || 'No comment provided'}</p>

                        {review.images?.length > 0 && (
                            <div className="flex gap-2 mb-4">
                                {review.images.map((img, idx) => (
                                    <img key={idx} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                                ))}
                            </div>
                        )}

                        {review.tenantReply?.comment && (
                            <div className="bg-slate-50 rounded-lg p-3 mb-4 border-l-4 border-emerald-500">
                                <p className="text-xs font-medium text-emerald-700 mb-1 flex items-center gap-1"><MessageSquare size={12} /> Tenant Reply</p>
                                <p className="text-sm text-slate-600">{review.tenantReply.comment}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                            {review.status === 'pending' && (
                                <>
                                    <button onClick={() => handleModerate(review._id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors">
                                        <CheckCircle size={14} /> Approve
                                    </button>
                                    <button onClick={() => handleModerate(review._id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">
                                        <XCircle size={14} /> Reject
                                    </button>
                                </>
                            )}
                            <button onClick={() => handleModerate(review._id, 'flagged')} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-100 transition-colors">
                                <Flag size={14} /> Flag
                            </button>
                            <button onClick={() => handleDelete(review._id)} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-slate-500 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button disabled={pagination.page === 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50">Previous</button>
                    <span className="text-sm text-slate-600">Page {pagination.page} of {pagination.totalPages}</span>
                    <button disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
}
