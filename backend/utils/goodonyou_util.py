import json
import re
from pathlib import Path

import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0"}
BASE_URL = "https://directory.goodonyou.eco/brand"

_CACHE_FILE = Path(__file__).parent.parent / "cache" / "goodonyou_ratings.json"
_NOT_FOUND_SENTINEL = "__NOT_FOUND__"


def _load_cache() -> dict:
    if _CACHE_FILE.exists():
        return json.loads(_CACHE_FILE.read_text())
    return {}


def _save_cache(cache: dict) -> None:
    _CACHE_FILE.parent.mkdir(exist_ok=True)
    _CACHE_FILE.write_text(json.dumps(cache, indent=2))


def make_request(url: str) -> requests.Response | None:
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code == 200:
            return response
        print(f"Failed to retrieve page: {response.status_code}")
        return None
    except requests.RequestException as e:
        print(f"An error occurred: {e}")
        return None


def _to_slug(brand_name: str) -> str:
    """Normalize a brand name to a Good on You URL slug (e.g. 'H&M' → 'hm')."""
    return re.sub(r"[^a-z0-9]+", "-", brand_name.lower()).strip("-")


def brand_search(brand_name: str) -> str | None:
    """
    Returns the Good on You sustainability rating for a brand (e.g. 'Great',
    'Good', "It's a start", 'We avoid'), or None if the brand is not listed.
    """
    slug = _to_slug(brand_name)
    print(f"{BASE_URL}/{slug}")
    response = make_request(f"{BASE_URL}/{slug}")
    if not response:
        return None

    # Prefer structured data embedded by Next.js over HTML scraping
    soup = BeautifulSoup(response.text, "html.parser")
    next_data_tag = soup.find("script", id="__NEXT_DATA__")
    if next_data_tag:
        try:
            data = json.loads(next_data_tag.string) # type: ignore
            rating = (
                data.get("props", {})
                .get("pageProps", {})
                .get("brand", {})
                .get("rating")
            )
            if rating:
                return rating
        except (json.JSONDecodeError, AttributeError):
            pass

    # Fallback: find the "Rated : <value>" text pattern in rendered HTML
    match = re.search(r"Rated\s*:\s*([^<\"]+)", response.text)
    if match:
        return match.group(1).strip()

    return None

def get_brand_rating(brand_name: str) -> str | None:
    """
    Returns the Good on You rating for a brand, using a local JSON cache to
    avoid redundant HTTP requests. Brands not listed on Good on You are also
    cached so repeat lookups don't trigger another fetch.
    """
    slug = _to_slug(brand_name)
    cache = _load_cache()

    if slug in cache:
        value = cache[slug]
        return None if value == _NOT_FOUND_SENTINEL else value

    rating = brand_search(brand_name)
    cache[slug] = rating if rating is not None else _NOT_FOUND_SENTINEL
    _save_cache(cache)
    return rating


if __name__ == '__main__':
    brand = input("Brand: ")
    print(get_brand_rating(brand))