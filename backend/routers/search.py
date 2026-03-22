from typing import Optional

from fastapi import APIRouter, Query
from utils.goodonyou_util import get_brand_rating
from utils.serpapi_util import search_products

router = APIRouter()


@router.get("/search")
def search(
    q: str = Query(..., description="Search query (e.g. 'blue A-line dress')"),
    shoprs: Optional[str] = Query(None, description="Opaque SerpAPI filter token"),
    min_price: Optional[float] = Query(None, ge=0, description="Custom price range minimum"),
    max_price: Optional[float] = Query(None, ge=0, description="Custom price range maximum"),
):
    data = search_products(q, shoprs, min_price, max_price)
    results = data["shopping_results"]

    for result in results:
        brand = result.get("source")
        result["sustainability_rating"] = get_brand_rating(brand) if brand else None

    return {
        "query": q,
        "filter_groups": data["filters"],
        "results": results,
    }
