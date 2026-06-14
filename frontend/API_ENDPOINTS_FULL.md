# 📡 All API Endpoints — Full Reference
> **Base URL:** `http://localhost:8080`  
> **Auth Header:** `Authorization: Bearer <token>` (obtained from `/api/users/login`)

---

## 🔐 Auth — `/api/users`

---

### 1. Register User
**`POST /api/users/register`**

```json
// Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "ADMIN | CASHIER | WAITER"
}
```
```json
// Response Body
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CASHIER"
}
```

---

### 2. Login
**`POST /api/users/login`**

```json
// Request Body
{
  "email": "john@example.com",
  "password": "password123"
}
```
```json
// Response Body
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "CASHIER"
}
```

---

### 3. Get All Users
**`GET /api/users`**

```
// No Request Body
```
```json
// Response Body (Array)
[
  {
    "id": 1,
    "name": "Aditi Sharma",
    "email": "aditi@cafe.com",
    "role": "ADMIN",
    "isArchived": false
  },
  {
    "id": 2,
    "name": "Rohan Mehta",
    "email": "rohan@cafe.com",
    "role": "EMPLOYEE",
    "isArchived": false
  }
]
```

---

### 4. Get All Users (Alias)
**`GET /api/users/all`**

```
// No Request Body
// Response: same Array format as GET /api/users
```

---

### 5. Get User by ID
**`GET /api/users/{id}`**

```
// No Request Body
// Path Variable: id (Long)
```
```json
// Response Body
{
  "id": 2,
  "name": "Rohan Mehta",
  "email": "rohan@cafe.com",
  "role": "EMPLOYEE",
  "isArchived": false
}
```

---

### 6. Update User (Name and Role)
**`PUT /api/users/{id}`**

```json
// Request Body — email is NOT sent, it cannot be changed
{
  "name": "Rohan Mehta Updated",
  "role": "ADMIN"
}
```
```json
// Response Body
{
  "id": 2,
  "name": "Rohan Mehta Updated",
  "email": "rohan@cafe.com",
  "role": "ADMIN",
  "isArchived": false
}
```

---

### 7. Delete User
**`DELETE /api/users/{id}`**

```
// No Request Body
// Path Variable: id (Long)
// Response: 200 OK (empty body)
```

---

### 8. Archive / Unarchive User
**`PATCH /api/users/{id}/archive`**

```
// No Request Body — server-side toggles isArchived flag
// Path Variable: id (Long)
```
```json
// Response Body — updated user with flipped isArchived
{
  "id": 3,
  "name": "Kabir Singh",
  "email": "kabir@cafe.com",
  "role": "EMPLOYEE",
  "isArchived": true
}
```

---

### 9. Change Password
**`PATCH /api/users/{id}/password`**

```json
// Request Body
{
  "newPassword": "newSecurePass123"
}
```
```json
// Response Body
{
  "message": "Password updated successfully"
}
```

---


---

### 3. Get All Categories
**`GET /api/categories`**

```
// No Request Body
// Query Params: none
```
```json
// Response Body (Array)
[
  {
    "id": 1,
    "name": "Beverages",
    "colorHex": "#FF5733"
  }
]
```

---

### 4. Get Category by ID
**`GET /api/categories/{id}`**

```
// No Request Body
// Path Variable: id (Long)
```
```json
// Response Body
{
  "id": 1,
  "name": "Beverages",
  "colorHex": "#FF5733"
}
```

---

### 5. Create Category
**`POST /api/categories`**

```json
// Request Body
{
  "name": "Beverages",
  "colorHex": "#FF5733"
}
```
```json
// Response Body
{
  "id": 1,
  "name": "Beverages",
  "colorHex": "#FF5733"
}
```

---

### 6. Update Category
**`PUT /api/categories/{id}`**

```json
// Request Body
{
  "name": "Hot Drinks",
  "colorHex": "#C0392B"
}
```
```json
// Response Body
{
  "id": 1,
  "name": "Hot Drinks",
  "colorHex": "#C0392B"
}
```

---

### 7. Delete Category
**`DELETE /api/categories/{id}`**

```
// No Request Body
// Response: 204 No Content
```

---

## 🛍️ Products — `/api/products`

---

### 8. Get All Products
**`GET /api/products`**

```
// No Request Body
// Query Params:
//   categoryId (optional) — filter by category
//   search     (optional) — search by name
```
```json
// Response Body (Array)
[
  {
    "id": 1,
    "name": "Cappuccino",
    "categoryId": 1,
    "categoryName": "Beverages",
    "categoryColorHex": "#FF5733",
    "price": 150.0,
    "uom": "Cup",
    "tax": 5.0,
    "description": "Rich espresso with steamed milk",
    "showOnKDS": true,
    "imagePath": "/images/cappuccino.jpg",
    "isActive": true
  }
]
```

---

### 9. Get Product by ID
**`GET /api/products/{id}`**

```
// No Request Body
// Path Variable: id (Long)
```
```json
// Response Body
{
  "id": 1,
  "name": "Cappuccino",
  "categoryId": 1,
  "categoryName": "Beverages",
  "categoryColorHex": "#FF5733",
  "price": 150.0,
  "uom": "Cup",
  "tax": 5.0,
  "description": "Rich espresso with steamed milk",
  "showOnKDS": true,
  "imagePath": "/images/cappuccino.jpg",
  "isActive": true
}
```

---

### 10. Create Product
**`POST /api/products`**

```json
// Request Body
{
  "name": "Cappuccino",
  "categoryId": 1,
  "price": 150.0,
  "uom": "Cup",
  "tax": 5.0,
  "description": "Rich espresso with steamed milk",
  "showOnKDS": true,
  "imagePath": "/images/cappuccino.jpg",
  "isActive": true
}
```
```json
// Response Body
{
  "id": 1,
  "name": "Cappuccino",
  "categoryId": 1,
  "categoryName": "Beverages",
  "categoryColorHex": "#FF5733",
  "price": 150.0,
  "uom": "Cup",
  "tax": 5.0,
  "description": "Rich espresso with steamed milk",
  "showOnKDS": true,
  "imagePath": "/images/cappuccino.jpg",
  "isActive": true
}
```

---

### 11. Update Product
**`PUT /api/products/{id}`**

```json
// Request Body
{
  "name": "Cappuccino Large",
  "categoryId": 1,
  "price": 180.0,
  "uom": "Cup",
  "tax": 5.0,
  "description": "Large cappuccino",
  "showOnKDS": true,
  "imagePath": "/images/cappuccino_lg.jpg",
  "isActive": true
}
```
```json
// Response Body
{
  "id": 1,
  "name": "Cappuccino Large",
  "categoryId": 1,
  "categoryName": "Beverages",
  "categoryColorHex": "#FF5733",
  "price": 180.0,
  "uom": "Cup",
  "tax": 5.0,
  "description": "Large cappuccino",
  "showOnKDS": true,
  "imagePath": "/images/cappuccino_lg.jpg",
  "isActive": true
}
```

---

### 12. Delete Product
**`DELETE /api/products/{id}`**

```
// No Request Body
// Response: 204 No Content
```

---

## 🏢 Floors — `/api/floors`

---

### 13. Get All Floors
**`GET /api/floors`**

```
// No Request Body
```
```json
// Response Body (Array)
[
  {
    "id": 1,
    "name": "Ground Floor"
  }
]
```

---

### 14. Get Floor by ID
**`GET /api/floors/{id}`**

```
// No Request Body
// Path Variable: id (Long)
```
```json
// Response Body
{
  "id": 1,
  "name": "Ground Floor"
}
```

---

### 15. Create Floor
**`POST /api/floors`**

```json
// Request Body
{
  "name": "Ground Floor"
}
```
```json
// Response Body
{
  "id": 1,
  "name": "Ground Floor"
}
```

---

### 16. Update Floor
**`PUT /api/floors/{id}`**

```json
// Request Body
{
  "name": "First Floor"
}
```
```json
// Response Body
{
  "id": 1,
  "name": "First Floor"
}
```

---

### 17. Delete Floor
**`DELETE /api/floors/{id}`**

```
// No Request Body
// Response: 204 No Content
```

---

## 🪑 Tables — `/api/tables`

---

### 18. Get All Tables
**`GET /api/tables`**

```
// No Request Body
// Query Params:
//   floorId (optional) — filter by floor
```
```json
// Response Body (Array)
[
  {
    "id": 1,
    "tableNumber": "T1",
    "seats": 4,
    "isActive": true,
    "hasActiveOrder": false,
    "floorId": 1,
    "floorName": "Ground Floor"
  }
]
```

---

### 19. Get Table by ID
**`GET /api/tables/{id}`**

```
// No Request Body
// Path Variable: id (Long)
```
```json
// Response Body
{
  "id": 1,
  "tableNumber": "T1",
  "seats": 4,
  "isActive": true,
  "hasActiveOrder": false,
  "floorId": 1,
  "floorName": "Ground Floor"
}
```

---

### 20. Create Table
**`POST /api/tables`**

```json
// Request Body
{
  "tableNumber": "T1",
  "seats": 4,
  "floorId": 1,
  "isActive": true,
  "hasActiveOrder": false
}
```
```json
// Response Body
{
  "id": 1,
  "tableNumber": "T1",
  "seats": 4,
  "isActive": true,
  "hasActiveOrder": false,
  "floorId": 1,
  "floorName": "Ground Floor"
}
```

---

### 21. Update Table
**`PUT /api/tables/{id}`**

```json
// Request Body
{
  "tableNumber": "T1",
  "seats": 6,
  "floorId": 1,
  "isActive": true,
  "hasActiveOrder": false
}
```
```json
// Response Body
{
  "id": 1,
  "tableNumber": "T1",
  "seats": 6,
  "isActive": true,
  "hasActiveOrder": false,
  "floorId": 1,
  "floorName": "Ground Floor"
}
```

---

### 22. Delete Table
**`DELETE /api/tables/{id}`**

```
// No Request Body
// Response: 204 No Content
```

---

## 🧾 Orders — `/api/orders`

---

### 23. Create Order
**`POST /api/orders`**

```json
// Request Body
{
  "tableId": 1,
  "sessionId": 1,
  "customerId": null,
  "couponCode": null,
  "discount": 0.00,
  "lines": [
    {
      "productId": 1,
      "qty": 2,
      "unitPrice": 150.00,
      "lineDiscount": 0.00
    }
  ]
}
```
```json
// Response Body
{
  "id": 101,
  "sessionId": 1,
  "tableId": 1,
  "tableNumber": "T1",
  "customerId": null,
  "customerName": null,
  "status": "OPEN",
  "subtotal": 300.00,
  "tax": 15.00,
  "discount": 0.00,
  "total": 315.00,
  "couponCode": null,
  "paymentMethod": null,
  "lines": [
    {
      "id": 1,
      "orderId": 101,
      "productId": 1,
      "productName": "Cappuccino",
      "categoryColorHex": "#FF5733",
      "qty": 2,
      "unitPrice": 150.00,
      "lineTotal": 300.00,
      "lineDiscount": 0.00,
      "status": "PENDING"
    }
  ]
}
```

---

### 24. Get All Orders
**`GET /api/orders`**

```
// No Request Body
// Query Params:
//   sessionId (optional) — filter by session
//   search    (optional) — search keyword
```
```json
// Response Body (Array of OrderResponse — same structure as above)
[ { ... }, { ... } ]
```

---

### 25. Get Order by ID
**`GET /api/orders/{id}`**

```
// No Request Body
// Path Variable: id (Long)
```
```json
// Response Body (same as Create Order response)
{
  "id": 101,
  "sessionId": 1,
  "tableId": 1,
  "tableNumber": "T1",
  "status": "OPEN",
  "subtotal": 300.00,
  "tax": 15.00,
  "discount": 0.00,
  "total": 315.00,
  "couponCode": null,
  "paymentMethod": null,
  "lines": [ { ... } ]
}
```

---

### 26. Add or Update Order Line
**`PUT /api/orders/{id}/lines`**

```json
// Request Body
{
  "productId": 2,
  "qty": 1,
  "lineDiscount": 0.00
}
```
```json
// Response Body (updated OrderResponse)
{
  "id": 101,
  "status": "OPEN",
  "subtotal": 450.00,
  "tax": 22.50,
  "total": 472.50,
  "lines": [ { ... }, { ... } ]
}
```

---

### 27. Remove Order Line
**`DELETE /api/orders/{id}/lines/{lineId}`**

```
// No Request Body
// Path Variables: id (order ID), lineId (line ID)
```
```json
// Response Body (updated OrderResponse with line removed)
{
  "id": 101,
  "status": "OPEN",
  "subtotal": 300.00,
  "lines": [ { ... } ]
}
```

---

### 28. Apply Coupon to Order
**`POST /api/orders/{id}/coupon`**

```json
// Request Body
{
  "code": "WELCOME10"
}
```
```json
// Response Body (updated OrderResponse with discount applied)
{
  "id": 101,
  "couponCode": "WELCOME10",
  "discount": 30.00,
  "total": 285.00,
  "lines": [ { ... } ]
}
```

---

### 29. Mark Order as Paid
**`POST /api/orders/{id}/pay`**

```json
// Request Body
{
  "paymentMethod": "CASH | CARD | UPI",
  "receivedAmount": 500.00
}
```
```json
// Response Body (updated OrderResponse)
{
  "id": 101,
  "status": "PAID",
  "paymentMethod": "CASH",
  "total": 315.00
}
```

---

### 30. Cancel Order
**`POST /api/orders/{id}/cancel`**

```
// No Request Body
```
```json
// Response Body (updated OrderResponse)
{
  "id": 101,
  "status": "CANCELLED"
}
```

---

## 🏷️ Admin Promotions — `/api/admin/promotions`

---

### 31. Get All Promotions
**`GET /api/admin/promotions`**

```
// No Request Body
```
```json
// Response Body (Array)
[
  {
    "id": 1,
    "name": "Welcome Discount",
    "code": "WELCOME10",
    "type": "ORDER",
    "applicableProductId": null,
    "productName": null,
    "minQty": null,
    "discountType": "PERCENT",
    "discountValue": 10.00,
    "minOrderAmount": 100.00,
    "startDate": "2025-01-01T00:00:00",
    "endDate": "2025-12-31T23:59:59",
    "isActive": true
  }
]
```

---

### 32. Create Promotion / Coupon
**`POST /api/admin/promotions`**

```json
// Request Body
{
  "name": "Weekend Special",
  "code": "WKND20",
  "type": "ORDER | PRODUCT",
  "applicableProductId": null,
  "minQty": null,
  "discountType": "PERCENT | FLAT",
  "discountValue": 20.00,
  "minOrderAmount": 200.00,
  "startDate": "2025-06-01T00:00:00",
  "endDate": "2025-06-30T23:59:59"
}
```
```json
// Response Body
{
  "id": 2,
  "name": "Weekend Special",
  "code": "WKND20",
  "type": "ORDER",
  "discountType": "PERCENT",
  "discountValue": 20.00,
  "minOrderAmount": 200.00,
  "startDate": "2025-06-01T00:00:00",
  "endDate": "2025-06-30T23:59:59",
  "isActive": true
}
```

---

### 33. Delete Promotion
**`DELETE /api/admin/promotions/{id}`**

```
// No Request Body
// Response: 200 OK (empty body)
```

---

### 34. Seed Default Coupon (WELCOME10)
**`POST /api/admin/promotions/seed-coupon`**

```
// No Request Body
```
```json
// Response Body (plain string)
"Coupon WELCOME10 created successfully! (10% off on orders above 100)"
// OR if already exists:
"Coupon WELCOME10 already exists!"
```

---

## 👷 Employee Sessions — `/api/sessions`

---

### 35. Open Session
**`POST /api/sessions/open`**

```
// No Request Body
```
```json
// Response Body
{
  "id": 1,
  "employeeId": 5,
  "employeeName": "John Doe",
  "openTime": "2025-06-13T09:00:00",
  "closeTime": null,
  "closingAmount": null,
  "status": "OPEN"
}
```

---

### 36. Close Session
**`POST /api/sessions/close`**

```json
// Request Body (optional — send null or omit body to skip manual amount)
{
  "closingAmount": 5000.00
}
```
```json
// Response Body
{
  "id": 1,
  "employeeId": 5,
  "employeeName": "John Doe",
  "openTime": "2025-06-13T09:00:00",
  "closeTime": "2025-06-13T18:00:00",
  "closingAmount": 5000.00,
  "status": "CLOSED"
}
```

---

### 37. Get Current Active Session
**`GET /api/sessions/current`**

```
// No Request Body
```
```json
// Response Body
{
  "id": 1,
  "employeeId": 5,
  "employeeName": "John Doe",
  "openTime": "2025-06-13T09:00:00",
  "closeTime": null,
  "closingAmount": null,
  "status": "OPEN"
}
```

---

### 38. Get All Sessions
**`GET /api/sessions`**

```
// No Request Body
// Query Params:
//   status     (optional) — "OPEN" | "CLOSED"
//   employeeId (optional) — filter by employee ID
```
```json
// Response Body (Array)
[
  {
    "id": 1,
    "employeeId": 5,
    "employeeName": "John Doe",
    "openTime": "2025-06-13T09:00:00",
    "closeTime": "2025-06-13T18:00:00",
    "closingAmount": 5000.00,
    "status": "CLOSED"
  }
]
```
