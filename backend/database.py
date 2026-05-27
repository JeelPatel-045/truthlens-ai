import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, String, Float, Boolean, Text, JSON
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./truthlens.db")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class ArticleDB(Base):
    __tablename__ = "articles"

    id = Column(String, primary_key=True)
    url = Column(String, unique=True, nullable=True)
    title = Column(Text, nullable=False)
    source = Column(String, nullable=True)
    author = Column(String, nullable=True)
    published_at = Column(String, nullable=True)
    content = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    category = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    sentiment = Column(String, nullable=True)
    sentiment_positive = Column(Float, nullable=True)
    sentiment_negative = Column(Float, nullable=True)
    sentiment_neutral = Column(Float, nullable=True)
    sentiment_compound = Column(Float, nullable=True)
    fake_score = Column(Float, nullable=True)
    bias = Column(String, nullable=True)
    credibility_score = Column(Float, nullable=True)
    reading_level = Column(String, nullable=True)
    is_clickbait = Column(Boolean, nullable=True)
    keywords = Column(JSON, nullable=True)
    entities = Column(JSON, nullable=True)
    geo_tags = Column(JSON, nullable=True)
    analyzed_at = Column(String, nullable=True)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
