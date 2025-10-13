import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomBill', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    amountPaid: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'online'], required: true },
    paymentDate: { type: Date, default: Date.now },
    referenceNo: { type: String },
    notes: { type: String },
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);