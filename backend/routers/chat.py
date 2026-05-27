import asyncio
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db, ArticleDB
from models.schemas import ChatRequest, ChatResponse
from services.summarizer import chat_with_news

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ArticleDB.title, ArticleDB.summary, ArticleDB.category, ArticleDB.fake_score)
        .order_by(ArticleDB.analyzed_at.desc())
        .limit(10)
    )
    rows = result.all()

    context_parts = []
    for row in rows:
        parts = [f"- {row.title}"]
        if row.summary:
            parts.append(f"  Summary: {row.summary}")
        if row.fake_score is not None:
            parts.append(f"  Fake Score: {row.fake_score:.0f}%")
        context_parts.append("\n".join(parts))

    news_context = "\n".join(context_parts) if context_parts else "No articles analyzed yet."

    loop = asyncio.get_event_loop()
    reply = await loop.run_in_executor(
        None,
        chat_with_news,
        req.message,
        news_context,
        [m.model_dump() for m in (req.history or [])],
    )
    return ChatResponse(reply=reply)
