import mongoose from "mongoose";

const currencySchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true }, // USD, INR, EUR
        name: { type: String, required: true }, // US Dollar, Indian Rupee
        symbol: { type: String, required: true }, // $, ₹, €
        exchangeRate: { type: Number, default: 1 }, // Rate against base currency (USD)
        decimalPlaces: { type: Number, default: 2 },
        isBase: { type: Boolean, default: false }, // Base currency for conversion
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Currency = mongoose.models.Currency || mongoose.model("Currency", currencySchema);
export default Currency;
