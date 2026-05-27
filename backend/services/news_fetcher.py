import os
import hashlib
import httpx
from bs4 import BeautifulSoup
from typing import Optional

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
NEWS_API_BASE = "https://newsapi.org/v2"

CATEGORIES = ["general", "technology", "business", "health", "science", "sports", "entertainment"]

MOCK_NEWS = [
    {
        "title": "AI Breakthrough: New Model Achieves Human-Level Reasoning",
        "description": "Researchers announce a major milestone in artificial intelligence development.",
        "url": "https://example.com/ai-breakthrough",
        "source": "Tech Daily",
        "publishedAt": "2024-12-01T10:00:00Z",
        "urlToImage": "https://picsum.photos/seed/ai1/400/200",
        "category": "technology",
        "content": "Scientists at a leading research lab have unveiled an AI system that demonstrates unprecedented reasoning capabilities. The model can solve complex mathematical problems, write code, and engage in nuanced conversations. Experts say this could revolutionize industries from healthcare to education. The team published their findings in a peer-reviewed journal, with full transparency about limitations and safety measures implemented.",
    },
    {
        "title": "Global Climate Summit Reaches Historic Agreement",
        "description": "World leaders commit to ambitious emissions reduction targets.",
        "url": "https://example.com/climate-summit",
        "source": "World News",
        "publishedAt": "2024-12-01T08:00:00Z",
        "urlToImage": "https://picsum.photos/seed/climate1/400/200",
        "category": "general",
        "content": "Representatives from 190 nations gathered in Geneva to finalize a landmark climate agreement. The accord sets binding targets to reduce carbon emissions by 45% by 2035. According to UN Secretary General, this represents the most significant climate action in history. Developing nations secured financial support of $100 billion annually for clean energy transition. Environmental groups praised the deal while noting that implementation remains the critical challenge.",
    },
    {
        "title": "Stock Markets CRASH as Federal Reserve Shocks Investors!!!",
        "description": "BREAKING: Experts predict catastrophic economic collapse nobody saw coming.",
        "url": "https://example.com/market-crash",
        "source": "FinanceBuzz",
        "publishedAt": "2024-12-01T09:00:00Z",
        "urlToImage": "https://picsum.photos/seed/finance1/400/200",
        "category": "business",
        "content": "SHOCKING revelation! The Federal Reserve made a surprise announcement that has sent shockwaves through global markets! EVERYONE is panicking! Insiders who don't want you to know the truth have been hiding this information for MONTHS! This one weird trick could protect your savings! The mainstream media won't cover this! Act NOW before it's too late!!!",
    },
    {
        "title": "New Cancer Treatment Shows 90% Success Rate in Clinical Trials",
        "description": "Breakthrough immunotherapy could transform cancer treatment worldwide.",
        "url": "https://example.com/cancer-treatment",
        "source": "Medical Journal",
        "publishedAt": "2024-11-30T15:00:00Z",
        "urlToImage": "https://picsum.photos/seed/health1/400/200",
        "category": "health",
        "content": "A new immunotherapy treatment developed by researchers at Johns Hopkins University has shown remarkable results in Phase 3 clinical trials. The treatment, which targets specific protein markers on cancer cells, achieved a 90% response rate in patients with advanced lung cancer. Lead researcher Dr. Sarah Chen said the results exceeded expectations. The FDA has granted fast-track designation for the therapy. Larger trials involving 2,000 patients across 15 countries are now underway.",
    },
    {
        "title": "Tech Giants Face Antitrust Investigation in Europe",
        "description": "EU regulators launch probe into anticompetitive practices.",
        "url": "https://example.com/tech-antitrust",
        "source": "Reuters",
        "publishedAt": "2024-11-30T12:00:00Z",
        "urlToImage": "https://picsum.photos/seed/tech2/400/200",
        "category": "technology",
        "content": "European Union regulators have formally launched antitrust investigations into three major technology companies over alleged anticompetitive practices. The European Commission said it had evidence suggesting these companies used their dominant market positions to stifle competition. The companies have 30 days to respond to the charges. Penalties could reach 10% of global annual revenue if violations are confirmed. This marks the most significant tech regulation action since the GDPR.",
    },
    {
        "title": "Scientists Discover Ancient Civilization Beneath Amazon Rainforest",
        "description": "LiDAR technology reveals vast network of cities hidden for centuries.",
        "url": "https://example.com/amazon-discovery",
        "source": "National Geographic",
        "publishedAt": "2024-11-29T14:00:00Z",
        "urlToImage": "https://picsum.photos/seed/science1/400/200",
        "category": "science",
        "content": "Archaeologists using advanced LiDAR scanning technology have discovered evidence of a sophisticated ancient civilization beneath the Amazon rainforest canopy. The scans reveal an interconnected network of cities, roads, and agricultural systems spanning over 4,500 square kilometers. University of Exeter professor Dr. Jonas Weber described the findings as rewriting the history of pre-Columbian South America. The civilization appears to have flourished between 500 and 1400 CE, with a population estimated at over one million people.",
    },
]


def _make_id(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()[:16]


async def fetch_headlines(
    category: Optional[str] = None,
    query: Optional[str] = None,
    country: str = "us",
    page_size: int = 20,
) -> list:
    if not NEWS_API_KEY:
        return _filter_mock(category, query)

    params = {"apiKey": NEWS_API_KEY, "pageSize": page_size, "language": "en"}
    endpoint = f"{NEWS_API_BASE}/top-headlines"

    if query:
        params["q"] = query
        endpoint = f"{NEWS_API_BASE}/everything"
        params["sortBy"] = "publishedAt"
    else:
        params["country"] = country
        if category and category != "all":
            params["category"] = category

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(endpoint, params=params)
            data = resp.json()
            articles = data.get("articles", [])
            return [_normalize(a, category) for a in articles if a.get("title")]
    except Exception:
        return _filter_mock(category, query)


def _normalize(article: dict, category: Optional[str] = None) -> dict:
    source_name = article.get("source", {})
    if isinstance(source_name, dict):
        source_name = source_name.get("name", "Unknown")
    url = article.get("url", "")
    return {
        "id": _make_id(url or article.get("title", "")),
        "title": article.get("title", ""),
        "description": article.get("description", ""),
        "url": url,
        "source": source_name,
        "author": article.get("author"),
        "published_at": article.get("publishedAt"),
        "image_url": article.get("urlToImage"),
        "category": category or "general",
        "content": article.get("content") or article.get("description") or "",
    }


def _filter_mock(category: Optional[str], query: Optional[str]) -> list:
    news = MOCK_NEWS
    if category and category != "all":
        news = [n for n in news if n.get("category") == category]
    if query:
        q = query.lower()
        news = [n for n in news if q in n["title"].lower() or q in n.get("content", "").lower()]
    result = []
    for n in news:
        url = n.get("url", n["title"])
        result.append({
            "id": _make_id(url),
            "title": n["title"],
            "description": n.get("description", ""),
            "url": n.get("url"),
            "source": n.get("source"),
            "author": None,
            "published_at": n.get("publishedAt"),
            "image_url": n.get("urlToImage"),
            "category": n.get("category", "general"),
            "content": n.get("content", ""),
        })
    return result


async def extract_article_from_url(url: str) -> dict:
    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=12,
            headers={"User-Agent": "Mozilla/5.0 (compatible; TruthLens/1.0)"},
        ) as client:
            resp = await client.get(url)
            soup = BeautifulSoup(resp.text, "html.parser")

            title_tag = soup.find("h1") or soup.find("title")
            title = title_tag.get_text(strip=True) if title_tag else ""

            for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
                tag.decompose()

            article_body = (
                soup.find("article")
                or soup.find(attrs={"class": re.compile(r"article|content|body|story", re.I)})
                or soup.find("main")
                or soup.find("body")
            )
            paragraphs = article_body.find_all("p") if article_body else []
            content = " ".join(p.get_text(strip=True) for p in paragraphs[:30])

            img = soup.find("meta", property="og:image")
            image_url = img["content"] if img and img.get("content") else None

            source_meta = soup.find("meta", property="og:site_name")
            source = source_meta["content"] if source_meta and source_meta.get("content") else url.split("/")[2]

            return {
                "id": _make_id(url),
                "title": title,
                "url": url,
                "source": source,
                "content": content,
                "image_url": image_url,
                "category": "general",
            }
    except Exception as e:
        return {"id": _make_id(url), "title": url, "url": url, "content": "", "error": str(e)}
