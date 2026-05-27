# TruthLens AI — Complete Project Documentation

> AI-powered News Intelligence Platform | Fake News Detection | Sentiment Analysis | Bias Detection | Real-time NLP

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Full Project Structure](#3-full-project-structure)
4. [How to Run](#4-how-to-run)
5. [Environment Variables](#5-environment-variables)
6. [Backend Modules — Detailed](#6-backend-modules--detailed)
7. [Frontend Modules — Detailed](#7-frontend-modules--detailed)
8. [Where NLP is Used](#8-where-nlp-is-used)
9. [How AI is Used](#9-how-ai-is-used)
10. [API Endpoints](#10-api-endpoints)
11. [Database Schema](#11-database-schema)
12. [Data Flow — End to End](#12-data-flow--end-to-end)
13. [NLP Pipeline — Step by Step](#13-nlp-pipeline--step-by-step)
14. [News Data Sources](#14-news-data-sources)
15. [Features Complete List](#15-features-complete-list)
16. [Deployment Guide (Free)](#16-deployment-guide-free)
17. [Interview Talking Points](#17-interview-talking-points)

---

## 1. Project Overview

**TruthLens AI** is a full-stack AI-powered news intelligence platform that automatically fetches news from 10+ sources, runs real-time NLP analysis on every article, and presents results in an Inshorts-style card feed.

### Core Idea
Every article that enters the platform is automatically processed through a multi-layer NLP pipeline that answers:
- **Is this real or fake?** → Fake News Score (0–100%)
- **What tone does it have?** → Sentiment & Polarity Analysis
- **Is it biased?** → Political Bias Detection (Left / Center / Right)
- **What is it saying?** → AI-generated 2-line Summary (Groq)
- **Who is mentioned?** → Named Entity Recognition
- **Where is it about?** → Geographic Tag Detection
- **Who published it?** → Source Credibility Profile
- **What words dominate?** → Word Cloud (TF-IDF Keywords)
- **How complex is it?** → Reading Level (Easy / Medium / Hard)
- **Is the headline manipulative?** → Clickbait Detection

### What Makes It Enterprise-Grade
- Real data from 10 live RSS feeds (no mock data needed)
- Every NLP step is explainable with scores and color indicators
- Source credibility database with 12 major news outlets
- AI chat powered by Groq LLM with news context injection
- SQLite caching — articles are never re-analyzed unnecessarily
- Auto-refresh every 5 minutes with new-article notifications
- Full article analysis export as JSON
- Radar chart, word cloud, polarity bar, NER tags on each article

---

## 2. Tech Stack

### Backend
| Layer | Technology | Purpose |
|---|---|---|
| Web Framework | **FastAPI** (Python) | REST API, async endpoints |
| Language | **Python 3.14** | All backend logic |
| NLP — Sentiment | **VADER** (vaderSentiment) | Polarity scoring |
| NLP — Keywords | **TF-IDF** (pure Python) | Word cloud extraction |
| NLP — Entities | **Regex NER** (pure Python) | Named entity recognition |
| NLP — Fake News | **Rule-based engine** | Fake score calculation |
| AI — Summarization | **Groq API** (llama-3.1-8b-instant) | Inshorts-style summaries |
| AI — Chat | **Groq API** (llama-3.1-8b-instant) | News Q&A chatbot |
| News Fetching | **httpx** + **RSS XML parser** | Live news from 10 sources |
| HTML Parsing | **BeautifulSoup4** | URL article extraction |
| Database | **SQLite** + **SQLAlchemy async** | Article caching |
| ORM | **aiosqlite** | Async SQLite driver |
| Data Models | **Pydantic v2** | Request/response validation |
| Server | **Uvicorn** | ASGI server |

### Frontend
| Layer | Technology | Purpose |
|---|---|---|
| Framework | **React 18** | UI components |
| Build Tool | **Vite** | Dev server + bundler |
| Styling | **Tailwind CSS v3** | Utility-first CSS (light theme) |
| Routing | **React Router v6** | Client-side navigation |
| HTTP Client | **Axios** | API calls to backend |
| Charts | **Recharts** | Pie, bar, radar charts |
| Word Cloud | **react-wordcloud** | Interactive keyword cloud |
| Icons | **lucide-react** | Clean icon set |
| Utilities | **clsx** | Conditional classnames |

### External APIs (All Free)
| Service | Purpose | Limit |
|---|---|---|
| **Groq API** | Summarization + AI Chat | 14,400 req/day |
| **NewsAPI.org** | Optional extra news feed | 100 req/day (dev) |
| **HuggingFace Inference API** | Optional ML fake news model | Free tier |
| **RSS Feeds** | Live news (10 sources) | Unlimited |

---

## 3. Full Project Structure

```
truthlens-ai/
│
├── INFO.md                        ← This documentation file
├── start-backend.ps1              ← Quick start script for backend
├── start-frontend.ps1             ← Quick start script for frontend
│
├── backend/
│   ├── main.py                    ← FastAPI app entry point
│   ├── database.py                ← SQLAlchemy models + DB init
│   ├── requirements.txt           ← Python dependencies
│   ├── .env                       ← Environment variables (your API keys)
│   ├── .env.example               ← Template for env vars
│   ├── truthlens.db               ← SQLite database (auto-created)
│   ├── venv/                      ← Python virtual environment
│   │
│   ├── models/
│   │   └── schemas.py             ← Pydantic request/response models
│   │
│   ├── routers/
│   │   ├── news.py                ← /api/news/* endpoints
│   │   ├── analyze.py             ← /api/analyze endpoint
│   │   ├── trends.py              ← /api/trends endpoint
│   │   └── chat.py                ← /api/chat endpoint
│   │
│   └── services/
│       ├── nlp_pipeline.py        ← Core NLP engine (all analysis)
│       ├── summarizer.py          ← Groq AI summarization + chat
│       ├── news_fetcher.py        ← NewsAPI integration + mock data
│       ├── rss_fetcher.py         ← RSS feed parser (10 sources)
│       └── source_db.py           ← Source credibility database
│
└── frontend/
    ├── index.html                 ← Root HTML
    ├── package.json               ← npm dependencies
    ├── vite.config.js             ← Vite + proxy config
    ├── tailwind.config.js         ← Tailwind theme config
    ├── postcss.config.js          ← PostCSS config
    ├── .env                       ← Frontend env (VITE_API_URL)
    │
    └── src/
        ├── main.jsx               ← React entry point
        ├── App.jsx                ← Router + layout shell
        ├── index.css              ← Tailwind base + custom classes
        │
        ├── services/
        │   └── api.js             ← Axios API call wrappers
        │
        ├── components/
        │   ├── Navbar.jsx         ← Top navigation bar
        │   ├── NewsCard.jsx       ← Inshorts-style article card
        │   ├── SentimentBadge.jsx ← Positive/Negative/Neutral label
        │   ├── FakeScoreBadge.jsx ← Fake % with color coding
        │   ├── BiasIndicator.jsx  ← Left/Center/Right bias label
        │   ├── CategoryTag.jsx    ← Topic category chip
        │   ├── CredibilityScore.jsx ← X/10 shield score
        │   ├── PolarityBar.jsx    ← Tri-color sentiment bar
        │   ├── WordCloudChart.jsx ← Interactive word cloud
        │   ├── LoadingSkeleton.jsx ← Animated loading cards
        │   ├── SourceCard.jsx     ← "Who posted this" panel
        │   ├── GeoBadge.jsx       ← Country flag + region tag
        │   └── ArticleActions.jsx ← Save/Share/Copy/Ask AI buttons
        │
        └── pages/
            ├── Home.jsx           ← Main news feed + filters
            ├── Article.jsx        ← Full article NLP breakdown
            ├── Trends.jsx         ← Analytics dashboard
            ├── Analyze.jsx        ← Paste URL or text to analyze
            └── Chat.jsx           ← AI chatbot page
```

---

## 4. How to Run

### Prerequisites
- Python 3.11+ (3.14 used in this project)
- Node.js 18+
- A Groq API key (free at console.groq.com)

### Step 1 — Add your Groq API Key

Open `backend/.env` and set:
```
GROQ_API_KEY=your_groq_key_here
```

### Step 2 — Start the Backend

Open **Terminal 1**:
```powershell
cd f:\Learnings\Reactjs\truthlens-ai\backend
.\venv\Scripts\uvicorn.exe main:app --reload --port 8003
```

Expected output:
```
INFO: Uvicorn running on http://127.0.0.1:8003
INFO: Application startup complete.
```

> Note: The venv is already created and all packages are installed.
> If you ever need to reinstall: `.\venv\Scripts\pip install -r requirements.txt`

### Step 3 — Start the Frontend

Open **Terminal 2**:
```powershell
cd f:\Learnings\Reactjs\truthlens-ai\frontend
npm run dev
```

Expected output:
```
VITE v5.4.x  ready in ~2000ms
➜  Local: http://localhost:5173/
```

### Step 4 — Open the App

Navigate to **http://localhost:5173**

The app will:
1. Fetch news from 10 RSS sources simultaneously
2. Run NLP analysis on each article (takes 5–15 seconds first load)
3. Display analyzed articles with all badges and scores

### Verify Backend is Running
```
http://localhost:8003/health     → {"status": "ok"}
http://localhost:8003/docs       → Interactive API docs (Swagger UI)
http://localhost:8003/redoc      → ReDoc documentation
```

---

## 5. Environment Variables

### `backend/.env`

```env
# REQUIRED
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx        # Groq AI key for summaries + chat

# OPTIONAL — enhances the app if provided
NEWS_API_KEY=                            # newsapi.org key for extra news
HF_API_TOKEN=                            # HuggingFace token for ML fake news model

# DATABASE
DATABASE_URL=sqlite+aiosqlite:///./truthlens.db   # SQLite (local dev)
# For production: postgresql+asyncpg://user:pass@host/dbname

# CORS
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env`

```env
VITE_API_URL=          # Empty = uses Vite proxy (localhost:8003 automatically)
# For production: VITE_API_URL=https://your-render-backend.onrender.com
```

---

## 6. Backend Modules — Detailed

### `main.py` — Application Entry Point
- Creates the FastAPI application instance
- Registers CORS middleware (allows frontend at port 5173)
- Mounts all routers (`/api/news`, `/api/analyze`, `/api/trends`, `/api/chat`)
- Calls `init_db()` on startup to create SQLite tables
- Exposes `/` and `/health` endpoints

### `database.py` — Database Layer
- Defines `ArticleDB` — the SQLAlchemy ORM model for the `articles` table
- Creates async SQLAlchemy engine using `aiosqlite`
- `init_db()` — creates all tables on startup (idempotent)
- `get_db()` — FastAPI dependency injection for database sessions
- Stores all NLP results as columns (no re-analysis needed on repeat visits)

### `models/schemas.py` — Data Models (Pydantic)
Defines all request and response types:

| Model | Purpose |
|---|---|
| `SentimentScores` | positive / negative / neutral / compound floats |
| `PolarityResult` | label + score + color |
| `BiasResult` | Left/Center/Right + score + color |
| `EntityItem` | Named entity text + label (PERSON, ORG, GPE…) |
| `KeywordItem` | Word + weight for word cloud |
| `NLPResult` | Full analysis result bundling all above |
| `ArticleAnalyzed` | Full article with NLP attached |
| `AnalyzeRequest` | POST body for /api/analyze (url or text) |
| `ChatRequest` | message + history array |
| `ChatResponse` | reply string |
| `TrendsResponse` | aggregated analytics data |

### `services/nlp_pipeline.py` — Core NLP Engine

The heart of the project. Single class `NLPPipeline` with these methods:

| Method | What it does |
|---|---|
| `analyze(text, title)` | Master method — runs all sub-analyses, returns full dict |
| `_clean_text(text)` | Strips URLs, normalizes whitespace |
| `_get_polarity(scores)` | Maps VADER compound score to Very Positive / Positive / Neutral / Negative / Very Negative |
| `_extract_keywords(text)` | TF-IDF-inspired word frequency with positional boosting → word cloud data |
| `_extract_entities(text)` | Regex-based NER — extracts proper nouns, classifies as PERSON/ORG/GPE |
| `_detect_bias(text)` | Keyword-matching against left/right political vocabulary lists |
| `_get_fake_score(text, title)` | Routes to HuggingFace API (if token) or rule-based engine |
| `_rule_based_fake_score(text, title)` | Scores based on caps ratio, clickbait patterns, exclamation marks, citation presence |
| `_hf_fake_score(text)` | Calls HuggingFace `GonzaloA/fake-news-detection` model API |
| `_calculate_credibility(fake, sentiment, entities)` | Composite score: 10 minus fake penalty, sentiment extremism penalty, entity bonus |
| `_reading_level(text)` | Flesch-Kincaid readability → Easy / Medium / Hard |
| `_detect_clickbait(title)` | Regex patterns for "you won't believe", numbered lists, trailing "..." |
| `_extract_geo_tags(entities)` | Maps GPE entities to country + flag + region using 35-country lookup table |

### `services/summarizer.py` — Groq AI Integration

| Function | Purpose |
|---|---|
| `summarize_article(title, content)` | Calls Groq `llama-3.1-8b-instant` to produce a 2-sentence Inshorts-style summary. Falls back to first 180 chars if API fails. |
| `chat_with_news(message, news_context, history)` | Calls Groq with system prompt + last 10 analyzed articles as context + chat history. Returns AI response. |

**Groq model used:** `llama-3.1-8b-instant` — chosen for speed (sub-second responses) and free tier generosity.

### `services/news_fetcher.py` — NewsAPI Integration

| Function | Purpose |
|---|---|
| `fetch_headlines(category, query, country, page_size)` | Calls NewsAPI `/top-headlines` or `/everything`. Falls back to `MOCK_NEWS` (6 realistic articles) if no API key. |
| `extract_article_from_url(url)` | Fetches a URL, parses HTML with BeautifulSoup, extracts title/content/image using OG meta tags and paragraph text. |
| `_normalize(article)` | Converts NewsAPI response shape to internal article dict |
| `_make_id(url)` | MD5 hash of URL → 16-char article ID |

Mock data covers: AI breakthrough, climate summit, fake financial panic article (intentionally high fake score), cancer treatment, tech antitrust, Amazon archaeology — demonstrates the full range of NLP outputs.

### `services/rss_fetcher.py` — Multi-Source RSS Parser

Fetches and parses RSS/Atom feeds from 10 news sources simultaneously.

| Function | Purpose |
|---|---|
| `fetch_all_rss(category)` | Fires all RSS fetches in parallel with `asyncio.gather()`, deduplicates by article ID, sorts by date |
| `fetch_rss_source(source)` | Fetches a single RSS URL with httpx, parses with `_parse_rss_xml` |
| `_parse_rss_xml(xml_text, source, category)` | Parses RSS 2.0 and Atom formats using `xml.etree.ElementTree`. Handles CDATA, namespaces, media enclosures |
| `_strip_html(text)` | Removes HTML tags from RSS descriptions |
| `_normalize_date(raw)` | Converts RSS date strings to ISO format (tries 4 common formats) |

**RSS_SOURCES list** (defined at top of file):
```python
BBC World News     → https://feeds.bbci.co.uk/news/world/rss.xml
BBC Technology     → https://feeds.bbci.co.uk/news/technology/rss.xml
TechCrunch         → https://techcrunch.com/feed/
NPR                → https://feeds.npr.org/1001/rss.xml
Ars Technica       → https://feeds.arstechnica.com/arstechnica/index
The Guardian World → https://www.theguardian.com/world/rss
The Guardian Tech  → https://www.theguardian.com/technology/rss
The Guardian Sci   → https://www.theguardian.com/science/rss
Al Jazeera         → https://www.aljazeera.com/xml/rss/all.xml
Hacker News        → https://news.ycombinator.com/rss
```

### `services/source_db.py` — Source Credibility Database

Static dictionary of 12 major news sources with:
- `credibility` — score out of 10 (based on Media Bias/Fact Check standards)
- `bias` — Center / Left-Leaning / Right-Leaning / Center-Left / Center-Right
- `country` + `flag` — origin country with emoji flag
- `region` — geographic region
- `reliability` — Very High / High / Moderate / Low
- `type` — Public Broadcaster / News Agency / Newspaper / Digital Media
- `founded` — founding year
- `description` — one-line editorial description

`get_source_info(source_name)` does fuzzy matching: exact match → partial match → default unknown profile.

### `routers/news.py` — News Feed Endpoints

| Endpoint | Logic |
|---|---|
| `GET /api/news/feed` | Fetches RSS + NewsAPI in parallel, merges + deduplicates, runs `_analyze_and_store` on each article concurrently |
| `GET /api/news/sources` | Returns all RSS source names + their source_db profiles |
| `GET /api/news/{id}` | Returns single analyzed article from DB by ID |

`_analyze_and_store(article, db)`:
1. Checks SQLite cache — if article ID exists, returns cached result instantly
2. Runs `NLPPipeline.analyze()` in a thread pool (CPU-bound, off event loop)
3. Runs `summarize_article()` in thread pool (blocking I/O)
4. Saves all results to SQLite
5. Attaches `source_info` from source_db before returning

### `routers/analyze.py` — On-Demand Analysis

`POST /api/analyze` with `{ url }` or `{ text, title }`:
- URL mode: calls `extract_article_from_url()` → runs full NLP pipeline
- Text mode: directly runs NLP pipeline on provided text
- Returns full analysis without saving to DB

### `routers/trends.py` — Analytics Aggregation

`GET /api/trends`:
- Queries last 50 analyzed articles from DB
- Aggregates: global word cloud (keyword frequency sum), sentiment distribution counts, category distribution counts, top entity mentions (Counter), average fake rate
- Returns structured data for frontend charts

### `routers/chat.py` — AI Chat

`POST /api/chat` with `{ message, history }`:
- Queries last 10 analyzed articles from DB for context (title + summary + fake_score)
- Injects context into Groq system prompt
- Passes last 6 messages of history
- Returns AI reply

---

## 7. Frontend Modules — Detailed

### `App.jsx` — Root Component
Sets up React Router with 5 routes. Wraps everything in `<Navbar>` + `<main>`.

### `services/api.js` — API Layer
All backend calls in one place using Axios. Functions:
- `fetchFeed(category, q)` → GET /api/news/feed
- `fetchArticle(id)` → GET /api/news/:id
- `analyzeArticle(payload)` → POST /api/analyze
- `fetchTrends()` → GET /api/trends
- `sendChat(message, history)` → POST /api/chat

### Pages

#### `pages/Home.jsx` — Main News Feed
- Category filter pills (8 categories)
- Source filter bar (7 specific sources + All)
- Search form
- Auto-refresh every 5 minutes (`setInterval` in `useEffect`)
- "New articles" floating banner when background refresh finds new content
- "Last updated X minutes ago" live counter
- Stats bar (article count, flagged count)
- Renders `NewsCard` grid (1/2/3 columns responsive)

**Custom hooks used:**
- `useTimeAgo(date)` — reactive time-ago label that updates every 30s
- `useCallback` for stable `loadArticles` reference

#### `pages/Article.jsx` — Full NLP Breakdown
Sections in order:
1. Back button + category tag + source link
2. Fake news alert banner (red) or credibility confirmation (green)
3. AI Summary block (indigo border-left)
4. Article Actions toolbar
5. "Who Posted This" → `SourceCard`
6. "Geographic Focus" → `GeoBadge` + country detail
7. NLP scores + gauge bars + polarity bar
8. Radar chart (5 axes: Credibility, Positivity, Objectivity, Realness, Neutrality)
9. "What Can You Do" action grid (6 cards)
10. Named Entities (color-coded by type)
11. Word Cloud

#### `pages/Trends.jsx` — Analytics Dashboard
- 4 stat cards (articles analyzed, avg fake rate, categories, unique keywords)
- Global word cloud (all keywords from all articles)
- Sentiment pie chart (Recharts PieChart)
- Category bar chart (horizontal, Recharts BarChart)
- Top entities list with mention counts

#### `pages/Analyze.jsx` — On-Demand Analysis
- Toggle: URL mode / Paste Text mode
- URL input or textarea + optional title
- Submit → shows full NLP results inline
- Same display as Article page but without navigation

#### `pages/Chat.jsx` — AI Chatbot
- Pre-seeded welcome message
- 5 suggestion chips (shown on first load)
- Chat history with user/bot message bubbles
- `?q=` URL param support (pre-fills input when navigated from "Ask AI" action)
- Passes last 6 messages as history to maintain context

### Components

| Component | Input Props | What it renders |
|---|---|---|
| `Navbar` | — | Sticky top bar with logo + nav links + mobile icons |
| `NewsCard` | `article` | Full Inshorts-style card with all badges, summary, source, actions |
| `SentimentBadge` | `sentiment` (string) | Colored pill: 😊 Very Positive / 😡 Very Negative etc. |
| `FakeScoreBadge` | `score` (0–100) | ✓ Real (green) / 🔍 Uncertain (yellow) / ⚠️ Fake (red) |
| `BiasIndicator` | `bias` (object) | ⚖️ Left-Leaning / Center / Right-Leaning pill |
| `CategoryTag` | `category` (string) | Colored chip with emoji (💻 Tech, 🏥 Health etc.) |
| `CredibilityScore` | `score` (1–10) | 🛡️ X.X/10 with color coding |
| `PolarityBar` | `scores` (object) | Tri-color bar (green/gray/red) showing pos/neu/neg % |
| `WordCloudChart` | `words`, `height` | Interactive react-wordcloud with indigo color palette |
| `LoadingSkeleton` | `count` | Animated gray skeleton cards while loading |
| `SourceCard` | `sourceInfo`, `compact` | Source profile: name, flag, credibility, bias, reliability, type |
| `GeoBadge` | `geoTags`, `compact` | Country flag + region label, multi-location support |
| `ArticleActions` | `article`, `compact` | Save/Share/Copy/Ask AI/Find Similar/Export buttons |

---

## 8. Where NLP is Used

NLP runs at **three trigger points** in the application:

### Trigger 1 — News Feed Load (`GET /api/news/feed`)
When the home page loads or refreshes:
```
RSS Feeds (10 sources) + NewsAPI
        ↓
Merge + Deduplicate articles
        ↓
For each article (up to 18, in parallel):
    Check SQLite cache
    If not cached:
        → NLPPipeline.analyze(content, title)     ← FULL NLP
        → summarize_article(title, content)        ← GROQ AI
        → Save to SQLite
```

### Trigger 2 — Manual Analysis (`POST /api/analyze`)
When user pastes a URL or text on the Analyze page:
```
User input (URL or text)
        ↓
If URL: extract article content from webpage
        ↓
NLPPipeline.analyze(content, title)    ← FULL NLP
summarize_article(title, content)      ← GROQ AI
        ↓
Return results (not saved to DB)
```

### Trigger 3 — Trends Aggregation (`GET /api/trends`)
No new NLP runs here — aggregates previously computed NLP data from SQLite.

### Detailed NLP Usage Map

| NLP Feature | Where Used | Library / Method |
|---|---|---|
| Sentiment Analysis | Every article | VADER `SentimentIntensityAnalyzer` |
| Polarity Scoring | Every article | VADER compound score → 5-level scale |
| Positive/Negative/Neutral % | Every article + Trends charts | VADER `pos`, `neg`, `neu` keys |
| Keyword Extraction | Every article → Word Cloud | Custom TF-IDF with positional boosting |
| Named Entity Recognition | Every article | Regex + proper noun detection |
| Geographic Entity Detection | Every article → Geo badge | NER entities filtered by GPE label → 35-country geo map |
| Fake News Detection | Every article | Rule-based engine (patterns, caps ratio, citation presence) + optional HuggingFace API |
| Political Bias Detection | Every article | Keyword matching against left/right political vocabulary (28 keywords each) |
| Clickbait Detection | Every article | Regex patterns on title |
| Reading Level | Every article | Flesch-Kincaid formula |
| Credibility Score | Every article | Composite formula using fake score + sentiment extremism + entity count |
| Summarization | Every article | Groq LLM API (llama-3.1-8b-instant) — Inshorts-style 2 sentences |
| AI Q&A | Chat page | Groq LLM with news context injection |

---

## 9. How AI is Used

### Groq API (Primary AI)
**Model:** `llama-3.1-8b-instant`
**Used in 2 places:**

#### 1. Article Summarization (`services/summarizer.py → summarize_article`)
```
Input:  Article title + first 2500 chars of content
Prompt: "Summarize this news article in exactly 2 concise sentences,
         Inshorts-style — factual, no opinions, under 60 words total"
Output: 2-sentence summary stored in DB + shown on every card
```
**Why Groq:** Free tier, extremely fast (~200ms response), llama-3.1-8b is accurate enough for summarization without being expensive.

#### 2. News Chatbot (`services/summarizer.py → chat_with_news`)
```
System prompt: "You are TruthLens AI, an intelligent news assistant..."
Context:        Last 10 analyzed articles (title + summary + fake_score)
History:        Last 6 messages from conversation
Input:          User's question
Output:         Conversational answer grounded in today's news
```
Pre-fills from Article page via `?q=` URL param so users can ask about specific articles directly.

### HuggingFace Inference API (Optional ML Boost)
**Model:** `GonzaloA/fake-news-detection`
**Trigger:** Only if `HF_API_TOKEN` is set in `.env`
```
Input:  First 512 chars of article text
Output: FAKE / REAL label with confidence score
Result: Replaces the rule-based fake score with an ML-based score
```
Falls back to rule-based engine if API times out or token not provided.

### Rule-Based NLP (Always-on, No API Needed)

These techniques run on every article regardless of API key availability:

| Technique | Algorithm |
|---|---|
| VADER Sentiment | Pre-trained lexicon with valence scores — no ML inference needed |
| TF-IDF Keywords | Term frequency × positional weight → word cloud |
| Regex NER | Capitalized word sequence patterns → entity extraction |
| Fake Score Engine | Weighted scoring of: ALL CAPS ratio, exclamation marks, clickbait phrase regex, citation presence |
| Bias Detection | Keyword frequency count: 14 left-leaning vs 14 right-leaning political terms |
| Flesch-Kincaid | Formula: 206.835 − 1.015×(words/sentences) − 84.6×(syllables/words) |

---

## 10. API Endpoints

Base URL: `http://localhost:8003`

### News Endpoints

#### `GET /api/news/feed`
Fetch analyzed news articles.

**Query parameters:**
| Param | Type | Description |
|---|---|---|
| `category` | string | Filter: general, technology, business, health, science, sports, entertainment |
| `q` | string | Search query |
| `source` | string | Filter by source name (partial match) |

**Response:** Array of `ArticleAnalyzed` objects with `nlp` and `source_info` attached.

---

#### `GET /api/news/sources`
List all RSS sources with their credibility profiles.

**Response:**
```json
[
  {
    "name": "BBC News",
    "info": {
      "full_name": "BBC News",
      "credibility": 9.2,
      "bias": "Center",
      "country": "United Kingdom",
      "flag": "🇬🇧",
      "region": "Europe",
      "reliability": "Very High",
      "type": "Public Broadcaster",
      "founded": 1922
    }
  }
]
```

---

#### `GET /api/news/{article_id}`
Get a single analyzed article by ID.

**Response:** Full `ArticleAnalyzed` object.

---

### Analysis Endpoint

#### `POST /api/analyze`
Analyze any article on-demand.

**Request body:**
```json
// Option A — URL
{ "url": "https://example.com/article" }

// Option B — Text
{ "text": "Full article text here...", "title": "Optional Title" }
```

**Response:** Full NLP analysis including summary, sentiment, fake score, bias, entities, keywords, geo_tags.

---

### Trends Endpoint

#### `GET /api/trends`
Get aggregated analytics from all analyzed articles.

**Response:**
```json
{
  "word_cloud": [{"text": "ai", "value": 85}, ...],
  "sentiment_distribution": {
    "Very Positive": 3,
    "Positive": 7,
    "Neutral": 4,
    "Negative": 2,
    "Very Negative": 0
  },
  "category_distribution": {"technology": 8, "general": 6, ...},
  "fake_rate": 24.3,
  "top_entities": [{"text": "OpenAI", "label": "ENTITY", "count": 5}],
  "total_analyzed": 16
}
```

---

### Chat Endpoint

#### `POST /api/chat`
Send a message to the AI assistant.

**Request body:**
```json
{
  "message": "Which news today has the highest fake score?",
  "history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi there!"}
  ]
}
```

**Response:**
```json
{ "reply": "Based on today's analyzed articles, the article titled..." }
```

---

### Utility Endpoints

| Endpoint | Description |
|---|---|
| `GET /` | Version info |
| `GET /health` | Health check → `{"status": "ok"}` |
| `GET /docs` | Interactive Swagger UI |
| `GET /redoc` | ReDoc documentation |

---

## 11. Database Schema

**Database:** SQLite (file: `backend/truthlens.db`)
**Table:** `articles`

| Column | Type | Description |
|---|---|---|
| `id` | String (PK) | MD5 hash of URL, 16 chars |
| `url` | String (unique) | Original article URL |
| `title` | Text | Article headline |
| `source` | String | Source name (e.g., "BBC News") |
| `author` | String | Author if available |
| `published_at` | String | ISO datetime string |
| `content` | Text | Article body (max 5000 chars) |
| `image_url` | String | Cover image URL |
| `category` | String | technology / general / health etc. |
| `summary` | Text | Groq AI-generated 2-sentence summary |
| `sentiment` | String | Very Positive / Positive / Neutral / Negative / Very Negative |
| `sentiment_positive` | Float | VADER positive score (0–100) |
| `sentiment_negative` | Float | VADER negative score (0–100) |
| `sentiment_neutral` | Float | VADER neutral score (0–100) |
| `sentiment_compound` | Float | VADER compound score (−1 to +1) |
| `fake_score` | Float | Fake news probability (0–100) |
| `bias` | JSON | `{"label": "Center", "score": 0.5, "color": "gray"}` |
| `credibility_score` | Float | Composite credibility (1–10) |
| `reading_level` | String | Easy / Medium / Hard |
| `is_clickbait` | Boolean | True if clickbait patterns detected in title |
| `keywords` | JSON | `[{"text": "ai", "value": 85}, ...]` |
| `entities` | JSON | `[{"text": "OpenAI", "label": "ORG"}, ...]` |
| `geo_tags` | JSON | `{"primary_country": "US", "primary_flag": "🇺🇸", "primary_region": "North America", "all_locations": [...]}` |
| `analyzed_at` | String | ISO datetime when analysis was run |

**Caching behavior:** Once an article ID exists in the DB, it is never re-analyzed. This means the first load is slower (NLP running) but all subsequent loads are instant (DB read).

---

## 12. Data Flow — End to End

```
USER opens http://localhost:5173
        │
        ▼
Home.jsx → fetchFeed() via Axios
        │
        ▼
FastAPI GET /api/news/feed
        │
        ├─ fetch_all_rss()          ← 10 RSS sources in parallel (httpx)
        │       └─ XML parsing      ← xml.etree.ElementTree
        │
        ├─ fetch_headlines()        ← NewsAPI (if key) or mock data
        │
        ├─ Merge + deduplicate      ← by article ID (MD5 hash)
        │
        └─ For each article (asyncio.gather):
                │
                ├─ Check SQLite cache  ← if exists, return instantly
                │
                └─ If new article:
                        │
                        ├─ NLPPipeline.analyze()   ← thread pool executor
                        │       ├─ VADER sentiment
                        │       ├─ TF-IDF keywords
                        │       ├─ Regex NER
                        │       ├─ Bias detection
                        │       ├─ Fake score (rule-based or HF API)
                        │       ├─ Credibility score
                        │       ├─ Reading level
                        │       ├─ Clickbait detection
                        │       └─ Geo tags
                        │
                        ├─ summarize_article()     ← thread pool (Groq API)
                        │
                        ├─ Save to SQLite
                        │
                        └─ Attach source_info      ← source_db lookup
        │
        ▼
JSON response → axios → React state → NewsCard grid rendered
```

---

## 13. NLP Pipeline — Step by Step

Given input: article text + title

```
Step 1: Clean Text
  └─ Strip URLs, normalize whitespace

Step 2: VADER Sentiment
  Input:  cleaned text (max 5000 chars)
  Output: positive %, negative %, neutral %, compound score
  Scale:  compound ≥ 0.35 = Very Positive
          compound ≥ 0.05 = Positive
          compound ≤ -0.35 = Very Negative
          compound ≤ -0.05 = Negative
          else             = Neutral

Step 3: Keyword Extraction (TF-IDF)
  Input:  cleaned text (max 4000 chars)
  Process:
    1. Tokenize → filter stopwords (60-word list)
    2. Count term frequency
    3. Boost terms appearing in first 800 chars (×1.4)
    4. Score = (tf/total_words) × boost
    5. Sort by score, take top 20
  Output: [{"text": "climate", "value": 72}, ...]

Step 4: Named Entity Recognition (Regex)
  Input:  first 1500 chars of text
  Process:
    1. Regex: 2+ consecutive capitalized words (not at sentence start)
    2. Label heuristic: Inc/Corp/University → ORG, else → PERSON
    3. Lookup 20 known geo locations → label as GPE
  Output: [{"text": "Tim Cook", "label": "PERSON"}, ...]

Step 5: Political Bias Detection
  Input:  full cleaned text
  Process:
    - Count 14 left-leaning keywords (progressive, equity, inclusion...)
    - Count 14 right-leaning keywords (conservative, border security...)
    - If left > right+1 → Left-Leaning (strength = count/5)
    - If right > left+1 → Right-Leaning
    - Otherwise → Center
  Output: {"label": "Center", "score": 0.5, "color": "gray"}

Step 6: Fake News Score
  Input:  title + first 512 chars
  Primary (if HF_API_TOKEN set):
    - POST to HuggingFace GonzaloA/fake-news-detection
    - Returns FAKE confidence score × 100
  Fallback (always available):
    - Base score: 15
    - Sensationalist words (SHOCKING, BOMBSHELL...): +12 each
    - ALL CAPS ratio: × 40
    - Exclamation marks: +3 each (max 15)
    - Exaggeration words (always, never, guaranteed...): +4 each
    - Quote marks: -1 each (trust signal)
    - Attribution phrases (said, according to...): -2 each
    - Clamp: max(5, min(95, score))

Step 7: Credibility Score (Composite)
  score = 10.0
  score -= fake_score / 14        (fake penalty)
  score -= 1.5 if |compound| > 0.75  (emotional language penalty)
  score += 0.5 if entities ≥ 3    (named entities add credibility)
  Output: clamp(1.0, 10.0)

Step 8: Reading Level (Flesch-Kincaid)
  score = 206.835
          - 1.015 × (words / sentences)
          - 84.6 × (chars_per_word / 5)
  ≥ 70 → Easy
  ≥ 50 → Medium
  < 50 → Hard

Step 9: Clickbait Detection
  Regex patterns on title:
  - "you won't believe", "mind-blowing"
  - "here's why", "the real reason"
  - "N things/ways/reasons/tips"
  - Ends with "..."
  - Multiple "??" or "!!"

Step 10: Geographic Tags
  Input:  entities from Step 4
  Process: filter GPE-labeled entities → lookup in 35-country map
  Output: {"primary_country": "China", "primary_flag": "🇨🇳",
           "primary_region": "Asia", "all_locations": [...]}
```

---

## 14. News Data Sources

### RSS Sources (No API Key Required)

| Source | URL | Category | Credibility |
|---|---|---|---|
| BBC World | feeds.bbci.co.uk/news/world/rss.xml | general | 9.2/10 |
| BBC Technology | feeds.bbci.co.uk/news/technology/rss.xml | technology | 9.2/10 |
| TechCrunch | techcrunch.com/feed/ | technology | 8.0/10 |
| NPR | feeds.npr.org/1001/rss.xml | general | 8.7/10 |
| Ars Technica | feeds.arstechnica.com/arstechnica/index | technology | 8.5/10 |
| The Guardian World | theguardian.com/world/rss | general | 8.1/10 |
| The Guardian Tech | theguardian.com/technology/rss | technology | 8.1/10 |
| The Guardian Science | theguardian.com/science/rss | science | 8.1/10 |
| Al Jazeera | aljazeera.com/xml/rss/all.xml | general | 7.8/10 |
| Hacker News | news.ycombinator.com/rss | technology | 7.5/10 |

### Optional Sources (Require API Key)

| Source | API | Key Variable | Notes |
|---|---|---|---|
| NewsAPI.org | REST | `NEWS_API_KEY` | 100 req/day free dev plan |

---

## 15. Features Complete List

### News Feed
- [x] Live news from 10 RSS sources (no API key needed)
- [x] Auto-refresh every 5 minutes
- [x] New articles banner notification
- [x] "Last updated X minutes ago" counter
- [x] Category filter (8 categories)
- [x] Source filter (7 specific outlets)
- [x] Search by keyword
- [x] Stats bar (total articles, flagged count)

### Per-Article NLP (on every article)
- [x] AI Summary — Inshorts-style 2 sentences (Groq)
- [x] Sentiment — Very Positive to Very Negative
- [x] Polarity — color-coded tri-bar (positive/neutral/negative %)
- [x] Fake News Score — 0–100% with visual indicator
- [x] Political Bias — Left / Center / Right
- [x] Credibility Score — 1–10 composite
- [x] Reading Level — Easy / Medium / Hard
- [x] Clickbait Detection — title pattern matching
- [x] Named Entity Recognition — people, orgs, places
- [x] Geographic Focus — country flag + region
- [x] Word Cloud — top 20 keywords per article

### Source Intelligence
- [x] Source credibility score (12 major outlets)
- [x] Source bias profile
- [x] Source country + region + type
- [x] Source reliability rating
- [x] Source founding year + description

### Article Actions
- [x] Save to browser localStorage
- [x] Share (native share API + URL copy fallback)
- [x] Copy AI summary to clipboard
- [x] Ask AI (navigates to chat with pre-filled question)
- [x] Find Similar (searches feed for related topic)
- [x] Export analysis as JSON file

### Full Article Page
- [x] Fake news alert banner (red) or credibility badge (green)
- [x] "Who Posted This" — source profile card
- [x] "Geographic Focus" — country + region breakdown
- [x] NLP score breakdown with gauge bars
- [x] Radar chart (5-axis article quality)
- [x] "What Can You Do" action grid
- [x] Named entity tags (color-coded by type)
- [x] Interactive word cloud

### Trends Dashboard
- [x] Global word cloud (all articles)
- [x] Sentiment distribution pie chart
- [x] Category distribution bar chart
- [x] Top mentioned entities
- [x] Summary stat cards

### Analyze Page
- [x] URL input — fetches and analyzes any article
- [x] Text paste — analyze any raw text
- [x] Full NLP results displayed inline

### AI Chat
- [x] Context-aware (knows today's analyzed articles)
- [x] Conversation history (last 6 messages)
- [x] Suggestion chips
- [x] Pre-fill from article page ("Ask AI" button)

---

## 16. Deployment Guide (Free)

### Frontend → Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Set Root Directory: `frontend`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. Deploy

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect GitHub repo
3. Settings:
   ```
   Root Directory: backend
   Build Command:  pip install -r requirements.txt
   Start Command:  uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
4. Add Environment Variables in Render dashboard:
   ```
   GROQ_API_KEY=your_groq_key
   NEWS_API_KEY=your_newsapi_key (optional)
   DATABASE_URL=sqlite+aiosqlite:///./truthlens.db
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
5. Deploy (free tier — spins down after 15min inactivity)

### Database → Supabase (Optional, for persistent storage)

For production persistence (Render's free tier has ephemeral storage):
1. Create a free project at [supabase.com](https://supabase.com)
2. Get the connection string from Settings → Database
3. Install asyncpg: add `asyncpg` to requirements.txt
4. Set in Render env vars:
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
   ```

---

## 17. Interview Talking Points

### "What NLP techniques did you use?"
> "I implemented a multi-layer NLP pipeline covering sentiment analysis with VADER (a lexicon-based approach giving compound polarity scores), custom TF-IDF keyword extraction for word clouds, regex-based Named Entity Recognition for people and organizations, Flesch-Kincaid readability scoring, clickbait detection via regex pattern matching on headlines, and a composite credibility score that combines fake probability, sentiment extremism, and entity density."

### "How did you detect fake news?"
> "I used a rule-based engine that scores articles based on: ALL-CAPS word ratio, sensationalist keyword patterns (SHOCKING, BOMBSHELL), excessive punctuation, presence/absence of source citations, and attribution phrases. I also integrated the HuggingFace Inference API as an optional ML layer using a fine-tuned BERT model. The rule-based approach was intentional — it's transparent, explainable, and works without any API dependency."

### "Why Groq instead of OpenAI?"
> "Groq uses LPU (Language Processing Unit) hardware which gives sub-second inference. Their free tier allows 14,400 requests per day which is more than enough for a demo. The llama-3.1-8b-instant model gives accurate summarization at minimal cost."

### "How does the architecture scale?"
> "The NLP pipeline runs in a thread pool executor so it doesn't block FastAPI's async event loop. Articles are cached in SQLite — once analyzed, they're never re-processed. For production, I'd replace SQLite with PostgreSQL on Supabase and add a Celery task queue with Redis to handle spikes in analysis requests."

### "What would you add next?"
> "RAG pipeline with ChromaDB for semantic article search, multi-agent verification that cross-references claims across sources, real-time WebSocket streaming for live news alerts, and fine-tuning a bias detection model on AllSides/MBFC labeled data instead of keyword rules."
