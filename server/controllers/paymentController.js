const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const paymentConroller = {
  async processPayment(req, res, next) {
    console.log(req.body);
    try {
      const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "usd",
        metadata: {
          company: "Ecommerce",
        },
      });
      res.json({ success: true, client_secret: myPayment.client_secret });
    } catch (error) {
      console.log(error?.message);
      return next(error);
    }
  },
};

module.exports = paymentConroller;
