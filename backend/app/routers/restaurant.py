from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.database import get_database
from app.models.order import OrderStatus, OrderStatusUpdateRequest, PaymentStatus
from app.models.menu import (
    MenuItemCreate, MenuItemUpdate, AvailabilityToggle,
    CategoryCreate, CategoryUpdate
)
from app.models.settings import RestaurantSettingsUpdate
from app.utils.security import get_current_admin
from app.utils.serializers import serialize_doc, serialize_docs
from app.websocket_manager import ws_manager

router = APIRouter(prefix="/restaurant", tags=["Restaurant Management"])

# ==================== ORDERS MANAGEMENT ====================

@router.get("/orders")
async def get_all_orders(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    admin: dict = Depends(get_current_admin)
):
    db = get_database()
    # Restaurant dashboard only receives/displays orders that are either COD or have completed/refunded online payment
    conditions = [
        {
            "$or": [
                {"payment_method": "COD"},
                {"payment_status": {"$in": ["COMPLETED", "REFUNDED"]}}
            ]
        }
    ]

    if status_filter and status_filter.upper() != "ALL":
        conditions.append({"order_status": status_filter.upper()})

    if search:
        conditions.append({
            "$or": [
                {"order_id": {"$regex": search, "$options": "i"}},
                {"customer_phone": {"$regex": search, "$options": "i"}},
                {"customer_name": {"$regex": search, "$options": "i"}}
            ]
        })

    if date_from or date_to:
        date_q = {}
        if date_from:
            date_q["$gte"] = date_from
        if date_to:
            date_q["$lte"] = date_to
        conditions.append({"created_at": date_q})

    query = {"$and": conditions} if len(conditions) > 1 else conditions[0]

    skip = (page - 1) * limit
    cursor = db.orders.find(query).sort("created_at", -1).skip(skip).limit(limit)
    orders = await cursor.to_list(length=limit)
    total_count = await db.orders.count_documents(query)

    return {
        "orders": serialize_docs(orders),
        "total": total_count,
        "page": page,
        "limit": limit
    }

@router.get("/orders/{order_id}")
async def get_order_by_id(order_id: str, admin: dict = Depends(get_current_admin)):
    db = get_database()
    order = await db.orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_doc(order)

@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    req: OrderStatusUpdateRequest,
    admin: dict = Depends(get_current_admin)
):
    db = get_database()
    order = await db.orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    now_iso = datetime.utcnow().isoformat()
    update_data = {
        "order_status": req.status.value,
        "updated_at": now_iso
    }

    if req.prep_time_minutes is not None:
        update_data["estimated_prep_time_minutes"] = req.prep_time_minutes

    if req.rejection_reason is not None:
        update_data["rejection_reason"] = req.rejection_reason

    # Payment status adjustments for COD or refunds
    if req.status == OrderStatus.DELIVERED and order.get("payment_method") == "COD":
        update_data["payment_status"] = PaymentStatus.COMPLETED.value
    elif req.status in [OrderStatus.CANCELLED, OrderStatus.REJECTED] and order.get("payment_status") == PaymentStatus.COMPLETED.value:
        update_data["payment_status"] = PaymentStatus.REFUNDED.value

    note = req.note or f"Status transitioned to {req.status.value} by restaurant."
    if req.rejection_reason:
        note += f" Reason: {req.rejection_reason}"

    await db.orders.update_one(
        {"order_id": order_id},
        {
            "$set": update_data,
            "$push": {
                "status_history": {
                    "status": req.status.value,
                    "timestamp": now_iso,
                    "note": note
                }
            }
        }
    )

    updated_order = await db.orders.find_one({"order_id": order_id})
    serialized = serialize_doc(updated_order)

    # Broadcast event to both restaurant dashboard and customer tracking interface
    event_payload = {
        "event": "order_status_updated",
        "order_id": order_id,
        "status": req.status.value,
        "order": serialized,
        "note": note
    }
    await ws_manager.broadcast_to_restaurant(event_payload)
    await ws_manager.broadcast_to_all_customers(event_payload)

    return serialized

# ==================== MENU MANAGEMENT ====================

@router.get("/menu")
async def get_admin_menu(admin: dict = Depends(get_current_admin)):
    db = get_database()
    cursor = db.menu_items.find({}).sort("created_at", -1)
    items = await cursor.to_list(length=1000)
    return serialize_docs(items)

@router.post("/menu")
async def create_menu_item(item: MenuItemCreate, admin: dict = Depends(get_current_admin)):
    db = get_database()
    item_dict = item.dict()
    item_dict["is_veg"] = True  # strictly pure vegetarian
    item_dict["created_at"] = datetime.utcnow().isoformat()
    item_dict["updated_at"] = datetime.utcnow().isoformat()

    res = await db.menu_items.insert_one(item_dict)
    item_dict["id"] = str(res.inserted_id)
    serialized = serialize_doc(item_dict)

    # Broadcast real-time menu update
    await ws_manager.broadcast_all({
        "event": "menu_updated",
        "action": "create",
        "item": serialized
    })

    return serialized

@router.put("/menu/{item_id}")
async def update_menu_item(item_id: str, item: MenuItemUpdate, admin: dict = Depends(get_current_admin)):
    db = get_database()
    update_data = {k: v for k, v in item.dict().items() if v is not None}
    update_data["is_veg"] = True
    update_data["updated_at"] = datetime.utcnow().isoformat()

    try:
        await db.menu_items.update_one({"_id": ObjectId(item_id)}, {"$set": update_data})
        updated = await db.menu_items.find_one({"_id": ObjectId(item_id)})
    except Exception:
        await db.menu_items.update_one({"id": item_id}, {"$set": update_data})
        updated = await db.menu_items.find_one({"id": item_id})

    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")

    serialized = serialize_doc(updated)

    # Broadcast real-time update
    await ws_manager.broadcast_all({
        "event": "menu_updated",
        "action": "update",
        "item": serialized
    })

    return serialized

@router.patch("/menu/{item_id}/availability")
async def toggle_item_availability(
    item_id: str,
    body: AvailabilityToggle,
    admin: dict = Depends(get_current_admin)
):
    db = get_database()
    update_data = {
        "is_available": body.is_available,
        "updated_at": datetime.utcnow().isoformat()
    }

    try:
        await db.menu_items.update_one({"_id": ObjectId(item_id)}, {"$set": update_data})
        updated = await db.menu_items.find_one({"_id": ObjectId(item_id)})
    except Exception:
        await db.menu_items.update_one({"id": item_id}, {"$set": update_data})
        updated = await db.menu_items.find_one({"id": item_id})

    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")

    serialized = serialize_doc(updated)

    # Broadcast instant food_availability_changed event
    await ws_manager.broadcast_all({
        "event": "food_availability_changed",
        "item_id": str(updated["_id"]),
        "name": updated.get("name"),
        "is_available": body.is_available,
        "item": serialized
    })

    return serialized

@router.delete("/menu/{item_id}")
async def delete_menu_item(item_id: str, admin: dict = Depends(get_current_admin)):
    db = get_database()
    try:
        await db.menu_items.delete_one({"_id": ObjectId(item_id)})
    except Exception:
        await db.menu_items.delete_one({"id": item_id})

    await ws_manager.broadcast_all({
        "event": "menu_updated",
        "action": "delete",
        "item_id": item_id
    })

    return {"message": "Menu item deleted successfully", "item_id": item_id}

# ==================== CATEGORIES MANAGEMENT ====================

@router.post("/categories")
async def create_category(cat: CategoryCreate, admin: dict = Depends(get_current_admin)):
    db = get_database()
    cat_dict = cat.dict()
    cat_dict["slug"] = cat.name.lower().replace(" ", "-")
    cat_dict["created_at"] = datetime.utcnow().isoformat()

    res = await db.categories.insert_one(cat_dict)
    cat_dict["id"] = str(res.inserted_id)
    serialized = serialize_doc(cat_dict)

    await ws_manager.broadcast_all({
        "event": "category_updated",
        "category": serialized
    })

    return serialized

@router.put("/categories/{cat_id}")
async def update_category(cat_id: str, cat: CategoryUpdate, admin: dict = Depends(get_current_admin)):
    db = get_database()
    update_data = {k: v for k, v in cat.dict().items() if v is not None}
    if "name" in update_data:
        update_data["slug"] = update_data["name"].lower().replace(" ", "-")

    try:
        await db.categories.update_one({"_id": ObjectId(cat_id)}, {"$set": update_data})
        updated = await db.categories.find_one({"_id": ObjectId(cat_id)})
    except Exception:
        await db.categories.update_one({"id": cat_id}, {"$set": update_data})
        updated = await db.categories.find_one({"id": cat_id})

    serialized = serialize_doc(updated)
    await ws_manager.broadcast_all({
        "event": "category_updated",
        "category": serialized
    })
    return serialized

@router.delete("/categories/{cat_id}")
async def delete_category(cat_id: str, admin: dict = Depends(get_current_admin)):
    db = get_database()
    try:
        await db.categories.delete_one({"_id": ObjectId(cat_id)})
    except Exception:
        await db.categories.delete_one({"id": cat_id})

    await ws_manager.broadcast_all({
        "event": "category_deleted",
        "cat_id": cat_id
    })
    return {"message": "Category deleted", "id": cat_id}

# ==================== RESTAURANT SETTINGS ====================

@router.get("/settings")
async def get_settings():
    db = get_database()
    settings = await db.restaurant_settings.find_one({})
    if not settings:
        return {}
    return serialize_doc(settings)

@router.put("/settings")
async def update_settings(body: RestaurantSettingsUpdate, admin: dict = Depends(get_current_admin)):
    db = get_database()
    update_data = {k: v for k, v in body.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()

    await db.restaurant_settings.update_one({}, {"$set": update_data}, upsert=True)
    updated = await db.restaurant_settings.find_one({})
    serialized = serialize_doc(updated)

    # Broadcast restaurant settings update (e.g. store closed/open, delivery fees)
    await ws_manager.broadcast_all({
        "event": "restaurant_status_changed",
        "settings": serialized
    })

    return serialized

# ==================== CUSTOMER MANAGEMENT ====================

@router.get("/customers")
async def get_customers(admin: dict = Depends(get_current_admin)):
    db = get_database()
    # Fetch distinct customers and calculate their order statistics
    cursor = db.users.find({"role": "customer"})
    customers = await cursor.to_list(length=1000)

    customer_list = []
    for c in customers:
        cid = str(c["_id"])
        c_orders = await db.orders.find({"customer_id": cid}).to_list(length=1000)
        total_orders = len(c_orders)
        total_spent = sum(o.get("total_amount", 0) for o in c_orders if o.get("order_status") != "CANCELLED")

        customer_list.append({
            "id": cid,
            "name": c.get("name"),
            "email": c.get("email"),
            "phone": c.get("phone"),
            "total_orders": total_orders,
            "total_spent": round(total_spent, 2),
            "created_at": c.get("created_at"),
            "addresses": c.get("addresses", [])
        })

    return customer_list
