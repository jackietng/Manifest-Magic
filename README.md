# Manifest Magic ✨

A full-stack manifestation and wellness application built with React, TypeScript, Supabase, and Node.js. Manifest Magic combines mood tracking, journaling, and a dynamic vision board into one sacred space for intentional living and personal growth.

---

## 🌙 Live Demo
Coming soon

---

## ✨ Features

### Vision Board
- Create a personalized mood board by adding images via URL or uploading directly from your device
- Drag, resize, and arrange images and text freely on the canvas
- Save boards to your account and reload them anytime
- Export your board as a JPEG to save or share

### Mood Tracker
- Log your daily mood from 7 emotional states with emoji indicators
- Visualize your mood patterns over time with an interactive line graph
- Track emotional trends to better understand yourself

### Journal
- Receive a daily writing prompt to inspire reflection
- Save journal entries to your account
- Preview, edit, and delete past entries from your journal history

### Authentication
- Secure signup and login with Supabase Auth
- Protected dashboard accessible only to logged in users
- User profiles auto-created on signup

### UI/UX
- Light and dark mode toggle with smooth transitions
- Fully responsive sidebar navigation
- Color scheme rooted in soft purples, lavender, and gold
- Custom crystal ball logo matching the app's spiritual aesthetic

---

## 🛠️ Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Recharts
- React Router DOM
- Framer Motion
- react-rnd

**Backend:**
- Node.js + Express
- Nodemailer (contact form)
- Supabase (database, auth, storage)

**Database:**
- Supabase (PostgreSQL)
- Row Level Security policies
- Supabase Storage for image uploads

---

## 🗄️ Database Schema
```sql
profiles        -- Auto-created on signup, linked to auth.users
mood_logs       -- Mood entries per user with timestamps
journals        -- Journal entries with title and content
moodboards      -- Saved board metadata per user
moodboard_items -- Individual items on each board (images and text)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A Supabase account
- A Gmail account with App Password enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jackietng/Mood-Board.git
cd Mood-Board
```

2. Install client dependencies:
```bash
cd client && npm install
```

3. Install server dependencies:
```bash
cd ../server && npm install
```

4. Set up your environment variables:

**`client/.env`:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PROXY_URL=http://localhost:5000
```

**`server/.env`:**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
CONTACT_RECEIVER=your.email@gmail.com
```

5. Start the development servers:
```bash
# In one terminal - start the client
cd client && npm run dev

# In another terminal - start the server
cd server && npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

---

## 📁 Project Structure
```
mood-board/
├── client/                  # React frontend
│   ├── public/
│   │   └── images/          # Background images for light/dark mode
│   └── src/
│       ├── assets/          # Logo and static images
│       ├── components/
│       │   ├── common/      # NavBar, Footer, ThemeToggle, Button
│       │   ├── dashboard/   # MoodLogger, MoodGraph, JournalPrompt, JournalHistory
│       │   └── moodboard/   # DynamicMoodBoard, MoodItem, MoodInput
│       ├── context/         # AuthContext, ThemeContext, MoodContext
│       ├── hooks/           # useUserMoods
│       ├── lib/             # Supabase client
│       ├── pages/           # Home, About, Contact, Dashboard, Login, Signup
│       └── routes/          # Route definitions
└── server/                  # Express backend
    └── src/
        └── server.js        # API routes, image proxy, contact form
```

---

## 🔒 Security
- All environment variables are excluded from version control via `.gitignore`
- Supabase Row Level Security (RLS) enforces user-level data access
- Authentication handled securely via Supabase Auth
- Image proxy prevents CORS issues with external image URLs

---

## 🌸 About

> There is something powerful about writing down what you want. About seeing it. About believing it before it exists.

Manifest Magic was built as a passion project rooted in intentional living, spiritual empowerment, and the belief that your inner world shapes your outer one. Here, magic meets mindfulness.

---

## 📬 Contact
Have a question or want to connect? Use the contact form on the app or reach out via GitHub.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).