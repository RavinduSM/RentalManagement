import mongoose from "mongoose";

const BuildingSchema = new mongoose.Schema({
  buildingId: { type: String, unique: true },  
  name: { type: String, required: true },
  location: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

BuildingSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastBuilding = await mongoose.models.Building.findOne().sort({ createdAt: -1 });
    let nextId = 1;
    if (lastBuilding && lastBuilding.buildingId) {
      const lastId = parseInt(lastBuilding.buildingId.split("-")[1], 10);
      nextId = lastId + 1;
    }
    this.buildingId = `B-${String(nextId).padStart(4, "0")}`;
  }
  next(); 
});


export default mongoose.models.Building || mongoose.model("Building", BuildingSchema);
