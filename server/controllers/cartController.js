import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Product from "../models/Product.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }
    if (!quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate(
      "items.productId",
      "name newPrice images"
    );

    res.status(200).json({ cart: updatedCart });
  } catch (error) {
    console.error("❌ addToCart error:", error);
    res.status(500).json({ message: "Failed to add product to cart" });
  }
};

export const getCart = async (req, res) => {
  try {
    const user = req.user.id; // Assuming your auth middleware sets this

    const cart = await Cart.findOne({ user: user }).populate(
      "items.productId",
      "name price newPrice images"
    ); // ✅ populate product details

    if (!cart) {
      return res.status(200).json({ cart: { items: [] } });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.json({
      message: "Cart cleared successfully",
      cart: { items: [], totalPrice: 0 },
    });
  } catch (error) {
    console.error("❌ clearCart error:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
