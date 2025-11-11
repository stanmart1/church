from typing import Any, Dict, List
from fastapi import Query

def parse_pagination_params(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
) -> Dict[str, int]:
    return {"page": page, "limit": limit, "offset": (page - 1) * limit}

def format_pagination_response(
    data: List[Any],
    total: int,
    page: int,
    limit: int
) -> Dict[str, Any]:
    return {
        "data": data,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }
