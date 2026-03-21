from enum import IntEnum
from typing import Optional

from fastapi import APIRouter, Query
from utils.goodonyou_util import get_brand_rating
from utils.serpapi_util import search_products

router = APIRouter()


class SortOrder(IntEnum):
    HIGH_TO_LOW = 2
    LOW_TO_HIGH = 1


@router.get("/search")
def search(
    q: str = Query(..., description="Search query (e.g. 'blue A-line dress')"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    sort_by: Optional[SortOrder] = Query(None, description="1 = price low→high, 2 = price high→low"),
):
    results = search_products(q, min_price, max_price, sort_by)

    for result in results:
        brand = result.get("source")
        result["sustainability_rating"] = get_brand_rating(brand) if brand else None

    return {
        "query": q,
        "filters": {
            "min_price": min_price,
            "max_price": max_price,
            "sort_by": sort_by,
        },
        "results": results,
    }
