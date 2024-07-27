import mongoose from "mongoose";

const AdminKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }
});

export default mongoose.models.AdminKey || mongoose.model("AdminKey", AdminKeySchema);
