const verifyToken = require("./verifyToken");
const { productValidation } = require("../validation");
const Product = require("../models/product");
const router = require("express").Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(404).json({
        status: "Fail",
        message: "Only Admin can perform this action",
      });
    const { title, description, price, category } = req.body;
    const { error } = productValidation(req.body);
    if (error)
      return res.status(400).json({
        status: "Fail",
        message: error.details[0].message,
      });
    // if (!title || !description || !price || !category)
    //   return res.status(400).json({
    //     status: "Fail",
    //     message: "Field cannot be empty",
    //   });
    const addProduct = new Product({
      title,
      description,
      price,
      category,
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

module.exports = router;
