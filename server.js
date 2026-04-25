const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors()); 

app.use(express.json());

// ================== MONGODB ==================
mongoose.connect('mongodb://127.0.0.1:27017/posDB')
  .then(() => console.log("MongoDB Connected (Local) ✅"))
  .catch(err => console.log(err)); 

/* ================== SCHEMAS ================== */

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number
});

const OrderSchema = new mongoose.Schema({
  items: Array,
  status: String
});

const InvoiceSchema = new mongoose.Schema({
  items: Array,
  total: Number,
  date: String
});

const PaymentSchema = new mongoose.Schema({
  invoiceId: String,
  method: String,
  amount: Number,
  status: String
});

const TableSchema = new mongoose.Schema({
  tableNumber: Number,
  capacity: Number,
  status: String
});

/* ================== MODELS ================== */

const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);
const Payment = mongoose.model('Payment', PaymentSchema);
const Table = mongoose.model('Table', TableSchema);

/* ================== HOME ================== */

app.get('/', (req, res) => {
  res.send('POS Server Running 🚀');
});

/* ================== PRODUCT (SINGLE + BULK) ================== */

app.post('/product', async (req, res) => {
  try {
    const data = req.body;

    // 🔥 BULK INSERT
    if (Array.isArray(data)) {
      const products = await Product.insertMany(data);

      return res.json({
        message: "Multiple products added",
        products
      });
    }

    // 🔥 SINGLE INSERT
    const product = new Product(data);
    await product.save();

    res.json({
      message: "Product added",
      product
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================== GET PRODUCTS ================== */

app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

/* ================== ORDER + STOCK UPDATE ================== */

app.post('/order', async (req, res) => {
  try {
    const items = req.body.items;

    for (let item of items) {
      const product = await Product.findOne({
        name: { $regex: new RegExp("^" + item.name + "$", "i") }
      });

      if (!product) {
        return res.status(404).json({ message: `${item.name} not found` });
      }

      if (product.quantity < item.qty) {
        return res.status(400).json({ message: `Not enough stock for ${item.name}` });
      }

      product.quantity -= item.qty;
      await product.save();
    }

    const order = new Order({
      items,
      status: "pending"
    });

    await order.save();

    res.json({
      message: "Order created + stock updated",
      order
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================== GET ORDERS ================== */

app.get('/orders', async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

/* ================== INVOICE ================== */

app.post('/bill', async (req, res) => {
  let total = 0;

  req.body.items.forEach(i => {
    total += i.price * i.qty;
  });

  const invoice = new Invoice({
    items: req.body.items,
    total,
    date: new Date().toLocaleString()
  });

  await invoice.save();

  res.json({
    message: "Invoice saved",
    invoice
  });
});

/* ================== GET INVOICES ================== */

app.get('/invoices', async (req, res) => {
  const invoices = await Invoice.find();
  res.json(invoices);
});

/* ================== PAYMENT ================== */

app.post('/payment', async (req, res) => {
  const payment = new Payment(req.body);
  await payment.save();

  res.json({
    message: "Payment successful",
    payment
  });
});

/* ================== GET PAYMENTS ================== */

app.get('/payments', async (req, res) => {
  const payments = await Payment.find();
  res.json(payments);
});

/* ================== TABLE SYSTEM ================== */

app.post('/table', async (req, res) => {
  const table = new Table({
    tableNumber: req.body.tableNumber,
    capacity: req.body.capacity,
    status: "available"
  });

  await table.save();

  res.json({
    message: "Table added",
    table
  });
});

app.get('/tables', async (req, res) => {
  const tables = await Table.find();
  res.json(tables);
});

app.put('/table/:id/reserve', async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (!table) return res.status(404).json({ message: "Not found" });

  table.status = "reserved";
  await table.save();

  res.json({ message: "Table reserved", table });
});

app.put('/table/:id/free', async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (!table) return res.status(404).json({ message: "Not found" });

  table.status = "available";
  await table.save();

  res.json({ message: "Table freed", table });
});

/* ================== SERVER ================== */

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});