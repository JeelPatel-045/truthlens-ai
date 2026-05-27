import asyncio
from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeRequest
from services.news_fetcher import extract_article_from_url
from services.nlp_pipeline import NLPPipeline
from services.summarizer import summarize_article
import hashlib

router = APIRouter(prefix="/api/analyze", tags=["analyze"])
_pipeline = NLPPipeline()


def _make_id(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()[:16]


@router.post("")
async def analyze_article(req: AnalyzeRequest):
    if not req.url and not req.text:
        raise HTTPException(status_code=400, detail="Provide url or text")

    article = {}

    if req.url:
        article = await extract_article_from_url(req.url)
        if not article.get("content"):
            raise HTTPException(status_code=422, detail="Could not extract article content from URL")
    else:
        article = {
            "id": _make_id(req.text or ""),
            "title": req.title or "Pasted Article",
            "url": None,
            "source": "User Input",
            "content": req.text or "",
        }

    loop = asyncio.get_event_loop()
    nlp_result = await loop.run_in_executor(
        None, _pipeline.analyze, article.get("content", ""), article.get("title", "")
    )
    summary = await loop.run_in_executor(
        None, summarize_article, article.get("title", ""), article.get("content", "")
    )

    return {
        **article,
        "summary": summary,
        "nlp": nlp_result,
    }
