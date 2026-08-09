const mongoose = require('mongoose');

const challanItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
});

const deliveryChallanSchema = new mongoose.Schema(
  {
    challanNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    dispatchDate: {
      type: Date,
      default: Date.now,
    },
    items: [challanItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Dispatched', 'Delivered', 'Invoiced'],
      default: 'Dispatched',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliveryChallan', deliveryChallanSchema);
