import mongoose from "mongoose";

const RoomMeterSchema = new mongoose.Schema({
    meterId: { type: String, unique: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomMeter', required: true },
    installedAt: { type: Date, default: Date.now },
    removedAt: { type: Date },
    startReading: { type: Number, required: true },
    endReading: { type: Number },
    meterType: { type: String, enum: ['electricity'], default: 'electricity' },
}, { timestamps: true });

export default mongoose.models.RoomMeter || mongoose.model("RoomMeter", RoomMeterSchema);