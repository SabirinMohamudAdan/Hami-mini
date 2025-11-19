


const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET all orders with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, date } = req.query;
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }
    
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET order statistics
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    
    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
});

// GET single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/


// POST create new order - FIXED VERSION WITH SEQUENTIAL ORDER NUMBERS
router.post('/', async (req, res) => {
  try {
    console.log('Received order data:', req.body);
    
    const { items, subtotal, tax, total, customerInfo, paymentMethod } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    
    if (subtotal === undefined || tax === undefined || total === undefined) {
      return res.status(400).json({ error: 'Missing order totals' });
    }
    
    if (!customerInfo || !customerInfo.name || !customerInfo.email) {
      return res.status(400).json({ error: 'Missing customer information' });
    }

    // GENERATE ORDER NUMBER SEQUENTIALLY - XAL SAX AH
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    let orderNumber = 'HM001'; // Start with HM001
    
    if (lastOrder && lastOrder.orderNumber) {
      // Ka soo qaad lambarka ugu dambeeyay (tusaale: HM001 -> 1, HM002 -> 2)
      const lastNumberStr = lastOrder.orderNumber.replace('HM', '');
      const lastNumber = parseInt(lastNumberStr);
      
      if (!isNaN(lastNumber)) {
        orderNumber = `HM${String(lastNumber + 1).padStart(3, '0')}`;
      } else {
        // Haddii lambarku aanu number ahin, bilow HM001
        orderNumber = 'HM001';
      }
    }

    console.log('Generated order number:', orderNumber);

    const order = new Order({
      orderNumber: orderNumber,
      items: items.map(item => ({
        productId: item.productId || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal: parseFloat(subtotal),
      tax: parseFloat(tax),
      total: parseFloat(total),
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone || '',
        address: customerInfo.address || ''
      },
      paymentMethod: paymentMethod || 'cash',
      status: 'pending'
    });

    console.log('Saving order with number:', order.orderNumber);
    
    const savedOrder = await order.save();
    console.log('Order saved successfully:', savedOrder);
    
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ 
      error: 'Failed to create order',
      details: error.message 
    });
  }
});


// PUT update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({ error: 'Failed to update order status' });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;