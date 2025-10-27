import mongoose from "mongoose";

const TenantAssignmentSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  roomId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date }, 
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Ensure only one active assignment per room
TenantAssignmentSchema.index({ roomId: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export default mongoose.models.TenantAssignment || mongoose.model("TenantAssignment", TenantAssignmentSchema);
