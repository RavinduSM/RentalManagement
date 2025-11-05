import mongoose from "mongoose";

const MainMeterSchema = new mongoose.Schema({
    mainMeterId: { type: String, unique: true },
    meterType: { type: String, required: true },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
    meterNo: { type: String, required: true, unique: true },  // from utility company
    installedAt: { type: Date, default: Date.now },
    removedAt: { type: Date },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

MainMeterSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastMainMeter = await mongoose.models.MainMeter.findOne().sort({ createdAt: -1 });
    let nextId = 1;
    if (lastMainMeter && lastMainMeter.mainMeterId) {
      const lastId = parseInt(lastMainMeter.mainMeterId.split("-")[1], 10);
      nextId = lastId + 1;
    }
    this.mainMeterId = `M-${String(nextId).padStart(4, "0")}`;
  }
  next(); 
});

export default mongoose.models.MainMeter || mongoose.model("MainMeter", MainMeterSchema);