const router = require("express").Router();
const { default: mongoose } = require("mongoose");
const Product = require("../models/product");
const User = require("../models/user");
const verifyToken = require("./verifyToken");

// add product to cart
router.post("/", verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({
        status: "Fail",
        message: "User not found.",
      });
    const product = await Product.findById(productId);
    if (!product)
      return res.status(400).json({
        status: "Fail",
        message: "Product  not found.",
      });
    const productStock = product.stockQuantity;

    // updating stocklevel immediately
    if (productStock >= quantity) {
      product.stockQuantity -= quantity;
      await product.save();

      // add product
      const productToAdd = {
        productId,
        quantity: quantity || 1,
      };
      user.cart.push(productToAdd);
      await user.save();
    } else {
      res.status(400).json({
        status: "Fail",
        message: `${productStock} stock level is low, check again!`,
      });
    }
    res.status(200).json({
      status: "Success",
      data: user.cart,
    });
  } catch (error) {
    res.status(200).json({
      status: "Fail",
      message: error.message,
    });
  }
});
// get cart item
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({
        status: "Fail",
        message: "User not found.",
      });
    const cartItems = user.cart;
    const populatedCart = await Promise.all(
      cartItems.map(async (cartItem) => {
        console.log(cartItem);
        const product = await Product.findById(cartItem.productId);
        // console.log(product);
        return {
          title: product.title,
          description: product.description,
          price: product.price,
          quantity: cartItem.quantity,
          id: cartItem._id,
        };
      })
    );
    res.status(200).json({
      status: "Success",
      length: cartItems.length,
      data: populatedCart.map(
        ({ title, description, price, quantity, id }) => ({
          title,
          description,
          price,
          quantity,
          id,
        })
      ),
    });
  } catch (error) {
    res.status(200).json({
      status: "Fail",
      message: error.message,
    });
  }
});
//  update cart
// router.patch("/:cardId");

// delete cart
router.delete("/:cartId", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({
        status: "Fail",
        message: "User not found.",
      });
    const productIdToRemove = req.params.cartId;

    const updatedCart = user.cart.filter(
      (item) => item._id.toString() !== productIdToRemove
    );
    const removedCartItem = user.cart.filter(
      (item) => item._id.toString() === productIdToRemove
    );

    if (!updatedCart)
      return res.status(400).json({
        status: "Fail",
        message: "Cart not found.",
      });

    const quantityRemoved = removedCartItem.quantity;

    user.cart = updatedCart;
    await user.save();

    // // update stock level
    const product = await Product.findById(productIdToRemove);
    if (product) product.stockQuantity += quantityRemoved;
    await product.save();

    res.status(200).json({
      status: "Success",
      data: cart,
    });
  } catch (error) {
    res.status(200).json({
      status: "Fail",
      message: error.message,
    });
  }
});

module.exports = router;
