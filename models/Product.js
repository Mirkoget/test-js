import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isSold: { type: Boolean, default: false }
});

const Product = mongoose.model("Product", productSchema);

export default Product;