import serpapi
import os

from dotenv import load_dotenv
from utils.sustainable_brands import SITE_FILTER

load_dotenv()

SERP_API_KEY = os.getenv('SERP_API_KEY')

client = serpapi.Client(api_key=SERP_API_KEY)

def search_products(
        q: str,
        shoprs: str | None = None,
        min_price=None,
        max_price=None,
        sustainable_only: bool = False,
    ):
    if sustainable_only:
        q = f"{q} {SITE_FILTER}"

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

    if sustainable_only:
        return _search_until_full(params)

    results = client.search(params)
    return {
        "shopping_results": results.get("shopping_results", []),
        "filters": results.get("filters", []),
    }


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
        all_results.extend(page_results)

        if len(all_results) >= target or not page_results:
            break

    return {
        "shopping_results": all_results,
        "filters": filters,
    }
