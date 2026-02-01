"use client";

import { useState, useEffect } from "react";
import { CreditCard, Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Script from "next/script";

export default function RazorpayButton({
    amount,
    bookingId,
    orderId = null,
    customerName,
    customerEmail,
    customerMobile,
    businessName = "BookIt",
    description = "Booking Payment",
    onSuccess,
    onFailure,
    className = "",
    disabled = false,
    children
}) {
    const [loading, setLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null); // null, 'success', 'failed'

    const handlePayment = async () => {
        if (!scriptLoaded) {
            console.error("Razorpay script not loaded");
            return;
        }

        setLoading(true);
        setPaymentStatus(null);

        try {
            // Create order if not provided
            let orderDetails;
            if (!orderId) {
                const res = await fetch("/api/payments/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount,
                        bookingId,
                        type: "booking"
                    })
                });

                if (!res.ok) {
                    throw new Error("Failed to create payment order");
                }

                orderDetails = await res.json();
            } else {
                orderDetails = { orderId, amount: amount * 100, keyId: "" };
                // Fetch key ID
                const keyRes = await fetch("/api/payments/key");
                if (keyRes.ok) {
                    const keyData = await keyRes.json();
                    orderDetails.keyId = keyData.keyId;
                }
            }

            // Configure Razorpay options
            const options = {
                key: orderDetails.keyId,
                amount: orderDetails.amount,
                currency: "INR",
                name: businessName,
                description: description,
                order_id: orderDetails.orderId,
                prefill: {
                    name: customerName || "",
                    email: customerEmail || "",
                    contact: customerMobile || ""
                },
                notes: {
                    bookingId: bookingId || ""
                },
                theme: {
                    color: "#10b981"
                },
                handler: async function (response) {
                    // Verify payment on server
                    try {
                        const verifyRes = await fetch("/api/payments/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                bookingId
                            })
                        });

                        const result = await verifyRes.json();

                        if (result.success) {
                            setPaymentStatus("success");
                            if (onSuccess) onSuccess(result);
                        } else {
                            setPaymentStatus("failed");
                            if (onFailure) onFailure(result.error || "Payment verification failed");
                        }
                    } catch (error) {
                        setPaymentStatus("failed");
                        if (onFailure) onFailure("Payment verification failed");
                    }
                    setLoading(false);
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            // Open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.on("payment.failed", function (response) {
                setPaymentStatus("failed");
                setLoading(false);
                if (onFailure) {
                    onFailure(response.error?.description || "Payment failed");
                }
            });
            razorpay.open();
        } catch (error) {
            console.error("Payment error:", error);
            setPaymentStatus("failed");
            setLoading(false);
            if (onFailure) onFailure(error.message || "Payment failed");
        }
    };

    // Payment status display
    if (paymentStatus === "success") {
        return (
            <div className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle size={48} className="mx-auto text-emerald-600 mb-3" />
                <h3 className="text-lg font-bold text-emerald-800">Payment Successful!</h3>
                <p className="text-emerald-600 text-sm mt-1">Your booking has been confirmed</p>
            </div>
        );
    }

    if (paymentStatus === "failed") {
        return (
            <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                <XCircle size={48} className="mx-auto text-red-600 mb-3" />
                <h3 className="text-lg font-bold text-red-800">Payment Failed</h3>
                <p className="text-red-600 text-sm mt-1 mb-4">Please try again or use a different payment method</p>
                <button
                    onClick={() => setPaymentStatus(null)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => setScriptLoaded(true)}
            />

            <button
                onClick={handlePayment}
                disabled={disabled || loading || !scriptLoaded}
                className={`w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 ${className}`}
            >
                {loading ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                    </>
                ) : children ? (
                    children
                ) : (
                    <>
                        <CreditCard size={20} />
                        Pay ₹{amount?.toLocaleString()}
                    </>
                )}
            </button>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500">
                <Shield size={14} className="text-emerald-600" />
                <span>Secured by Razorpay</span>
            </div>
        </>
    );
}
