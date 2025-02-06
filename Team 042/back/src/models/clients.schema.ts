import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  msspId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MSSP",
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  managerName: {
    type: String,
    required: true,
  },
  managerEmail: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
});

export const Client = mongoose.model("Client", ClientSchema);
