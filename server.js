import express from "express";
import fs from "fs";
import cors from "cors"

const app = express();
const PORT = 8080;

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(cors(corsOptions));
app.use(express.json());

const USERS_FILE = "./users.json";
const sessions = {};

// Read users from file
function getUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]");
  }

  return JSON.parse(fs.readFileSync(USERS_FILE));
}

// Save users
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Register
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const users = getUsers();

  const existingUser = users.find((u) => u.email === email);

  if (existingUser) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
  };

  users.push(newUser);
  saveUsers(users);

  res.json({
    success: true,
    message: "Registration successful",
  });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const users = getUsers();

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const token = Math.random().toString(36).substring(2);

  sessions[token] = user.id;

  res.json({
    success: true,
    message: "Login successful",
    userId: user.id,
  });
});

// Profile
app.get("/profile/:userid", (req, res) => {
  const { userid } = req.params;

  const users = getUsers();

  const user = users.find((u) => userid === u.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});