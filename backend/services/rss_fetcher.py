import re
import hashlib
import httpx
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Optional

RSS_SOURCES = [
    {"url": "https://feeds.bbci.co.uk/news/world/rss.xml",         "source": "BBC News",     "category": "general"},
    {"url": "https://feeds.bbci.co.uk/news/technology/rss.xml",    "source": "BBC News",     "category": "technology"},
    {"url": "https://techcrunch.com/feed/",                        "source": "TechCrunch",   "category": "technology"},
    {"url": "https://feeds.npr.org/1001/rss.xml",                  "source": "NPR",          "category": "general"},
    {"url": "https://feeds.arstechnica.com/arstechnica/index",     "source": "Ars Technica", "category": "technology"},
    {"url": "https://www.theguardian.com/world/rss",               "source": "The Guardian", "category": "general"},
    {"url": "https://www.theguardian.com/technology/rss",          "source": "The Guardian", "category": "technology"},
    {"url": "https://www.theguardian.com/science/rss",             "source": "The Guardian", "category": "science"},
    {"url": "https://www.aljazeera.com/xml/rss/all.xml",           "source": "Al Jazeera",   "category": "general"},
    {"url": "https://news.ycombinator.com/rss",                    "source": "Hacker News",  "category": "technology"},
]

_ATOM_NS = "http://www.w3.org/2005/Atom"
_MEDIA_NS = "http://search.yahoo.com/mrss/"


def _make_id(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()[:16]


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


def _parse_rss_xml(xml_text: str, source_name: str, category: str) -> list:
    articles = []
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return []

    # Determine format: RSS vs Atom
    is_atom = root.tag == f"{{{_ATOM_NS}}}feed" or "feed" in root.tag.lower()

    if is_atom:
        entries = root.findall(f"{{{_ATOM_NS}}}entry")
        for entry in entries[:8]:
            title = entry.findtext(f"{{{_ATOM_NS}}}title", "").strip()
            link_el = entry.find(f"{{{_ATOM_NS}}}link")
            link = link_el.get("href", "") if link_el is not None else ""
            summary = _strip_html(entry.findtext(f"{{{_ATOM_NS}}}summary", ""))
            published = entry.findtext(f"{{{_ATOM_NS}}}published", "")
            if title and link:
                articles.append(_build_article(title, link, summary, published, source_name, category))
    else:
        # Standard RSS 2.0
        channel = root.find("channel") or root
        for item in channel.findall("item")[:8]:
            title = _strip_html(item.findtext("title", "")).strip()
            link = item.findtext("link", "").strip()
            description = _strip_html(item.findtext("description", ""))
            pub_date = item.findtext("pubDate", "")

            # Try media:content for image
            img = None
            media_content = item.find(f"{{{_MEDIA_NS}}}content")
            if media_content is not None:
                img = media_content.get("url")
            if not img:
                enclosure = item.find("enclosure")
                if enclosure is not None and "image" in (enclosure.get("type") or ""):
                    img = enclosure.get("url")

            if title and link:
                a = _build_article(title, link, description, pub_date, source_name, category)
                a["image_url"] = img
                articles.append(a)

    return articles


def _build_article(title, link, content, published, source, category) -> dict:
    return {
        "id": _make_id(link),
        "title": title,
        "url": link,
        "source": source,
        "author": None,
        "published_at": _normalize_date(published),
        "content": content[:1500] if content else "",
        "image_url": None,
        "category": category,
        "description": content[:200] if content else "",
    }


def _normalize_date(raw: str) -> Optional[str]:
    if not raw:
        return datetime.utcnow().isoformat()
    # Try common formats
    for fmt in ("%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z",
                "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ"):
        try:
            return datetime.strptime(raw.strip(), fmt).isoformat()
        except Exception:
            continue
    return raw


async def fetch_rss_source(source: dict) -> list:
    try:
        async with httpx.AsyncClient(
            timeout=10,
            follow_redirects=True,
            headers={"User-Agent": "TruthLens/1.0 (+https://truthlens.ai)"},
        ) as client:
            resp = await client.get(source["url"])
            if resp.status_code == 200:
                return _parse_rss_xml(resp.text, source["source"], source["category"])
    except Exception:
        pass
    return []


async def fetch_all_rss(category: Optional[str] = None) -> list:
    import asyncio

    sources = RSS_SOURCES
    if category and category != "all":
        sources = [s for s in RSS_SOURCES if s["category"] == category]
        if not sources:
            sources = RSS_SOURCES  # fallback to all

    tasks = [fetch_rss_source(s) for s in sources]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    seen_ids = set()
    articles = []
    for batch in results:
        if isinstance(batch, list):
            for a in batch:
                if a["id"] not in seen_ids:
                    seen_ids.add(a["id"])
                    articles.append(a)

    # Sort by published_at descending
    articles.sort(key=lambda x: x.get("published_at") or "", reverse=True)
    return articles[:30]
