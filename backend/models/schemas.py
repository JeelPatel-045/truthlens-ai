from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SentimentScores(BaseModel):
    positive: float
    negative: float
    neutral: float
    compound: float


class PolarityResult(BaseModel):
    label: str
    score: float
    color: str


class BiasResult(BaseModel):
    label: str
    score: float
    color: str


class EntityItem(BaseModel):
    text: str
    label: str


class KeywordItem(BaseModel):
    text: str
    value: int


class NLPResult(BaseModel):
    sentiment: str
    sentiment_scores: SentimentScores
    polarity: PolarityResult
    bias: BiasResult
    fake_score: float
    credibility_score: float
    reading_level: str
    is_clickbait: bool
    keywords: List[KeywordItem]
    entities: List[EntityItem]


class ArticleBase(BaseModel):
    url: Optional[str] = None
    title: str
    source: Optional[str] = None
    author: Optional[str] = None
    published_at: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None


class ArticleAnalyzed(ArticleBase):
    id: str
    summary: Optional[str] = None
    nlp: Optional[NLPResult] = None
    analyzed_at: Optional[str] = None


class AnalyzeRequest(BaseModel):
    url: Optional[str] = None
    text: Optional[str] = None
    title: Optional[str] = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str


class TrendsResponse(BaseModel):
    word_cloud: List[KeywordItem]
    sentiment_distribution: dict
    category_distribution: dict
    fake_rate: float
    top_entities: List[EntityItem]
