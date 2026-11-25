import re
import random
import urllib.parse
from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_database
from app.models.order import (
    OrderCreateRequest, OrderStatus, PaymentStatus, PaymentMethod,
    FulfillmentType, PaymentVerifyRequest, UpiPaymentConfirmRequest
)
from app.utils.security import get_optional_user, get_current_user, get_current_admin
from app.utils.payment import create_razorpay_order, verify_razorpay_signature
from app.utils.serializers import serialize_doc, serialize_docs
from app.websocket_manager import ws_manager

router = APIRouter(prefix="/orders", tags=["Orders"])

def generate_order_id() -> str:
    today_str = datetime.utcnow().strftime("%Y%m%d")
    rand_num = random.randint(1000, 9999)
    return f"BD-{today_str}-{rand_num}"

@router.post("")
async def create_order(req: OrderCreateRequest, optional_user: dict = Depends(get_optional_user)):
    db = get_database()
    settings = await db.restaurant_settings.find_one({}) or {}

    if not settings.get("is_accepting_orders", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Restaurant is currently not accepting orders. Please check opening hours."
        )

    if not req.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart cannot be empty"
        )

    # Validate items and recalculate prices
    subtotal = 0.0
    order_items = []
    for item_input in req.items:
        query_or = [{"_id": str(item_input.item_id)}, {"id": str(item_input.item_id)}]
        if ObjectId.is_valid(str(item_input.item_id)):
            query_or.append({"_id": ObjectId(str(item_input.item_id))})
        food_doc = await db.menu_items.find_one({"$or": query_or})

        if not food_doc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item with ID {item_input.item_id} not found"
            )

        if not food_doc.get("is_available", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"'{food_doc.get('name')}' is currently sold out and unavailable"
            )

        item_price = float(food_doc.get("price", 0))
        item_total = item_price * item_input.quantity
        subtotal += item_total

        order_items.append({
            "item_id": str(food_doc["_id"]),
            "name": food_doc.get("name"),
            "price": item_price,
            "quantity": item_input.quantity,
            "total": round(item_total, 2),
            "image_url": food_doc.get("image_url"),
            "category": food_doc.get("category")
        })

    # Validate minimum order amount (waived for Dine-In QR table orders)
    min_order_val = 0.0 if req.fulfillment_type == FulfillmentType.DINE_IN else float(settings.get("min_order_value", 99.0))
    if subtotal < min_order_val:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum order amount is ₹{min_order_val}. Your current subtotal is ₹{round(subtotal, 2)}."
        )

    # Coupon validation
    discount_amount = 0.0
    valid_coupon_code = None
    if req.coupon_code:
        code_upper = req.coupon_code.strip().upper()
        coupon = await db.coupons.find_one({"code": code_upper, "is_active": True})
        if coupon and subtotal >= float(coupon.get("min_order_amount", 0)):
            if coupon.get("discount_type") == "percentage":
                calc_disc = (subtotal * float(coupon.get("discount_value", 0))) / 100.0
                max_cap = coupon.get("max_discount_amount")
                if max_cap and calc_disc > float(max_cap):
                    calc_disc = float(max_cap)
                discount_amount = round(calc_disc, 2)
            else:
                discount_amount = round(float(coupon.get("discount_value", 0)), 2)
            valid_coupon_code = code_upper

            # Increment usage
            await db.coupons.update_one({"code": code_upper}, {"$inc": {"used_count": 1}})

    # Taxes & fees
    tax_percent = float(settings.get("tax_percentage", 5.0))
    taxable = max(0.0, subtotal - discount_amount)
    tax_amount = round((taxable * tax_percent) / 100.0, 2)
    packaging_fee = 0.0 if req.fulfillment_type == FulfillmentType.DINE_IN else float(settings.get("packaging_fee", 15.0))

    delivery_fee = 0.0
    if req.fulfillment_type == FulfillmentType.DELIVERY:
        free_thresh = float(settings.get("free_delivery_threshold", 499.0))
        if subtotal < free_thresh:
            delivery_fee = float(settings.get("delivery_fee", 35.0))

    total_amount = round(max(0.0, subtotal - discount_amount + tax_amount + delivery_fee + packaging_fee), 2)

    order_id = generate_order_id()
    now_iso = datetime.utcnow().isoformat()

    customer_id = (optional_user.get("sub") if optional_user else req.customer_id)

    # Resolve table details if Dine-In
    norm_table_num = req.table_number.strip().upper() if req.table_number else None
    resolved_table_name = req.table_name
    if norm_table_num and not resolved_table_name:
        t_doc = await db.tables.find_one({"table_number": norm_table_num})
        if t_doc:
            resolved_table_name = t_doc.get("table_name")

    # Payment setup
    is_online = req.payment_method in [PaymentMethod.RAZORPAY_UPI, PaymentMethod.RAZORPAY_CARD, PaymentMethod.RAZORPAY_NETBANKING]
    payment_status = PaymentStatus.PENDING
    razorpay_order_id = None

    if is_online:
        rzp_order = create_razorpay_order(order_id, total_amount)
        razorpay_order_id = rzp_order.get("id")

    order_doc = {
        "order_id": order_id,
        "customer_id": customer_id,
        "customer_name": req.customer_name,
        "customer_phone": req.customer_phone,
        "customer_email": req.customer_email,
        "fulfillment_type": req.fulfillment_type.value,
        "table_number": norm_table_num,
        "table_name": resolved_table_name,
        "delivery_address": req.delivery_address,
        "order_instructions": req.order_instructions,
        "items": order_items,
        "subtotal": round(subtotal, 2),
        "discount_amount": discount_amount,
        "coupon_code": valid_coupon_code,
        "tax_amount": tax_amount,
        "delivery_fee": delivery_fee,
        "packaging_fee": packaging_fee,
        "total_amount": total_amount,
        "payment_method": req.payment_method.value,
        "payment_status": payment_status.value,
        "order_status": OrderStatus.PLACED.value,
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": None,
        "estimated_prep_time_minutes": 25,
        "status_history": [
            {
                "status": OrderStatus.PLACED.value,
                "timestamp": now_iso,
                "note": f"Dine-In order placed at {norm_table_num}." if norm_table_num else "Order placed by customer."
            }
        ],
        "created_at": now_iso,
        "updated_at": now_iso
    }

    result = await db.orders.insert_one(order_doc)
    order_doc["id"] = str(result.inserted_id)

    # Mark Dine-In table as OCCUPIED automatically
    if req.fulfillment_type == FulfillmentType.DINE_IN and norm_table_num:
        await db.tables.update_one(
            {"table_number": norm_table_num},
            {"$set": {"status": "OCCUPIED", "updated_at": now_iso}}
        )
        updated_table = await db.tables.find_one({"table_number": norm_table_num})
        if updated_table:
            await ws_manager.broadcast_to_restaurant({
                "event": "table_updated",
                "table": serialize_doc(updated_table)
            })

    serialized = serialize_doc(order_doc)

    # Broadcast new_order to restaurant dashboard upfront for COD / Pay-at-Table!
    # For online / UPI payments, the restaurant should only receive the order AFTER payment succeeds.
    if req.payment_method == PaymentMethod.COD:
        label = f"New Table {norm_table_num} order" if norm_table_num else "New Cash-on-Delivery order"
        await ws_manager.broadcast_to_restaurant({
            "event": "new_order",
            "order": serialized,
            "message": f"{label} received: {order_id} (₹{total_amount})"
        })

    upi_id = settings.get("upi_id", "basaveshwaradabha@okaxis")
    upi_payee_name = settings.get("upi_payee_name", "Basaveshwara Dabha")
    encoded_payee = urllib.parse.quote(upi_payee_name)
    upi_intent_uri = f"upi://pay?pa={upi_id}&pn={encoded_payee}&am={total_amount:.2f}&tn=Order%20{order_id}&cu=INR"
    upi_qr_image_url = settings.get("upi_qr_image_url")

    return {
        "message": "Order created successfully",
        "order": serialized,
        "razorpay_order_id": razorpay_order_id,
        "key_id": settings.get("RAZORPAY_KEY_ID", "rzp_test_basaveshwara_123"),
        "upi": {
            "upi_id": upi_id,
            "payee_name": upi_payee_name,
            "upi_intent_uri": upi_intent_uri,
            "qr_image_url": upi_qr_image_url,
            "amount": total_amount,
            "order_id": order_id
        }
    }

@router.post("/confirm-upi")
async def confirm_upi_payment(req: UpiPaymentConfirmRequest, current_admin: dict = Depends(get_current_admin)):
    """
    Staff / Admin ONLY: Confirm a manual counter UPI payment after verifying physical bank SMS or soundbox.
    Customers cannot self-confirm payments to prevent fraud and financial loss.
    """
    db = get_database()
    order = await db.orders.find_one({"order_id": req.order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    now_iso = datetime.utcnow().isoformat()
    utr_note = f" (UTR/Ref: {req.utr_number})" if req.utr_number else ""
    app_note = f" via {req.upi_app}" if req.upi_app else ""

    await db.orders.update_one(
        {"order_id": req.order_id},
        {
            "$set": {
                "payment_status": PaymentStatus.COMPLETED.value,
                "order_status": OrderStatus.PLACED.value,
                "upi_utr_number": req.utr_number,
                "upi_app": req.upi_app,
                "updated_at": now_iso
            },
            "$push": {
                "status_history": {
                    "status": "PAYMENT_CONFIRMED",
                    "timestamp": now_iso,
                    "note": f"UPI Payment of ₹{order.get('total_amount')} confirmed{utr_note}{app_note}. Awaiting restaurant acceptance."
                }
            }
        }
    )

    updated_order = await db.orders.find_one({"order_id": req.order_id})
    serialized = serialize_doc(updated_order)

    # Broadcast new_order to restaurant dashboard now that payment is confirmed!
    await ws_manager.broadcast_to_restaurant({
        "event": "new_order",
        "order": serialized,
        "message": f"New paid order received: {req.order_id} (₹{order.get('total_amount')}) via UPI! Please review and accept or decline."
    })
    await ws_manager.broadcast_to_all_customers({
        "event": "order_status_updated",
        "order": serialized
    })
    if order.get("customer_id"):
        await ws_manager.send_to_customer(order["customer_id"], {
            "event": "payment_confirmed",
            "order": serialized
        })

    return {
        "status": "success",
        "message": "UPI payment verified and confirmed successfully!",
        "order": serialized
    }

@router.post("/verify-payment")
async def verify_payment(req: PaymentVerifyRequest):
    db = get_database()
    order = await db.orders.find_one({"order_id": req.order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    is_valid, msg = verify_razorpay_signature(
        req.order_id,
        req.razorpay_order_id,
        req.razorpay_payment_id,
        req.razorpay_signature
    )

    if not is_valid:
        await db.orders.update_one(
            {"order_id": req.order_id},
            {
                "$set": {
                    "payment_status": PaymentStatus.FAILED.value,
                    "updated_at": datetime.utcnow().isoformat()
                }
            }
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment verification failed: {msg}"
        )

    now_iso = datetime.utcnow().isoformat()
    await db.orders.update_one(
        {"order_id": req.order_id},
        {
            "$set": {
                "payment_status": PaymentStatus.COMPLETED.value,
                "razorpay_payment_id": req.razorpay_payment_id,
                "updated_at": now_iso
            },
            "$push": {
                "status_history": {
                    "status": "PAYMENT_CONFIRMED",
                    "timestamp": now_iso,
                    "note": f"Payment of ₹{order.get('total_amount')} verified successfully."
                }
            }
        }
    )

    updated_order = await db.orders.find_one({"order_id": req.order_id})
    serialized = serialize_doc(updated_order)

    # Broadcast new_order to restaurant dashboard now that payment is confirmed!
    await ws_manager.broadcast_to_restaurant({
        "event": "new_order",
        "order": serialized,
        "message": f"New paid order received: {req.order_id} (₹{order.get('total_amount')}) via Online Payment! Please review and accept or decline."
    })
    await ws_manager.broadcast_to_all_customers({
        "event": "order_status_updated",
        "order": serialized
    })
    if order.get("customer_id"):
        await ws_manager.send_to_customer(order["customer_id"], {
            "event": "payment_confirmed",
            "order": serialized
        })

    return {
        "status": "success",
        "message": "Payment verified successfully",
        "order": serialized
    }

@router.get("/track/{order_id}")
async def track_order(order_id: str):
    db = get_database()
    order = await db.orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_doc(order)

@router.get("/my-orders")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    db = get_database()
    sub = str(current_user.get("sub", "")).strip()
    email = current_user.get("email", "").strip().lower()

    # Look up user to find registered phone
    user_doc = None
    if sub or email:
        user_doc = await db.users.find_one({"$or": [{"_id": sub}, {"id": sub}, {"email": email}]})

    match_conditions = []
    if sub:
        match_conditions.append({"customer_id": sub})
    if email:
        match_conditions.append({"customer_email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}})
    if user_doc and user_doc.get("phone"):
        match_conditions.append({"customer_phone": user_doc["phone"]})

    if match_conditions:
        cursor = db.orders.find({"$or": match_conditions}).sort("created_at", -1)
    else:
        cursor = db.orders.find({"customer_id": sub}).sort("created_at", -1)

    orders = await cursor.to_list(length=150)
    return serialize_docs(orders)

@router.post("/{order_id}/cancel")
async def cancel_order(order_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    order = await db.orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.get("customer_id") != current_user["sub"] and current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Unauthorized to cancel this order")

    if order.get("order_status") in [OrderStatus.PREPARING.value, OrderStatus.READY.value, OrderStatus.SERVED.value, OrderStatus.OUT_FOR_DELIVERY.value, OrderStatus.DELIVERED.value]:
        raise HTTPException(
            status_code=400,
            detail="Order cannot be cancelled because kitchen preparation has already started."
        )

    now_iso = datetime.utcnow().isoformat()
    new_payment_status = order.get("payment_status")
    refund_note = ""
    if order.get("payment_status") == PaymentStatus.COMPLETED.value:
        new_payment_status = PaymentStatus.REFUNDED.value
        refund_note = " (Online payment initiated for refund)"

    await db.orders.update_one(
        {"order_id": order_id},
        {
            "$set": {
                "order_status": OrderStatus.CANCELLED.value,
                "payment_status": new_payment_status,
                "updated_at": now_iso
            },
            "$push": {
                "status_history": {
                    "status": OrderStatus.CANCELLED.value,
                    "timestamp": now_iso,
                    "note": f"Order cancelled by customer.{refund_note}"
                }
            }
        }
    )

    updated = await db.orders.find_one({"order_id": order_id})
    serialized = serialize_doc(updated)

    # Real-time broadcasts
    await ws_manager.broadcast_to_restaurant({
        "event": "order_cancelled",
        "order": serialized
    })
    await ws_manager.broadcast_to_all_customers({
        "event": "order_status_updated",
        "order": serialized
    })

    return {"message": "Order cancelled successfully", "order": serialized}
