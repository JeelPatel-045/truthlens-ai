import re
import os
import requests
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from typing import Optional
from collections import Counter

_vader = None


def _load_models():
    global _vader
    if _vader is None:
        _vader = SentimentIntensityAnalyzer()


class NLPPipeline:
    def __init__(self):
        _load_models()
        self.vader = _vader
        self.hf_token = os.getenv("HF_API_TOKEN", "")

    def analyze(self, text: str, title: str = "") -> dict:
        full_text = f"{title}. {text}" if title else text
        clean_text = self._clean_text(full_text)

        sentiment_raw = self.vader.polarity_scores(clean_text[:5000])
        polarity = self._get_polarity(sentiment_raw)

        keywords = self._extract_keywords(clean_text)
        entities = self._extract_entities(clean_text[:1500])
        bias = self._detect_bias(clean_text)
        fake_score = self._get_fake_score(clean_text, title)
        credibility = self._calculate_credibility(fake_score, sentiment_raw, entities)
        reading_level = self._reading_level(clean_text)
        is_clickbait = self._detect_clickbait(title)
        geo_tags = self._extract_geo_tags(entities)

        return {
            "sentiment": polarity["label"],
            "sentiment_scores": {
                "positive": round(sentiment_raw["pos"] * 100, 1),
                "negative": round(sentiment_raw["neg"] * 100, 1),
                "neutral": round(sentiment_raw["neu"] * 100, 1),
                "compound": round(sentiment_raw["compound"], 3),
            },
            "polarity": polarity,
            "keywords": keywords,
            "entities": entities[:12],
            "bias": bias,
            "fake_score": fake_score,
            "credibility_score": credibility,
            "reading_level": reading_level,
            "is_clickbait": is_clickbait,
            "geo_tags": geo_tags,
        }

    def _clean_text(self, text: str) -> str:
        text = re.sub(r"http\S+", "", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def _get_polarity(self, scores: dict) -> dict:
        compound = scores["compound"]
        if compound >= 0.35:
            return {"label": "Very Positive", "score": compound, "color": "green"}
        elif compound >= 0.05:
            return {"label": "Positive", "score": compound, "color": "emerald"}
        elif compound <= -0.35:
            return {"label": "Very Negative", "score": abs(compound), "color": "red"}
        elif compound <= -0.05:
            return {"label": "Negative", "score": abs(compound), "color": "orange"}
        else:
            return {"label": "Neutral", "score": 0.5, "color": "gray"}

    def _extract_keywords(self, text: str) -> list:
        # TF-IDF-inspired keyword extraction without external libraries
        STOP = {
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
            "for", "of", "with", "by", "from", "is", "was", "are", "were",
            "be", "been", "has", "have", "had", "do", "did", "will", "would",
            "this", "that", "it", "he", "she", "they", "we", "i", "you", "its",
            "as", "so", "if", "not", "no", "can", "said", "says", "also", "just",
            "than", "then", "when", "who", "which", "what", "how", "their", "all",
            "more", "new", "one", "two", "about", "after", "before", "into",
            "over", "such", "up", "out", "could", "would", "should", "been",
        }
        words = re.findall(r"\b[a-zA-Z]{3,}\b", text[:4000].lower())
        n = max(len(words), 1)
        tf: Counter = Counter(w for w in words if w not in STOP)
        # boost words that appear in first 20% (likely more topical)
        head_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", text[:800].lower()))
        result = []
        seen = set()
        for w, c in tf.most_common(30):
            if w in seen:
                continue
            seen.add(w)
            # simple TF score with position boost
            score = (c / n) * (1.4 if w in head_words else 1.0)
            result.append({"text": w, "value": min(int(score * 2000 + c * 3), 100)})
        return sorted(result, key=lambda x: x["value"], reverse=True)[:20]

    def _extract_entities(self, text: str) -> list:
        # Regex-based NER (no spaCy needed): extract capitalized multi-word sequences
        # that look like names, organizations, or places
        entities = []
        seen = set()

        # Proper noun sequences (2+ capitalized words not at sentence start)
        pattern = r'(?<![.!?]\s)(?<!\n)(?<!\A)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)'
        for match in re.finditer(pattern, text):
            name = match.group(1).strip()
            if name not in seen and len(name) > 3:
                seen.add(name)
                # Heuristic label
                label = "ORG" if any(w in name for w in ["Inc", "Corp", "Ltd", "University", "Institute", "Foundation"]) else "PERSON"
                entities.append({"text": name, "label": label})

        # Country/city names via simple lookup
        GEO = {
            "United States", "United Kingdom", "European Union", "New York", "Washington",
            "China", "India", "Russia", "Germany", "France", "Japan", "Brazil",
            "California", "Texas", "London", "Paris", "Beijing", "Moscow",
        }
        for geo in GEO:
            if geo in text and geo not in seen:
                seen.add(geo)
                entities.append({"text": geo, "label": "GPE"})

        return entities[:12]

    def _detect_bias(self, text: str) -> dict:
        text_lower = text.lower()
        left_kw = [
            "progressive", "liberal", "democrat", "climate change", "social justice",
            "equity", "inclusive", "diversity", "welfare", "green new deal",
            "universal healthcare", "gun control", "lgbtq", "immigration reform",
        ]
        right_kw = [
            "conservative", "republican", "traditional", "border security",
            "second amendment", "free market", "patriot", "america first",
            "deregulation", "tax cuts", "law and order", "illegal immigration",
            "big government", "constitution",
        ]
        left_count = sum(1 for kw in left_kw if kw in text_lower)
        right_count = sum(1 for kw in right_kw if kw in text_lower)

        if left_count > right_count + 1:
            strength = min(left_count / 5.0, 1.0)
            return {"label": "Left-Leaning", "score": round(strength, 2), "color": "blue"}
        elif right_count > left_count + 1:
            strength = min(right_count / 5.0, 1.0)
            return {"label": "Right-Leaning", "score": round(strength, 2), "color": "red"}
        else:
            return {"label": "Center", "score": 0.5, "color": "gray"}

    def _get_fake_score(self, text: str, title: str = "") -> float:
        # Try HuggingFace Inference API first
        if self.hf_token:
            score = self._hf_fake_score(text[:512])
            if score is not None:
                return score
        return self._rule_based_fake_score(text, title)

    def _hf_fake_score(self, text: str) -> Optional[float]:
        try:
            url = "https://api-inference.huggingface.co/models/GonzaloA/fake-news-detection"
            headers = {"Authorization": f"Bearer {self.hf_token}"}
            resp = requests.post(url, headers=headers, json={"inputs": text}, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, list) and data:
                    scores = data[0]
                    fake = next((s for s in scores if "FAKE" in s.get("label", "").upper()), None)
                    if fake:
                        return round(fake["score"] * 100, 1)
        except Exception:
            pass
        return None

    def _rule_based_fake_score(self, text: str, title: str = "") -> float:
        score = 15.0
        combined = f"{title} {text}"

        # Sensationalist patterns in title
        clickbait_patterns = [
            r"\b(SHOCKING|BREAKING|EXPLOSIVE|BOMBSHELL|MUST.?READ|UNBELIEVABLE|MIRACLE)\b",
            r"\b(they don.?t want you to know|secret agenda|hidden truth|mainstream media won.?t)\b",
            r"\b(doctors hate|one weird trick|this will blow)\b",
        ]
        for pat in clickbait_patterns:
            hits = re.findall(pat, combined, re.IGNORECASE)
            score += len(hits) * 12

        # ALL CAPS ratio
        words = combined.split()
        if words:
            caps_ratio = sum(1 for w in words if w.isupper() and len(w) > 2) / len(words)
            score += caps_ratio * 40

        # Excessive punctuation
        exclaim = combined.count("!")
        score += min(exclaim * 3, 15)

        # Extreme quantifiers without evidence
        exaggeration = re.findall(
            r"\b(always|never|everyone|nobody|all|none|100%|proven|guaranteed)\b",
            combined, re.IGNORECASE,
        )
        score += len(exaggeration) * 4

        # Has citations/quotes (trust indicator)
        quotes = re.findall(r'["“”]', combined)
        attributed = re.findall(r"\baccording to\b|\bsaid\b|\btold\b|\breported\b", combined, re.IGNORECASE)
        score -= (len(quotes) * 1 + len(attributed) * 2)

        return round(max(5.0, min(95.0, score)), 1)

    def _calculate_credibility(self, fake_score: float, sentiment: dict, entities: list) -> float:
        score = 10.0
        score -= fake_score / 14
        if abs(sentiment["compound"]) > 0.75:
            score -= 1.5
        if len(entities) >= 3:
            score += 0.5
        return round(max(1.0, min(10.0, score)), 1)

    def _reading_level(self, text: str) -> str:
        sentences = [s.strip() for s in re.split(r"[.!?]", text) if s.strip()]
        words = text.split()
        if not sentences or not words:
            return "Unknown"
        avg_words = len(words) / max(len(sentences), 1)
        avg_chars = sum(len(w) for w in words) / max(len(words), 1)
        score = 206.835 - 1.015 * avg_words - 84.6 * (avg_chars / 5)
        if score >= 70:
            return "Easy"
        elif score >= 50:
            return "Medium"
        else:
            return "Hard"

    def _detect_clickbait(self, title: str) -> bool:
        if not title:
            return False
        patterns = [
            r"\b(you won.?t believe|mind.?blowing|jaw.?dropping|shocking)\b",
            r"\b(here.?s why|this is why|the real reason)\b",
            r"\b\d+\s+(things|ways|reasons|tips|facts|secrets|tricks)\b",
            r"\.{3}$",
            r"\?{2,}$",
            r"!{2,}",
        ]
        title_lower = title.lower()
        return any(re.search(p, title_lower) for p in patterns)

    # Maps of known country names/cities to metadata
    _GEO_MAP = {
        "United States": ("United States", "🇺🇸", "North America"),
        "Washington": ("United States", "🇺🇸", "North America"),
        "New York": ("United States", "🇺🇸", "North America"),
        "California": ("United States", "🇺🇸", "North America"),
        "United Kingdom": ("United Kingdom", "🇬🇧", "Europe"),
        "London": ("United Kingdom", "🇬🇧", "Europe"),
        "Britain": ("United Kingdom", "🇬🇧", "Europe"),
        "China": ("China", "🇨🇳", "Asia"),
        "Beijing": ("China", "🇨🇳", "Asia"),
        "India": ("India", "🇮🇳", "Asia"),
        "New Delhi": ("India", "🇮🇳", "Asia"),
        "Russia": ("Russia", "🇷🇺", "Europe/Asia"),
        "Moscow": ("Russia", "🇷🇺", "Europe/Asia"),
        "Germany": ("Germany", "🇩🇪", "Europe"),
        "Berlin": ("Germany", "🇩🇪", "Europe"),
        "France": ("France", "🇫🇷", "Europe"),
        "Paris": ("France", "🇫🇷", "Europe"),
        "Japan": ("Japan", "🇯🇵", "Asia"),
        "Tokyo": ("Japan", "🇯🇵", "Asia"),
        "Brazil": ("Brazil", "🇧🇷", "South America"),
        "Australia": ("Australia", "🇦🇺", "Oceania"),
        "Canada": ("Canada", "🇨🇦", "North America"),
        "Israel": ("Israel", "🇮🇱", "Middle East"),
        "Ukraine": ("Ukraine", "🇺🇦", "Europe"),
        "Iran": ("Iran", "🇮🇷", "Middle East"),
        "Pakistan": ("Pakistan", "🇵🇰", "Asia"),
        "Saudi Arabia": ("Saudi Arabia", "🇸🇦", "Middle East"),
        "Qatar": ("Qatar", "🇶🇦", "Middle East"),
        "South Korea": ("South Korea", "🇰🇷", "Asia"),
        "North Korea": ("North Korea", "🇰🇵", "Asia"),
        "Indonesia": ("Indonesia", "🇮🇩", "Asia"),
        "Turkey": ("Turkey", "🇹🇷", "Middle East/Europe"),
        "Mexico": ("Mexico", "🇲🇽", "North America"),
        "Nigeria": ("Nigeria", "🇳🇬", "Africa"),
        "South Africa": ("South Africa", "🇿🇦", "Africa"),
        "Egypt": ("Egypt", "🇪🇬", "Africa"),
        "Europe": ("Europe", "🇪🇺", "Europe"),
        "Asia": ("Asia", "🌏", "Asia"),
        "Africa": ("Africa", "🌍", "Africa"),
        "Middle East": ("Middle East", "🌍", "Middle East"),
    }

    def _extract_geo_tags(self, entities: list) -> dict:
        locations = [e["text"] for e in entities if e.get("label") in ("GPE", "LOC")]
        found = []
        seen = set()
        for loc in locations:
            for key, (country, flag, region) in self._GEO_MAP.items():
                if key.lower() in loc.lower() and country not in seen:
                    seen.add(country)
                    found.append({"country": country, "flag": flag, "region": region})
                    break
        if found:
            primary = found[0]
            return {
                "primary_country": primary["country"],
                "primary_flag": primary["flag"],
                "primary_region": primary["region"],
                "all_locations": found[:4],
            }
        return {
            "primary_country": None,
            "primary_flag": "🌐",
            "primary_region": "Global",
            "all_locations": [],
        }
