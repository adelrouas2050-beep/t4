# Transfers Admin - PRD

## المشكلة الأصلية
بناء قاعدة بيانات شاملة للتطبيق بالكامل

## ما تم تنفيذه

### تاريخ التحديث: 2026-01-31

#### 1. نظام المستخدمين
- ✅ `registered_users` - المستخدمين المسجلين (userId, name, email, phone, password, userType)
- ✅ `users` - بيانات المستخدمين الإضافية
- ✅ `admins` - المديرين

#### 2. نظام الدردشة
- ✅ `conversations` - المحادثات (id, type, participants, lastMessage, createdAt)
- ✅ `messages` - الرسائل (id, conversationId, senderId, content, type, read)
- ✅ APIs: إنشاء محادثة، إرسال رسالة، جلب المحادثات والرسائل

#### 3. نظام النقل
- ✅ `drivers` - السائقين (id, name, phone, vehicle, plate, status, rating)
- ✅ `rides` - الرحلات (id, user, driver, from, to, status, fare)

#### 4. نظام الطلبات
- ✅ `restaurants` - المطاعم (id, name, category, rating, status)
- ✅ `orders` - الطلبات (id, user, restaurant, items, total, status)

#### 5. النظام الإداري
- ✅ `promotions` - العروض الترويجية
- ✅ الإحصائيات الشاملة

## البنية التقنية
- **Database**: MongoDB
- **Backend**: FastAPI
- **Frontend**: React.js
- **Authentication**: JWT

## Collections في MongoDB
1. registered_users - المستخدمين المسجلين
2. users - بيانات المستخدمين
3. admins - المديرين
4. conversations - المحادثات
5. messages - الرسائل
6. drivers - السائقين
7. rides - الرحلات
8. restaurants - المطاعم
9. orders - الطلبات
10. promotions - العروض

## APIs المتاحة
- `/api/auth/*` - التسجيل وتسجيل الدخول والبحث
- `/api/chat/*` - الدردشة والرسائل
- `/api/users/*` - إدارة المستخدمين
- `/api/drivers/*` - إدارة السائقين
- `/api/rides/*` - إدارة الرحلات
- `/api/orders/*` - إدارة الطلبات
- `/api/restaurants/*` - إدارة المطاعم
- `/api/promotions/*` - إدارة العروض
- `/api/stats/*` - الإحصائيات
- `/api/backup/*` - النسخ الاحتياطي
