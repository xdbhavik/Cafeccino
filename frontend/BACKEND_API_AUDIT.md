# Backend API Audit — CafeChino POS System

> **Generated**: 2026-06-14  
> **Package**: `com.cafe.mark1`  
> **Base URL**: `http://localhost:8080`  
> **Security**: Spring Security is configured with `.anyRequest().permitAll()` — **all endpoints are publicly accessible**. JWT filter is present but no endpoints enforce authentication or role checks at the Spring Security config level. Service-layer code reads the authenticated user from `SecurityContextHolder` with a fallback to the first user in the DB when unauthenticated.

---

## Table of Contents

1. [Users (Auth)](#1-users--auth--usercontroller)
2. [Categories](#2-categories--categorycontroller)
3. [Products](#3-products--productcontroller)
4. [Floors](#4-floors--floorcontroller)
5. [Tables](#5-tables--tablecontroller)
6. [Orders](#6-orders--ordercontroller)
7. [Customers](#7-customers--customercontroller)
8. [Promotions (Admin)](#8-promotions-admin--adminpromotioncontroller)
9. [Employee Sessions](#9-employee-sessions--employeesessioncontroller)
10. [Kitchen Tickets (KDS)](#10-kitchen-tickets-kds--kitchenticketcontroller)
11. [Dashboard](#11-dashboard--dashboardcontroller)
12. [Reports](#12-reports--reportscontroller)
13. [Payment QR](#13-payment-qr--paymentqrcontroller)
14. [Payment Settings](#14-payment-settings--paymentsettingscontroller)
15. [Enum Reference](#15-enum-reference)
16. [WebSocket Topics](#16-websocket-topics)
17. [Endpoints With No Internal References](#17-endpoints-with-no-internal-references)

---

## 15. Enum Reference

| Enum | Values | Used In |
|------|--------|---------|
| `Role` | `ADMIN`, `EMPLOYEE`, `CHEF` | UserRequest, UpdateUserRequest, UserResponse, User entity |
| `OrderStatus` | `DRAFT`, `PAID`, `CANCELLED` | OrderResponse, Order entity |
| `LineStatus` | `PENDING`, `PREPPING`, `READY`, `SERVED`, `CANCELLED` | KitchenLineStatusRequest, OrderLine entity |
| `PromotionType` | `PRODUCT`, `ORDER` | PromotionRequest, PromotionResponse, Promotion entity |
| `DiscountType` | `PERCENT`, `FIXED` | PromotionRequest, PromotionResponse, Promotion entity |
| `SessionStatus` | `OPEN`, `CLOSED` | EmployeeSessionResponse, SessionReportResponse, EmployeeSession entity |

---

## 1. Users / Auth — `UserController`

**Controller**: `com.cafe.mark1.Controller.UserController`  
**Base Path**: `/api/users`  
**CORS**: `@CrossOrigin(origins = "*")`

---

### 1.1 `POST /api/users/register`

**Method**: `UserController.register()`  
**Service**: `UserService.registerUser(UserRequest)`

**Authentication**: None required (permitAll)  
**Role Restrictions**: None

**Request Body** (`UserRequest`, `@Valid`):
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@cafechino.com",
  "password": "securePass123",
  "role": "EMPLOYEE"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | Yes | `@NotBlank("Name is required")` |
| `email` | String | Yes | `@NotBlank("Email is required")`, `@Email("Invalid email format")` |
| `password` | String | Yes | `@NotBlank("Password is required")` |
| `role` | Role (enum) | Yes | `@NotNull("Role is required")` — values: `ADMIN`, `EMPLOYEE`, `CHEF` |

**Response Body** (`UserResponse`, HTTP 200):
```json
{
  "id": 1,
  "name": "Rahul Sharma",
  "email": "rahul@cafechino.com",
  "role": "EMPLOYEE",
  "isArchived": false
}
```

**Business Rules**:
- Throws `RuntimeException("Email already exists")` if email is duplicate.
- Password is BCrypt-encoded before saving.

**Internal References**: `UserService.registerUser()` — called only from this controller endpoint. Also used in `DataSeeder` to seed default users.

---

### 1.2 `POST /api/users/login`

**Method**: `UserController.login()`  
**Service**: `UserService.loginUser(LoginRequest)`

**Authentication**: None required  
**Role Restrictions**: None

**Request Body** (`LoginRequest`, `@Valid`):
```json
{
  "email": "admin@cafechino.com",
  "password": "admin123"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | String | Yes | `@NotBlank("Email is required")`, `@Email("Invalid email format")` |
| `password` | String | Yes | `@NotBlank("Password is required")` |

**Response Body** (`AuthResponse`, HTTP 200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBjYWZlY2hpbm8uY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzE4MzQ1NjAwLCJleHAiOjE3MTgzODE2MDB9.abc123",
  "email": "admin@cafechino.com",
  "name": "Admin User",
  "role": "ADMIN"
}
```

**Business Rules**:
- Throws `RuntimeException("User not found")` if email doesn't exist.
- Throws `RuntimeException("User account is archived")` if `isArchived == true`.
- Throws `RuntimeException("Invalid password")` if BCrypt match fails.
- JWT token includes `email` as subject and `role` as claim, with 10-hour expiration.

**Internal References**: Called only from this controller.

---

### 1.3 `GET /api/users`

**Method**: `UserController.getUsers()`  
**Service**: `UserService.getAllUsers()`

**Authentication**: None required  
**Role Restrictions**: None

**Request Body**: None  
**Path Variables**: None  
**Query Parameters**: None

**Response Body** (`List<UserResponse>`, HTTP 200):
```json
[
  {
    "id": 1,
    "name": "Admin User",
    "email": "admin@cafechino.com",
    "role": "ADMIN",
    "isArchived": false
  },
  {
    "id": 2,
    "name": "Rahul Sharma",
    "email": "rahul@cafechino.com",
    "role": "EMPLOYEE",
    "isArchived": false
  }
]
```

**Internal References**: Called only from this controller.

---

### 1.4 `GET /api/users/all`

**Method**: `UserController.getAllUsers()`  
**Service**: `UserService.getAllUsers()`

**Authentication**: None required  
**Role Restrictions**: None

> **Note**: This is a duplicate of `GET /api/users` — same service method, different path.

**Request Body**: None  
**Response Body**: Same as `GET /api/users`

**Internal References**: Called only from this controller.

---

### 1.5 `GET /api/users/{id}`

**Method**: `UserController.getUserById()`  
**Service**: `UserService.getUserById(Long)`

**Authentication**: None required  
**Role Restrictions**: None

**Path Variables**:

| Name | Type | Required |
|------|------|----------|
| `id` | Long | Yes |

**Response Body** (`UserResponse`, HTTP 200):
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@cafechino.com",
  "role": "ADMIN",
  "isArchived": false
}
```

**Business Rules**: Throws `RuntimeException("User not found")` if ID doesn't exist.

**Internal References**: Called only from this controller.

---

### 1.6 `PUT /api/users/{id}`

**Method**: `UserController.updateUser()`  
**Service**: `UserService.updateUser(Long, UpdateUserRequest)`

**Authentication**: None required  
**Role Restrictions**: None

**Path Variables**:

| Name | Type | Required |
|------|------|----------|
| `id` | Long | Yes |

**Request Body** (`UpdateUserRequest`, `@Valid`):
```json
{
  "name": "Updated Name",
  "role": "CHEF"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | Yes | `@NotBlank("Name is required")` |
| `role` | Role (enum) | Yes | `@NotNull("Role is required")` — values: `ADMIN`, `EMPLOYEE`, `CHEF` |

> **Note**: Email and password are NOT updated by this endpoint.

**Response Body** (`UserResponse`, HTTP 200): Same shape as above.

**Internal References**: Called only from this controller.

---

### 1.7 `DELETE /api/users/{id}`

**Method**: `UserController.deleteUser()`  
**Service**: `UserService.deleteUser(Long)`

**Authentication**: None required  
**Role Restrictions**: None

**Path Variables**:

| Name | Type | Required |
|------|------|----------|
| `id` | Long | Yes |

**Response Body**: Empty body, HTTP 200.

**Business Rules**: Throws `RuntimeException("User not found")` if ID doesn't exist. Performs hard delete.

**Internal References**: Called only from this controller.

---

### 1.8 `PATCH /api/users/{id}/archive`

**Method**: `UserController.toggleArchive()`  
**Service**: `UserService.toggleArchive(Long)`

**Authentication**: None required  
**Role Restrictions**: None

**Path Variables**:

| Name | Type | Required |
|------|------|----------|
| `id` | Long | Yes |

**Request Body**: None

**Response Body** (`UserResponse`, HTTP 200):
```json
{
  "id": 2,
  "name": "Rahul Sharma",
  "email": "rahul@cafechino.com",
  "role": "EMPLOYEE",
  "isArchived": true
}
```

**Business Rules**: Toggles the `isArchived` boolean (false → true, true → false).

**Internal References**: Called only from this controller.

---

### 1.9 `PATCH /api/users/{id}/password`

**Method**: `UserController.changePassword()`  
**Service**: `UserService.changePassword(Long, ChangePasswordRequest)`

**Authentication**: None required  
**Role Restrictions**: None

**Path Variables**:

| Name | Type | Required |
|------|------|----------|
| `id` | Long | Yes |

**Request Body** (`ChangePasswordRequest`, `@Valid`):
```json
{
  "newPassword": "newSecure456"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `newPassword` | String | Yes | `@NotBlank("New password is required")`, `@Size(min=6, "Password must be at least 6 characters")` |

**Response Body** (`Map<String, String>`, HTTP 200):
```json
{
  "message": "Password updated successfully"
}
```

**Internal References**: Called only from this controller.

---

## 2. Categories — `CategoryController`

**Controller**: `com.cafe.mark1.Controller.CategoryController`  
**Base Path**: `/api/categories`  
**CORS**: `@CrossOrigin(origins = "*")`

---

### 2.1 `GET /api/categories`

**Method**: `CategoryController.getAllCategories()`  
**Service**: `CategoryService.getAllCategories()`

**Authentication**: None required  
**Role Restrictions**: None

**Response Body** (`List<CategoryResponse>`, HTTP 200):
```json
[
  {
    "id": 1,
    "name": "Beverages",
    "colorHex": "#FF5733"
  },
  {
    "id": 2,
    "name": "Snacks",
    "colorHex": "#33FF57"
  }
]
```

**Internal References**: Called only from this controller.

---

### 2.2 `GET /api/categories/{id}`

**Method**: `CategoryController.getCategoryById()`  
**Service**: `CategoryService.getCategoryById(Long)`

**Path Variables**:

| Name | Type | Required |
|------|------|----------|
| `id` | Long | Yes |

**Response Body** (`CategoryResponse`, HTTP 200):
```json
{
  "id": 1,
  "name": "Beverages",
  "colorHex": "#FF5733"
}
```

**Business Rules**: Throws `RuntimeException("Category not found")` if not found.

**Internal References**: Called only from this controller.

---

### 2.3 `POST /api/categories`

**Method**: `CategoryController.createCategory()`  
**Service**: `CategoryService.createCategory(CategoryRequest)`

**Request Body** (`CategoryRequest`, `@Valid`):
```json
{
  "name": "Desserts",
  "colorHex": "#E91E63"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | Yes | `@NotBlank("Category name is required")` |
| `colorHex` | String | Yes | `@NotBlank("Color hex code is required")` |

**Response Body** (`CategoryResponse`, HTTP 201 CREATED): Same shape as GET by ID.

**Internal References**: Called only from this controller. Also used in `DataSeeder` (direct repo access).

---

### 2.4 `PUT /api/categories/{id}`

**Method**: `CategoryController.updateCategory()`  
**Service**: `CategoryService.updateCategory(Long, CategoryRequest)`

**Path Variables**: `id` (Long, required)

**Request Body**: Same as POST.

**Response Body** (`CategoryResponse`, HTTP 200): Same shape.

**Internal References**: Called only from this controller.

---

### 2.5 `DELETE /api/categories/{id}`

**Method**: `CategoryController.deleteCategory()`  
**Service**: `CategoryService.deleteCategory(Long)`

**Path Variables**: `id` (Long, required)

**Response Body**: Empty, HTTP 204 NO_CONTENT.

**Internal References**: Called only from this controller.

---

## 3. Products — `ProductController`

**Controller**: `com.cafe.mark1.Controller.ProductController`  
**Base Path**: `/api/products`  
**CORS**: `@CrossOrigin(origins = "*")`

---

### 3.1 `GET /api/products`

**Method**: `ProductController.getAllProducts()`  
**Service**: `ProductService.getAllProducts(Long categoryId, String search)`

**Query Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `categoryId` | Long | No | Filter by category |
| `search` | String | No | Search by product name (case-insensitive contains) |

**Response Body** (`List<ProductResponse>`, HTTP 200):
```json
[
  {
    "id": 1,
    "name": "Cappuccino",
    "categoryId": 1,
    "categoryName": "Beverages",
    "categoryColorHex": "#FF5733",
    "price": 180.0,
    "uom": "cup",
    "tax": 5.0,
    "description": "Rich Italian cappuccino",
    "showOnKDS": true,
    "imagePath": "/images/cappuccino.jpg",
    "isActive": true
  }
]
```

**Business Rules**: Supports 4 combinations: all products, by category, by search, or by both category + search.

**Internal References**: Called only from this controller.

---

### 3.2 `GET /api/products/{id}`

**Method**: `ProductController.getProductById()`  
**Service**: `ProductService.getProductById(Long)`

**Path Variables**: `id` (Long, required)

**Response Body** (`ProductResponse`, HTTP 200): Same shape as single item above.

**Internal References**: Called only from this controller.

---

### 3.3 `POST /api/products`

**Method**: `ProductController.createProduct()`  
**Service**: `ProductService.createProduct(ProductRequest)`

**Request Body** (`ProductRequest`, `@Valid`):
```json
{
  "name": "Cappuccino",
  "categoryId": 1,
  "price": 180.0,
  "uom": "cup",
  "tax": 5.0,
  "description": "Rich Italian cappuccino",
  "showOnKDS": true,
  "imagePath": "/images/cappuccino.jpg",
  "isActive": true
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | Yes | `@NotBlank("Product name is required")` |
| `categoryId` | Long | Yes | `@NotNull("Category ID is required")` |
| `price` | Double | Yes | `@NotNull("Price is required")`, `@Positive("Price must be positive")` |
| `uom` | String | Yes | `@NotBlank("UOM is required")` |
| `tax` | Double | Yes | `@NotNull("Tax is required")` |
| `description` | String | No | None |
| `showOnKDS` | Boolean | Yes | `@NotNull("showOnKDS status is required")` |
| `imagePath` | String | No | None |
| `isActive` | Boolean | No | None (defaults to `true` in entity) |

**Response Body** (`ProductResponse`, HTTP 201 CREATED): Same shape.

**Internal References**: Called only from this controller. Also used in `DataSeeder` (direct repo access).

---

### 3.4 `PUT /api/products/{id}`

**Method**: `ProductController.updateProduct()`  
**Service**: `ProductService.updateProduct(Long, ProductRequest)`

**Path Variables**: `id` (Long, required)  
**Request Body**: Same as POST.  
**Response Body** (`ProductResponse`, HTTP 200): Same shape.

**Internal References**: Called only from this controller.

---

### 3.5 `DELETE /api/products/{id}`

**Method**: `ProductController.deleteProduct()`  
**Service**: `ProductService.deleteProduct(Long)`

**Path Variables**: `id` (Long, required)  
**Response Body**: Empty, HTTP 204 NO_CONTENT.

**Internal References**: Called only from this controller.

---

## 4. Floors — `FloorController`

**Controller**: `com.cafe.mark1.Controller.FloorController`  
**Base Path**: `/api/floors`  
**CORS**: `@CrossOrigin("*")`

---

### 4.1 `GET /api/floors`

**Method**: `FloorController.getAllFloors()`  
**Service**: `FloorService.getAllFloors()`

**Response Body** (`List<FloorResponse>`, HTTP 200):
```json
[
  { "id": 1, "name": "Ground Floor" },
  { "id": 2, "name": "First Floor" }
]
```

**Internal References**: Called only from this controller.

---

### 4.2 `GET /api/floors/{id}`

**Method**: `FloorController.getFloorById()`  
**Service**: `FloorService.getFloorById(Long)`

**Path Variables**: `id` (Long, required)

**Response Body** (`FloorResponse`, HTTP 200):
```json
{ "id": 1, "name": "Ground Floor" }
```

**Internal References**: Called only from this controller.

---

### 4.3 `POST /api/floors`

**Method**: `FloorController.createFloor()`  
**Service**: `FloorService.createFloor(FloorRequest)`

**Request Body** (`FloorRequest`, `@Valid`):
```json
{ "name": "Terrace" }
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | Yes | `@NotBlank("Floor name is required")` |

**Response Body** (`FloorResponse`, HTTP 200): Same shape.

**Internal References**: Called only from this controller. Also used in `DataSeeder`.

---

### 4.4 `PUT /api/floors/{id}`

**Method**: `FloorController.updateFloor()`  
**Service**: `FloorService.updateFloor(Long, FloorRequest)`

**Path Variables**: `id` (Long, required)  
**Request Body**: Same as POST.  
**Response Body** (`FloorResponse`, HTTP 200): Same shape.

**Internal References**: Called only from this controller.

---

### 4.5 `DELETE /api/floors/{id}`

**Method**: `FloorController.deleteFloor()`  
**Service**: `FloorService.deleteFloor(Long)`

**Path Variables**: `id` (Long, required)  
**Response Body**: Empty, HTTP 204 NO_CONTENT.

**Internal References**: Called only from this controller.

---

## 5. Tables — `TableController`

**Controller**: `com.cafe.mark1.Controller.TableController`  
**Base Path**: `/api/tables`  
**CORS**: `@CrossOrigin("*")`

---

### 5.1 `GET /api/tables`

**Method**: `TableController.getAllTables()`  
**Service**: `TableService.getAllTables(Long floorId)`

**Query Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `floorId` | Long | No | Filter tables by floor |

**Response Body** (`List<TableResponse>`, HTTP 200):
```json
[
  {
    "id": 1,
    "tableNumber": "T-01",
    "seats": 4,
    "isActive": true,
    "hasActiveOrder": false,
    "floorId": 1,
    "floorName": "Ground Floor"
  }
]
```

**Internal References**: Called only from this controller.

---

### 5.2 `GET /api/tables/{id}`

**Method**: `TableController.getTableById()`  
**Service**: `TableService.getTableById(Long)`

**Path Variables**: `id` (Long, required)  
**Response Body** (`TableResponse`, HTTP 200): Same single-item shape.

**Internal References**: Called only from this controller.

---

### 5.3 `POST /api/tables`

**Method**: `TableController.createTable()`  
**Service**: `TableService.createTable(TableRequest)`

**Request Body** (`TableRequest`, `@Valid`):
```json
{
  "tableNumber": "T-05",
  "seats": 6,
  "floorId": 1,
  "isActive": true,
  "hasActiveOrder": false
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `tableNumber` | String | Yes | `@NotBlank("Table number is required")` |
| `seats` | Integer | Yes | `@NotNull("Seats is required")`, `@Min(value=1, "Seats must be at least 1")` |
| `floorId` | Long | Yes | `@NotNull("Floor ID is required")` |
| `isActive` | Boolean | No | None |
| `hasActiveOrder` | Boolean | No | None |

**Response Body** (`TableResponse`, HTTP 200): Same shape.

**Internal References**: Called only from this controller. Also used in `DataSeeder`.

---

### 5.4 `PUT /api/tables/{id}`

**Method**: `TableController.updateTable()`  
**Service**: `TableService.updateTable(Long, TableRequest)`

**Path Variables**: `id` (Long, required)  
**Request Body**: Same as POST.  
**Response Body** (`TableResponse`, HTTP 200): Same shape.

**Internal References**: Called only from this controller.

---

### 5.5 `DELETE /api/tables/{id}`

**Method**: `TableController.deleteTable()`  
**Service**: `TableService.deleteTable(Long)`

**Path Variables**: `id` (Long, required)  
**Response Body**: Empty, HTTP 204 NO_CONTENT.

**Internal References**: Called only from this controller.

---

## 6. Orders — `OrderController`

**Controller**: `com.cafe.mark1.Controller.OrderController`  
**Base Path**: `/api/orders`  
**CORS**: `@CrossOrigin("*")`

---

### 6.1 `POST /api/orders`

**Method**: `OrderController.createOrder()`  
**Service**: `OrderService.createOrder(OrderRequest)`

**Authentication**: Uses `SecurityContextHolder` to identify current user (with anonymous fallback).  
**Role Restrictions**: None at controller; service checks session ownership.

> **Note**: `@Valid` is NOT present on this endpoint — no bean validation is enforced.

**Request Body** (`OrderRequest`):
```json
{
  "tableId": 1,
  "sessionId": 5,
  "customerId": 3,
  "couponCode": "WELCOME10",
  "discount": 0,
  "lines": [
    {
      "productId": 1,
      "qty": 2,
      "unitPrice": 180.00,
      "lineDiscount": 0.00
    },
    {
      "productId": 4,
      "qty": 1,
      "unitPrice": 120.00,
      "lineDiscount": 10.00
    }
  ]
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `tableId` | Long | Yes (service enforced) | None (no `@Valid`) |
| `sessionId` | Long | No | If null, uses authenticated user's current OPEN session |
| `customerId` | Long | No | If provided, customer must exist and not be archived |
| `couponCode` | String | No | Applied during recalculation |
| `discount` | BigDecimal | No | Manual order-level discount |
| `lines` | List\<OrderLineRequest\> | No | Can create order with empty cart |
| `lines[].productId` | Long | Yes (service enforced) | Product must exist |
| `lines[].qty` | Integer | Yes (service enforced) | — |
| `lines[].unitPrice` | BigDecimal | No | Ignored — service uses product's price |
| `lines[].lineDiscount` | BigDecimal | No | Defaults to 0 if null |

**Response Body** (`OrderResponse`, HTTP 200):
```json
{
  "id": 101,
  "sessionId": 5,
  "tableId": 1,
  "tableNumber": "T-01",
  "customerId": 3,
  "customerName": "Priya Patel",
  "customerPhone": "9876543210",
  "status": "DRAFT",
  "subtotal": 470.00,
  "tax": 23.50,
  "discount": 47.00,
  "total": 446.50,
  "couponCode": "WELCOME10",
  "paymentMethod": null,
  "receivedAmount": null,
  "changeAmount": null,
  "transactionRef": null,
  "createdAt": "2026-06-14T08:30:00",
  "paidAt": null,
  "sentToKitchen": false,
  "lines": [
    {
      "id": 201,
      "orderId": 101,
      "productId": 1,
      "productName": "Cappuccino",
      "categoryColorHex": "#FF5733",
      "qty": 2,
      "unitPrice": 180.00,
      "lineTotal": 360.00,
      "lineDiscount": 0.00,
      "status": "PENDING"
    },
    {
      "id": 202,
      "orderId": 101,
      "productId": 4,
      "productName": "Paneer Tikka",
      "categoryColorHex": "#33FF57",
      "qty": 1,
      "unitPrice": 120.00,
      "lineTotal": 120.00,
      "lineDiscount": 10.00,
      "status": "PENDING"
    }
  ]
}
```

**Business Rules**:
- Sets `hasActiveOrder = true` on the table.
- Auto-applies active PRODUCT-type promotions to matching lines during recalculation.
- Auto-applies active ORDER-type promotions if subtotal meets `minOrderAmount`.
- Applies coupon on top of auto promotions.
- `total = subtotal + tax - discount` (minimum 0).

**Internal References**: Called only from this controller.

---

### 6.2 `GET /api/orders/{id}`

**Method**: `OrderController.getOrderById()`  
**Service**: `OrderService.getOrderById(Long)`

**Path Variables**: `id` (Long, required)  
**Response Body** (`OrderResponse`, HTTP 200): Same shape as above.

**Internal References**: `OrderService.getOrderById()` is also called by `AnalyticsService.getOrderReport()`.

---

### 6.3 `PUT /api/orders/{id}/lines`

**Method**: `OrderController.addOrUpdateLine()`  
**Service**: `OrderService.addOrUpdateLine(Long orderId, Long productId, Integer qty, BigDecimal lineDiscount)`

**Path Variables**: `id` (Long, required — orderId)

**Request Body** (`OrderController.LineUpdateRequest` — inner static class):
```json
{
  "productId": 3,
  "qty": 2,
  "lineDiscount": 15.00
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productId` | Long | Yes | Product to add/update |
| `qty` | Integer | Yes | New quantity. If ≤ 0, the line is removed |
| `lineDiscount` | BigDecimal | No | Line-level discount |

**Response Body** (`OrderResponse`, HTTP 200): Full order with updated lines.

**Business Rules**:
- Only DRAFT orders can be modified.
- Validates order ownership (owner or ADMIN).
- If product already exists in lines, updates qty + discount. If new, creates a new line.
- If qty ≤ 0, removes the line.
- Recalculates order totals.

**Internal References**: Called only from this controller.

---

### 6.4 `DELETE /api/orders/{id}/lines/{lineId}`

**Method**: `OrderController.removeLine()`  
**Service**: `OrderService.removeLine(Long orderId, Long lineId)`

**Path Variables**:

| Name | Type | Required |
|------|------|----------|
| `id` | Long | Yes (orderId) |
| `lineId` | Long | Yes |

**Response Body** (`OrderResponse`, HTTP 200): Full order with line removed.

**Business Rules**: Only DRAFT orders. Validates ownership.

**Internal References**: Called only from this controller.

---

### 6.5 `POST /api/orders/{id}/coupon`

**Method**: `OrderController.applyCoupon()`  
**Service**: `OrderService.applyCoupon(Long orderId, String code)`

**Path Variables**: `id` (Long, required)

**Request Body** (`OrderController.CouponRequest` — inner static class):
```json
{
  "code": "WELCOME10"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | String | Yes | Coupon code to apply |

**Response Body** (`OrderResponse`, HTTP 200): Recalculated order with coupon applied.

**Business Rules**:
- Only DRAFT orders.
- Validates ownership.
- Coupon must exist and be active (`findByCodeAndIsActiveTrue`).
- Throws `RuntimeException("Invalid or inactive coupon code")` if not found.

**Internal References**: Called only from this controller.

---

### 6.6 `POST /api/orders/{id}/pay`

**Method**: `OrderController.markAsPaid()`  
**Service**: `OrderService.markAsPaid(Long orderId, String paymentMethod, BigDecimal receivedAmount, String transactionRef)`

**Path Variables**: `id` (Long, required)

**Request Body** (`OrderController.PayRequest` — inner static class):
```json
{
  "paymentMethod": "CASH",
  "receivedAmount": 500.00,
  "transactionRef": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `paymentMethod` | String | No | Defaults to `"CASH"`. Values: `CASH`, `CARD`, `UPI` (case-insensitive) |
| `receivedAmount` | BigDecimal | Required for CASH | Amount received from customer |
| `transactionRef` | String | Required for CARD | Card transaction reference number |

**Response Body** (`OrderResponse`, HTTP 200): Order with status `PAID`, payment details filled.

**Business Rules**:
- Only DRAFT orders with non-empty lines can be paid.
- Validates payment method is enabled in `PaymentSettings`.
- CASH: requires `receivedAmount >= total`, calculates `changeAmount`.
- CARD: requires non-empty `transactionRef`.
- UPI: requires UPI to be enabled and UPI ID configured.
- Sets `hasActiveOrder = false` on the table.
- Throws if payment method is unsupported or disabled.

**Internal References**: Called only from this controller.

---

### 6.7 `POST /api/orders/{id}/send-to-kitchen`

**Method**: `OrderController.sendToKitchen()`  
**Service**: `OrderService.sendToKitchen(Long)`

**Path Variables**: `id` (Long, required)  
**Request Body**: None

**Response Body** (`OrderResponse`, HTTP 200): Order with `sentToKitchen = true`.

**Business Rules**:
- Throws if already sent to kitchen.
- Throws if order has no lines or no KDS-eligible items.
- Sets `sentToKitchen = true`.
- Re-activates any CANCELLED KDS lines to PENDING.
- Broadcasts update to `/topic/kds` and `/topic/kitchen-tickets` via WebSocket.

**Internal References**: `OrderService.sendToKitchen()` is also called by `OrderService.sendOrderToKitchenTicket()` (used by KitchenTicketController).

---

### 6.8 `POST /api/orders/{id}/cancel`

**Method**: `OrderController.cancelOrder()`  
**Service**: `OrderService.cancelOrder(Long)`

**Path Variables**: `id` (Long, required)  
**Request Body**: None

**Response Body** (`OrderResponse`, HTTP 200): Order with status `CANCELLED`.

**Business Rules**:
- Only DRAFT orders can be cancelled.
- Validates ownership.
- If no other DRAFT orders on the same table, sets `hasActiveOrder = false`.

**Internal References**: Called only from this controller.

---

### 6.9 `GET /api/orders`

**Method**: `OrderController.getOrders()`  
**Service**: `OrderService.getOrders(Long sessionId, String search)`

**Query Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sessionId` | Long | No | Filter by session (validates visibility) |
| `search` | String | No | Filter by customer name or order ID (case-insensitive contains) |

**Response Body** (`List<OrderResponse>`, HTTP 200): Array of orders.

**Business Rules**:
- If `sessionId` provided: returns orders for that session (non-ADMIN can only see their own).
- If no `sessionId`: ADMIN sees all orders; others see only their own.
- Search filters on customer name or order ID string.

**Internal References**: Called only from this controller.

---

## 7. Customers — `CustomerController`

**Controller**: `com.cafe.mark1.Controller.CustomerController`  
**Base Path**: `/api/customers`  
**CORS**: `@CrossOrigin("*")`

---

### 7.1 `GET /api/customers`

**Method**: `CustomerController.getCustomers()`  
**Service**: `CustomerService.getCustomers(String search)`

**Query Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | String | No | Search by name, phone, or email (case-insensitive) |

**Response Body** (`List<CustomerResponse>`, HTTP 200):
```json
[
  {
    "id": 1,
    "name": "Priya Patel",
    "phone": "9876543210",
    "email": "priya@example.com",
    "address": "123 MG Road, Mumbai",
    "isArchived": false
  }
]
```

**Internal References**: Called only from this controller.

---

### 7.2 `GET /api/customers/{id}`

**Method**: `CustomerController.getCustomerById()`  
**Service**: `CustomerService.getCustomerById(Long)`

**Path Variables**: `id` (Long, required)  
**Response Body** (`CustomerResponse`, HTTP 200): Single customer.

**Internal References**: Called only from this controller.

---

### 7.3 `GET /api/customers/phone/{phone}`

**Method**: `CustomerController.getCustomerByPhone()`  
**Service**: `CustomerService.getCustomerByPhone(String)`

**Path Variables**:

| Name | Type | Required |
|------|------|----------|
| `phone` | String | Yes |

**Response Body** (`CustomerResponse`, HTTP 200): Single customer.

**Internal References**: Called only from this controller.

---

### 7.4 `POST /api/customers`

**Method**: `CustomerController.createCustomer()`  
**Service**: `CustomerService.createCustomer(CustomerRequest)`

**Request Body** (`CustomerRequest`, `@Valid`):
```json
{
  "name": "Priya Patel",
  "phone": "9876543210",
  "email": "priya@example.com",
  "address": "123 MG Road, Mumbai"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | Yes | `@NotBlank("Customer name is required")` |
| `phone` | String | Yes | `@NotBlank("Customer phone is required")` |
| `email` | String | No | None |
| `address` | String | No | None |

**Response Body** (`CustomerResponse`, HTTP 201 CREATED): Same shape.

**Business Rules**: Phone must be unique (`existsByPhone` check).

**Internal References**: Called only from this controller.

---

### 7.5 `PUT /api/customers/{id}`

**Method**: `CustomerController.updateCustomer()`  
**Service**: `CustomerService.updateCustomer(Long, CustomerRequest)`

**Path Variables**: `id` (Long, required)  
**Request Body**: Same as POST.  
**Response Body** (`CustomerResponse`, HTTP 200): Same shape.

**Internal References**: Called only from this controller.

---

### 7.6 `PATCH /api/customers/{id}/archive`

**Method**: `CustomerController.toggleArchive()`  
**Service**: `CustomerService.toggleArchive(Long)`

**Path Variables**: `id` (Long, required)  
**Request Body**: None  
**Response Body** (`CustomerResponse`, HTTP 200): Customer with toggled `isArchived`.

**Internal References**: Called only from this controller.

---

### 7.7 `DELETE /api/customers/{id}`

**Method**: `CustomerController.deleteCustomer()`  
**Service**: `CustomerService.deleteCustomer(Long)`

**Path Variables**: `id` (Long, required)  
**Response Body**: Empty, HTTP 204 NO_CONTENT.

**Internal References**: Called only from this controller.

---

## 8. Promotions (Admin) — `AdminPromotionController`

**Controller**: `com.cafe.mark1.Controller.AdminPromotionController`  
**Base Path**: `/api/admin/promotions`  
**CORS**: None (no `@CrossOrigin` annotation)

---

### 8.1 `POST /api/admin/promotions`

**Method**: `AdminPromotionController.createPromotion()`  
**Service**: `PromotionService.createPromotion(PromotionRequest)`

**Authentication**: None required (despite the `/admin/` path prefix, no security is enforced)  
**Role Restrictions**: None

**Request Body** (`PromotionRequest` — no `@Valid`):
```json
{
  "name": "Buy 2 Get 10% Off Cappuccino",
  "code": null,
  "type": "PRODUCT",
  "applicableProductId": 1,
  "minQty": 2,
  "discountType": "PERCENT",
  "discountValue": 10.00,
  "minOrderAmount": null,
  "startDate": "2026-06-01T00:00:00",
  "endDate": "2026-07-01T23:59:59"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes (service enforced) | Promotion name |
| `code` | String | No | Coupon code — required for ORDER-type promotions |
| `type` | PromotionType | Yes | `PRODUCT` or `ORDER` |
| `applicableProductId` | Long | Conditional | Required if type is `PRODUCT` |
| `minQty` | Integer | Conditional | Min quantity for PRODUCT-type (e.g., Buy 2) |
| `discountType` | DiscountType | Yes | `PERCENT` or `FIXED` |
| `discountValue` | BigDecimal | Yes | Discount amount or percentage |
| `minOrderAmount` | BigDecimal | No | Minimum bill for ORDER-type |
| `startDate` | LocalDateTime | No | Promo start (ISO 8601) |
| `endDate` | LocalDateTime | No | Promo end (ISO 8601) |

**Response Body** (`PromotionResponse`, HTTP 200):
```json
{
  "id": 5,
  "name": "Buy 2 Get 10% Off Cappuccino",
  "code": null,
  "type": "PRODUCT",
  "applicableProductId": 1,
  "productName": "Cappuccino",
  "minQty": 2,
  "discountType": "PERCENT",
  "discountValue": 10.00,
  "minOrderAmount": null,
  "startDate": "2026-06-01T00:00:00",
  "endDate": "2026-07-01T23:59:59",
  "isActive": true
}
```

**Internal References**: Called only from this controller.

---

### 8.2 `GET /api/admin/promotions`

**Method**: `AdminPromotionController.getAll()`  
**Service**: `PromotionService.getAllPromotions()`

**Response Body** (`List<PromotionResponse>`, HTTP 200): Array of all promotions.

**Internal References**: Called only from this controller.

---

### 8.3 `DELETE /api/admin/promotions/{id}`

**Method**: `AdminPromotionController.delete()`  
**Service**: `PromotionService.deletePromotion(Long)`

**Path Variables**: `id` (Long, required)  
**Response Body**: Empty, HTTP 200.

**Internal References**: Called only from this controller.

---

### 8.4 `POST /api/admin/promotions/seed-coupon`

**Method**: `AdminPromotionController.seedCoupon()`  
**Service**: Direct `PromotionRepository` access (bypasses service layer)

**Request Body**: None

**Response Body** (`String`, HTTP 200):
```
"Coupon WELCOME10 created successfully! (10% off on orders above 100)"
```
or
```
"Coupon WELCOME10 already exists!"
```

**Business Rules**: Creates a hardcoded `WELCOME10` coupon (ORDER type, 10% PERCENT, minOrderAmount=100, active for 1 month) if it doesn't already exist.

**Internal References**: Called only from this controller. Direct repository access (code smell).

---

## 9. Employee Sessions — `EmployeeSessionController`

**Controller**: `com.cafe.mark1.Controller.EmployeeSessionController`  
**Base Path**: `/api/sessions`  
**CORS**: `@CrossOrigin("*")`

---

### 9.1 `POST /api/sessions/open`

**Method**: `EmployeeSessionController.openSession()`  
**Service**: `EmployeeSessionService.openSession()`

**Authentication**: Uses `SecurityContextHolder` to identify current user (with anonymous fallback).

**Request Body**: None

**Response Body** (`EmployeeSessionResponse`, HTTP 200):
```json
{
  "id": 10,
  "employeeId": 2,
  "employeeName": "Rahul Sharma",
  "openTime": "2026-06-14T08:00:00",
  "closeTime": null,
  "closingAmount": 0.00,
  "status": "OPEN"
}
```

**Business Rules**:
- If the user already has an OPEN session, returns it (idempotent).
- Otherwise creates a new session with status `OPEN`.

**Internal References**: Called only from this controller.

---

### 9.2 `POST /api/sessions/close`

**Method**: `EmployeeSessionController.closeSession()`  
**Service**: `EmployeeSessionService.closeSession(BigDecimal manualClosingAmount)`

**Request Body** (`EmployeeSessionRequest`, optional — `@RequestBody(required = false)`):
```json
{
  "employeeId": 2,
  "closingAmount": 4500.00
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | Long | No | Not used by closeSession logic |
| `closingAmount` | BigDecimal | No | Manual closing amount. If null, system auto-calculates from PAID order totals |

**Response Body** (`EmployeeSessionResponse`, HTTP 200):
```json
{
  "id": 10,
  "employeeId": 2,
  "employeeName": "Rahul Sharma",
  "openTime": "2026-06-14T08:00:00",
  "closeTime": "2026-06-14T17:30:00",
  "closingAmount": 4500.00,
  "status": "CLOSED"
}
```

**Business Rules**:
- Throws if no OPEN session exists for the current user.
- If `closingAmount` provided: uses it (manual cash counting).
- If null: auto-calculates sum of PAID order totals for the session.

**Internal References**: Called only from this controller.

---

### 9.3 `GET /api/sessions/current`

**Method**: `EmployeeSessionController.getCurrentSession()`  
**Service**: `EmployeeSessionService.getCurrentSession()`

**Response Body** (`EmployeeSessionResponse`, HTTP 200): Returns OPEN session if exists, otherwise most recent CLOSED session.

**Business Rules**: Throws `RuntimeException("No session history found for you.")` if no sessions found.

**Internal References**: Called only from this controller.

---

### 9.4 `GET /api/sessions`

**Method**: `EmployeeSessionController.getAllSessions()`  
**Service**: Multiple methods based on params

**Query Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | SessionStatus (enum) | No | Filter by `OPEN` or `CLOSED` |
| `employeeId` | Long | No | Filter by employee (returns their session history) |

**Response Body** (`List<EmployeeSessionResponse>`, HTTP 200): Array of sessions.

**Business Rules**:
- If `employeeId` provided → calls `getEmployeeSessionHistory(employeeId)`.
- Else if `status` provided → calls `getSessionsByStatus(status)`.
- Else → calls `getAllSessions()`.
- Priority: `employeeId` > `status` > all.

**Internal References**: Called only from this controller.

---

## 10. Kitchen Tickets (KDS) — `KitchenTicketController`

**Controller**: `com.cafe.mark1.Controller.KitchenTicketController`  
**Base Path**: `/api/kitchen-tickets`  
**CORS**: `@CrossOrigin("*")`

---

### 10.1 `GET /api/kitchen-tickets`

**Method**: `KitchenTicketController.getActiveTickets()`  
**Service**: `OrderService.getActiveKitchenTickets()`

**Response Body** (`List<KitchenTicketResponse>`, HTTP 200):
```json
[
  {
    "ticketId": 101,
    "orderId": 101,
    "tableId": 1,
    "tableNumber": "T-01",
    "customerName": "Priya Patel",
    "stage": "PENDING",
    "totalItems": 3,
    "items": [
      {
        "lineId": 201,
        "productId": 1,
        "productName": "Cappuccino",
        "categoryColorHex": "#FF5733",
        "qty": 2,
        "status": "PENDING"
      },
      {
        "lineId": 202,
        "productId": 4,
        "productName": "Paneer Tikka",
        "categoryColorHex": "#33FF57",
        "qty": 1,
        "status": "PREPPING"
      }
    ]
  }
]
```

**Business Rules**:
- Returns orders where `sentToKitchen = true` AND at least one line has status `PENDING`, `PREPPING`, or `READY` and `showOnKDS = true`.
- Only includes KDS-eligible, non-CANCELLED lines in items.
- `stage` is the lowest status ordinal among active KDS lines.
- `totalItems` is the sum of qty across KDS-eligible items.

**Internal References**: Called only from this controller.

---

### 10.2 `POST /api/kitchen-tickets/orders/{orderId}/send`

**Method**: `KitchenTicketController.sendToKitchen()`  
**Service**: `OrderService.sendOrderToKitchenTicket(Long)`

**Path Variables**: `orderId` (Long, required)  
**Request Body**: None

**Response Body** (`KitchenTicketResponse`, HTTP 200): Single kitchen ticket.

**Business Rules**: Same as `POST /api/orders/{id}/send-to-kitchen` but returns `KitchenTicketResponse` instead of `OrderResponse`.

**Internal References**: `sendOrderToKitchenTicket()` internally calls `sendToKitchen()` (the same method used by OrderController).

---

### 10.3 `PATCH /api/kitchen-tickets/{orderId}/lines/{lineId}/status`

**Method**: `KitchenTicketController.updateLineStatus()`  
**Service**: `OrderService.updateKitchenLineStatus(Long orderId, Long lineId, LineStatus status)`

**Path Variables**:

| Name | Type | Required |
|------|------|----------|
| `orderId` | Long | Yes |
| `lineId` | Long | Yes |

**Request Body** (`KitchenLineStatusRequest`, `@Valid`):
```json
{
  "status": "PREPPING"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | LineStatus (enum) | Yes | `@NotNull("Status is required")` — values: `PENDING`, `PREPPING`, `READY`, `SERVED`, `CANCELLED` |

**Response Body** (`KitchenTicketResponse`, HTTP 200): Updated kitchen ticket.

**Business Rules**:
- Order must have been sent to kitchen.
- Forward-only transitions: `PENDING → PREPPING → READY → SERVED`.
- `CANCELLED` allowed from any state except `SERVED` and `CANCELLED`.
- Broadcasts update to `/topic/kds` and `/topic/kitchen-tickets`.

**Internal References**: Called only from this controller.

---

### 10.4 `PATCH /api/kitchen-tickets/{orderId}/advance`

**Method**: `KitchenTicketController.advanceTicketStage()`  
**Service**: `OrderService.advanceKitchenTicketStage(Long)`

**Path Variables**: `orderId` (Long, required)  
**Request Body**: None

**Response Body** (`KitchenTicketResponse`, HTTP 200): Updated kitchen ticket with all lowest-status lines advanced.

**Business Rules**:
- Finds the lowest status among active KDS lines.
- Advances all lines at that lowest status to the next stage.
- `PENDING → PREPPING → READY → SERVED`.
- Broadcasts update to `/topic/kds` and `/topic/kitchen-tickets`.

**Internal References**: Called only from this controller.

---

## 11. Dashboard — `DashboardController`

**Controller**: `com.cafe.mark1.Controller.DashboardController`  
**Base Path**: `/api/dashboard`  
**CORS**: `@CrossOrigin("*")`

---

### 11.1 `GET /api/dashboard/summary`

**Method**: `DashboardController.getSummary()`  
**Service**: `AnalyticsService.getDashboardSummary(LocalDate from, LocalDate to)`

**Query Parameters**:

| Name | Type | Required | Format |
|------|------|----------|--------|
| `from` | LocalDate | Yes | ISO date `yyyy-MM-dd` |
| `to` | LocalDate | Yes | ISO date `yyyy-MM-dd` |

**Response Body** (`DashboardSummaryResponse`, HTTP 200):
```json
{
  "totalSales": 45600.00,
  "totalOrders": 128,
  "averageOrderValue": 356.25,
  "cashSales": 22800.00,
  "cardSales": 15200.00,
  "upiSales": 7600.00,
  "activeTables": 5,
  "openSessions": 3
}
```

**Business Rules**: Aggregates PAID orders within the date range. `activeTables` counts tables with `hasActiveOrder = true`. `openSessions` counts sessions with status `OPEN`.

**Internal References**: Called only from this controller.

---

### 11.2 `GET /api/dashboard/sales-trend`

**Method**: `DashboardController.getSalesTrend()`  
**Service**: `AnalyticsService.getSalesTrend(LocalDate from, LocalDate to)`

**Query Parameters**: Same as summary (both required, ISO date).

**Response Body** (`List<SalesTrendResponse>`, HTTP 200):
```json
[
  { "date": "2026-06-10", "sales": 12500.00, "orders": 35 },
  { "date": "2026-06-11", "sales": 14200.00, "orders": 42 },
  { "date": "2026-06-12", "sales": 9800.00, "orders": 28 }
]
```

**Internal References**: Called only from this controller.

---

### 11.3 `GET /api/dashboard/top-products`

**Method**: `DashboardController.getTopProducts()`  
**Service**: `AnalyticsService.getTopProducts(LocalDate from, LocalDate to, int limit)`

**Query Parameters**:

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `from` | LocalDate | Yes | — | ISO date |
| `to` | LocalDate | Yes | — | ISO date |
| `limit` | int | No | `5` | Max products to return |

**Response Body** (`List<TopProductResponse>`, HTTP 200):
```json
[
  { "productId": 1, "productName": "Cappuccino", "quantitySold": 87, "revenue": 15660.00 },
  { "productId": 3, "productName": "Cheese Sandwich", "quantitySold": 65, "revenue": 9750.00 }
]
```

**Internal References**: Called only from this controller.

---

## 12. Reports — `ReportsController`

**Controller**: `com.cafe.mark1.Controller.ReportsController`  
**Base Path**: `/api/reports`  
**CORS**: `@CrossOrigin("*")`

---

### 12.1 `GET /api/reports/sales`

**Method**: `ReportsController.getSalesReport()`  
**Service**: `AnalyticsService.getSalesReport(LocalDate from, LocalDate to)`

**Query Parameters**: `from` (LocalDate, required), `to` (LocalDate, required) — ISO date format.

**Response Body** (`SalesReportResponse`, HTTP 200):
```json
{
  "totalSales": 45600.00,
  "totalTax": 2280.00,
  "totalDiscount": 1520.00,
  "netSales": 43320.00,
  "orders": 128,
  "paymentBreakdown": {
    "cash": 22800.00,
    "card": 15200.00,
    "upi": 7600.00
  }
}
```

**Business Rules**: `netSales = totalSales - totalTax`.

**Internal References**: Called only from this controller.

---

### 12.2 `GET /api/reports/orders`

**Method**: `ReportsController.getOrderReport()`  
**Service**: `AnalyticsService.getOrderReport(LocalDate from, LocalDate to)`

**Query Parameters**: Same date range.

**Response Body** (`List<OrderResponse>`, HTTP 200): Array of full order objects (PAID orders in date range).

**Business Rules**: Internally calls `OrderService.getOrderById()` for each order.

**Internal References**: `AnalyticsService.getOrderReport()` calls `OrderService.getOrderById()`.

---

### 12.3 `GET /api/reports/products`

**Method**: `ReportsController.getProductReport()`  
**Service**: `AnalyticsService.getProductReport(LocalDate from, LocalDate to)`

**Query Parameters**: Same date range.

**Response Body** (`List<ProductReportResponse>`, HTTP 200):
```json
[
  {
    "productId": 1,
    "productName": "Cappuccino",
    "categoryName": "Beverages",
    "quantitySold": 87,
    "grossRevenue": 15660.00,
    "discount": 450.00,
    "netRevenue": 15210.00
  }
]
```

**Internal References**: Called only from this controller.

---

### 12.4 `GET /api/reports/sessions`

**Method**: `ReportsController.getSessionReport()`  
**Service**: `AnalyticsService.getSessionReport(LocalDate from, LocalDate to)`

**Query Parameters**: Same date range.

**Response Body** (`List<SessionReportResponse>`, HTTP 200):
```json
[
  {
    "sessionId": 10,
    "employeeId": 2,
    "employeeName": "Rahul Sharma",
    "openTime": "2026-06-14T08:00:00",
    "closeTime": "2026-06-14T17:30:00",
    "status": "CLOSED",
    "closingAmount": 4500.00,
    "sales": 4350.00,
    "orders": 12
  }
]
```

**Internal References**: Called only from this controller.

---

## 13. Payment QR — `PaymentQrController`

**Controller**: `com.cafe.mark1.Controller.PaymentQrController`  
**Base Path**: `/api/payments`  
**CORS**: `@CrossOrigin("*")`

---

### 13.1 `GET /api/payments/orders/{orderId}/upi-qr`

**Method**: `PaymentQrController.generateUpiQr()`  
**Service**: `PaymentQrService.generateUpiQrForOrder(Long)`

**Path Variables**: `orderId` (Long, required)

**Produces**: `image/png`

**Response Body**: Raw PNG image bytes (`byte[]`, HTTP 200, Content-Type: `image/png`).

**Business Rules**:
- Throws if order not found.
- Throws if UPI is not enabled in payment settings.
- Throws if UPI ID is not configured.
- Generates a UPI deep link QR code: `upi://pay?pa={upiId}&pn=CafeChino&am={amount}&cu=INR&tn=Order {orderId}`.
- QR code size: 320×320 pixels.

**Internal References**: `PaymentQrService` calls `PaymentSettingsService.getPaymentSettings()` internally.

---

## 14. Payment Settings — `PaymentSettingsController`

**Controller**: `com.cafe.mark1.Controller.PaymentSettingsController`  
**Base Path**: `/api/settings/payment-methods`  
**CORS**: `@CrossOrigin(origins = "*")`

---

### 14.1 `GET /api/settings/payment-methods`

**Method**: `PaymentSettingsController.getPaymentSettings()`  
**Service**: `PaymentSettingsService.getPaymentSettings()`

**Response Body** (`PaymentSettingsResponse`, HTTP 200):
```json
{
  "cash": true,
  "card": true,
  "upi": true,
  "upiId": "cafechino@upi"
}
```

**Business Rules**: If no settings exist in DB, auto-creates defaults (all enabled, empty UPI ID) with hardcoded ID = 1.

**Internal References**: `PaymentSettingsService.getPaymentSettings()` is also called by:
- `PaymentQrService.generateUpiQrForOrder()` (UPI QR generation)
- `OrderService.markAsPaid()` (validates payment method settings, via `PaymentSettingsRepository` directly)

---

### 14.2 `PUT /api/settings/payment-methods`

**Method**: `PaymentSettingsController.updatePaymentSettings()`  
**Service**: `PaymentSettingsService.updatePaymentSettings(PaymentSettingsRequest)`

**Request Body** (`PaymentSettingsRequest`, `@Valid`):
```json
{
  "cash": true,
  "card": true,
  "upi": true,
  "upiId": "cafechino@upi"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `cash` | Boolean | Yes | `@NotNull("Cash setting is required")` |
| `card` | Boolean | Yes | `@NotNull("Card setting is required")` |
| `upi` | Boolean | Yes | `@NotNull("UPI setting is required")` |
| `upiId` | String | No | None |

**Response Body** (`PaymentSettingsResponse`, HTTP 200): Updated settings.

**Internal References**: Called only from this controller.

---

## 16. WebSocket Topics

**Configuration**: `WebSocketConfig` (STOMP over SockJS)  
**Endpoint**: `/ws` (SockJS fallback enabled)  
**Broker Prefix**: `/topic`  
**App Destination Prefix**: `/app`

| Topic | Published By | Payload Type | Description |
|-------|-------------|--------------|-------------|
| `/topic/kds` | `OrderService.broadcastKds()` | `KitchenTicketResponse` | Real-time KDS updates when orders are sent to kitchen or line statuses change |
| `/topic/kitchen-tickets` | `OrderService.broadcastKds()` | `KitchenTicketResponse` | Same payload, duplicate topic for kitchen ticket screen |

---

## 17. Endpoints With No Internal References

These endpoints' underlying service methods are called **only** from their respective controller — they are purely external-facing APIs with no internal backend usage.

| # | Endpoint | Controller | Service Method |
|---|----------|------------|----------------|
| 1 | `POST /api/users/register` | UserController | `UserService.registerUser()` |
| 2 | `POST /api/users/login` | UserController | `UserService.loginUser()` |
| 3 | `GET /api/users` | UserController | `UserService.getAllUsers()` |
| 4 | `GET /api/users/all` | UserController | `UserService.getAllUsers()` (duplicate) |
| 5 | `GET /api/users/{id}` | UserController | `UserService.getUserById()` |
| 6 | `PUT /api/users/{id}` | UserController | `UserService.updateUser()` |
| 7 | `DELETE /api/users/{id}` | UserController | `UserService.deleteUser()` |
| 8 | `PATCH /api/users/{id}/archive` | UserController | `UserService.toggleArchive()` |
| 9 | `PATCH /api/users/{id}/password` | UserController | `UserService.changePassword()` |
| 10 | `GET /api/categories` | CategoryController | `CategoryService.getAllCategories()` |
| 11 | `GET /api/categories/{id}` | CategoryController | `CategoryService.getCategoryById()` |
| 12 | `POST /api/categories` | CategoryController | `CategoryService.createCategory()` |
| 13 | `PUT /api/categories/{id}` | CategoryController | `CategoryService.updateCategory()` |
| 14 | `DELETE /api/categories/{id}` | CategoryController | `CategoryService.deleteCategory()` |
| 15 | `GET /api/products` | ProductController | `ProductService.getAllProducts()` |
| 16 | `GET /api/products/{id}` | ProductController | `ProductService.getProductById()` |
| 17 | `POST /api/products` | ProductController | `ProductService.createProduct()` |
| 18 | `PUT /api/products/{id}` | ProductController | `ProductService.updateProduct()` |
| 19 | `DELETE /api/products/{id}` | ProductController | `ProductService.deleteProduct()` |
| 20 | `GET /api/floors` | FloorController | `FloorService.getAllFloors()` |
| 21 | `GET /api/floors/{id}` | FloorController | `FloorService.getFloorById()` |
| 22 | `POST /api/floors` | FloorController | `FloorService.createFloor()` |
| 23 | `PUT /api/floors/{id}` | FloorController | `FloorService.updateFloor()` |
| 24 | `DELETE /api/floors/{id}` | FloorController | `FloorService.deleteFloor()` |
| 25 | `GET /api/tables` | TableController | `TableService.getAllTables()` |
| 26 | `GET /api/tables/{id}` | TableController | `TableService.getTableById()` |
| 27 | `POST /api/tables` | TableController | `TableService.createTable()` |
| 28 | `PUT /api/tables/{id}` | TableController | `TableService.updateTable()` |
| 29 | `DELETE /api/tables/{id}` | TableController | `TableService.deleteTable()` |
| 30 | `POST /api/orders` | OrderController | `OrderService.createOrder()` |
| 31 | `PUT /api/orders/{id}/lines` | OrderController | `OrderService.addOrUpdateLine()` |
| 32 | `DELETE /api/orders/{id}/lines/{lineId}` | OrderController | `OrderService.removeLine()` |
| 33 | `POST /api/orders/{id}/coupon` | OrderController | `OrderService.applyCoupon()` |
| 34 | `POST /api/orders/{id}/pay` | OrderController | `OrderService.markAsPaid()` |
| 35 | `POST /api/orders/{id}/cancel` | OrderController | `OrderService.cancelOrder()` |
| 36 | `GET /api/orders` | OrderController | `OrderService.getOrders()` |
| 37 | `GET /api/customers` | CustomerController | `CustomerService.getCustomers()` |
| 38 | `GET /api/customers/{id}` | CustomerController | `CustomerService.getCustomerById()` |
| 39 | `GET /api/customers/phone/{phone}` | CustomerController | `CustomerService.getCustomerByPhone()` |
| 40 | `POST /api/customers` | CustomerController | `CustomerService.createCustomer()` |
| 41 | `PUT /api/customers/{id}` | CustomerController | `CustomerService.updateCustomer()` |
| 42 | `PATCH /api/customers/{id}/archive` | CustomerController | `CustomerService.toggleArchive()` |
| 43 | `DELETE /api/customers/{id}` | CustomerController | `CustomerService.deleteCustomer()` |
| 44 | `POST /api/admin/promotions` | AdminPromotionController | `PromotionService.createPromotion()` |
| 45 | `GET /api/admin/promotions` | AdminPromotionController | `PromotionService.getAllPromotions()` |
| 46 | `DELETE /api/admin/promotions/{id}` | AdminPromotionController | `PromotionService.deletePromotion()` |
| 47 | `POST /api/admin/promotions/seed-coupon` | AdminPromotionController | Direct `PromotionRepository` access |
| 48 | `POST /api/sessions/open` | EmployeeSessionController | `EmployeeSessionService.openSession()` |
| 49 | `POST /api/sessions/close` | EmployeeSessionController | `EmployeeSessionService.closeSession()` |
| 50 | `GET /api/sessions/current` | EmployeeSessionController | `EmployeeSessionService.getCurrentSession()` |
| 51 | `GET /api/sessions` | EmployeeSessionController | `EmployeeSessionService.getAllSessions()` / `getSessionsByStatus()` / `getEmployeeSessionHistory()` |
| 52 | `GET /api/kitchen-tickets` | KitchenTicketController | `OrderService.getActiveKitchenTickets()` |
| 53 | `PATCH /api/kitchen-tickets/{orderId}/lines/{lineId}/status` | KitchenTicketController | `OrderService.updateKitchenLineStatus()` |
| 54 | `PATCH /api/kitchen-tickets/{orderId}/advance` | KitchenTicketController | `OrderService.advanceKitchenTicketStage()` |
| 55 | `GET /api/dashboard/summary` | DashboardController | `AnalyticsService.getDashboardSummary()` |
| 56 | `GET /api/dashboard/sales-trend` | DashboardController | `AnalyticsService.getSalesTrend()` |
| 57 | `GET /api/dashboard/top-products` | DashboardController | `AnalyticsService.getTopProducts()` |
| 58 | `GET /api/reports/sales` | ReportsController | `AnalyticsService.getSalesReport()` |
| 59 | `GET /api/reports/orders` | ReportsController | `AnalyticsService.getOrderReport()` |
| 60 | `GET /api/reports/products` | ReportsController | `AnalyticsService.getProductReport()` |
| 61 | `GET /api/reports/sessions` | ReportsController | `AnalyticsService.getSessionReport()` |
| 62 | `PUT /api/settings/payment-methods` | PaymentSettingsController | `PaymentSettingsService.updatePaymentSettings()` |

### Endpoints WITH Internal References (excluded from above)

| Endpoint | Service Method | Referenced By |
|----------|---------------|---------------|
| `GET /api/orders/{id}` | `OrderService.getOrderById()` | `AnalyticsService.getOrderReport()` |
| `POST /api/orders/{id}/send-to-kitchen` | `OrderService.sendToKitchen()` | `OrderService.sendOrderToKitchenTicket()` (KitchenTicketController) |
| `POST /api/kitchen-tickets/orders/{orderId}/send` | `OrderService.sendOrderToKitchenTicket()` | Calls `OrderService.sendToKitchen()` internally |
| `GET /api/settings/payment-methods` | `PaymentSettingsService.getPaymentSettings()` | `PaymentQrService.generateUpiQrForOrder()` |
| `GET /api/payments/orders/{orderId}/upi-qr` | `PaymentQrService.generateUpiQrForOrder()` | Uses `PaymentSettingsService` internally |
