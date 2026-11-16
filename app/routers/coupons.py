from typing import Optional
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from app.database import get_database
from app.models.coupon import CouponCreate, CouponApplyRequest
from app.utils.security import get_current_admin
from app.utils.serializers import serialize_doc, serialize_docs

router = APIRouter(prefix="/coupons", tags=["Coupons & Offers"])

@router.get("")
async def get_all_coupons():
    db = get_database()
    cursor = db.coupons.find({})
    coupons = await cursor.to_list(length=100)
    return serialize_docs(coupons)

@router.post("")
async def create_coupon(req: CouponCreate, admin: dict = Depends(get_current_admin)):
    db = get_database()
    code_upper = req.code.strip().upper()
    existing = await db.coupons.find_one({"code": code_upper})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    doc = req.dict()
    doc["code"] = code_upper
    doc["used_count"] = 0
    res = await db.coupons.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return serialize_doc(doc)

@router.patch("/{coupon_id}/toggle")
async def toggle_coupon(coupon_id: str, admin: dict = Depends(get_current_admin)):
    db = get_database()
    try:
        coupon = await db.coupons.find_one({"_id": ObjectId(coupon_id)})
    except Exception:
        coupon = await db.coupons.find_one({"id": coupon_id})

    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    new_state = not coupon.get("is_active", True)
    try:
        await db.coupons.update_one({"_id": ObjectId(coupon_id)}, {"$set": {"is_active": new_state}})
        updated = await db.coupons.find_one({"_id": ObjectId(coupon_id)})
    except Exception:
        await db.coupons.update_one({"id": coupon_id}, {"$set": {"is_active": new_state}})
        updated = await db.coupons.find_one({"id": coupon_id})

    return serialize_doc(updated)

@router.delete("/{coupon_id}")
async def delete_coupon(coupon_id: str, admin: dict = Depends(get_current_admin)):
    db = get_database()
    try:
        await db.coupons.delete_one({"_id": ObjectId(coupon_id)})
    except Exception:
        await db.coupons.delete_one({"id": coupon_id})
    return {"message": "Coupon deleted"}
