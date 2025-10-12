import mongoose from "mongoose";

const MaintenanceRequestSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    issueTitle: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'in_progress', 'resolved'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    reportedDate: { type: Date, default: Date.now },
    resolvedDate: { type: Date },
}, { timestamps: true });


export default mongoose.models.MaintenanceRequest || mongoose.model("MaintenanceRequest", MaintenanceRequestSchema);