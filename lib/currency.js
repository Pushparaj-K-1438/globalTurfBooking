/**
 * Simple Currency Converter for the platform.
 * In a production app, this would fetch real-time rates from an API like fixer.io or openexchangerates.org.
 */

const STATIC_RATES = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.15,
    AED: 3.67,
};

export function convertCurrency(amount, from, to) {
    if (from === to) return amount;

    const baseAmount = amount / (STATIC_RATES[from] || 1);
    const converted = baseAmount * (STATIC_RATES[to] || 1);

    return parseFloat(converted.toFixed(2));
}

export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(amount);
}
