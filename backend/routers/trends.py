from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json
from collections import Counter

from database import get_db, ArticleDB

router = APIRouter(prefix="/api/trends", tags=["trends"])


@router.get("")
async def get_trends(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ArticleDB).order_by(ArticleDB.analyzed_at.desc()).limit(50))
    rows = result.scalars().all()

    if not rows:
        return _empty_trends()

    # Aggregate word cloud keywords
    all_keywords: dict = {}
    sentiment_counts = {"Positive": 0, "Very Positive": 0, "Neutral": 0, "Negative": 0, "Very Negative": 0}
    category_counts: dict = {}
    all_entities: list = []
    fake_scores = []

    for row in rows:
        if row.keywords:
            kws = json.loads(row.keywords)
            for kw in kws:
                text = kw.get("text", "").lower()
                val = kw.get("value", 10)
                all_keywords[text] = all_keywords.get(text, 0) + val

        if row.sentiment and row.sentiment in sentiment_counts:
            sentiment_counts[row.sentiment] += 1

        cat = row.category or "general"
        category_counts[cat] = category_counts.get(cat, 0) + 1

        if row.entities:
            ents = json.loads(row.entities)
            all_entities.extend([e.get("text", "") for e in ents if e.get("label") in ("PERSON", "ORG", "GPE")])

        if row.fake_score is not None:
            fake_scores.append(row.fake_score)

    word_cloud = sorted(
        [{"text": k, "value": v} for k, v in all_keywords.items()],
        key=lambda x: x["value"],
        reverse=True,
    )[:40]

    top_entities_raw = Counter(all_entities).most_common(10)
    top_entities = [{"text": e, "label": "ENTITY", "count": c} for e, c in top_entities_raw]

    fake_rate = round(sum(fake_scores) / len(fake_scores), 1) if fake_scores else 0.0

    return {
        "word_cloud": word_cloud,
        "sentiment_distribution": sentiment_counts,
        "category_distribution": category_counts,
        "fake_rate": fake_rate,
        "top_entities": top_entities,
        "total_analyzed": len(rows),
    }


def _empty_trends():
    return {
        "word_cloud": [],
        "sentiment_distribution": {"Positive": 0, "Neutral": 0, "Negative": 0},
        "category_distribution": {},
        "fake_rate": 0.0,
        "top_entities": [],
        "total_analyzed": 0,
    }
