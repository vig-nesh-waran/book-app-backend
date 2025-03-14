const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  books: [
    {
      bookId: { type: String, required: true },
      title: { type: String, required: true },
      author: { type: String },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1 },
      thumbnail: { type: String }
    }
  ],
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Cart", CartSchema);
