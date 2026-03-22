from typing import Optional

from fastapi import APIRouter, Query
from utils.goodonyou_util import get_brand_rating
from utils.serpapi_util import search_products
from utils.sustainable_brands import SUSTAINABLE_BRANDS

router = APIRouter()


@router.get("/brands")
def get_brands():
    return [{"name": name, "domain": domain} for name, domain in SUSTAINABLE_BRANDS.items()]


@router.get("/search")
def search(
    q: str = Query(..., description="Search query (e.g. 'blue A-line dress')"),
    shoprs: Optional[str] = Query(None, description="Opaque SerpAPI filter token"),
    min_price: Optional[float] = Query(None, ge=0, description="Custom price range minimum"),
    max_price: Optional[float] = Query(None, ge=0, description="Custom price range maximum"),
    brands: list[str] = Query(default=[], description="Brand names to restrict to; empty = all curated brands"),
    page: int = Query(default=0, ge=0, description="Page number for pagination (0-indexed)"),
):
    data = search_products(q, shoprs, min_price, max_price, brands=brands if brands else [], page=page)
    results = data["shopping_results"]

    for result in results:
        brand = result.get("source")
        result["sustainability_rating"] = get_brand_rating(brand) if brand else None

    return {
        "query": q,
        "filter_groups": data["filters"],
        "results": results,
    }

@router.get("/general-search")
def general_search(
    q: str = Query(..., description="Search query (e.g. 'blue A-line dress')"),
    shoprs: Optional[str] = Query(None, description="Opaque SerpAPI filter token"),
    min_price: Optional[float] = Query(None, ge=0, description="Custom price range minimum"),
    max_price: Optional[float] = Query(None, ge=0, description="Custom price range maximum"),
    sustainable_only: bool = Query(False, description="Restrict results to curated sustainable brands"),
):
    data = search_products(q, shoprs, min_price, max_price, sustainable_only)
    results = data["shopping_results"]

    for result in results:
        brand = result.get("source")
        result["sustainability_rating"] = get_brand_rating(brand) if brand else None

    return {
        "query": q,
        "filter_groups": data["filters"],
        "results": results,
    }
