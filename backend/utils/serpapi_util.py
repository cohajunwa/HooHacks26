import serpapi
import os

from dotenv import load_dotenv
from utils.sustainable_brands import SITE_FILTER, SUSTAINABLE_BRANDS

load_dotenv()

SERP_API_KEY = os.getenv('SERP_API_KEY')

client = serpapi.Client(api_key=SERP_API_KEY)

def search_products(
        q: str,
        shoprs: str | None = None,
        min_price=None,
        max_price=None,
        brands: list[str] | None = None,
        page: int | None = None,
    ):
    # brands=None → no filter; brands=[] → all curated; brands=[...] → specific subset
    # page=None   → multi-page auto-fetch (style assistant); page=N → single page fetch (main search)
    if brands is not None:
        if brands:
            site_filter = " OR ".join(
                f"site: {SUSTAINABLE_BRANDS[b]}" for b in brands if b in SUSTAINABLE_BRANDS
            )
        else:
            site_filter = SITE_FILTER
        if site_filter:
            q = f"{q} {site_filter}"

    params = {
        "engine": "google_shopping",
        "q": q,
    }
    if shoprs is not None:
        params["shoprs"] = shoprs
    if min_price is not None:
        params["min_price"] = int(min_price)
    if max_price is not None:
        params["max_price"] = int(max_price)

    print(q)

    if brands is not None:
        if page is not None:
            # Single-page fetch for user-driven pagination
            params["start"] = page * 10
            response = client.search(params)
            shopping = response.get("shopping_results", [])
            _normalize_sources(shopping)
            return {
                "shopping_results": shopping,
                "filters": response.get("filters", []),
                "has_more": len(shopping) >= 10,
            }
        else:
            # Multi-page auto-fetch for style assistant
            return _search_until_full(params)

    results = client.search(params)
    shopping = results.get("shopping_results", [])
    _normalize_sources(shopping)
    return {
        "shopping_results": shopping,
        "filters": results.get("filters", []),
        "has_more": False,
    }


_MARKETPLACE_PREFIXES = ("Etsy", "eBay")

def _normalize_sources(results: list) -> None:
    """Trim marketplace seller suffixes, e.g. 'Etsy - SandyVintageBoutique' → 'Etsy'."""
    for result in results:
        source = result.get("source", "")
        for prefix in _MARKETPLACE_PREFIXES:
            if source.startswith(prefix):
                result["source"] = prefix
                break


def _search_until_full(params: dict, target: int = 10, max_pages: int = 3) -> dict:
    """Fetch up to max_pages of results, stopping early once target items are collected."""
    all_results = []
    filters = []

    for page in range(max_pages):
        params["start"] = page * 10
        response = client.search(params)

        if page == 0:
            filters = response.get("filters", [])

        page_results = response.get("shopping_results", [])
        _normalize_sources(page_results)
        all_results.extend(page_results)

        if len(all_results) >= target or not page_results:
            break

    return {
        "shopping_results": all_results,
        "filters": filters,
    }
