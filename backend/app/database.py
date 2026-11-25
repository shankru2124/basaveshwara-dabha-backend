import os
import json
import asyncio
import logging
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
import mongomock_motor
from app.config import settings

logger = logging.getLogger("basaveshwara.db")

class DatabaseManager:
    client = None
    db = None
    is_mock: bool = False
    store_file = settings.DATABASE_DIR / "local_store.json"

    @classmethod
    async def connect(cls):
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
            real_client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1500)
            # Try a quick ping
            await real_client.admin.command("ping")
            cls.client = real_client
            cls.db = cls.client[settings.DATABASE_NAME]
            cls.is_mock = False
            logger.info("Successfully connected to live MongoDB instance.")
        except Exception as e:
            logger.warning(f"Live MongoDB not reachable ({e}). Falling back to persistent Motor-compatible local DB.")
            cls.client = mongomock_motor.AsyncMongoMockClient()
            cls.db = cls.client[settings.DATABASE_NAME]
            cls.is_mock = True
            await cls._load_from_disk()

        # Create indexes
        await cls.create_indexes()

    @classmethod
    async def close(cls):
        if cls.is_mock:
            await cls.save_to_disk()
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed.")

    @classmethod
    async def create_indexes(cls):
        try:
            # users
            await cls.db.users.create_index("email", unique=True)
            await cls.db.users.create_index("phone")
            # orders
            await cls.db.orders.create_index("order_id", unique=True)
            await cls.db.orders.create_index("customer_id")
            await cls.db.orders.create_index("created_at")
            # menu_items
            await cls.db.menu_items.create_index("category")
            await cls.db.menu_items.create_index("is_available")
            # coupons
            await cls.db.coupons.create_index("code", unique=True)
            # tables
            await cls.db.tables.create_index("table_number", unique=True)
        except Exception as err:
            logger.warning(f"Index creation notice: {err}")

    @classmethod
    async def save_to_disk(cls):
        if not cls.is_mock:
            return
        try:
            data = {}
            collections = [
                "users", "restaurants", "categories", "menu_items", "orders",
                "payments", "coupons", "addresses", "notifications",
                "restaurant_settings", "tables", "service_requests"
            ]
            for col_name in collections:
                cursor = cls.db[col_name].find({})
                docs = await cursor.to_list(length=10000)
                serialized = []
                for doc in docs:
                    d = dict(doc)
                    if "_id" in d:
                        d["_id"] = str(d["_id"])
                    serialized.append(d)
                data[col_name] = serialized

            with open(cls.store_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, default=str)
            logger.info("Saved local database store to disk.")
        except Exception as e:
            logger.error(f"Error saving database to disk: {e}")

    @classmethod
    async def _load_from_disk(cls):
        if not cls.store_file.exists():
            return
        try:
            with open(cls.store_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            for col_name, docs in data.items():
                if docs:
                    for doc in docs:
                        if "_id" in doc:
                            try:
                                doc["_id"] = ObjectId(doc["_id"])
                            except Exception:
                                pass
                    await cls.db[col_name].insert_many(docs)
            logger.info(f"Loaded existing collections from disk store ({len(data)} collections).")
        except Exception as e:
            logger.error(f"Error loading database from disk: {e}")

db_manager = DatabaseManager

def get_database():
    return db_manager.db
