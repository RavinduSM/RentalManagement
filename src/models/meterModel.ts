import mongoose from "mongoose";

const MeterSchema = new mongoose.Schema({
  meterId: { type: String, unique: true },  
  roomId: { type: String, required: true }, // link to Room
  installedAt: { type: Date, required: true, default: Date.now },
  removedAt: { type: Date },
  startReading: { type: Number, required: true },
  endReading: { type: Number }, 
}, { timestamps: true });

MeterSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastMeter = await mongoose.models.Meter.findOne().sort({ createdAt: -1 });
    let nextId = 1;
    if (lastMeter && lastMeter.meterId) {
      const lastId = parseInt(lastMeter.meterId.split("-")[1], 10);
      nextId = lastId + 1;
    }
    this.meterId = `M-${String(nextId).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.models.Meter || mongoose.model("Meter", MeterSchema);
