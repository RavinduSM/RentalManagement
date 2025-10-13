import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true },
  buildingId: { type: String, required: true }, // link to Building
  name: { type: String, required: true },
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true },

  // Facilities with additional price
  facilities: [
    {
      name: { type: String, required: true },
      additionalPrice: { type: Number, default: 0 },
    },
  ],

  // Price history
  prices: [
    {
      price: { type: Number, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date }, // null = current price
    },
  ],
}, { timestamps: true });

RoomSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastRoom = await mongoose.models.Room.findOne().sort({ createdAt: -1 });
    let nextId = 1;
    if (lastRoom && lastRoom.roomId) {
      const lastId = parseInt(lastRoom.roomId.split("-")[1], 10);
      nextId = lastId + 1;
    }
    this.roomId = `R-${String(nextId).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);
