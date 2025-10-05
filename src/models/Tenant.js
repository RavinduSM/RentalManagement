import mongoose from "mongoose";
import CryptoJS from "crypto-js";
import crypto from "crypto";

const SECRET_KEY = process.env.ENCRYPTION_KEY;

const TenantSchema = new mongoose.Schema({
  tenantId: { type: String, unique: true },
  fullName: { type: String, required: true },
  callingName: { type: String, required: true },
  nicNo: { type: String, required: true },       // Encrypted
  nicNoHash: { type: String, unique: true },     // Hashed (for uniqueness)
  contactNo: { type: String, required: true },   // Encrypted
  contactNoHash: { type: String, unique: true }, // Hashed (for uniqueness)
  address: { type: String, required: true },
  joinedDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// 🔹 Auto-generate tenantId & encrypt sensitive fields
TenantSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastTenant = await mongoose.models.Tenant.findOne().sort({ createdAt: -1 });
    let nextId = 1;
    if (lastTenant && lastTenant.tenantId) {
      const lastId = parseInt(lastTenant.tenantId.split("-")[1], 10);
      nextId = lastId + 1;
    }
    this.tenantId = `T-${String(nextId).padStart(4, "0")}`;
  }

  // 🔹 NIC
  if (this.isModified("nicNo")) {
    this.nicNoHash = crypto.createHash("sha256").update(this.nicNo).digest("hex");
    this.nicNo = CryptoJS.AES.encrypt(this.nicNo, SECRET_KEY).toString();
  }

  // 🔹 Contact
  if (this.isModified("contactNo")) {
    this.contactNoHash = crypto.createHash("sha256").update(this.contactNo).digest("hex");
    this.contactNo = CryptoJS.AES.encrypt(this.contactNo, SECRET_KEY).toString();
  }

  // 🔹 Address
  if (this.isModified("address")) {
    this.address = CryptoJS.AES.encrypt(this.address, SECRET_KEY).toString();
  }

  next();
});

// Decrypt for API response
TenantSchema.methods.decryptData = function () {
  const decrypt = (ciphertext) => {
    if (!ciphertext) return "";
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      console.error("Decryption failed:", err);
      return ciphertext;
    }
  };

  return {
    _id: this._id.toString(),
    tenantId: this.tenantId,
    fullName: this.fullName,
    callingName: this.callingName,
    nicNo: decrypt(this.nicNo),
    contactNo: decrypt(this.contactNo),
    address: decrypt(this.address),
    joinedDate: this.joinedDate,
    isActive: this.isActive,
  };
};

TenantSchema.pre("findOneAndUpdate", function (next) {
  let update = this.getUpdate();
  if (!update) return next();

  // Ensure $set exists
  if (!update.$set) update.$set = {};

  const data = update.$set;

  // Encrypt and hash NIC
  if (data.nicNo) {
    data.nicNoHash = crypto.createHash("sha256").update(data.nicNo).digest("hex");
    data.nicNo = CryptoJS.AES.encrypt(data.nicNo, SECRET_KEY).toString();
  }

  // Encrypt and hash Contact
  if (data.contactNo) {
    data.contactNoHash = crypto.createHash("sha256").update(data.contactNo).digest("hex");
    data.contactNo = CryptoJS.AES.encrypt(data.contactNo, SECRET_KEY).toString();
  }

  // Encrypt Address
  if (data.address) {
    data.address = CryptoJS.AES.encrypt(data.address, SECRET_KEY).toString();
  }

  // Apply back
  this.setUpdate(update);

  next();
});



// Enforce uniqueness at DB level
TenantSchema.index({ nicNoHash: 1 }, { unique: true });
TenantSchema.index({ contactNoHash: 1 }, { unique: true });

export default mongoose.models.Tenant || mongoose.model("Tenant", TenantSchema);
