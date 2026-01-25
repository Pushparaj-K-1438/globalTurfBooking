"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle, Clock, Search, Filter } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [statusFilter, setStatusFilter] = useState("all");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    useEffect(() => { fetchReviews(); }, [statusFilter]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reviews?status=${statusFilter}`);
            const data = await res.json();
            if (data.reviews) {
                setReviews(data.reviews);
                setStats(data.stats || { total: 0, pending: 0, approved: 0 });
            }
        } catch (error) { toast.error("Failed to fetch reviews"); }
        finally { setLoading(false); }
    };

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) return;
        try {
            const res = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ replyComment: replyText }),
            });
            if (res.ok) {
                toast.success("Reply posted");
                setReplyingTo(null);
                setReplyText("");
                fetchReviews();
            }
        } catch (error) { toast.error("Failed to post reply"); }
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
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    if (loading && reviews.length === 0) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Customer Reviews</h1>
                <p className="text-slate-500 mt-1">View and respond to customer feedback</p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Total Reviews</span>
                    <span className="text-2xl font-bold text-slate-700">{stats.total}</span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Pending</span>
                    <span className="text-2xl font-bold text-amber-600">{stats.pending}</span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Approved</span>
                    <span className="text-2xl font-bold text-emerald-600">{stats.approved}</span>
                </div>
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl p-4 flex items-center justify-between text-white">
                    <span className="text-sm font-medium opacity-90">Avg Rating</span>
                    <div className="flex items-center gap-2">
                        <Star size={20} className="fill-white" />
                        <span className="text-2xl font-bold">{stats.avgRating || '0.0'}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Status:</span>
                </div>
                {['all', 'pending', 'approved'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Reviews */}
            {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No reviews yet</h3>
                    <p className="text-slate-500">Reviews from customers will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center font-bold text-white">
                                        {review.userId?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{review.userId?.name || 'Anonymous'}</p>
                                        <p className="text-xs text-slate-500">{review.listingId?.title} • {new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex">{renderStars(review.overallRating)}</div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusStyle(review.status)}`}>
                                        {review.status}
                                    </span>
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

                            {/* Tenant Reply */}
                            {review.tenantReply?.comment ? (
                                <div className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-500">
                                    <p className="text-xs font-medium text-emerald-700 mb-1 flex items-center gap-1"><MessageSquare size={12} /> Your Reply</p>
                                    <p className="text-sm text-slate-700">{review.tenantReply.comment}</p>
                                </div>
                            ) : replyingTo === review._id ? (
                                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write your reply..."
                                        rows={3}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => handleReply(review._id)} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">Post Reply</button>
                                        <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setReplyingTo(review._id)} className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                                    <MessageSquare size={14} /> Reply to Review
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
