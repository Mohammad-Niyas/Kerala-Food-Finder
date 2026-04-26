<p align="center">
  <img src="https://img.shields.io/badge/Go-1.25-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Groq_AI-Llama_3.3-F55036?style=for-the-badge&logo=meta&logoColor=white" alt="Groq AI"/>
  <img src="https://img.shields.io/badge/Status-MVP-green?style=for-the-badge" alt="MVP"/>
</p>

<h1 align="center">🍛 ELAYIL</h1>
<p align="center"><strong>Save dishes from Instagram reels. Find them when you travel Kerala.</strong></p>

<p align="center">
  <em>An AI-powered food discovery platform that extracts restaurant and dish data from Instagram Reels using LLM inference, lets users build a personal food bucket list, and (soon) reminds them when they're near a saved spot.</em>
</p>

> **📌 This is an MVP (Minimum Viable Product)** — a working proof-of-concept built to validate the core idea. The AI extraction pipeline, search, reviews, and bucket list are fully functional. Auth, geofencing, and maps are on the [roadmap](#️-roadmap--whats-next).

> **⚠️ Deployment Status:** Previously live on [Railway](https://railway.app/) (free tier). The free trial has expired — **no live demo currently**. Run it locally in under 5 minutes — see [Getting Started](#-getting-started).

---

## 🤔 What Problem Does This Solve?

Every day, thousands of Instagram food reels showcase hidden gems across Kerala — a biryani joint in a Kozhikode alley, a fish curry shack in Fort Kochi, a porotta spot in Palakkad. But there's no way to:

1. **Remember** which reel showed which restaurant
2. **Search** by dish name ("Where can I get *Meen Pollichathu* in Alappuzha?")
3. **Get reminded** when you're actually travelling near that spot

**Elayil fixes this.** Paste a reel link → AI extracts the restaurant, location, and every dish mentioned → you save it → the app tracks it for you.

---

## ⚡ How It Works (The Core Flow)

```
┌────────────────────┐
│  User pastes an    │
│  Instagram Reel    │
│  URL               │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  RapidAPI fetches  │
│  the reel caption  │
│  & metadata        │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Groq AI (Llama    │
│  3.3 70B) parses   │
│  the caption and   │
│  extracts:         │
│  • Restaurant name │
│  • City / Area     │
│  • All dishes      │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  User reviews the  │
│  extracted data,   │
│  selects dishes,   │
│  and saves them    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Data is stored in │
│  PostgreSQL and    │
│  becomes instantly │
│  searchable        │
└────────────────────┘
```

---

## 🎬 Features (What's Built)

| Feature | Status | Description |
|:--------|:------:|:------------|
| **Reel Extraction** | ✅ | Paste any Instagram reel link → AI auto-extracts restaurant, city, area, and dishes |
| **Manual Entry** | ✅ | Add dishes manually with restaurant name, city, area, category, and notes |
| **Dish-First Search** | ✅ | Search by dish name, restaurant, city, or area (full-text `ILIKE` search across all fields) |
| **City Filtering** | ✅ | Filter dishes by Kerala city (Kochi, Kozhikode, Kannur, Thrissur, Palakkad, Alappuzha, Thiruvananthapuram) |
| **Save / Unsave** | ✅ | Personal bucket list — save dishes and view them in a dedicated "Saved" tab |
| **Trending** | ✅ | Top 10 most-saved dishes, filterable by city |
| **Reviews** | ✅ | Multi-axis review system (overall rating, taste, value, ambience) with "Mark Helpful" support |
| **Restaurant Profiles** | ✅ | View all dishes and linked reels for any restaurant |
| **Mobile-First UI** | ✅ | Premium, app-like interface with onboarding flow, animations, and a bottom tab bar |

---

## 🧠 Tech Stack

### Backend — Go + Gin + GORM

| Layer | Technology | What it does |
|:------|:-----------|:-------------|
| **Web Framework** | [Gin Gonic](https://github.com/gin-gonic/gin) `v1.12` | HTTP routing, JSON binding, middleware |
| **ORM** | [GORM](https://gorm.io/) `v1.31` | PostgreSQL ORM with auto-migration, preloading, and relational queries |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Primary data store (restaurants, dishes, reviews, reels, saves) |
| **AI / LLM** | [Groq API](https://groq.com/) — `llama-3.3-70b-versatile` | Parses reel captions to extract structured food data as JSON |
| **Instagram Data** | [RapidAPI](https://rapidapi.com/) — Instagram Scraper | Fetches reel captions and metadata from Instagram URLs |
| **Config** | [godotenv](https://github.com/joho/godotenv) | Loads environment variables from `.env` |
| **Deployment** | Docker | Single-stage Alpine container |

### Frontend — React + Vite

| Layer | Technology | What it does |
|:------|:-----------|:-------------|
| **Framework** | [React 19](https://react.dev/) | Component-based UI |
| **Bundler** | [Vite 8](https://vitejs.dev/) | Dev server + production build |
| **Styling** | Inline CSS-in-JS | All styles are inline with a custom theme system (`LIGHT_T` tokens) |
| **Typography** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) + [Fraunces](https://fonts.google.com/specimen/Fraunces) | Google Fonts loaded at runtime |
| **State** | React `useState` + `localStorage` | Saved dish IDs persist in `localStorage` |

---

## 📁 Project Structure

```
ELAYIL/
│
├── cmd/
│   └── main.go                  # Application entry point
│                                  - Loads .env, connects DB, runs auto-migration, starts Gin server
│
├── config/
│   └── database.go              # PostgreSQL connection via DATABASE_URL
│
├── models/                      # GORM schema definitions
│   ├── restaurant.go            # Restaurant (name, city, area, verified, dishes[], reels[])
│   ├── dish.go                  # Dish (name, category, notes, saves count, restaurant FK)
│   ├── reel.go                  # Reel (link, restaurant FK, added_by)
│   ├── review.go                # Review (rating, taste, value, ambience, comment, visited, helpful)
│   └── save.go                  # Save (dish FK — tracks which dishes a user saved)
│
├── controllers/                 # Business logic / HTTP handlers
│   ├── ai_controller.go         # POST /api/ai/extract  → fetches caption via RapidAPI → sends to Groq → returns JSON
│   │                              POST /api/ai/save     → saves AI-extracted dishes to DB
│   ├── dish_controller.go       # CRUD for dishes (list, get, create, save/unsave)
│   ├── restaurant_controller.go # List restaurants, get single, get dishes/reels by restaurant
│   ├── search_controller.go     # GET /api/search?q=... → full-text ILIKE search across dishes + restaurants
│   ├── review_controller.go     # GET/POST reviews per dish, mark review as helpful
│   └── trending_controller.go   # GET /api/trending → top 10 dishes by save count
│
├── routes/
│   └── routes.go                # All API route definitions (grouped under /api)
│
├── middleware/
│   └── cors.go                  # CORS middleware (allows all origins)
│
├── kerala-food-finder-frontend/ # React frontend (Vite) — will be renamed to "frontend" post-MVP
│   ├── src/
│   │   ├── App.jsx              # Entire UI — single-file React app (~1100 lines)
│   │   ├── App.css              # Legacy Vite boilerplate CSS (not actively used)
│   │   ├── main.jsx             # React DOM entry
│   │   └── index.css            # Minimal global styles
│   ├── package.json
│   └── vite.config.js
│
├── Dockerfile                   # Go build → Alpine container
├── .env.example                 # Required environment variables
├── go.mod / go.sum              # Go dependencies
└── README.md                    # You are here
```

---

## 🔌 API Reference

All endpoints are under `/api`. The server runs on port `8081` by default.

### AI Extraction

| Method | Endpoint | Body | Description |
|:-------|:---------|:-----|:------------|
| `POST` | `/api/ai/extract` | `{ "reel_link": "https://instagram.com/reel/..." }` | Extracts restaurant, city, area, and dishes from a reel |
| `POST` | `/api/ai/save` | `{ "restaurant_name", "city", "area", "dishes": [...], "reel_link" }` | Saves extracted dishes to DB |

### Dishes

| Method | Endpoint | Query Params | Description |
|:-------|:---------|:-------------|:------------|
| `GET` | `/api/dishes` | `?city=Kochi&category=Seafood` | List all dishes (filterable) |
| `GET` | `/api/dishes/:id` | — | Get single dish with restaurant + reviews |
| `POST` | `/api/dishes` | JSON body | Create a dish manually |
| `POST` | `/api/dishes/:id/save` | — | Save a dish to bucket list |
| `DELETE` | `/api/dishes/:id/save` | — | Remove a dish from bucket list |

### Reviews

| Method | Endpoint | Body | Description |
|:-------|:---------|:-----|:------------|
| `GET` | `/api/dishes/:id/reviews` | — | Get all reviews for a dish |
| `POST` | `/api/dishes/:id/reviews` | `{ "user_name", "rating", "taste", "value", "ambience", "comment", "visited" }` | Post a review |
| `PUT` | `/api/reviews/:id/helpful` | — | Increment "helpful" count on a review |

### Restaurants

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/restaurants` | List all restaurants |
| `GET` | `/api/restaurants/:id` | Get single restaurant |
| `GET` | `/api/restaurants/:id/dishes` | Get all dishes for a restaurant |
| `GET` | `/api/restaurants/:id/reels` | Get all linked reels for a restaurant |

### Search & Trending

| Method | Endpoint | Query Params | Description |
|:-------|:---------|:-------------|:------------|
| `GET` | `/api/search` | `?q=biryani` | Search dishes, restaurants, cities, areas |
| `GET` | `/api/trending` | `?city=Kochi` | Top 10 most-saved dishes |

---

## 🏗️ Database Schema

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Restaurant  │       │     Dish     │       │    Review    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ ID           │◄──┐   │ ID           │◄──┐   │ ID           │
│ Name         │   │   │ Name         │   │   │ DishID (FK)  │
│ City         │   ├───│ RestaurantID │   ├───│ UserName     │
│ Area         │   │   │ Category     │   │   │ Rating (1-5) │
│ Location     │   │   │ Notes        │   │   │ Taste        │
│ Verified     │   │   │ Saves        │   │   │ Value        │
│ CreatedAt    │   │   │ CreatedAt    │   │   │ Ambience     │
└──────────────┘   │   └──────────────┘   │   │ Comment      │
                   │                      │   │ Helpful      │
┌──────────────┐   │   ┌──────────────┐   │   │ Visited      │
│     Reel     │   │   │     Save     │   │   └──────────────┘
├──────────────┤   │   ├──────────────┤   │
│ ID           │   │   │ ID           │   │
│ RestaurantID │───┘   │ DishID (FK)  │───┘
│ ReelLink     │       │ CreatedAt    │
│ AddedBy      │       └──────────────┘
└──────────────┘
```

All tables use GORM's `gorm.Model` which adds `ID`, `CreatedAt`, `UpdatedAt`, and `DeletedAt` (soft delete) automatically.

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Why |
|:-----|:--------|:----|
| **Go** | 1.25+ | Backend runtime |
| **Node.js** | 18+ | Frontend build tooling |
| **PostgreSQL** | 14+ | Database |
| **RapidAPI account** | — | For Instagram reel data extraction |
| **Groq API key** | — | For LLM-powered caption parsing |

### 1. Clone the repo

```bash
git clone https://github.com/Mohammad-Niyas/Elayil.git
cd Elayil
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
# Database — full PostgreSQL connection string
DATABASE_URL=postgres://user:password@localhost:5432/elayil?sslmode=disable

# Server port
PORT=8081

# AI & API Keys
GROQ_API_KEY=gsk_your_groq_api_key_here
RAPID_API_KEY=your_rapidapi_key_here
RAPID_API_HOST=instagram-scraper-api2.p.rapidapi.com
```

> **Where to get keys:**
> - **Groq API Key** → [console.groq.com](https://console.groq.com) (free tier available)
> - **RapidAPI Key** → [rapidapi.com](https://rapidapi.com) → subscribe to "Instagram Scraper API"

### 3. Create the database

```bash
# Using psql
createdb elayil

# Or inside psql:
# CREATE DATABASE elayil;
```

> Tables are auto-created on first run via GORM's `AutoMigrate`.

### 4. Run the backend

```bash
go run cmd/main.go
```

You should see:
```
Database connected successfully!
Server starting on port: 8081
```

### 5. Run the frontend

```bash
cd kerala-food-finder-frontend
npm install
```

Create a `.env` file inside the frontend folder:
```env
VITE_API_URL=http://localhost:8081/api
```

Then start the dev server:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 6. (Optional) Docker

```bash
docker build -t elayil .
docker run -p 8080:8080 --env-file .env elayil
```

> Note: The Dockerfile only containerizes the backend. The frontend is served separately during development.

---

## ☁️ Deployment

This project was previously deployed on **Railway** (free tier) with a managed PostgreSQL instance. The free trial has since expired.

**To redeploy**, you can use any of these free/cheap options:

| Platform | Free Tier | Notes |
|:---------|:----------|:------|
| [Render](https://render.com) | ✅ 750 hrs/month + free PostgreSQL (90 days) | Best free option right now — deploy from GitHub in 2 clicks |
| [Fly.io](https://fly.io) | ✅ 3 shared VMs free | Good for Go apps, requires `fly.toml` config |
| [Railway](https://railway.app) | ❌ Free trial expired | $5/month hobby plan works great — was previously used for this project |
| [Supabase](https://supabase.com) | ✅ Free PostgreSQL | Use as a standalone DB with any compute platform above |

**Frontend** can be deployed for free on [Vercel](https://vercel.com) or [Netlify](https://netlify.com) — just point `VITE_API_URL` to your backend URL.

---

## 🗺️ Roadmap — What's Next

Elayil is currently an **MVP (v0.1)**. The core extraction + search + save loop works. Here's what's planned for v1.0:

| Priority | Feature | Description |
|:---------|:--------|:------------|
| 🔴 High | **JWT Authentication** | Replace `localStorage` saves with per-user accounts |
| 🔴 High | **Geofencing Reminders** | Notify users when they're near a saved restaurant |
| 🟡 Medium | **Interactive Map** | Leaflet/Google Maps view of all saved spots |
| 🟡 Medium | **Audio Transcription** | Use AssemblyAI to transcribe reel voiceovers for better extraction |
| 🟢 Low | **Admin Verification** | Let food critics verify restaurant data |
| 🟢 Low | **Component Refactor** | Break `App.jsx` (1100 lines) into proper React components |

---

## 🧑‍💻 Contributing

This is an early-stage indie project. If you want to contribute:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/map-view`)
3. Commit your changes
4. Push and open a PR

---

## 📄 License

This project is not yet licensed. All rights reserved by the author.

---

<p align="center">
  Built by <a href="https://github.com/Mohammad-Niyas"><strong>Mohammad Niyas</strong></a> · Kerala, India
</p>
