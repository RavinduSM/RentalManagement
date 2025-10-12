import mongoose from "mongoose";

const MainMeterSchema = new mongoose.Schema({
    mainMeterId: { type: String, unique: true },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
    meterNo: { type: String, required: true, unique: true },  // from utility company
    installedAt: { type: Date, default: Date.now },
    removedAt: { type: Date },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.MainMeter || mongoose.model("MainMeter", MainMeterSchema);