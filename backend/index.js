const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const userRouter = require("./routes/user");
const productRouter = require("./routes/product");
const cartRouter = require("./routes/cart");
const reviewRouter = require("./routes/review");

const app = express();
app.use(express.json());
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("DB CONNECTED"))
  .catch((err) => console.log("Error Occured", err));

app.use("/api/user", userRouter);
app.use("/api/user/cart", cartRouter);
app.use("/api/products", productRouter);
app.use("/api/products", reviewRouter);

app.listen(8000, () => console.log("Server is up and running..."));
