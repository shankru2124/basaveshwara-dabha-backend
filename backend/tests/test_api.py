import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import db_manager
from app.seed_data import seed_initial_data

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await db_manager.connect()
    await seed_initial_data()
    yield

@pytest.mark.asyncio
async def test_health_and_root():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_menu_categories_and_items():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Categories
        cat_res = await ac.get("/api/menu/categories")
        assert cat_res.status_code == 200
        categories = cat_res.json()
        assert len(categories) > 0

        # Menu items
        menu_res = await ac.get("/api/menu/items")
        assert menu_res.status_code == 200
        items = menu_res.json()
        assert len(items) > 0
        # Check pure vegetarian
        for item in items:
            assert item["is_veg"] is True

@pytest.mark.asyncio
async def test_restaurant_admin_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/auth/restaurant-login", json={
            "email": "admin@basaveshwara.com",
            "password": "Admin@123"
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["user"]["role"] in ["admin", "restaurant_admin"]

@pytest.mark.asyncio
async def test_cart_calculation_and_order_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Get an available item
        menu_res = await ac.get("/api/menu/items?available_only=true")
        items = menu_res.json()
        assert len(items) > 0
        test_item = items[0]

        # 2. Calculate cart
        cart_res = await ac.post("/api/cart/calculate", json={
            "items": [{"item_id": test_item["id"], "quantity": 2}],
            "fulfillment_type": "DELIVERY",
            "coupon_code": "WELCOME50"
        })
        assert cart_res.status_code == 200
        cart_data = cart_res.json()
        assert cart_data["subtotal"] > 0
        assert cart_data["total_amount"] > 0

        # 3. Place order
        order_res = await ac.post("/api/orders", json={
            "customer_name": "Test Customer",
            "customer_phone": "9999988888",
            "customer_email": "test@example.com",
            "fulfillment_type": "DELIVERY",
            "delivery_address": {
                "address_line": "123 Test Street",
                "landmark": "Near Circle",
                "city": "Bengaluru"
            },
            "payment_method": "COD",
            "items": [{"item_id": test_item["id"], "quantity": 2}],
            "coupon_code": "WELCOME50"
        })
        assert order_res.status_code == 200
        order_data = order_res.json()["order"]
        order_id = order_data["order_id"]
        assert order_id.startswith("BD-")
        assert order_data["order_status"] == "PLACED"

        # 4. Admin updates order status to ACCEPTED
        login_res = await ac.post("/api/auth/restaurant-login", json={
            "email": "admin@basaveshwara.com",
            "password": "Admin@123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        status_res = await ac.put(f"/api/restaurant/orders/{order_id}/status", json={
            "status": "ACCEPTED",
            "prep_time_minutes": 25,
            "note": "Kitchen preparing fresh order"
        }, headers=headers)
        assert status_res.status_code == 200
        assert status_res.json()["order_status"] == "ACCEPTED"

        # 5. Track order as customer
        track_res = await ac.get(f"/api/orders/track/{order_id}")
        assert track_res.status_code == 200
        assert track_res.json()["order_status"] == "ACCEPTED"

@pytest.mark.asyncio
async def test_upi_order_placement_and_confirmation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        menu_res = await ac.get("/api/menu/items?available_only=true")
        test_item = menu_res.json()[0]

        # Login as admin to check restaurant orders
        login_res = await ac.post("/api/auth/restaurant-login", json={
            "email": "admin@basaveshwara.com",
            "password": "Admin@123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Place UPI order (Payment is PENDING)
        order_res = await ac.post("/api/orders", json={
            "customer_name": "UPI Customer",
            "customer_phone": "9876543210",
            "fulfillment_type": "DELIVERY",
            "delivery_address": {"address_line": "123 Main Road", "city": "Bengaluru"},
            "payment_method": "RAZORPAY_UPI",
            "items": [{"item_id": test_item["id"], "quantity": 2}]
        })
        assert order_res.status_code == 200
        data = order_res.json()
        assert "upi" in data
        assert data["upi"]["upi_id"] is not None
        assert "upi://pay" in data["upi"]["upi_intent_uri"]
        order_id = data["order"]["order_id"]

        # 2. Verify restaurant dashboard DOES NOT see the order before payment!
        rest_orders_before = await ac.get("/api/restaurant/orders", headers=headers)
        assert rest_orders_before.status_code == 200
        orders_before = rest_orders_before.json()["orders"]
        assert not any(o["order_id"] == order_id for o in orders_before)

        # 3. Confirm UPI payment with UTR number (Payment COMPLETED, order stays PLACED for review)
        confirm_res = await ac.post("/api/orders/confirm-upi", json={
            "order_id": order_id,
            "utr_number": "123456789012",
            "upi_app": "Google Pay"
        })
        assert confirm_res.status_code == 200
        conf_data = confirm_res.json()["order"]
        assert conf_data["payment_status"] == "COMPLETED"
        assert conf_data["order_status"] == "PLACED"
        assert conf_data["upi_utr_number"] == "123456789012"
        assert conf_data["upi_app"] == "Google Pay"

        # 4. Now restaurant dashboard receives and sees the paid order!
        rest_orders_after = await ac.get("/api/restaurant/orders", headers=headers)
        assert rest_orders_after.status_code == 200
        orders_after = rest_orders_after.json()["orders"]
        assert any(o["order_id"] == order_id for o in orders_after)

        # 5. Restaurant manager reviews and accepts the paid order
        accept_res = await ac.put(f"/api/restaurant/orders/{order_id}/status", json={
            "status": "ACCEPTED",
            "prep_time_minutes": 25,
            "note": "Payment verified. Chef started preparation."
        }, headers=headers)
        assert accept_res.status_code == 200
        assert accept_res.json()["order_status"] == "ACCEPTED"

@pytest.mark.asyncio
async def test_admin_credentials_and_staff_management():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login with current admin
        login_res = await ac.post("/api/auth/restaurant-login", json={
            "email": "admin@basaveshwara.com",
            "password": "Admin@123"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create new staff member
        create_res = await ac.post("/api/auth/admins", json={
            "name": "Kitchen Manager",
            "email": "kitchen@basaveshwara.com",
            "phone": "9876500001",
            "password": "Kitchen@123",
            "role": "staff"
        }, headers=headers)
        assert create_res.status_code == 200
        staff_data = create_res.json()
        staff_id = staff_data["id"]

        # 3. List admins
        list_res = await ac.get("/api/auth/admins", headers=headers)
        assert list_res.status_code == 200
        admins = list_res.json()
        assert any(a["email"] == "kitchen@basaveshwara.com" for a in admins)

        # 4. Login with newly created staff
        staff_login = await ac.post("/api/auth/restaurant-login", json={
            "email": "kitchen@basaveshwara.com",
            "password": "Kitchen@123"
        })
        assert staff_login.status_code == 200

        # 5. Delete staff member
        del_res = await ac.delete(f"/api/auth/admins/{staff_id}", headers=headers)
        assert del_res.status_code == 200

        # 6. Change credentials for admin
        change_res = await ac.put("/api/auth/change-credentials", json={
            "current_password": "Admin@123",
            "new_name": "Head Administrator",
            "new_email": "owner@basaveshwara.com",
            "new_password": "NewSecret@123"
        }, headers=headers)
        assert change_res.status_code == 200
        assert "access_token" in change_res.json()

        # 7. Verify login with new email and password
        new_login = await ac.post("/api/auth/restaurant-login", json={
            "email": "owner@basaveshwara.com",
            "password": "NewSecret@123"
        })
        assert new_login.status_code == 200

@pytest.mark.asyncio
async def test_image_upload_and_qr_handling():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        files = {"file": ("restaurant_qr.png", png_content, "image/png")}

        res = await ac.post("/api/upload", files=files)
        assert res.status_code == 200
        data = res.json()
        assert "url" in data
        assert data["url"].startswith("/uploads/")
        assert data["filename"].endswith(".png")
