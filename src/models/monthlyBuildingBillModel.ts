import mongoose from "mongoose";

const MonthlyBuildingBillSchema = new mongoose.Schema({
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
    billingMonth: { type: Number, required: true },
    billingYear: { type: Number, required: true },
    totalElectricityBill: { type: Number, required: true },
    totalRoomBills: { type: Number, required: true },
    totalCollected: { type: Number, default: 0 },
    remarks: { type: String },
}, { timestamps: true });

export default mongoose.models.MonthlyBuildingBill || mongoose.model("MonthlyBuildingBill", MonthlyBuildingBillSchema);