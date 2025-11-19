// const mongoose = require('mongoose');

// const orderItemSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   name: {
//     type: String,
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   image: {
//     type: String,
//     required: true
//   }
// });

// const orderSchema = new mongoose.Schema({
//   orderNumber: {
//     type: String,
//     unique: true,
//     required: true
//   },
//   items: [orderItemSchema],
//   subtotal: {
//     type: Number,
//     required: true
//   },
//   tax: {
//     type: Number,
//     required: true
//   },
//   total: {
//     type: Number,
//     required: true
//   },
//   customerInfo: {
//     name: String,
//     email: String,
//     phone: String,
//     address: String
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
//     default: 'pending'
//   },
//   paymentMethod: {
//     type: String,
//     default: 'cash'
//   }
// }, {
//   timestamps: true
// });

// orderSchema.pre('save', async function(next) {
//   if (this.isNew) {
//     const count = await mongoose.model('Order').countDocuments();
//     this.orderNumber = `HM${String(count + 1).padStart(4, '0')}`;
//   }
//   next();
// });

// module.exports = mongoose.model('Order', orderSchema);

// const mongoose = require('mongoose');

// const orderItemSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   name: {
//     type: String,
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   image: {
//     type: String,
//     required: true
//   }
// });

// const orderSchema = new mongoose.Schema({
//   orderNumber: {
//     type: String,
//     unique: true,
//     required: true
//   },
//   items: [orderItemSchema],
//   subtotal: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   tax: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   total: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   customerInfo: {
//     name: {
//       type: String,
//       required: true
//     },
//     email: {
//       type: String,
//       required: true
//     },
//     phone: String,
//     address: String
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
//     default: 'pending'
//   },
//   paymentMethod: {
//     type: String,
//     default: 'cash'
//   }
// }, {
//   timestamps: true
// });

// // Generate order number before saving
// orderSchema.pre('save', async function(next) {
//   if (this.isNew) {
//     try {
//       const count = await mongoose.model('Order').countDocuments();
//       this.orderNumber = `HM${String(count + 1).padStart(4, '0')}`;
//       next();
//     } catch (error) {
//       next(error);
//     }
//   } else {
//     next();
//   }
// });

// module.exports = mongoose.model('Order', orderSchema);
// ----------------8***

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    required: true
  }
});

const customerInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  customerInfo: customerInfoSchema,
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for better performance
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'customerInfo.email': 1 });

module.exports = mongoose.model('Order', orderSchema);