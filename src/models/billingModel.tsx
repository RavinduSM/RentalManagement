import mongoose from "mongoose";

const RoomBillSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  billingMonth: { type: Number, required: true }, // 1-12
  billingYear: { type: Number, required: true },
  
  baseRoomPrice: { type: Number, required: true },
  facilityCharges: { type: Number, default: 0 },
  electricityUnits: { type: Number, default: 0 },
  electricityCost: { type: Number, default: 0 },

  totalAmount: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.RoomBill || mongoose.model("RoomBill", RoomBillSchema);
