const Order = require("../models/orderModels");
const Product = require("../models/productModel");
const CustomErrorHandler = require("../services/CustomErrorHandler.js");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const orderController = {
  async newOrder(req, res, next) {
    console.log(req.body);
    try {
      const { shippingInfo, orderItems, email, totalPrice, id, paymentInfo } =
        req.body;

      const customer = await stripe.customers.create({
        email: email,
        source: id,
      });

      const myPayment = await stripe.charges.create({
        amount: Number(Math.round(totalPrice * 100)),
        currency: "usd",
        customer: customer.id,
        receipt_email: email,
      });

      if (myPayment) {
        await Order.create({
          shippingInfo,
          orderItems,
          email,
          totalPrice,
          id,
          paymentInfo,
          paidAt: Date.now(),
          user: req.user._id,
        });

        res.status(201).json({
          message: "Payment successfully done.",
        });
      } else {
        res
          .status(400)
          .json({ message: "There's some issue while processing payment" });
      }
    } catch (error) {
      return next(error);
    }
  },

  async getOrderById(req, res, next) {
    let order;
    try {
      order = await Order.findOne({ _id: req.params.id })
        .populate("user", "name email")
        .select("-updatedAt -__v");

      if (!order) {
        return next(
          CustomErrorHandler.badRequest("Order not found with this Id.")
        );
      }
    } catch (err) {
      return next(err);
    }

    res.json(order);
  },
  // get user all order
  async myOrders(req, res, next) {
    console.log(req.user._id);
    let orders;
    try {
      orders = await Order.find({ user: req.user._id })
        .select("-updatedAt -__v")
        .sort({ _id: -1 });
    } catch (err) {
      return next(err);
    }

    res.json(orders);
  },
  // get admin all orders
  async getAllOrders(req, res, next) {
    console.log(req.user._id);
    try {
      const orders = await Order.find();

      let totalAmount = 0;

      orders.forEach((order) => {
        totalAmount += order.totalPrice;
      });

      res.json({
        success: true,
        totalAmount,
        orders,
      });
    } catch (err) {
      return next(err);
    }
  },
  // admin can do that
  async updateOrder(req, res, next) {
    try {
      const order = await Order.findById(req.params.id);
      console.log(order, "update order");

      if (!order) {
        return next(
          CustomErrorHandler.badRequest("Order not found with this Id,")
        );
      }

      if (order.orderStatus === "Delivered") {
        return next(
          CustomErrorHandler.badRequest("You have already delivered this order")
        );
      }

      if (req.body.status === "Shipped") {
        order?.orderItems?.forEach(async (o) => {
          await updateStock(o.product, o.quantity);
        });
      }
      order.orderStatus = req.body.status;

      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
      }

      await order.save({ validateBeforeSave: false });
      res.status(200).json({
        success: true,
      });
    } catch (error) {
      return next(error);
    }
  },

  async deleteOrder(req, res, next) {
    try {
      try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ success: true });
      } catch (err) {
        return next(err);
      }
    } catch (err) {
      return next(err);
    }
  },
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

module.exports = orderController;
