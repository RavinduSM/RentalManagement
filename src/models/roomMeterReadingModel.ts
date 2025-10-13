import mongoose from "mongoose";

const RoomMeterReadingSchema = new mongoose.Schema({
    meterId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomMeter', required: true },
    readingDate: { type: Date, required: true },
    readingValue: { type: Number, required: true },
    billingMonth: { type: Number, required: true },
    billingYear: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.RoomMeterReading || mongoose.model("RoomMeterReading", RoomMeterReadingSchema);