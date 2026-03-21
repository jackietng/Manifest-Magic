// src/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// POST /signup
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  // Check if user already exists
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existing) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from("users").insert([{ email, password: hashedPassword }]);

  if (error) return res.status(500).json({ message: "Error creating user" });

  const token = jwt.sign({ email }, process.env.JWT_SECRET);
  res.json({ user: { email }, token });
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ email }, process.env.JWT_SECRET);
  res.json({ user: { email }, token });
});

module.exports = router;
