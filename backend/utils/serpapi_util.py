import serpapi
import os

from dotenv import load_dotenv

load_dotenv()

SERP_API_KEY = os.getenv('SERP_API_KEY')

client = serpapi.Client(api_key=SERP_API_KEY)

def search_products(
        q: str,
        min_price=None,
        max_price=None,
        sort_by=None,
    ):
    params = {
        "engine": "google_shopping",
        "q": q,
    }
    if min_price is not None:
        params["min_price"] = min_price
    if max_price is not None:
        params["max_price"] = max_price
    if sort_by is not None:
        params["sort_by"] = sort_by

    results = client.search(params)

    return results.get("shopping_results", [])