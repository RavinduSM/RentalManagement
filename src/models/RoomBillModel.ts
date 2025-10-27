import mongoose from "mongoose";

const RoomBillSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
    billingMonth: { type: Number, required: true },
    billingYear: { type: Number, required: true },

    baseRoomPrice: { type: Number, required: true },
    facilityCharges: { type: Number, default: 0 },
    electricityUnits: { type: Number, default: 0 },
    electricityCost: { type: Number, default: 0 },

    totalAmount: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidDate: { type: Date },
}, { timestamps: true });

export default mongoose.models.RoomBill || mongoose.model("RoomBill", RoomBillSchema);


