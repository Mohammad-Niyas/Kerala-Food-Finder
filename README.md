# 🍛 Kerala Food Finder (MVP)

![Kerala Food Finder Banner](file:///C:/Users/mohammad%20niyas/.gemini/antigravity/brain/077d224a-dc4f-4dde-9381-962090f3a756/kerala_food_finder_banner_1774704630329.png)

> **"Discovering Kerala's culinary soul through the power of multi-modal AI."**

Kerala Food Finder is an advanced AI-powered discovery platform that bridges the gap between viral social media reels and your next favorite meal. By leveraging state-of-the-art **Speech-to-Text** and **Large Language Models**, we transform unstructured food content into structured, searchable dining insights across Kerala.

---

## 🚀 Key Features

- **🎤 AI Audio Transcription**: Instantly convert spoken reviews in food reels into high-fidelity text transcripts.
- **🤖 Intelligent Extraction**: Automatically parse restaurant names, cities (Kochi, Kozhikode, Thrissur, etc.), and dish lists from transcribed audio and captions.
- **🔍 Smarter Discovery**: Filter by specific Kerala delicacies, cities, or trending spots to plan your food journey.
- **📈 Viral Sentiment**: Track trending restaurants based on social media buzz and real-user "Saves."
- **📍 Personal Food Bucket List**: Curate your favorites into a personalized collection of must-visit spots.
- **🎬 Integrated Reel Player**: View the original content directly on the platform to verify recommendations.

---

## 🤖 AI Architecture (The "Brain")

The platform features a multi-stage AI pipeline to ensure the highest accuracy in food discovery.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Media Fetcher** | `yt-dlp` (Python Integration) | Extracts headers, captions, and audio metadata from Instagram/YouTube links. |
| **Audio Transcription** | **AssemblyAI** | Processes reel audio using advanced ASR to generate full-text transcripts. |
| **Inference Engine** | **Groq AI (Llama 3.3 70B)** | An "LLM-on-Steroids" that analyzes transcripts to extract structured entities. |
| **Geographic Parsing** | Custom Prompting | Tailored logic to identify Kerala's unique geography (14 districts and smaller locales). |

### The Extraction Workflow:
1.  **Input**: User pastes a Reel URL.
2.  **Meta-Fetch**: `yt-dlp` & `ffmpeg` extract caption text and audio streams.
3.  **Transcribe**: **AssemblyAI** converts audio speech into a searchable transcript.
4.  **Analyze**: **Groq (Llama 3.3)** takes both caption and transcript to output a clean JSON:
    - `restaurant`: Restaurant Name
    - `city`: Kerala District/City
    - `area`: Locality/Street
    - `dishes`: Full list of menu items mentioned.
5.  **Store**: Data is validated and linked to the PostgreSQL database for instant discovery.

---

## 🛠️ Tech Stack

### Core Technologies
- **Backend**: [Go (Gin Gonic)](https://go.dev/) - Performance-focused concurrent backend.
- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) - Ultra-fast, reactive user experience.
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Primary with GORM) & [MongoDB](https://www.mongodb.com/) (Extracted Metadata).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Modern, premium UI system.

### AI & Media Utilities
- **Transcription**: [AssemblyAI](https://www.assemblyai.com/)
- **Large Language Model**: [Groq](https://groq.com/) (Llama 3.3 70B)
- **Tooling**: `ffmpeg`, `yt-dlp` (Python-based media processing)

---

## 📦 Project Structure

```text
Kerala-Food-Finder/
├── cmd/                # Entry point (main.go)
├── config/             # DB & Environment Configuration
├── controllers/        # Business Logic & AI Pipeline (Handling Groq/AssemblyAI)
├── models/             # Database Schemas (GORM Models)
├── middleware/         # Auth, Security, and CORS
├── routes/             # API Endpoints (/api/ai, /api/search, /api/dishes)
├── seed/               # Initial demographic & restaurant data
├── kerala-food-finder-frontend/  # React/Tailwind Frontend application
└── Dockerfile          # Multi-container deployment config
```

---

## 🛠️ Local Development Setup

### Prerequisites
- **Go** (v1.25.0+)
- **Node.js** & **npm**
- **Python 3** (with `yt-dlp` installed)
- **ffmpeg** (for audio extraction)

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
    GROQ_API_KEY=your_groq_key
    ASSEMBLY_AI_KEY=your_assemblyai_key
    PORT=8081
    ```
3.  **Run Backend**:
    ```bash
    go mod download
    go run cmd/main.go
    ```
4.  **Run Frontend**:
    ```bash
    cd kerala-food-finder-frontend
    npm install
    npm run dev
    ```

---

## 🤝 Contributing

This is currently in **MVP phase**. Features like automated reel crawling and community-led tagging are in development. Feel free to open an issue for feature requests!

---

### Developed with ❤️ by [Mohammad Niyas](https://github.com/mohammad-niyas)
