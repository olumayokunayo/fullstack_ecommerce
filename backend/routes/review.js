const router = require("express").Router();
const Product = require("../models/product");
const User = require("../models/user");
const { reviewValidation } = require("../validation");
const verifyToken = require("./verifyToken");

// post a review
router.post("/:productId/reviews", verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user._id;
    const product = await Product.findById(productId);
    if (!product)
      return res.status(400).json({
        status: "Fail",
        message: "Product not found.",
      });

    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({
        status: "Fail",
        message: "User not found",
      });

    const { rating, comment } = req.body;
    const { error } = reviewValidation(req.body);
    if (error)
      return res.status(400).json({
        status: "Fail",
        message: error.details[0].message,
      });
    product.reviews.push({
      user: userId,
      rating: rating,
      comment: comment,
      dateCreated: Date.now(),
    });
    await product.save();
    res.status(200).json({
      status: "Success",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// update a review
router.patch("/:productId/reviews/:reviewId", verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product)
      return res.status(400).json({
        status: "Fail",
        message: "Product not found.",
      });
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({
        status: "Fail",
        message: "User not found",
      });
    const reviewId = req.params.reviewId;
    const reviewToUpdate = product.reviews.id(reviewId);
    if (!reviewToUpdate)
      return res.status(400).json({
        status: "Fail",
        message: "Review not found.",
      });
    const { rating, comment } = req.body;
    reviewToUpdate.rating = rating;
    reviewToUpdate.comment = comment;
    await product.save();
    res.status(200).json({
      status: "Success",
      data: product.reviews,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// delete a review
router.delete(
  "/:productId/reviews/:reviewId",
  verifyToken,
  async (req, res) => {
    try {
      const productId = req.params.productId;
      const product = await Product.findById(productId);
      if (!product)
        return res.status(400).json({
          status: "Fail",
          message: "Product not found.",
        });
      const userId = req.user._id;
      const user = await User.findById(userId);
      if (!user)
        return res.status(400).json({
          status: "Fail",
          message: "User not found",
        });
      const reviewId = req.params.reviewId;
      const reviewToDelete = product.reviews.id(reviewId);
      if (!reviewToDelete)
        return res.status(400).json({
          status: "Fail",
          message: "Review not found.",
        });
      const reviewIndex = product.reviews.findIndex(
        (review) => review._id.toString() === reviewId
      );
      product.reviews.splice(reviewIndex, 1);
      await product.save();
      console.log(reviewToDelete);
      res.status(200).json({
        status: "Success",
        data: reviewToDelete,
      });
    } catch (error) {
      res.status(400).json({
        status: "Fail",
        message: error.message,
      });
    }
  }
);
module.exports = router;
