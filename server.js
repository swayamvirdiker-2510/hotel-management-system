const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "data", "db.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------- persistence helpers ----------

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = buildInitialData();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function buildInitialData() {
  const rooms = [];
  for (let i = 1; i <= 20; i++) {
    rooms.push({ number: 1000 + i, type: "Single", rate: 900, available: true });
    rooms.push({ number: 2000 + i, type: "Double", rate: 1500, available: true });
    rooms.push({ number: 3000 + i, type: "Suite", rate: 2000, available: true });
  }
  for (let i = 1; i <= 10; i++) {
    rooms.push({ number: 4000 + i, type: "VIP", rate: 5000, available: true });
  }
  return { rooms, customers: [], confirmationCounter: 1000 };
}

// ---------- routes ----------

// GET room categories + rates (mirrors your old showAvailableRooms)
app.get("/api/rooms/categories", (req, res) => {
  res.json({
    Single: 900,
    Double: 1500,
    Suite: 2000,
    VIP: 5000
  });
});

// GET available rooms, optionally filtered by type
app.get("/api/rooms", (req, res) => {
  const db = loadDB();
  const { type } = req.query;
  let rooms = db.rooms;
  if (type) rooms = rooms.filter(r => r.type === type);
  res.json(rooms);
});

// GET all customers
app.get("/api/customers", (req, res) => {
  const db = loadDB();
  res.json(db.customers);
});

// POST add a customer
app.post("/api/customers", (req, res) => {
  const { name, contact } = req.body;
  if (!name || !contact) {
    return res.status(400).json({ error: "name and contact are required" });
  }
  const db = loadDB();
  if (db.customers.some(c => c.name === name)) {
    return res.status(409).json({ error: "A customer with this name already exists" });
  }
  const customer = { name, contact, roomsBooked: [], confirmationNumber: null };
  db.customers.push(customer);
  saveDB(db);
  res.status(201).json(customer);
});

// POST make a reservation
// body: { name, type, roomNumbers: [1001, 1002], numDays }
app.post("/api/reservations", (req, res) => {
  const { name, type, roomNumbers, numDays } = req.body;
  const db = loadDB();

  const customer = db.customers.find(c => c.name === name);
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  if (customer.confirmationNumber) {
    return res.status(409).json({ error: "Customer already has an active reservation" });
  }
  if (!Array.isArray(roomNumbers) || roomNumbers.length === 0) {
    return res.status(400).json({ error: "roomNumbers must be a non-empty array" });
  }
  if (!Number.isInteger(numDays) || numDays <= 0) {
    return res.status(400).json({ error: "numDays must be a positive integer" });
  }

  // validate every requested room exists, matches type, and is available
  const chosen = [];
  for (const num of roomNumbers) {
    const room = db.rooms.find(r => r.number === num && r.type === type);
    if (!room) return res.status(400).json({ error: `Room ${num} does not exist for type ${type}` });
    if (!room.available) return res.status(409).json({ error: `Room ${num} is not available` });
    chosen.push(room);
  }

  // all valid — commit
  chosen.forEach(room => { room.available = false; });
  const total = chosen.reduce((sum, r) => sum + r.rate * numDays, 0);
  const gst = total * 0.18;
  const final = total + gst;

  customer.roomsBooked = chosen.map(r => r.number);
  customer.confirmationNumber = db.confirmationCounter++;

  saveDB(db);
  res.status(201).json({
    confirmationNumber: customer.confirmationNumber,
    total: Number(final.toFixed(2)),
    roomsBooked: customer.roomsBooked
  });
});

// POST cancel a reservation
// body: { name, confirmationNumber }
app.post("/api/reservations/cancel", (req, res) => {
  const { name, confirmationNumber } = req.body;
  const db = loadDB();

  const customer = db.customers.find(c => c.name === name);
  if (!customer || !customer.confirmationNumber) {
    return res.status(404).json({ error: "Reservation not found" });
  }
  if (customer.confirmationNumber !== confirmationNumber) {
    return res.status(400).json({ error: "Invalid confirmation number" });
  }

  customer.roomsBooked.forEach(num => {
    const room = db.rooms.find(r => r.number === num);
    if (room) room.available = true;
  });

  const refund = customer.roomsBooked.reduce((sum, num) => {
    const room = db.rooms.find(r => r.number === num);
    return sum + (room ? room.rate : 0);
  }, 0) * 0.9;

  customer.roomsBooked = [];
  customer.confirmationNumber = null;

  saveDB(db);
  res.json({ refund: Number(refund.toFixed(2)) });
});

app.listen(PORT, () => {
  console.log(`Hotel Management System backend running at http://localhost:${PORT}`);
});
