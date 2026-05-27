import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
    return _client


def summarize_article(title: str, content: str) -> str:
    if not content or len(content.strip()) < 50:
        return title

    prompt = (
        "Summarize this news article in exactly 2 concise sentences, "
        "Inshorts-style — factual, no opinions, under 60 words total:\n\n"
        f"Title: {title}\n"
        f"Content: {content[:2500]}\n\n"
        "Summary:"
    )
    try:
        client = _get_client()
        resp = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=120,
            temperature=0.2,
        )
        return resp.choices[0].message.content.strip()
    except Exception:
        # Fallback: first 180 chars of content
        return content[:180].rsplit(" ", 1)[0] + "..."


def chat_with_news(user_message: str, news_context: str, history: list) -> str:
    system_prompt = (
        "You are TruthLens AI, an intelligent news assistant. "
        "Answer questions about news, fake news detection, media bias, and current events. "
        "Be concise, factual, and helpful. "
        "Use the provided news context when relevant.\n\n"
        f"Today's News Context:\n{news_context[:3000]}"
    )

    messages = [{"role": "system", "content": system_prompt}]
    for h in history[-6:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": user_message})

    try:
        client = _get_client()
        resp = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=400,
            temperature=0.5,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        return f"Sorry, I couldn't process that right now. Error: {str(e)}"
