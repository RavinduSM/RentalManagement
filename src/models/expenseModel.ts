import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
    category: { type: String, required: true }, // maintenance, tax, cleaning
    description: { type: String },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);