from typing import List, Optional
from bson import ObjectId
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
from app.database import get_database
from app.models.order import FulfillmentType
from app.utils.serializers import serialize_doc

router = APIRouter(prefix="/cart", tags=["Cart & Pricing"])

class CartItemInput(BaseModel):
    item_id: str
    quantity: int = Field(..., ge=1)

class CartValidateRequest(BaseModel):
    items: List[CartItemInput]
    fulfillment_type: FulfillmentType = FulfillmentType.DELIVERY
    coupon_code: Optional[str] = None

@router.post("/calculate")
async def calculate_cart(req: CartValidateRequest):
    db = get_database()
    settings = await db.restaurant_settings.find_one({}) or {}

    # Check restaurant accepting orders
    is_accepting = settings.get("is_accepting_orders", True)

    validated_items = []
    unavailable_items = []
    subtotal = 0.0

    for ci in req.items:
        # Find item flexibly by string _id, id, or ObjectId
        query_or = [{"_id": str(ci.item_id)}, {"id": str(ci.item_id)}]
        if ObjectId.is_valid(str(ci.item_id)):
            query_or.append({"_id": ObjectId(str(ci.item_id))})
        item = await db.menu_items.find_one({"$or": query_or})

        if not item:
            unavailable_items.append({
                "item_id": ci.item_id,
                "reason": "Item no longer exists in menu"
            })
            continue

        if not item.get("is_available", True):
            unavailable_items.append({
                "item_id": ci.item_id,
                "name": item.get("name"),
                "reason": "Currently sold out / unavailable"
            })
            continue

        price = float(item.get("price", 0))
        item_total = price * ci.quantity
        subtotal += item_total

        validated_items.append({
            "item_id": str(item["_id"]),
            "name": item.get("name"),
            "price": price,
            "quantity": ci.quantity,
            "total": round(item_total, 2),
            "image_url": item.get("image_url"),
            "category": item.get("category")
        })

    # Coupon validation
    discount_amount = 0.0
    coupon_info = None
    if req.coupon_code:
        code_upper = req.coupon_code.strip().upper()
        coupon = await db.coupons.find_one({"code": code_upper, "is_active": True})
        if coupon:
            min_req = float(coupon.get("min_order_amount", 0))
            if subtotal >= min_req:
                if coupon.get("discount_type") == "percentage":
                    calc_disc = (subtotal * float(coupon.get("discount_value", 0))) / 100.0
                    max_cap = coupon.get("max_discount_amount")
                    if max_cap and calc_disc > float(max_cap):
                        calc_disc = float(max_cap)
                    discount_amount = round(calc_disc, 2)
                else:
                    discount_amount = round(float(coupon.get("discount_value", 0)), 2)

                coupon_info = {
                    "code": code_upper,
                    "discount_applied": discount_amount,
                    "description": f"Applied successfully! ₹{discount_amount} saved."
                }
            else:
                coupon_info = {
                    "code": code_upper,
                    "discount_applied": 0.0,
                    "error": f"Minimum order amount for {code_upper} is ₹{min_req}"
                }
        else:
            coupon_info = {
                "code": code_upper,
                "discount_applied": 0.0,
                "error": "Invalid or expired coupon code"
            }

    # Taxes and fees
    tax_percent = float(settings.get("tax_percentage", 5.0))
    taxable_amount = max(0.0, subtotal - discount_amount)
    tax_amount = round((taxable_amount * tax_percent) / 100.0, 2)

    # Packaging fee
    packaging_fee = float(settings.get("packaging_fee", 15.0)) if validated_items else 0.0

    # Delivery fee
    delivery_fee = 0.0
    if req.fulfillment_type == FulfillmentType.DELIVERY and validated_items:
        free_thresh = float(settings.get("free_delivery_threshold", 499.0))
        if subtotal < free_thresh:
            delivery_fee = float(settings.get("delivery_fee", 35.0))
        else:
            delivery_fee = 0.0

    total_amount = round(max(0.0, subtotal - discount_amount + tax_amount + delivery_fee + packaging_fee), 2)
    min_order_val = float(settings.get("min_order_value", 99.0))
    can_place_order = (
        is_accepting
        and len(unavailable_items) == 0
        and len(validated_items) > 0
        and subtotal >= min_order_val
    )

    return {
        "items": validated_items,
        "unavailable_items": unavailable_items,
        "is_restaurant_open": is_accepting,
        "subtotal": round(subtotal, 2),
        "discount_amount": discount_amount,
        "coupon": coupon_info,
        "tax_amount": tax_amount,
        "tax_percentage": tax_percent,
        "packaging_fee": packaging_fee,
        "delivery_fee": delivery_fee,
        "total_amount": total_amount,
        "min_order_value": min_order_val,
        "can_place_order": can_place_order
    }
