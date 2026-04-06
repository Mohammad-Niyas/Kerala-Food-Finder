# 🍛 Kerala Food Finder

> **"Discovering Kerala's culinary soul through the power of multi-modal AI."**

Kerala Food Finder is an advanced AI-powered discovery platform that bridges the gap between viral social media reels and your next favorite meal. By leveraging state-of-the-art **Instagram Scraper APIs** and **LLM inference**, we transform unstructured food content into structured, searchable dining insights across Kerala.

---

## 🚀 Key Features

- **🎬 Smart Reel Extraction**: Paste any Instagram Reel link to automatically extract restaurant names, localities, and featured dishes.
- **🤖 Intelligent Entity Parsing**: Powered by Llama 3.3 (70B) to understand context, slang, and specific Kerala geography.
- **🔍 Dish-First Discovery**: Search for specific delicacies like *"Kozhikode Biryani"* or *"Kochi Meen Mulakittathu"* instead of just restaurant names.
- **📍 Personal Food Bucket List**: Curate your favorites into a personalized collection of must-visit spots across the 14 districts of Kerala.
- **🌟 Community Sentiment**: Track trending restaurants based on real-user saves and interaction buzz.
- **✨ Premium UI/UX**: A high-end, mobile-first experience designed with a "Gold & Palm" aesthetic.

---

## 🧠 AI Architecture (The "Brain")

The platform features a professional-grade AI pipeline to ensure the highest accuracy in food discovery, moving away from unstable local scrapers to stable, high-performance APIs.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Media Interface** | **RapidAPI (Instagram Scraper)** | Fetches high-fidelity captions, metadata, and reel details via professional social data bridges. |
| **Inference Engine** | **Groq AI (Llama 3.3 70B)** | An ultra-fast "LLM-on-Steroids" that analyzes metadata to extract structured JSON entities. |
| **Geographic Parsing** | **Custom Region Logic** | Specifically tuned to identify Kerala's unique districts (Kochi, Kozhikode, Thrissur, etc.) and micro-locations. |
| **Data Orchestration** | **Go (Gin)** | Highly concurrent backend managing the flow between UI, APIs, and the database. |

### The "Social-to-Plate" Workflow:
1.  **Input**: User pastes a Reel URL into the discovery engine.
2.  **API Fetch**: The system queries **RapidAPI** to retrieve the reel's caption and metadata reliably.
3.  **LLM Analysis**: **Groq (Llama 3.3)** parses the text to identify:
    - `restaurant`: The name of the culinary spot.
    - `city/area`: Precise Kerala-specific geographic data.
    - `dishes`: A comprehensive list of menu items mentioned or showcased.
4.  **Discovery**: Extracted data is indexed and instantly searchable by the community.

---

## 🛠️ Tech Stack

### Core Technologies
- **Backend**: [Go (Gin Gonic)](https://go.dev/) - Performance-focused concurrent backend.
- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) - Ultra-fast, reactive user experience.
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Primary with GORM) - Robust relational storage.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Modern, premium UI system.

### AI & Integration
- **Extraction**: [RapidAPI](https://rapidapi.com/) (Social Data Scraper)
- **Large Language Model**: [Groq AI](https://groq.com/) (Llama 3.3 70B Versatile)
- **Environment**: Containerized via Docker for seamless deployment.

---

## 📦 Project Structure

```text
Kerala-Food-Finder/
├── cmd/                # Backend entry point (main.go)
├── controllers/        # Business Logic (RapidAPI & Groq Integration)
├── models/             # Schema definitions (GORM Entities)
├── routes/             # API Endpoints (/api/ai, /api/dishes, /api/search)
├── config/             # DB & Environment Configuration
├── kerala-food-finder-frontend/  # React Frontend (80+ KB Optimized App)
└── Dockerfile          # Production deployment configuration
```

---

## 🗺️ Project Roadmap & Pending Features

We are currently in the **MVP+ phase**. Based on our latest architecture revision, the following features are in the pipeline:

- [ ] **🔐 Professional Auth System**: Transitioning from `localStorage` to a full JWT-based User Authentication system.
- [ ] **📍 Real-time Travel Reminders**: Implementing geofencing to notify users when they are near a "Saved" dish.
- [ ] **🗺️ Interactive MapView**: A visual map (Leaflet/Google Maps) to browse saved spots geographically.
- [ ] **🎙️ Deep Audio Extraction**: Re-integrating **AssemblyAI** to transcribe reel voiceovers for 100% data coverage.
- [ ] **🛡️ Admin Verification Portal**: A dedicated interface for food critics and admins to "Verify" restaurant data.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Go** (v1.25.0+)
- **Node.js** & **npm**
- **RapidAPI Account** (For Instagram data)

### Quick Start
1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/mohammad-niyas/Kerala-Food-Finder.git
    cd Kerala-Food-Finder
    ```
2.  **Environment Setup**:
    Create a `.env` file in the root:
    ```env
    DB_HOST=localhost
    DB_USER=your_user
    DB_PASSWORD=your_password
    DB_NAME=kerala_food_finder
    PORT=8081
    
    # AI & API KEYS
    GROQ_API_KEY=your_groq_key
    RAPID_API_KEY=your_rapidapi_key
    RAPID_API_HOST=instagram-scraper-api2.p.rapidapi.com
    ```
3.  **Run Systems**:
    - **Backend**: `go run cmd/main.go`
    - **Frontend**: `cd kerala-food-finder-frontend && npm run dev`

---

### Developed with ❤️ by [Mohammad Niyas](https://github.com/mohammad-niyas)
