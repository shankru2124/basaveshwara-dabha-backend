from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_database
from app.models.table import (
    TableCreate, TableUpdate, TableStatus,
    ServiceRequestCreate, ServiceRequestType
)
from app.utils.security import get_current_admin
from app.utils.serializers import serialize_doc, serialize_docs
from app.websocket_manager import ws_manager

router = APIRouter(tags=["Smart QR Tables"])


async def _find_table_by_id_or_number(db, identifier: str):
    query_or = [
        {"_id": str(identifier)},
        {"id": str(identifier)},
        {"table_number": str(identifier).strip().upper()}
    ]
    if ObjectId.is_valid(str(identifier)):
        query_or.append({"_id": ObjectId(str(identifier))})
    return await db.tables.find_one({"$or": query_or})


# ==================== PUBLIC CUSTOMER QR TABLE ENDPOINTS ====================

@router.get("/tables/public")
async def get_public_tables():
    db = get_database()
    cursor = db.tables.find({"is_active": True}).sort("table_number", 1)
    tables = await cursor.to_list(length=200)
    return serialize_docs(tables)


@router.get("/tables/by-number/{table_number}")
async def get_table_by_number(table_number: str):
    db = get_database()
    norm = table_number.strip().upper()
    table = await db.tables.find_one({"table_number": norm, "is_active": True})
    if not table:
        # Case-insensitive fallback match
        table = await db.tables.find_one({
            "table_number": {"$regex": f"^{table_number.strip()}$", "$options": "i"},
            "is_active": True
        })
    if not table:
        raise HTTPException(status_code=404, detail=f"Table '{table_number}' not found or inactive")

    # Fetch active dine-in orders for this table today
    active_cursor = db.orders.find({
        "table_number": table.get("table_number"),
        "order_status": {"$nin": ["DELIVERED", "CANCELLED", "REJECTED"]}
    }).sort("created_at", -1)
    active_orders = await active_cursor.to_list(length=20)

    serialized_table = serialize_doc(table)
    serialized_table["active_orders"] = serialize_docs(active_orders)
    return serialized_table


@router.post("/tables/{table_number}/service-request")
async def create_table_service_request(table_number: str, req: ServiceRequestCreate):
    db = get_database()
    norm = table_number.strip().upper()
    table = await _find_table_by_id_or_number(db, norm)
    table_num = table.get("table_number") if table else norm
    table_name = table.get("table_name") if table else f"Table {norm}"

    now_iso = datetime.utcnow().isoformat()
    doc = {
        "table_number": table_num,
        "table_name": table_name,
        "request_type": req.request_type.value,
        "customer_name": req.customer_name or "Dine-In Guest",
        "note": req.note or "",
        "status": "PENDING",
        "created_at": now_iso,
        "resolved_at": None
    }
    res = await db.service_requests.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    serialized_req = serialize_doc(doc)

    # If guest requested bill, update table status to BILLING
    if table and req.request_type == ServiceRequestType.REQUEST_BILL:
        await db.tables.update_one(
            {"_id": table["_id"]},
            {"$set": {"status": TableStatus.BILLING.value, "updated_at": now_iso}}
        )
        updated_table = await db.tables.find_one({"_id": table["_id"]})
        await ws_manager.broadcast_to_restaurant({
            "event": "table_updated",
            "table": serialize_doc(updated_table)
        })

    label_map = {
        "CALL_WAITER": "Waiter Requested",
        "REQUEST_BILL": "Bill Requested",
        "WATER": "Drinking Water Requested",
        "CUTLERY": "Cutlery / Plates Requested"
    }
    readable = label_map.get(req.request_type.value, "Assistance Requested")

    await ws_manager.broadcast_to_restaurant({
        "event": "table_service_request",
        "request": serialized_req,
        "message": f"{table_num} ({table_name}): {readable}"
    })

    return {
        "message": f"{readable} sent to Basaveshwara Dabha staff!",
        "request": serialized_req
    }


# ==================== ADMIN / RESTAURANT TABLE & QR MANAGEMENT ====================

@router.get("/restaurant/tables")
async def get_admin_tables(admin: dict = Depends(get_current_admin)):
    db = get_database()
    tables_cursor = db.tables.find({}).sort("table_number", 1)
    tables = await tables_cursor.to_list(length=500)

    # Attach count of active orders & pending service requests per table
    active_orders = await db.orders.find({
        "fulfillment_type": "DINE_IN",
        "order_status": {"$nin": ["DELIVERED", "CANCELLED", "REJECTED"]}
    }).to_list(length=500)

    pending_reqs = await db.service_requests.find({"status": "PENDING"}).to_list(length=500)

    enriched = []
    for t in serialize_docs(tables):
        tnum = t.get("table_number")
        t_orders = [serialize_doc(o) for o in active_orders if o.get("table_number") == tnum]
        t_reqs = [serialize_doc(r) for r in pending_reqs if r.get("table_number") == tnum]
        t["active_order_count"] = len(t_orders)
        t["active_bill_total"] = round(sum(float(o.get("total_amount", 0)) for o in t_orders), 2)
        t["pending_requests_count"] = len(t_reqs)
        enriched.append(t)

    return enriched


@router.post("/restaurant/tables")
async def create_table(table: TableCreate, admin: dict = Depends(get_current_admin)):
    db = get_database()
    norm_num = table.table_number.strip().upper()
    existing = await db.tables.find_one({"table_number": norm_num})
    if existing:
        raise HTTPException(status_code=400, detail=f"Table '{norm_num}' already exists")

    now_iso = datetime.utcnow().isoformat()
    doc = table.dict()
    doc["table_number"] = norm_num
    doc["status"] = table.status.value
    doc["created_at"] = now_iso
    doc["updated_at"] = now_iso

    res = await db.tables.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    serialized = serialize_doc(doc)

    await ws_manager.broadcast_to_restaurant({
        "event": "table_updated",
        "table": serialized
    })
    return serialized


@router.put("/restaurant/tables/{table_id}")
async def update_table(table_id: str, payload: TableUpdate, admin: dict = Depends(get_current_admin)):
    db = get_database()
    table = await _find_table_by_id_or_number(db, table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    update_data = {}
    for k, v in payload.dict().items():
        if v is not None:
            if k == "table_number":
                update_data[k] = str(v).strip().upper()
            elif k == "status":
                update_data[k] = v.value if hasattr(v, "value") else v
            else:
                update_data[k] = v
    update_data["updated_at"] = datetime.utcnow().isoformat()

    await db.tables.update_one({"_id": table["_id"]}, {"$set": update_data})
    updated = await db.tables.find_one({"_id": table["_id"]})
    serialized = serialize_doc(updated)

    await ws_manager.broadcast_to_restaurant({
        "event": "table_updated",
        "table": serialized
    })
    return serialized


@router.delete("/restaurant/tables/{table_id}")
async def delete_table(table_id: str, admin: dict = Depends(get_current_admin)):
    db = get_database()
    table = await _find_table_by_id_or_number(db, table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    await db.tables.delete_one({"_id": table["_id"]})
    return {"message": "Table deleted successfully"}


@router.get("/restaurant/service-requests")
async def get_service_requests(admin: dict = Depends(get_current_admin)):
    db = get_database()
    cursor = db.service_requests.find({}).sort("created_at", -1)
    reqs = await cursor.to_list(length=100)
    return serialize_docs(reqs)


@router.put("/restaurant/service-requests/{req_id}/resolve")
async def resolve_service_request(req_id: str, clear_table: bool = False, admin: dict = Depends(get_current_admin)):
    db = get_database()
    query_or = [{"_id": str(req_id)}, {"id": str(req_id)}]
    if ObjectId.is_valid(str(req_id)):
        query_or.append({"_id": ObjectId(str(req_id))})
    req_doc = await db.service_requests.find_one({"$or": query_or})
    if not req_doc:
        raise HTTPException(status_code=404, detail="Service request not found")

    now_iso = datetime.utcnow().isoformat()
    await db.service_requests.update_one(
        {"_id": req_doc["_id"]},
        {"$set": {"status": "RESOLVED", "resolved_at": now_iso}}
    )

    if clear_table and req_doc.get("table_number"):
        await db.tables.update_one(
            {"table_number": req_doc["table_number"]},
            {"$set": {"status": TableStatus.AVAILABLE.value, "updated_at": now_iso}}
        )

    updated = await db.service_requests.find_one({"_id": req_doc["_id"]})
    serialized = serialize_doc(updated)
    await ws_manager.broadcast_to_restaurant({
        "event": "service_request_resolved",
        "request": serialized
    })
    return serialized
