import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import cors from "cors";

const db = new Database("database.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    balance REAL DEFAULT 0,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price_per_1000 REAL,
    cost_price_per_1000 REAL DEFAULT 0,
    min_quantity INTEGER,
    max_quantity INTEGER,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    screenshot_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    service_id INTEGER,
    link TEXT,
    quantity INTEGER,
    total_price REAL,
    cost_price_per_1000 REAL DEFAULT 0,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(service_id) REFERENCES services(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    type TEXT, -- 'percentage' or 'fixed'
    value REAL,
    min_order REAL DEFAULT 0,
    usage_limit INTEGER DEFAULT 0, -- 0 means unlimited
    used_count INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add cost_price_per_1000 if not exists
try {
  db.prepare("ALTER TABLE services ADD COLUMN cost_price_per_1000 REAL DEFAULT 0").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE orders ADD COLUMN cost_price_per_1000 REAL DEFAULT 0").run();
} catch (e) {}

// Migration: Add usage_limit and used_count to coupons if not exists
try {
  db.prepare("ALTER TABLE coupons ADD COLUMN usage_limit INTEGER DEFAULT 0").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE coupons ADD COLUMN used_count INTEGER DEFAULT 0").run();
} catch (e) {}

// Seed Admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)").run(
    "admin",
    "admin@igvelocity.com",
    hashedPassword,
    "admin"
  );
}

// Seed Default Services
const servicesCount = db.prepare("SELECT COUNT(*) as count FROM services").get() as { count: number };
if (servicesCount.count === 0) {
  const defaultServices = [
    ["Instagram Followers", 220, 100, 1000000, "Followers"],
    ["Instagram Likes", 30, 10, 10000000, "Likes"],
    ["Instagram Views", 5, 10, 10000000, "Views"],
    ["Instagram Reel Views", 3, 10, 10000000, "Views"],
    ["Instagram Story Views", 25, 100, 10000, "Views"],
    ["Instagram Comments", 200, 10, 100000, "Comments"]
  ];
  const insertService = db.prepare("INSERT INTO services (name, price_per_1000, min_quantity, max_quantity, category) VALUES (?, ?, ?, ?, ?)");
  defaultServices.forEach(s => insertService.run(...s));
} else {
  // Update existing services to match requested rates if they exist by name
  const updateService = db.prepare("UPDATE services SET price_per_1000 = ?, min_quantity = ?, max_quantity = ? WHERE name = ?");
  updateService.run(220, 100, 1000000, "Instagram Followers");
  updateService.run(30, 10, 10000000, "Instagram Likes");
  updateService.run(5, 10, 10000000, "Instagram Views");
  updateService.run(3, 10, 10000000, "Instagram Reel Views");
  updateService.run(25, 100, 10000, "Instagram Story Views");
  
  // Check if Comments service exists, if not insert it
  const commentsExist = db.prepare("SELECT * FROM services WHERE name = 'Instagram Comments'").get();
  if (!commentsExist) {
    db.prepare("INSERT INTO services (name, price_per_1000, min_quantity, max_quantity, category) VALUES (?, ?, ?, ?, ?)").run(
      "Instagram Comments", 200, 10, 100000, "Comments"
    );
  } else {
    updateService.run(200, 10, 100000, "Instagram Comments");
  }
}

// Manual Price Updates requested by user
try {
  db.prepare("UPDATE services SET cost_price_per_1000 = 120 WHERE id = 1").run();
  db.prepare("UPDATE services SET cost_price_per_1000 = 12 WHERE id = 2").run();
  db.prepare("UPDATE services SET cost_price_per_1000 = 0.6 WHERE id = 3").run();
  db.prepare("UPDATE services SET cost_price_per_1000 = 0.28 WHERE id = 4").run();
  db.prepare("UPDATE services SET cost_price_per_1000 = 13 WHERE id = 5").run();
  db.prepare("UPDATE services SET cost_price_per_1000 = 70, price_per_1000 = 150 WHERE id = 6").run();
  
  // Also update existing orders to reflect correct profit calculation
  db.prepare("UPDATE orders SET cost_price_per_1000 = 120 WHERE service_id = 1").run();
  db.prepare("UPDATE orders SET cost_price_per_1000 = 12 WHERE service_id = 2").run();
  db.prepare("UPDATE orders SET cost_price_per_1000 = 0.6 WHERE service_id = 3").run();
  db.prepare("UPDATE orders SET cost_price_per_1000 = 0.28 WHERE service_id = 4").run();
  db.prepare("UPDATE orders SET cost_price_per_1000 = 13 WHERE service_id = 5").run();
  db.prepare("UPDATE orders SET cost_price_per_1000 = 70 WHERE service_id = 6").run();
} catch (e) {
  console.error("Manual updates failed:", e);
}

// Seed Default Settings
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run("admin_upi_id", "igvelocity@upi");
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run("admin_qr_url", "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=igvelocity@upi&pn=IGVelocity&am=0&cu=INR");
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run("telegram_id", "admin_igvelocity");
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run("instagram_username", "igvelocity");
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run("announcement", "🚀 Igvelocity: New Cheapest SMM Provider in the Market! High Quality Services at Lowest Rates!");

const app = express();
const PORT = 3000;
const JWT_SECRET = "igvelocity_secret_key_123";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Multer config for screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
};

// Auth Routes
app.post("/api/auth/register", (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)").run(username, email, hashedPassword);
    res.json({ message: "User registered successfully" });
  } catch (e: any) {
    res.status(400).json({ error: "Username or email already exists" });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, balance: user.balance } });
});

app.get("/api/user/profile", authenticate, (req: any, res) => {
  try {
    const user = db.prepare("SELECT id, username, email, balance, role FROM users WHERE id = ?").get(req.user.id) as any;
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === 'admin') {
      try {
        const profitData = db.prepare(`
          SELECT SUM(total_price - (COALESCE(cost_price_per_1000, 0) / 1000 * quantity)) as profit 
          FROM orders 
          WHERE status NOT IN ('Cancelled', 'Refunded')
        `).get() as any;
        user.totalEarnings = profitData?.profit || 0;
      } catch (profitError) {
        console.error("Profit calculation error:", profitError);
        user.totalEarnings = 0;
      }
    }
    
    res.json(user);
  } catch (e) {
    console.error("Profile fetch error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Service Routes
app.get("/api/services", (req, res) => {
  const services = db.prepare("SELECT * FROM services").all();
  res.json(services);
});

app.post("/api/admin/services", authenticate, isAdmin, (req, res) => {
  const { name, price_per_1000, cost_price_per_1000, min_quantity, max_quantity, category } = req.body;
  db.prepare("INSERT INTO services (name, price_per_1000, cost_price_per_1000, min_quantity, max_quantity, category) VALUES (?, ?, ?, ?, ?, ?)").run(
    name, price_per_1000, cost_price_per_1000 || 0, min_quantity, max_quantity, category
  );
  res.json({ message: "Service added" });
});

app.delete("/api/admin/services/:id", authenticate, isAdmin, (req, res) => {
  try {
    // Check if there are orders for this service
    const ordersCount = db.prepare("SELECT COUNT(*) as count FROM orders WHERE service_id = ?").get(req.params.id) as { count: number };
    if (ordersCount.count > 0) {
      return res.status(400).json({ error: "Cannot delete service with existing orders. Try editing it instead." });
    }

    const result = db.prepare("DELETE FROM services WHERE id = ?").run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json({ message: "Service deleted" });
  } catch (e: any) {
    console.error("Delete service error:", e);
    res.status(500).json({ error: "Failed to delete service. It might be linked to other data." });
  }
});

app.put("/api/admin/services/:id", authenticate, isAdmin, (req, res) => {
  const { name, price_per_1000, cost_price_per_1000, min_quantity, max_quantity, category } = req.body;
  db.prepare(`
    UPDATE services 
    SET name = ?, price_per_1000 = ?, cost_price_per_1000 = ?, min_quantity = ?, max_quantity = ?, category = ? 
    WHERE id = ?
  `).run(name, price_per_1000, cost_price_per_1000, min_quantity, max_quantity, category, req.params.id);
  res.json({ message: "Service updated" });
});

// Order Routes
app.post("/api/orders", authenticate, (req: any, res) => {
  const { service_id, link, quantity, coupon_code } = req.body;
  const service = db.prepare("SELECT * FROM services WHERE id = ?").get(service_id) as any;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id) as any;

  if (!service) return res.status(404).json({ error: "Service not found" });
  if (quantity < service.min_quantity || quantity > service.max_quantity) {
    return res.status(400).json({ error: `Quantity must be between ${service.min_quantity} and ${service.max_quantity}` });
  }

  const originalPrice = (service.price_per_1000 / 1000) * quantity;
  let totalPrice = originalPrice;

  // Apply Coupon if provided
  if (coupon_code) {
    const coupon = db.prepare("SELECT * FROM coupons WHERE code = ? AND is_active = 1").get(coupon_code.toUpperCase()) as any;
    if (coupon && originalPrice >= coupon.min_order) {
      if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
        return res.status(400).json({ error: "Coupon usage limit reached" });
      }
      
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = (originalPrice * coupon.value) / 100;
      } else {
        discount = coupon.value;
      }
      totalPrice = Math.max(0, originalPrice - discount);
      
      // Increment used count
      db.prepare("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?").run(coupon.id);
    }
  }

  if (user.balance < totalPrice) return res.status(400).json({ error: "Insufficient balance" });

  db.transaction(() => {
    db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(totalPrice, user.id);
    db.prepare("INSERT INTO orders (user_id, service_id, link, quantity, total_price, cost_price_per_1000) VALUES (?, ?, ?, ?, ?, ?)").run(
      user.id, service_id, link, quantity, totalPrice, service.cost_price_per_1000 || 0
    );
  })();

  res.json({ message: "Order placed successfully" });
});

app.get("/api/orders", authenticate, (req: any, res) => {
  const orders = db.prepare(`
    SELECT orders.*, services.name as service_name 
    FROM orders 
    JOIN services ON orders.service_id = services.id 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `).all(req.user.id);
  res.json(orders);
});

// Payment Routes
app.post("/api/payments", authenticate, upload.single("screenshot"), (req: any, res) => {
  const { amount } = req.body;
  const screenshot_url = req.file ? `/uploads/${req.file.filename}` : null;
  db.prepare("INSERT INTO payments (user_id, amount, screenshot_url) VALUES (?, ?, ?)").run(
    req.user.id, amount, screenshot_url
  );
  res.json({ message: "Payment request submitted" });
});

app.get("/api/payments", authenticate, (req: any, res) => {
  const payments = db.prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
  res.json(payments);
});

// Admin Routes
app.get("/api/admin/stats", authenticate, isAdmin, (req, res) => {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get() as any;
    
    // Profit = Total Selling Price - Total Cost Price
    const profitData = db.prepare(`
      SELECT SUM(total_price - (COALESCE(cost_price_per_1000, 0) / 1000 * quantity)) as profit 
      FROM orders 
      WHERE status NOT IN ('Cancelled', 'Refunded')
    `).get() as any;

    const pendingPayments = db.prepare("SELECT COUNT(*) as count FROM payments WHERE status = 'pending'").get() as any;
    res.json({
      totalUsers: totalUsers?.count || 0,
      totalOrders: totalOrders?.count || 0,
      totalEarnings: profitData?.profit || 0,
      pendingPayments: pendingPayments?.count || 0
    });
  } catch (e) {
    console.error("Admin stats error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/users", authenticate, isAdmin, (req, res) => {
  const users = db.prepare("SELECT id, username, email, balance, role, created_at FROM users").all();
  res.json(users);
});

app.get("/api/admin/orders", authenticate, isAdmin, (req, res) => {
  const orders = db.prepare(`
    SELECT orders.*, users.username, services.name as service_name 
    FROM orders 
    JOIN users ON orders.user_id = users.id 
    JOIN services ON orders.service_id = services.id 
    ORDER BY created_at DESC
  `).all();
  res.json(orders);
});

app.post("/api/admin/orders/:id/status", authenticate, isAdmin, (req, res) => {
  const { status } = req.body;
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ message: "Order status updated" });
});

app.post("/api/admin/orders/:id/refund", authenticate, isAdmin, (req, res) => {
  const orderId = req.params.id;
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as any;

  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.status === 'Refunded') return res.status(400).json({ error: "Order already refunded" });

  try {
    db.transaction(() => {
      // Update order status
      db.prepare("UPDATE orders SET status = 'Refunded' WHERE id = ?").run(orderId);
      // Refund balance to user
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(order.total_price, order.user_id);
    })();
    res.json({ message: "Order refunded successfully" });
  } catch (e) {
    console.error("Refund error:", e);
    res.status(500).json({ error: "Failed to process refund" });
  }
});

app.get("/api/admin/analytics", authenticate, isAdmin, (req, res) => {
  try {
    // Get orders for the last 7 days
    const analytics = db.prepare(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as count,
        SUM(CASE WHEN status NOT IN ('Cancelled', 'Refunded') THEN total_price ELSE 0 END) as revenue,
        SUM(CASE WHEN status NOT IN ('Cancelled', 'Refunded') THEN (total_price - (COALESCE(cost_price_per_1000, 0) / 1000 * quantity)) ELSE 0 END) as profit
      FROM orders
      WHERE created_at >= date('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date ASC
    `).all();
    res.json(analytics);
  } catch (e) {
    console.error("Analytics error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Coupon Routes
app.get("/api/admin/coupons", authenticate, isAdmin, (req, res) => {
  const coupons = db.prepare("SELECT * FROM coupons ORDER BY created_at DESC").all();
  res.json(coupons);
});

app.post("/api/admin/coupons", authenticate, isAdmin, (req, res) => {
  const { code, type, value, min_order, usage_limit } = req.body;
  try {
    db.prepare("INSERT INTO coupons (code, type, value, min_order, usage_limit) VALUES (?, ?, ?, ?, ?)").run(
      code.toUpperCase(), type, value, min_order || 0, usage_limit || 0
    );
    res.json({ message: "Coupon created" });
  } catch (e) {
    res.status(400).json({ error: "Coupon code already exists" });
  }
});

app.delete("/api/admin/coupons/:id", authenticate, isAdmin, (req, res) => {
  try {
    const result = db.prepare("DELETE FROM coupons WHERE id = ?").run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    res.json({ message: "Coupon deleted" });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

app.post("/api/coupons/validate", authenticate, (req, res) => {
  const { code, amount } = req.body;
  const coupon = db.prepare("SELECT * FROM coupons WHERE code = ? AND is_active = 1").get(code.toUpperCase()) as any;
  
  if (!coupon) return res.status(404).json({ error: "Invalid or expired coupon" });
  
  if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
    return res.status(400).json({ error: "Coupon usage limit reached" });
  }

  if (amount < coupon.min_order) {
    return res.status(400).json({ error: `Minimum order value for this coupon is ₹${coupon.min_order}` });
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (amount * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }

  res.json({ 
    valid: true, 
    discount: Math.min(discount, amount), 
    type: coupon.type, 
    value: coupon.value 
  });
});

app.get("/api/admin/payments", authenticate, isAdmin, (req, res) => {
  const payments = db.prepare(`
    SELECT payments.*, users.username 
    FROM payments 
    JOIN users ON payments.user_id = users.id 
    ORDER BY created_at DESC
  `).all();
  res.json(payments);
});

app.post("/api/admin/payments/:id/approve", authenticate, isAdmin, (req, res) => {
  const payment = db.prepare("SELECT * FROM payments WHERE id = ?").get(req.params.id) as any;
  if (payment.status !== "pending") return res.status(400).json({ error: "Payment already processed" });

  db.transaction(() => {
    db.prepare("UPDATE payments SET status = 'approved' WHERE id = ?").run(req.params.id);
    db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(payment.amount, payment.user_id);
  })();
  res.json({ message: "Payment approved" });
});

app.post("/api/admin/payments/:id/reject", authenticate, isAdmin, (req, res) => {
  db.prepare("UPDATE payments SET status = 'rejected' WHERE id = ?").run(req.params.id);
  res.json({ message: "Payment rejected" });
});

// Settings Routes
app.get("/api/settings/payment", (req, res) => {
  const upiId = db.prepare("SELECT value FROM settings WHERE key = 'admin_upi_id'").get() as any;
  const qrUrl = db.prepare("SELECT value FROM settings WHERE key = 'admin_qr_url'").get() as any;
  const telegramId = db.prepare("SELECT value FROM settings WHERE key = 'telegram_id'").get() as any;
  const instagramUsername = db.prepare("SELECT value FROM settings WHERE key = 'instagram_username'").get() as any;
  const announcement = db.prepare("SELECT value FROM settings WHERE key = 'announcement'").get() as any;
  res.json({ 
    upi_id: upiId?.value, 
    qr_url: qrUrl?.value, 
    telegram_id: telegramId?.value,
    instagram_username: instagramUsername?.value,
    announcement: announcement?.value
  });
});

app.post("/api/admin/settings/announcement", authenticate, isAdmin, (req, res) => {
  const { announcement } = req.body;
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("announcement", announcement);
  res.json({ message: "Announcement updated" });
});

app.post("/api/admin/settings/support", authenticate, isAdmin, (req, res) => {
  const { telegram_id, instagram_username } = req.body;
  if (telegram_id) {
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("telegram_id", telegram_id);
  }
  if (instagram_username) {
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("instagram_username", instagram_username);
  }
  res.json({ message: "Support settings updated" });
});

app.post("/api/admin/settings/payment", authenticate, isAdmin, upload.single("qr_code"), (req: any, res) => {
  const { upi_id } = req.body;
  if (upi_id) {
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("admin_upi_id", upi_id);
  }
  if (req.file) {
    const qr_url = `/uploads/${req.file.filename}`;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run("admin_qr_url", qr_url);
  }
  res.json({ message: "Payment settings updated" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
