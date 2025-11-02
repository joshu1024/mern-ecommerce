import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const populatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product not found: ${item.product}`);

        return {
          productId: product._id,
          name: product.name,
          price: product.newPrice,
          quantity: item.quantity,
          image: product.images?.[0] || null,
        };
      })
    );

    const total = populatedItems.reduce(
      (acc, item) => acc + (item.price || 0) * item.quantity,
      0
    );

    const order = new Order({
      user: req.user ? req.user._id : req.body.user,
      items: populatedItems,
      total,
      status: "Pending",
      createdAt: new Date(),
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .populate({
        path: "items.product",
        select: "name newPrice image",
      })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
};
