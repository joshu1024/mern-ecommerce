import Cart from "../models/cart.js";
import Product from "../models/Product.js";

export const addProduct = async (req, res) => {
  try {
    const { name, oldPrice, newPrice, brand, category } = req.body;

    const images = req.files
      ? req.files.map((file) => file.path.replace(/\\/g, "/"))
      : [];

    const product = new Product({
      name,
      oldPrice,
      newPrice,
      brand,
      category,
      images,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add product" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(400).json({ message: "Search query missing" });
    }

    console.log("🔍 Searching for:", query);

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    });

    console.log("✅ Found:", products.length, "products");
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, oldPrice, newPrice, brand, category, stock } = req.body;

    // Handle new images if uploaded
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => file.path.replace(/\\/g, "/"));
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // update fields
    product.name = name || product.name;
    product.oldPrice = oldPrice || product.oldPrice;
    product.newPrice = newPrice || product.newPrice;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.stock = stock || product.stock;

    // only replace images if new ones uploaded
    if (imagePaths.length > 0) {
      product.images = imagePaths;
    }

    await product.save();
    res.json({ message: "✅ Product updated successfully", product });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: error.message });
  }
};
