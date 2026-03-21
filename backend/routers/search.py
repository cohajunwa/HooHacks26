from enum import IntEnum
from typing import Optional

from fastapi import APIRouter, Query

router = APIRouter()


class SortOrder(IntEnum):
    HIGH_TO_LOW = 0
    LOW_TO_HIGH = 1


@router.get("/search")
def search(
    q: str = Query(..., description="Search query (e.g. 'blue A-line dress')"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    sort_by: Optional[SortOrder] = Query(None, description="0 = price high→low, 1 = price low→high"),
):
    # TODO: implement search across platforms and return results with sustainability ratings
    return {
        "query": q,
        "filters": {
            "min_price": min_price,
            "max_price": max_price,
            "sort_by": sort_by,
        },
        "results": [],
    }
