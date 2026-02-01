import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay credentials not configured');
    }

    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
};

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in INR (will be converted to paise)
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Unique receipt ID
 * @param {object} notes - Additional notes for the order
 */
export async function createOrder(amount, currency = 'INR', receipt, notes = {}) {
    try {
        const razorpay = getRazorpayInstance();

        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt,
            notes,
            payment_capture: 1 // Auto-capture payment
        };

        const order = await razorpay.orders.create(options);
        return { success: true, order };
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 */
export function verifyPaymentSignature(orderId, paymentId, signature) {
    try {
        const secret = process.env.RAZORPAY_KEY_SECRET;
        const body = orderId + '|' + paymentId;

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        return signature === expectedSignature;
    } catch (error) {
        console.error('Error verifying payment signature:', error);
        return false;
    }
}

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 */
export async function fetchPayment(paymentId) {
    try {
        const razorpay = getRazorpayInstance();
        const payment = await razorpay.payments.fetch(paymentId);
        return { success: true, payment };
    } catch (error) {
        console.error('Error fetching payment:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Initiate refund for a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in INR (optional, full refund if not provided)
 * @param {object} notes - Additional notes
 */
export async function initiateRefund(paymentId, amount = null, notes = {}) {
    try {
        const razorpay = getRazorpayInstance();

        const refundOptions = {
            notes
        };

        if (amount) {
            refundOptions.amount = Math.round(amount * 100); // Convert to paise
        }

        const refund = await razorpay.payments.refund(paymentId, refundOptions);
        return { success: true, refund };
    } catch (error) {
        console.error('Error initiating refund:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get Razorpay key ID for frontend
 */
export function getKeyId() {
    return process.env.RAZORPAY_KEY_ID || '';
}

/**
 * Create checkout options for frontend
 * @param {object} order - Razorpay order object
 * @param {object} customer - Customer details
 * @param {object} business - Business/tenant details
 */
export function createCheckoutOptions(order, customer, business = {}) {
    return {
        key: getKeyId(),
        amount: order.amount,
        currency: order.currency,
        name: business.name || 'BookIt',
        description: order.notes?.description || 'Booking Payment',
        image: business.logo || '/logo.png',
        order_id: order.id,
        prefill: {
            name: customer.name || '',
            email: customer.email || '',
            contact: customer.mobile || ''
        },
        notes: order.notes || {},
        theme: {
            color: business.primaryColor || '#10b981'
        }
    };
}

export default {
    createOrder,
    verifyPaymentSignature,
    fetchPayment,
    initiateRefund,
    getKeyId,
    createCheckoutOptions
};
