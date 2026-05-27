import asyncio
import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db, ArticleDB
from services.news_fetcher import fetch_headlines
from services.rss_fetcher import fetch_all_rss
from services.nlp_pipeline import NLPPipeline
from services.summarizer import summarize_article
from services.source_db import get_source_info

router = APIRouter(prefix="/api/news", tags=["news"])
_pipeline = NLPPipeline()


def _db_to_dict(row: ArticleDB) -> dict:
    bias = json.loads(row.bias) if row.bias else {"label": "Center", "score": 0.5, "color": "gray"}
    geo = json.loads(row.geo_tags) if row.geo_tags else {"primary_country": None, "primary_flag": "🌐", "primary_region": "Global", "all_locations": []}
    polarity_label = row.sentiment or "Neutral"
    polarity_score = abs(row.sentiment_compound or 0)
    polarity_color = "green" if "Positive" in polarity_label else "red" if "Negative" in polarity_label else "gray"

    return {
        "id": row.id,
        "title": row.title,
        "url": row.url,
        "source": row.source,
        "source_info": get_source_info(row.source or ""),
        "author": row.author,
        "published_at": row.published_at,
        "image_url": row.image_url,
        "category": row.category,
        "summary": row.summary,
        "nlp": {
            "sentiment": row.sentiment,
            "sentiment_scores": {
                "positive": row.sentiment_positive or 0,
                "negative": row.sentiment_negative or 0,
                "neutral": row.sentiment_neutral or 0,
                "compound": row.sentiment_compound or 0,
            },
            "polarity": {"label": polarity_label, "score": polarity_score, "color": polarity_color},
            "bias": bias,
            "fake_score": row.fake_score or 0,
            "credibility_score": row.credibility_score or 5,
            "reading_level": row.reading_level or "Unknown",
            "is_clickbait": row.is_clickbait or False,
            "keywords": json.loads(row.keywords) if row.keywords else [],
            "entities": json.loads(row.entities) if row.entities else [],
            "geo_tags": geo,
        },
        "analyzed_at": row.analyzed_at,
    }


async def _analyze_and_store(article: dict, db: AsyncSession) -> dict:
    art_id = article["id"]

    # Check cache — skip re-analysis if already done
    result = await db.execute(select(ArticleDB).where(ArticleDB.id == art_id))
    existing = result.scalar_one_or_none()
    if existing:
        return _db_to_dict(existing)

    content = article.get("content") or article.get("description") or ""
    title = article.get("title", "")

    loop = asyncio.get_event_loop()
    nlp_result = await loop.run_in_executor(None, _pipeline.analyze, content, title)
    summary = await loop.run_in_executor(None, summarize_article, title, content)

    row = ArticleDB(
        id=art_id,
        url=article.get("url"),
        title=title,
        source=article.get("source"),
        author=article.get("author"),
        published_at=article.get("published_at"),
        content=content[:5000],
        image_url=article.get("image_url"),
        category=article.get("category", "general"),
        summary=summary,
        sentiment=nlp_result["sentiment"],
        sentiment_positive=nlp_result["sentiment_scores"]["positive"],
        sentiment_negative=nlp_result["sentiment_scores"]["negative"],
        sentiment_neutral=nlp_result["sentiment_scores"]["neutral"],
        sentiment_compound=nlp_result["sentiment_scores"]["compound"],
        fake_score=nlp_result["fake_score"],
        bias=json.dumps(nlp_result["bias"]),
        credibility_score=nlp_result["credibility_score"],
        reading_level=nlp_result["reading_level"],
        is_clickbait=nlp_result["is_clickbait"],
        keywords=json.dumps(nlp_result["keywords"]),
        entities=json.dumps(nlp_result["entities"]),
        geo_tags=json.dumps(nlp_result.get("geo_tags", {})),
        analyzed_at=datetime.utcnow().isoformat(),
    )
    db.add(row)
    try:
        await db.commit()
    except Exception:
        await db.rollback()

    article["summary"] = summary
    article["nlp"] = nlp_result
    article["source_info"] = get_source_info(article.get("source", ""))
    article["analyzed_at"] = row.analyzed_at
    return article


@router.get("/feed")
async def get_feed(
    category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    # Fetch from RSS (always available, no API key needed) + NewsAPI if available
    rss_articles = await fetch_all_rss(category=category)
    newsapi_articles = await fetch_headlines(category=category, query=q)

    # Merge, deduplicate by id
    seen_ids = set()
    all_articles = []
    for a in rss_articles + newsapi_articles:
        if a["id"] not in seen_ids:
            seen_ids.add(a["id"])
            all_articles.append(a)

    # Filter by search query if provided
    if q:
        q_lower = q.lower()
        all_articles = [
            a for a in all_articles
            if q_lower in (a.get("title") or "").lower()
            or q_lower in (a.get("content") or "").lower()
        ]

    # Filter by specific source
    if source:
        s_lower = source.lower()
        all_articles = [a for a in all_articles if s_lower in (a.get("source") or "").lower()]

    # Limit to 18 articles for analysis
    all_articles = all_articles[:18]

    tasks = [_analyze_and_store(a, db) for a in all_articles]
    analyzed = await asyncio.gather(*tasks, return_exceptions=True)
    return [a for a in analyzed if isinstance(a, dict)]


@router.get("/sources")
async def get_sources():
    from services.rss_fetcher import RSS_SOURCES
    from services.source_db import get_source_info
    sources = []
    seen = set()
    for s in RSS_SOURCES:
        name = s["source"]
        if name not in seen:
            seen.add(name)
            sources.append({"name": name, "info": get_source_info(name)})
    return sources


@router.get("/{article_id}")
async def get_article(article_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ArticleDB).where(ArticleDB.id == article_id))
    row = result.scalar_one_or_none()
    if not row:
        return {"error": "Article not found"}
    return _db_to_dict(row)
