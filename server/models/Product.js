import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    oldPrice: { type: Number, required: true },
    newPrice: { type: Number, required: true },
    images: [{ type: String }],
    stock: { type: Number, default: 5 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
