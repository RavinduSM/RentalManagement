import mongoose from "mongoose";

const RoomFacilitySchema = new mongoose.Schema(
  {
    facilityId: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
        type: Number,
        min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// let the hook checks if the model exists before calling .findOne().
RoomFacilitySchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const RoomFacility = mongoose.models.RoomFacility; // already registered
      if (RoomFacility) {
        const lastFacility = await RoomFacility.findOne().sort({ createdAt: -1 });
        let nextId = 1;
        if (lastFacility && lastFacility.facilityId) {
          const lastId = parseInt(lastFacility.facilityId.split("-")[1], 10);
          nextId = lastId + 1;
        }
        this.facilityId = `RF-${String(nextId).padStart(4, "0")}`;
      }
    } catch (err) {
      console.error("Error generating facilityId:", err);
    }
  }
  next();
});


export default mongoose.models.RoomFacility || mongoose.model("RoomFacility", RoomFacilitySchema);
