import csv
import io
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Response
from app.database import get_database
from app.utils.security import get_current_admin

router = APIRouter(prefix="/analytics", tags=["Analytics & Reports"])

@router.get("/dashboard")
async def get_analytics_dashboard(admin: dict = Depends(get_current_admin)):
    db = get_database()
    cursor = db.orders.find({})
    orders = await cursor.to_list(length=10000)

    now = datetime.utcnow()
    today_str = now.strftime("%Y-%m-%d")
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    today_sales = 0.0
    today_orders = 0
    total_sales = 0.0
    valid_orders_count = 0
    cancelled_orders = 0
    pending_orders = 0
    accepted_orders = 0
    preparing_orders = 0
    completed_orders = 0

    item_sales_map = {}
    payment_methods_map = {"COD": 0, "RAZORPAY_UPI": 0, "RAZORPAY_CARD": 0, "RAZORPAY_NETBANKING": 0}
    daily_sales_chart = {}

    # Initialize last 7 days chart keys
    for i in range(7):
        day_date = (now - timedelta(days=6 - i)).strftime("%Y-%m-%d")
        daily_sales_chart[day_date] = 0.0

    for o in orders:
        # Ignore unpaid online checkouts - restaurant only processes confirmed/paid orders (or COD)
        is_cod = o.get("payment_method") == "COD"
        is_paid = o.get("payment_status") in ["COMPLETED", "REFUNDED"]
        if not (is_cod or is_paid):
            continue

        status = o.get("order_status", "")
        created_at_str = o.get("created_at", "")[:10]
        amount = float(o.get("total_amount", 0))

        if status == "CANCELLED":
            cancelled_orders += 1
            continue

        if status == "PLACED":
            pending_orders += 1
        elif status == "ACCEPTED":
            accepted_orders += 1
        elif status == "PREPARING":
            preparing_orders += 1
        elif status == "DELIVERED":
            completed_orders += 1

        total_sales += amount
        valid_orders_count += 1

        if created_at_str == today_str:
            today_sales += amount
            today_orders += 1

        if created_at_str in daily_sales_chart:
            daily_sales_chart[created_at_str] += amount

        pm = o.get("payment_method", "COD")
        payment_methods_map[pm] = payment_methods_map.get(pm, 0) + 1

        for itm in o.get("items", []):
            name = itm.get("name", "Unknown")
            qty = itm.get("quantity", 1)
            item_sales_map[name] = item_sales_map.get(name, 0) + qty

    avg_order_value = round(total_sales / valid_orders_count, 2) if valid_orders_count > 0 else 0.0

    # Best-selling & least-selling
    sorted_items = sorted(item_sales_map.items(), key=lambda x: x[1], reverse=True)
    best_sellers = [{"name": k, "units_sold": v} for k, v in sorted_items[:5]]
    least_sellers = [{"name": k, "units_sold": v} for k, v in sorted_items[-5:]] if len(sorted_items) > 5 else []

    chart_data = [{"date": k, "sales": round(v, 2)} for k, v in daily_sales_chart.items()]

    return {
        "today_sales": round(today_sales, 2),
        "today_orders": today_orders,
        "total_sales": round(total_sales, 2),
        "total_orders": len(orders),
        "average_order_value": avg_order_value,
        "pending_orders": pending_orders,
        "accepted_orders": accepted_orders,
        "preparing_orders": preparing_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": cancelled_orders,
        "best_selling_dishes": best_sellers,
        "least_selling_dishes": least_sellers,
        "payment_method_stats": payment_methods_map,
        "recent_sales_chart": chart_data
    }

@router.get("/export-csv")
async def export_orders_csv(admin: dict = Depends(get_current_admin)):
    db = get_database()
    cursor = db.orders.find({}).sort("created_at", -1)
    orders = await cursor.to_list(length=10000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Order ID", "Date", "Customer Name", "Phone", "Items Summary",
        "Subtotal", "Discount", "Tax", "Delivery Fee", "Total Amount",
        "Payment Method", "Payment Status", "Order Status"
    ])

    for o in orders:
        items_summary = "; ".join([f"{it.get('name')} x{it.get('quantity')}" for it in o.get("items", [])])
        writer.writerow([
            o.get("order_id"),
            o.get("created_at"),
            o.get("customer_name"),
            o.get("customer_phone"),
            items_summary,
            o.get("subtotal"),
            o.get("discount_amount"),
            o.get("tax_amount"),
            o.get("delivery_fee"),
            o.get("total_amount"),
            o.get("payment_method"),
            o.get("payment_status"),
            o.get("order_status")
        ])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=orders_export_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )
