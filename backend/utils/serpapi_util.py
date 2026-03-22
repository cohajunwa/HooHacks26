import serpapi
import os

from dotenv import load_dotenv

load_dotenv()

SERP_API_KEY = os.getenv('SERP_API_KEY')

client = serpapi.Client(api_key=SERP_API_KEY)

def search_products(
        q: str,
        shoprs: str | None = None,
        min_price=None,
        max_price=None,
    ):
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

    results = client.search(params)

    return {
        "shopping_results": results.get("shopping_results", []),
        "filters": results.get("filters", []),
    }
