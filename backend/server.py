from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Backup directory
BACKUP_DIR = ROOT_DIR / 'backups'
BACKUP_DIR.mkdir(exist_ok=True)

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'transfers-admin-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Auto backup settings
AUTO_BACKUP_INTERVAL_HOURS = 6
last_auto_backup = None

# Create the main app
app = FastAPI(title="Transfers Admin API")

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])
users_router = APIRouter(prefix="/api/users", tags=["Users"])
drivers_router = APIRouter(prefix="/api/drivers", tags=["Drivers"])
restaurants_router = APIRouter(prefix="/api/restaurants", tags=["Restaurants"])
rides_router = APIRouter(prefix="/api/rides", tags=["Rides"])
orders_router = APIRouter(prefix="/api/orders", tags=["Orders"])
promotions_router = APIRouter(prefix="/api/promotions", tags=["Promotions"])
stats_router = APIRouter(prefix="/api/stats", tags=["Statistics"])
backup_router = APIRouter(prefix="/api/backup", tags=["Backup"])

security = HTTPBearer()

# ============== MODELS ==============

class AdminLogin(BaseModel):
    email: str
    password: str

# ============== REGISTRATION MODELS ==============

class UserRegister(BaseModel):
    name: str
    email: str
    userId: str  # اسم المستخدم الفريد
    phone: Optional[str] = ""
    password: str
    userType: str = "rider"  # rider or driver

class RegisteredUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    userId: str  # اسم المستخدم كمعرف رئيسي
    name: str
    email: str
    phone: str = ""
    password: str  # مشفرة
    userType: str = "rider"
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class LoginRequest(BaseModel):
    email: str
    password: str
    userType: str = "rider"

class LoginResponse(BaseModel):
    success: bool
    user: Optional[dict] = None
    token: Optional[str] = None
    message: Optional[str] = None

class AdminResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    role: str
    token: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    status: str = "active"
    rides: int = 0
    orders: int = 0
    joined: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime('%Y-%m-%d'))
    avatar: str = ""
    username: Optional[str] = ""

class UserCreate(BaseModel):
    name: str
    email: str
    phone: str
    avatar: Optional[str] = ""

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    avatar: Optional[str] = None

class Driver(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    vehicle: str
    plate: str
    status: str = "offline"
    rating: float = 5.0
    rides: int = 0
    earnings: float = 0
    verified: bool = False
    avatar: str = ""

class DriverCreate(BaseModel):
    name: str
    phone: str
    vehicle: str
    plate: str
    avatar: Optional[str] = ""

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    vehicle: Optional[str] = None
    plate: Optional[str] = None
    status: Optional[str] = None
    verified: Optional[bool] = None

class Restaurant(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    rating: float = 5.0
    orders: int = 0
    status: str = "open"
    commission: float = 15
    image: str = ""

class RestaurantCreate(BaseModel):
    name: str
    category: str
    commission: float = 15
    image: Optional[str] = ""

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    commission: Optional[float] = None
    image: Optional[str] = None

class Ride(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"R{str(uuid.uuid4())[:6].upper()}")
    user: str
    driver: str
    from_location: str = Field(alias="from")
    to_location: str = Field(alias="to")
    status: str = "pending"
    fare: float = 0
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M'))
    duration: str = "-"

class RideCreate(BaseModel):
    user: str
    driver: str
    from_location: str
    to_location: str
    fare: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"O{str(uuid.uuid4())[:6].upper()}")
    user: str
    restaurant: str
    items: int
    total: float
    status: str = "preparing"
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M'))
    driver: str = "-"

class OrderCreate(BaseModel):
    user: str
    restaurant: str
    items: int
    total: float

class Promotion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"P{str(uuid.uuid4())[:6].upper()}")
    code: str
    discount: float
    type: str  # percentage or fixed
    maxUses: int
    used: int = 0
    status: str = "active"
    expires: str
    service: str  # all, rides, delivery

class PromotionCreate(BaseModel):
    code: str
    discount: float
    type: str
    maxUses: int
    expires: str
    service: str

class PromotionUpdate(BaseModel):
    code: Optional[str] = None
    discount: Optional[float] = None
    type: Optional[str] = None
    maxUses: Optional[int] = None
    status: Optional[str] = None
    expires: Optional[str] = None
    service: Optional[str] = None

class Stats(BaseModel):
    totalUsers: int
    totalDrivers: int
    totalRestaurants: int
    totalRides: int
    totalOrders: int
    totalRevenue: float
    activeDrivers: int
    pendingOrders: int
    todayRides: int
    todayOrders: int
    monthlyGrowth: float
    averageRating: float

class BackupInfo(BaseModel):
    id: str
    filename: str
    created_at: str
    size: int
    type: str  # manual or auto
    collections: List[str]

class BackupSettings(BaseModel):
    auto_backup_enabled: bool = True
    interval_hours: int = 6
    last_backup: Optional[str] = None
    next_backup: Optional[str] = None

# ============== HELPER FUNCTIONS ==============

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(admin_id: str, email: str) -> str:
    payload = {
        "sub": admin_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============== AUTH ROUTES ==============

@auth_router.post("/login", response_model=AdminResponse)
async def login(data: AdminLogin):
    admin = await db.admins.find_one({"email": data.email}, {"_id": 0})
    
    if not admin:
        # Create default admin if not exists
        if data.email == "admin@transfers.com" and data.password == "admin123":
            admin = {
                "id": str(uuid.uuid4()),
                "name": "مدير النظام",
                "email": "admin@transfers.com",
                "password": hash_password("admin123"),
                "role": "super_admin"
            }
            await db.admins.insert_one(admin)
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    else:
        if admin.get("password") != hash_password(data.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(admin["id"], admin["email"])
    
    return AdminResponse(
        id=admin["id"],
        name=admin["name"],
        email=admin["email"],
        role=admin["role"],
        token=token
    )

# ============== USER REGISTRATION & LOGIN ROUTES ==============

@auth_router.post("/register")
async def register_user(data: UserRegister):
    """تسجيل مستخدم جديد"""
    # التحقق من أن اسم المستخدم غير مستخدم
    existing_user_id = await db.registered_users.find_one({"userId": data.userId}, {"_id": 0})
    if existing_user_id:
        raise HTTPException(status_code=400, detail="اسم المستخدم موجود مسبقاً")
    
    # التحقق من أن البريد الإلكتروني غير مستخدم
    existing_email = await db.registered_users.find_one({"email": data.email.lower()}, {"_id": 0})
    if existing_email:
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    # إنشاء المستخدم الجديد
    new_user = {
        "userId": data.userId,
        "name": data.name,
        "email": data.email.lower(),
        "phone": data.phone or "",
        "password": hash_password(data.password),
        "userType": data.userType,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.registered_users.insert_one(new_user)
    
    # إنشاء التوكن
    token = create_token(data.userId, data.email)
    
    # إرجاع البيانات بدون كلمة المرور
    return {
        "success": True,
        "user": {
            "userId": data.userId,
            "name": data.name,
            "email": data.email.lower(),
            "phone": data.phone or "",
            "userType": data.userType
        },
        "token": token,
        "message": "تم التسجيل بنجاح"
    }

@auth_router.post("/user-login")
async def user_login(data: LoginRequest):
    """تسجيل دخول المستخدم"""
    # البحث عن المستخدم بالبريد الإلكتروني
    user = await db.registered_users.find_one({"email": data.email.lower()}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="البريد الإلكتروني غير مسجل")
    
    # التحقق من كلمة المرور
    if user.get("password") != hash_password(data.password):
        raise HTTPException(status_code=401, detail="كلمة المرور غير صحيحة")
    
    # إنشاء التوكن
    token = create_token(user["userId"], user["email"])
    
    return {
        "success": True,
        "user": {
            "userId": user["userId"],
            "name": user["name"],
            "email": user["email"],
            "phone": user.get("phone", ""),
            "userType": user.get("userType", "rider")
        },
        "token": token
    }

@auth_router.get("/check-user/{user_id}")
async def check_user_exists(user_id: str):
    """التحقق من وجود اسم المستخدم"""
    existing = await db.registered_users.find_one({"userId": user_id}, {"_id": 0})
    return {"exists": existing is not None}

@auth_router.get("/search-users")
async def search_users(q: str = ""):
    """البحث عن المستخدمين بالاسم أو اسم المستخدم أو البريد"""
    if not q or len(q) < 2:
        return {"users": []}
    
    # البحث في registered_users
    query = {
        "$or": [
            {"userId": {"$regex": q, "$options": "i"}},
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}}
        ]
    }
    
    users = await db.registered_users.find(query, {"_id": 0, "password": 0}).to_list(20)
    
    # تحويل الحقول للشكل المطلوب للدردشة
    result = []
    for user in users:
        result.append({
            "id": user.get("userId", ""),
            "userId": user.get("userId", ""),
            "name": user.get("name", ""),
            "nameEn": user.get("name", ""),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "photo": f"https://ui-avatars.com/api/?name={user.get('name', '')}&background=5288c1&color=fff",
            "status": "online",
            "userType": user.get("userType", "rider")
        })
    
    return {"users": result}

@auth_router.get("/user/{user_id}")
async def get_user_by_id(user_id: str):
    """جلب مستخدم بواسطة اسم المستخدم"""
    user = await db.registered_users.find_one({"userId": user_id}, {"_id": 0, "password": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    return {
        "id": user.get("userId", ""),
        "userId": user.get("userId", ""),
        "name": user.get("name", ""),
        "nameEn": user.get("name", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        "photo": f"https://ui-avatars.com/api/?name={user.get('name', '')}&background=5288c1&color=fff",
        "status": "online",
        "userType": user.get("userType", "rider")
    }

@auth_router.get("/me")
async def get_current_admin(payload: dict = Depends(verify_token)):
    admin = await db.admins.find_one({"email": payload["email"]}, {"_id": 0, "password": 0})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin

# ============== USERS ROUTES ==============

@users_router.get("", response_model=List[User])
async def get_users(payload: dict = Depends(verify_token)):
    # جلب المستخدمين من كلا الجدولين
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    
    # جلب المستخدمين المسجلين وتحويلهم للشكل المطلوب
    registered = await db.registered_users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    for reg_user in registered:
        # تحويل الحقول لتتوافق مع نموذج User
        user_data = {
            "id": reg_user.get("userId", ""),
            "name": reg_user.get("name", ""),
            "email": reg_user.get("email", ""),
            "phone": reg_user.get("phone", ""),
            "status": "active",
            "rides": 0,
            "orders": 0,
            "joined": reg_user.get("createdAt", "")[:10] if reg_user.get("createdAt") else "",
            "avatar": f"https://ui-avatars.com/api/?name={reg_user.get('name', '')}&background=6366f1&color=fff",
            "username": reg_user.get("userId", "")
        }
        # تجنب التكرار
        if not any(u.get("id") == user_data["id"] or u.get("email") == user_data["email"] for u in users):
            users.append(user_data)
    
    return users

@users_router.post("", response_model=User)
async def create_user(user: UserCreate, payload: dict = Depends(verify_token)):
    user_obj = User(**user.model_dump())
    await db.users.insert_one(user_obj.model_dump())
    return user_obj

@users_router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, update: UserUpdate, payload: dict = Depends(verify_token)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.users.find_one_and_update(
        {"id": user_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    
    result.pop("_id", None)
    return result

@users_router.delete("/{user_id}")
async def delete_user(user_id: str, payload: dict = Depends(verify_token)):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

# ============== DRIVERS ROUTES ==============

@drivers_router.get("", response_model=List[Driver])
async def get_drivers(payload: dict = Depends(verify_token)):
    drivers = await db.drivers.find({}, {"_id": 0}).to_list(1000)
    return drivers

@drivers_router.post("", response_model=Driver)
async def create_driver(driver: DriverCreate, payload: dict = Depends(verify_token)):
    driver_obj = Driver(**driver.model_dump())
    await db.drivers.insert_one(driver_obj.model_dump())
    return driver_obj

@drivers_router.put("/{driver_id}", response_model=Driver)
async def update_driver(driver_id: str, update: DriverUpdate, payload: dict = Depends(verify_token)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.drivers.find_one_and_update(
        {"id": driver_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    result.pop("_id", None)
    return result

@drivers_router.put("/{driver_id}/verify")
async def verify_driver(driver_id: str, payload: dict = Depends(verify_token)):
    result = await db.drivers.find_one_and_update(
        {"id": driver_id},
        {"$set": {"verified": True}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Driver not found")
    result.pop("_id", None)
    return result

@drivers_router.delete("/{driver_id}")
async def delete_driver(driver_id: str, payload: dict = Depends(verify_token)):
    result = await db.drivers.delete_one({"id": driver_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"message": "Driver deleted"}

# ============== RESTAURANTS ROUTES ==============

@restaurants_router.get("", response_model=List[Restaurant])
async def get_restaurants(payload: dict = Depends(verify_token)):
    restaurants = await db.restaurants.find({}, {"_id": 0}).to_list(1000)
    return restaurants

@restaurants_router.post("", response_model=Restaurant)
async def create_restaurant(restaurant: RestaurantCreate, payload: dict = Depends(verify_token)):
    restaurant_obj = Restaurant(**restaurant.model_dump())
    await db.restaurants.insert_one(restaurant_obj.model_dump())
    return restaurant_obj

@restaurants_router.put("/{restaurant_id}", response_model=Restaurant)
async def update_restaurant(restaurant_id: str, update: RestaurantUpdate, payload: dict = Depends(verify_token)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.restaurants.find_one_and_update(
        {"id": restaurant_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    result.pop("_id", None)
    return result

@restaurants_router.delete("/{restaurant_id}")
async def delete_restaurant(restaurant_id: str, payload: dict = Depends(verify_token)):
    result = await db.restaurants.delete_one({"id": restaurant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {"message": "Restaurant deleted"}

# ============== RIDES ROUTES ==============

@rides_router.get("")
async def get_rides(payload: dict = Depends(verify_token)):
    rides = await db.rides.find({}, {"_id": 0}).to_list(1000)
    # Convert field names for frontend
    for ride in rides:
        if "from_location" in ride:
            ride["from"] = ride.pop("from_location")
        if "to_location" in ride:
            ride["to"] = ride.pop("to_location")
    return rides

@rides_router.post("")
async def create_ride(ride: RideCreate, payload: dict = Depends(verify_token)):
    ride_obj = {
        "id": f"R{str(uuid.uuid4())[:6].upper()}",
        "user": ride.user,
        "driver": ride.driver,
        "from_location": ride.from_location,
        "to_location": ride.to_location,
        "status": "pending",
        "fare": ride.fare,
        "date": datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M'),
        "duration": "-"
    }
    await db.rides.insert_one(ride_obj)
    ride_obj.pop("_id", None)
    ride_obj["from"] = ride_obj.pop("from_location")
    ride_obj["to"] = ride_obj.pop("to_location")
    return ride_obj

@rides_router.put("/{ride_id}/status")
async def update_ride_status(ride_id: str, status: str, payload: dict = Depends(verify_token)):
    result = await db.rides.find_one_and_update(
        {"id": ride_id},
        {"$set": {"status": status}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Ride not found")
    result.pop("_id", None)
    return result

# ============== ORDERS ROUTES ==============

@orders_router.get("")
async def get_orders(payload: dict = Depends(verify_token)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    return orders

@orders_router.post("")
async def create_order(order: OrderCreate, payload: dict = Depends(verify_token)):
    order_obj = Order(**order.model_dump())
    await db.orders.insert_one(order_obj.model_dump())
    return order_obj

@orders_router.put("/{order_id}/status")
async def update_order_status(order_id: str, status: str, driver: Optional[str] = None, payload: dict = Depends(verify_token)):
    update_data = {"status": status}
    if driver:
        update_data["driver"] = driver
    
    result = await db.orders.find_one_and_update(
        {"id": order_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Order not found")
    result.pop("_id", None)
    return result

# ============== PROMOTIONS ROUTES ==============

@promotions_router.get("", response_model=List[Promotion])
async def get_promotions(payload: dict = Depends(verify_token)):
    promotions = await db.promotions.find({}, {"_id": 0}).to_list(1000)
    return promotions

@promotions_router.post("", response_model=Promotion)
async def create_promotion(promotion: PromotionCreate, payload: dict = Depends(verify_token)):
    # Check if code already exists
    existing = await db.promotions.find_one({"code": promotion.code})
    if existing:
        raise HTTPException(status_code=400, detail="Promotion code already exists")
    
    promotion_obj = Promotion(**promotion.model_dump())
    await db.promotions.insert_one(promotion_obj.model_dump())
    return promotion_obj

@promotions_router.put("/{promotion_id}", response_model=Promotion)
async def update_promotion(promotion_id: str, update: PromotionUpdate, payload: dict = Depends(verify_token)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.promotions.find_one_and_update(
        {"id": promotion_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    result.pop("_id", None)
    return result

@promotions_router.delete("/{promotion_id}")
async def delete_promotion(promotion_id: str, payload: dict = Depends(verify_token)):
    result = await db.promotions.delete_one({"id": promotion_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {"message": "Promotion deleted"}

# ============== STATS ROUTES ==============

@stats_router.get("", response_model=Stats)
async def get_stats(payload: dict = Depends(verify_token)):
    # Get counts from database
    total_users = await db.users.count_documents({})
    total_drivers = await db.drivers.count_documents({})
    total_restaurants = await db.restaurants.count_documents({})
    total_rides = await db.rides.count_documents({})
    total_orders = await db.orders.count_documents({})
    active_drivers = await db.drivers.count_documents({"status": "online"})
    pending_orders = await db.orders.count_documents({"status": {"$in": ["preparing", "on_way"]}})
    
    # Calculate revenue from completed orders
    completed_orders = await db.orders.find({"status": "delivered"}, {"_id": 0, "total": 1}).to_list(10000)
    total_revenue = sum(order.get("total", 0) for order in completed_orders)
    
    # Calculate average rating
    drivers = await db.drivers.find({}, {"_id": 0, "rating": 1}).to_list(1000)
    avg_rating = sum(d.get("rating", 0) for d in drivers) / max(len(drivers), 1)
    
    # Today's stats
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    today_rides = await db.rides.count_documents({"date": {"$regex": f"^{today}"}})
    today_orders = await db.orders.count_documents({"date": {"$regex": f"^{today}"}})
    
    return Stats(
        totalUsers=total_users,
        totalDrivers=total_drivers,
        totalRestaurants=total_restaurants,
        totalRides=total_rides,
        totalOrders=total_orders,
        totalRevenue=total_revenue,
        activeDrivers=active_drivers,
        pendingOrders=pending_orders,
        todayRides=today_rides,
        todayOrders=today_orders,
        monthlyGrowth=12.5,
        averageRating=round(avg_rating, 1)
    )

@stats_router.get("/weekly")
async def get_weekly_stats(payload: dict = Depends(verify_token)):
    # Return weekly chart data
    days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
    weekly = []
    for i, day in enumerate(days):
        rides_count = await db.rides.count_documents({}) // 7 + (i * 50)
        orders_count = await db.orders.count_documents({}) // 7 + (i * 30)
        weekly.append({"day": day, "rides": rides_count, "orders": orders_count})
    return weekly

@stats_router.get("/monthly")
async def get_monthly_stats(payload: dict = Depends(verify_token)):
    months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
    monthly = []
    for i, month in enumerate(months):
        revenue = 85000 + (i * 10000)
        monthly.append({"month": month, "revenue": revenue})
    return monthly

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_database():
    """Seed the database with initial data"""
    
    # Seed Users
    users_data = [
        {"id": "1", "name": "أحمد محمد", "email": "ahmed@example.com", "phone": "+966501234567", "status": "active", "rides": 45, "orders": 23, "joined": "2024-01-15", "avatar": "https://images.unsplash.com/photo-1576558656222-ba66febe3dec?w=100&h=100&fit=crop"},
        {"id": "2", "name": "سارة أحمد", "email": "sara@example.com", "phone": "+966502345678", "status": "active", "rides": 32, "orders": 56, "joined": "2024-02-20", "avatar": "https://images.unsplash.com/photo-1655249481446-25d575f1c054?w=100&h=100&fit=crop"},
        {"id": "3", "name": "محمد علي", "email": "mohamed@example.com", "phone": "+966503456789", "status": "inactive", "rides": 12, "orders": 8, "joined": "2024-03-10", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"},
        {"id": "4", "name": "فاطمة حسن", "email": "fatima@example.com", "phone": "+966504567890", "status": "active", "rides": 67, "orders": 89, "joined": "2023-12-05", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"},
        {"id": "5", "name": "خالد العمري", "email": "khaled@example.com", "phone": "+966505678901", "status": "blocked", "rides": 5, "orders": 2, "joined": "2024-04-01", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"},
    ]
    
    # Seed Drivers
    drivers_data = [
        {"id": "1", "name": "عبدالله السعيد", "phone": "+966511234567", "vehicle": "Toyota Camry 2023", "plate": "أ ب ج 1234", "status": "online", "rating": 4.8, "rides": 234, "earnings": 15600, "verified": True, "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"},
        {"id": "2", "name": "يوسف الحربي", "phone": "+966512345678", "vehicle": "Hyundai Sonata 2022", "plate": "د هـ و 5678", "status": "busy", "rating": 4.6, "rides": 178, "earnings": 12300, "verified": True, "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"},
        {"id": "3", "name": "فهد المالكي", "phone": "+966513456789", "vehicle": "Kia K5 2024", "plate": "ز ح ط 9012", "status": "offline", "rating": 4.9, "rides": 456, "earnings": 28900, "verified": True, "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"},
        {"id": "4", "name": "سعد القحطاني", "phone": "+966514567890", "vehicle": "Nissan Altima 2023", "plate": "ي ك ل 3456", "status": "online", "rating": 4.4, "rides": 89, "earnings": 6200, "verified": False, "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop"},
        {"id": "5", "name": "ماجد الغامدي", "phone": "+966515678901", "vehicle": "Honda Accord 2022", "plate": "م ن س 7890", "status": "online", "rating": 4.7, "rides": 312, "earnings": 21400, "verified": True, "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"},
    ]
    
    # Seed Restaurants
    restaurants_data = [
        {"id": "1", "name": "مطعم البيت", "category": "عربي", "rating": 4.7, "orders": 1234, "status": "open", "commission": 15, "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=150&fit=crop"},
        {"id": "2", "name": "برجر كينج", "category": "وجبات سريعة", "rating": 4.3, "orders": 2567, "status": "open", "commission": 18, "image": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=150&fit=crop"},
        {"id": "3", "name": "بيتزا هت", "category": "إيطالي", "rating": 4.5, "orders": 1890, "status": "closed", "commission": 16, "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=150&fit=crop"},
        {"id": "4", "name": "سوشي تايم", "category": "ياباني", "rating": 4.8, "orders": 876, "status": "open", "commission": 20, "image": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&h=150&fit=crop"},
        {"id": "5", "name": "شاورما الريف", "category": "عربي", "rating": 4.6, "orders": 3421, "status": "open", "commission": 12, "image": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200&h=150&fit=crop"},
    ]
    
    # Seed Rides
    rides_data = [
        {"id": "R001", "user": "أحمد محمد", "driver": "عبدالله السعيد", "from_location": "حي الملز، الرياض", "to_location": "مطار الملك خالد", "status": "completed", "fare": 85, "date": "2024-12-15 14:30", "duration": "35 دقيقة"},
        {"id": "R002", "user": "سارة أحمد", "driver": "يوسف الحربي", "from_location": "حي السليمانية", "to_location": "جامعة الملك سعود", "status": "in_progress", "fare": 45, "date": "2024-12-15 15:00", "duration": "20 دقيقة"},
        {"id": "R003", "user": "فاطمة حسن", "driver": "فهد المالكي", "from_location": "حي النرجس", "to_location": "مول الرياض جاليري", "status": "pending", "fare": 55, "date": "2024-12-15 15:15", "duration": "25 دقيقة"},
        {"id": "R004", "user": "محمد علي", "driver": "سعد القحطاني", "from_location": "حي الياسمين", "to_location": "مستشفى الملك فيصل", "status": "cancelled", "fare": 0, "date": "2024-12-15 13:45", "duration": "-"},
        {"id": "R005", "user": "خالد العمري", "driver": "ماجد الغامدي", "from_location": "حي الورود", "to_location": "حي العليا", "status": "completed", "fare": 35, "date": "2024-12-15 12:00", "duration": "15 دقيقة"},
    ]
    
    # Seed Orders
    orders_data = [
        {"id": "O001", "user": "أحمد محمد", "restaurant": "مطعم البيت", "items": 3, "total": 125, "status": "delivered", "date": "2024-12-15 13:00", "driver": "عبدالله السعيد"},
        {"id": "O002", "user": "سارة أحمد", "restaurant": "برجر كينج", "items": 5, "total": 89, "status": "preparing", "date": "2024-12-15 14:30", "driver": "-"},
        {"id": "O003", "user": "فاطمة حسن", "restaurant": "سوشي تايم", "items": 2, "total": 210, "status": "on_way", "date": "2024-12-15 14:45", "driver": "يوسف الحربي"},
        {"id": "O004", "user": "محمد علي", "restaurant": "شاورما الريف", "items": 4, "total": 65, "status": "cancelled", "date": "2024-12-15 12:15", "driver": "-"},
        {"id": "O005", "user": "خالد العمري", "restaurant": "بيتزا هت", "items": 1, "total": 75, "status": "delivered", "date": "2024-12-15 11:30", "driver": "فهد المالكي"},
    ]
    
    # Seed Promotions
    promotions_data = [
        {"id": "P001", "code": "WELCOME50", "discount": 50, "type": "percentage", "maxUses": 1000, "used": 456, "status": "active", "expires": "2025-01-31", "service": "all"},
        {"id": "P002", "code": "RIDE25", "discount": 25, "type": "fixed", "maxUses": 500, "used": 123, "status": "active", "expires": "2025-02-15", "service": "rides"},
        {"id": "P003", "code": "FOOD15", "discount": 15, "type": "percentage", "maxUses": 2000, "used": 1876, "status": "active", "expires": "2025-01-15", "service": "delivery"},
        {"id": "P004", "code": "VIP100", "discount": 100, "type": "fixed", "maxUses": 50, "used": 50, "status": "expired", "expires": "2024-12-01", "service": "all"},
    ]
    
    # Clear existing data
    await db.users.delete_many({})
    await db.drivers.delete_many({})
    await db.restaurants.delete_many({})
    await db.rides.delete_many({})
    await db.orders.delete_many({})
    await db.promotions.delete_many({})
    
    # Insert new data
    await db.users.insert_many(users_data)
    await db.drivers.insert_many(drivers_data)
    await db.restaurants.insert_many(restaurants_data)
    await db.rides.insert_many(rides_data)
    await db.orders.insert_many(orders_data)
    await db.promotions.insert_many(promotions_data)
    
    return {"message": "Database seeded successfully"}

@api_router.get("/")
async def root():
    return {"message": "Transfers Admin API", "version": "1.0.0"}

# ============== BACKUP ROUTES ==============

async def perform_backup(backup_type: str = "manual") -> BackupInfo:
    """Perform database backup"""
    global last_auto_backup
    
    timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
    filename = f"backup_{backup_type}_{timestamp}.json"
    filepath = BACKUP_DIR / filename
    
    # Collections to backup
    collections = ['users', 'drivers', 'restaurants', 'rides', 'orders', 'promotions', 'admins']
    
    backup_data = {
        'metadata': {
            'created_at': datetime.now(timezone.utc).isoformat(),
            'type': backup_type,
            'version': '1.0'
        },
        'data': {}
    }
    
    for collection_name in collections:
        collection = db[collection_name]
        documents = await collection.find({}, {"_id": 0}).to_list(100000)
        backup_data['data'][collection_name] = documents
    
    # Save to file
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(backup_data, f, ensure_ascii=False, indent=2, default=str)
    
    file_size = filepath.stat().st_size
    
    # Update last backup time
    last_auto_backup = datetime.now(timezone.utc)
    
    # Save backup info to database
    backup_info = {
        'id': f"BK{timestamp}",
        'filename': filename,
        'created_at': datetime.now(timezone.utc).isoformat(),
        'size': file_size,
        'type': backup_type,
        'collections': collections
    }
    await db.backups.insert_one(backup_info)
    
    return BackupInfo(**backup_info)

@backup_router.post("/create", response_model=BackupInfo)
async def create_backup(payload: dict = Depends(verify_token)):
    """Create manual backup"""
    try:
        backup = await perform_backup("manual")
        return backup
    except Exception as e:
        logger.error(f"Backup failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")

@backup_router.get("/list", response_model=List[BackupInfo])
async def list_backups(payload: dict = Depends(verify_token)):
    """List all backups"""
    backups = await db.backups.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return backups

@backup_router.get("/settings", response_model=BackupSettings)
async def get_backup_settings(payload: dict = Depends(verify_token)):
    """Get backup settings"""
    settings = await db.settings.find_one({"type": "backup"}, {"_id": 0})
    if not settings:
        settings = {
            "type": "backup",
            "auto_backup_enabled": True,
            "interval_hours": AUTO_BACKUP_INTERVAL_HOURS
        }
        await db.settings.insert_one(settings)
    
    # Calculate next backup time
    if last_auto_backup:
        next_backup = last_auto_backup + timedelta(hours=settings.get("interval_hours", 6))
        settings["last_backup"] = last_auto_backup.isoformat()
        settings["next_backup"] = next_backup.isoformat()
    
    return BackupSettings(
        auto_backup_enabled=settings.get("auto_backup_enabled", True),
        interval_hours=settings.get("interval_hours", 6),
        last_backup=settings.get("last_backup"),
        next_backup=settings.get("next_backup")
    )

@backup_router.put("/settings")
async def update_backup_settings(
    auto_backup_enabled: bool = True,
    interval_hours: int = 6,
    payload: dict = Depends(verify_token)
):
    """Update backup settings"""
    await db.settings.update_one(
        {"type": "backup"},
        {"$set": {
            "auto_backup_enabled": auto_backup_enabled,
            "interval_hours": interval_hours
        }},
        upsert=True
    )
    return {"message": "Settings updated", "auto_backup_enabled": auto_backup_enabled, "interval_hours": interval_hours}

@backup_router.delete("/{backup_id}")
async def delete_backup(backup_id: str, payload: dict = Depends(verify_token)):
    """Delete a backup"""
    backup = await db.backups.find_one({"id": backup_id}, {"_id": 0})
    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")
    
    # Delete file
    filepath = BACKUP_DIR / backup["filename"]
    if filepath.exists():
        filepath.unlink()
    
    # Delete from database
    await db.backups.delete_one({"id": backup_id})
    return {"message": "Backup deleted"}

@backup_router.post("/restore/{backup_id}")
async def restore_backup(backup_id: str, payload: dict = Depends(verify_token)):
    """Restore database from backup"""
    backup = await db.backups.find_one({"id": backup_id}, {"_id": 0})
    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")
    
    filepath = BACKUP_DIR / backup["filename"]
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Backup file not found")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            backup_data = json.load(f)
        
        # Restore each collection
        for collection_name, documents in backup_data['data'].items():
            if documents:
                collection = db[collection_name]
                await collection.delete_many({})
                await collection.insert_many(documents)
        
        return {"message": "Database restored successfully", "collections": list(backup_data['data'].keys())}
    except Exception as e:
        logger.error(f"Restore failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")

# Background task for auto backup
async def auto_backup_task():
    """Background task for automatic backups"""
    global last_auto_backup
    while True:
        try:
            settings = await db.settings.find_one({"type": "backup"})
            if settings and settings.get("auto_backup_enabled", True):
                interval = settings.get("interval_hours", AUTO_BACKUP_INTERVAL_HOURS)
                
                if last_auto_backup is None or \
                   datetime.now(timezone.utc) - last_auto_backup >= timedelta(hours=interval):
                    logger.info("Starting automatic backup...")
                    await perform_backup("auto")
                    logger.info("Automatic backup completed")
            
            # Check every 5 minutes
            await asyncio.sleep(300)
        except Exception as e:
            logger.error(f"Auto backup error: {str(e)}")
            await asyncio.sleep(60)

# Include all routers
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(drivers_router)
app.include_router(restaurants_router)
app.include_router(rides_router)
app.include_router(orders_router)
app.include_router(promotions_router)
app.include_router(stats_router)
app.include_router(backup_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Start background tasks on startup"""
    asyncio.create_task(auto_backup_task())
    logger.info("Auto backup task started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
