# Backend Deployment Checklist

## 1. Build Check

Run from the backend folder:

```bash
./mvnw test
./mvnw package -DskipTests
```

Windows:

```powershell
.\mvnw.cmd test
.\mvnw.cmd package -DskipTests
```

Jar output:

```text
target/hackthonproject-0.0.1-SNAPSHOT.jar
```

## 2. Production Environment Variables

Set these on the server:

```env
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:mysql://DB_HOST:3306/hackthon_db
SPRING_DATASOURCE_USERNAME=DB_USER
SPRING_DATASOURCE_PASSWORD=DB_PASSWORD
JWT_SECRET=replace_with_a_minimum_32_character_secret
JWT_EXPIRATION_MS=36000000
PORT=8080
```

Production profile uses:

```properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
```

So the database schema and data must be imported before starting the app.

## 3. Export Local MySQL Data

If `mysqldump` is in PATH:

```bash
mysqldump -u root -p --databases hackthon_db --routines --triggers --events > hackthon_db_dump.sql
```

Common Windows MySQL path example:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p --databases hackthon_db --routines --triggers --events > hackthon_db_dump.sql
```

Keep this dump private. It contains users, BCrypt password hashes, orders, customers, and payment settings.

## 4. Import Data On Server

Create database/user if needed:

```sql
CREATE DATABASE IF NOT EXISTS hackthon_db;
CREATE USER 'cafe_user'@'%' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON hackthon_db.* TO 'cafe_user'@'%';
FLUSH PRIVILEGES;
```

Import dump:

```bash
mysql -u cafe_user -p < hackthon_db_dump.sql
```

Windows example:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u cafe_user -p < hackthon_db_dump.sql
```

## 5. Start Backend

```bash
java -jar target/hackthonproject-0.0.1-SNAPSHOT.jar
```

Or with env inline on Linux:

```bash
SPRING_PROFILES_ACTIVE=prod \
SPRING_DATASOURCE_URL="jdbc:mysql://DB_HOST:3306/hackthon_db" \
SPRING_DATASOURCE_USERNAME="cafe_user" \
SPRING_DATASOURCE_PASSWORD="strong_password_here" \
JWT_SECRET="replace_with_a_minimum_32_character_secret" \
java -jar target/hackthonproject-0.0.1-SNAPSHOT.jar
```

## 6. Auth Status

Role-based auth is currently not enforced. The backend permits all API requests:

```text
anyRequest().permitAll()
```

JWT login/token generation is available, but endpoint authorization is intentionally open for the current frontend integration.

Keep these endpoints public:

```text
POST /api/users/login
POST /api/users/register
```

Before public production launch, revisit auth rules for admin-only and staff-only APIs.

Suggested future admin-only areas:

```text
/api/users/**
/api/settings/**
/api/dashboard/**
/api/reports/**
/api/admin/**
```

Suggested future staff areas:

```text
/api/orders/**
/api/sessions/**
/api/customers/**
/api/payments/**
/api/kitchen-tickets/**
```

## 7. Smoke Tests

Login:

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

Token response can still be tested:

```http
Authorization: Bearer <token>
```

Check protected APIs:

```http
GET /api/dashboard/summary?from=2026-06-01&to=2026-06-14
GET /api/settings/payment-methods
GET /api/products
```

Because auth is open right now, unauthenticated requests will still work.
