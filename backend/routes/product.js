const verifyToken = require("./verifyToken");
const { productValidation } = require("../validation");
const Product = require("../models/product");
const { default: mongoose } = require("mongoose");
const router = require("express").Router();

// post product _ admin only
router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(404).json({
        status: "Fail",
        message: "Only Admin can perform this action",
      });
    const { title, description, price, category, stockQuantity } = req.body;
    const { error } = productValidation(req.body);
    if (error)
      return res.status(400).json({
        status: "Fail",
        message: error.details[0].message,
      });
    const addProduct = new Product({
      title,
      description,
      price,
      category,
      stockQuantity,
    });
    const newProduct = await addProduct.save();
    res.status(200).json({
      status: "Success",
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
    return res.status(404).json({
      status: "Fail",
      message: error.message,
    });
  }
});
// update products __ admin only
router.patch("/:productId", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(404).json({
        status: "Fail",
        message: "Only Admin can perform this action",
      });

    const productId = req.params.productId;
    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(productId) },
      { $set: req.body },
      { new: true }
    );
    if (!updatedProduct)
      return res.status(400).json({
        status: "Fail",
        message: "Product not found",
      });

    res.status(200).json({
      status: "Success",
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(200).json({
      status: "Fail",
      message: error.message,
    });
  }
});
// delete a product
router.delete("/:productId", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(404).json({
        status: "Fail",
        message: "Only Admin can perform this action",
      });
    const productId = req.params.productId;
    const product = await Product.findOneAndDelete(productId);
    res.status(200).json({
      status: "Fail",
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});
// get all products __ both
router.get("/", async (req, res) => {
  try {
    const allProducts = await Product.find();
    if (!allProducts)
      return res.status(400).json({
        status: "Fail",
        message: "No products available.",
      });
    res.status(200).json({
      status: "Success",
      length: allProducts.length,
      data: allProducts,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});
// get single product __ both
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(productId);
    const product = await Product.findById(mongoose.Types.ObjectId(productId));
    if (!product)
      return res.status(400).json({
        status: "Fail",
        message: "No product found.",
      });
    res.status(200).json({
      status: "Success",
      data: product,
    });
  } catch (error) {
    res.status(200).json({
      status: "Fail",
      message: error.message,
    });
  }
});
// filter product by title __ both
router.get("/filter/title", async (req, res) => {
  try {
    const { titlename } = req.query;
    const filteredProducts = await Product.find({ title: titlename });
    res.status(200).json({
      status: "Success",
      length: filteredProducts.length,
      data: filteredProducts,
    });
  } catch (error) {
    res.status(200).json({
      status: "Fail",
      message: error.message,
    });
  }
});
// filter product by category __ both
router.get("/filter/category", async (req, res) => {
  try {
    let { categoryname } = req.query;
    categoryname = new RegExp(categoryname, "i");
    const filteredProducts = await Product.find({ category: categoryname });
    res.status(200).json({
      status: "Success",
      length: filteredProducts.length,
      data: filteredProducts,
    });
  } catch (error) {
    res.status(200).json({
      status: "Fail",
      message: error.message,
    });
  }
});
// filter product by price __both
router.get("/filter/price", async (req, res) => {
  try {
    const { minprice, maxprice } = req.query;
    const filteredProducts = await Product.find({
      price: { $gte: parseInt(minprice), $lte: parseInt(maxprice) },
    });
    res.status(200).json({
      status: "Success",
      length: filteredProducts.length,
      data: filteredProducts,
    });
  } catch (error) {
    res.status(200).json({
      status: "Fail",
      message: error.message,
    });
  }
});
// filter product by search __ both
router.get("/filter/search", async (req, res) => {
  try {
    const { query } = req.query;
    const results = await Product.aggregate([
      {
        $search: {
          text: {
            query: query,
            path: ["title", "description", "category"],
          },
        },
      },
    ]);
    res.status(200).json({
      status: "Success",
      length: results.length,
      data: results,
    });
  } catch (error) {
    res.status(200).json({
      status: "Fail",
      message: error.message,
    });
  }
});
// product stock level __ admin
router.get("/:productId/stock", verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product)
      return res.status(400).json({
        status: "Fail",
        message: "Product not found.",
      });
    const stockLevel = product.stockQuantity;
    res.status(200).json({
      status: "Success",
      data: stockLevel,
    });
  } catch (error) {
    res.status(200).json({
      status: "Fail",
      message: error.message,
    });
  }
});
// update product stock level __ admin
router.patch("/:productId/stock", verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product)
      return res.status(400).json({
        status: "Fail",
        message: "Product not found.",
      });
    const { stockQuantity } = req.body;
    product.stockQuantity = stockQuantity;
    await product.save();
    res.status(200).json({
      status: "Success",
      data: stockQuantity,
    });
  } catch (error) {
    res.status(200).json({
      status: "Fail",
      message: error.message,
    });
  }
});
module.exports = router;
