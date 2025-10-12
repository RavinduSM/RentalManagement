import mongoose from "mongoose";

const MainMeterReadingSchema = new mongoose.Schema({
  mainMeterId: { type: mongoose.Schema.Types.ObjectId, ref: 'MainMeter', required: true },
  billingMonth: { type: Number, required: true }, // 1-12
  billingYear: { type: Number, required: true },

  startReading: { type: Number, required: true },  // previous month's end
  endReading: { type: Number, required: true },
  totalUnitsUsed: { type: Number, required: true },

  totalBillAmount: { type: Number, required: true }, // amount from utility company
  pricePerUnit: { type: Number, required: true },    // derived: totalBillAmount / totalUnitsUsed

  billDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  isPaid: { type: Boolean, default: false },
  paidDate: { type: Date },
}, { timestamps: true });

// Optional: Pre-save hook to auto-calc pricePerUnit
MainMeterReadingSchema.pre('save', function (next) {
  if (this.totalUnitsUsed && this.totalBillAmount) {
    this.pricePerUnit = this.totalBillAmount / this.totalUnitsUsed;
  }
  next();
});

export default mongoose.models.MainMeterReading || mongoose.model("MainMeterReading", MainMeterReadingSchema);
