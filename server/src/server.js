// src/server.js
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fetch from "node-fetch";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, "../.env");
console.log("Looking for .env at:", envPath);
dotenv.config({ path: envPath });
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "✅ Found" : "❌ Missing");
console.log("SUPABASE_SERVICE_KEY:", process.env.SUPABASE_SERVICE_KEY ? "✅ Found" : "❌ Missing");
console.log("GMAIL_USER:", process.env.GMAIL_USER ? "✅ Found" : "❌ Missing");
console.log("GMAIL_APP_PASSWORD:", process.env.GMAIL_APP_PASSWORD ? "✅ Found" : "❌ Missing");
console.log("CONTACT_RECEIVER:", process.env.CONTACT_RECEIVER ? "✅ Found" : "❌ Missing");

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://manifest-magic.vercel.app/"
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Non-blocking transporter verify
transporter.verify().then(() => {
  console.log("✅ Email transporter ready");
}).catch((err) => {
  console.error("❌ Email transporter error:", err);
});

// Image proxy route
app.get("/proxy-image", async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).json({ error: "No URL provided" });

  try {
    res.setHeader("Access-Control-Allow-Origin", "https://manifest-magic.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "GET");

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/*",
        "Referer": "https://www.google.com",
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

// Contact form route
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  console.log("📧 Contact form received:", { name, email, message });

  if (!name || !email || !message) {
    console.log("❌ Missing fields");
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  try {
    const info = await transporter.sendMail({
      from: `"Manifest Magic" <${process.env.GMAIL_USER}>`,
      to: process.env.CONTACT_RECEIVER,
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Email error:", err);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// Journal routes
app.post("/journal", async (req, res) => {
  const { mood, entry, user_email } = req.body;
  const { data, error } = await supabase.from("journals").insert([
    { mood, entry, user_email }
  ]);
  if (error) return res.status(400).json({ error });
  res.status(200).json({ data });
});

app.get("/journals/:email", async (req, res) => {
  const { email } = req.params;
  const { data, error } = await supabase
    .from("journals")
    .select("*")
    .eq("user_email", email);
  if (error) return res.status(400).json({ error });
  res.status(200).json({ data });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));