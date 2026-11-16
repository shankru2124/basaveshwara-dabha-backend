from typing import Optional, List
from bson import ObjectId
from fastapi import APIRouter, Query, HTTPException
from app.database import get_database
from app.utils.serializers import serialize_docs, serialize_doc

router = APIRouter(prefix="/menu", tags=["Customer Menu"])

@router.get("/categories")
async def get_categories():
    db = get_database()
    cursor = db.categories.find({"is_active": True}).sort("display_order", 1)
    docs = await cursor.to_list(length=100)
    return serialize_docs(docs)

@router.get("/items")
async def get_menu_items(
    category: Optional[str] = None,
    search: Optional[str] = None,
    popular: Optional[bool] = None,
    today_special: Optional[bool] = None,
    available_only: bool = False,
    sort_by: Optional[str] = None,  # price_asc, price_desc, popular
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    db = get_database()
    query = {"is_veg": True}  # strictly vegetarian

    if available_only:
        query["is_available"] = True

    if category and category.lower() != "all":
        query["category"] = category

    if popular is not None:
        query["is_popular"] = popular

    if today_special is not None:
        query["is_today_special"] = today_special

    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["price"] = price_query

    if search:
        # regex search on name and description
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}}
        ]

    cursor = db.menu_items.find(query)

    # Sort
    if sort_by == "price_asc":
        cursor = cursor.sort("price", 1)
    elif sort_by == "price_desc":
        cursor = cursor.sort("price", -1)
    elif sort_by == "popular":
        cursor = cursor.sort("is_popular", -1)
    else:
        cursor = cursor.sort("created_at", -1)

    items = await cursor.to_list(length=500)
    return serialize_docs(items)

@router.get("/featured")
async def get_featured():
    db = get_database()
    today_specials = await db.menu_items.find({"is_today_special": True, "is_veg": True}).to_list(length=20)
    popular_items = await db.menu_items.find({"is_popular": True, "is_veg": True}).to_list(length=20)
    return {
        "today_specials": serialize_docs(today_specials),
        "popular_items": serialize_docs(popular_items)
    }

@router.get("/items/{item_id}")
async def get_menu_item(item_id: str):
    db = get_database()
    try:
        item = await db.menu_items.find_one({"_id": ObjectId(item_id)})
    except Exception:
        item = await db.menu_items.find_one({"id": item_id})

    if not item:
        raise HTTPException(status_code=404, detail="Food item not found")
    return serialize_doc(item)
