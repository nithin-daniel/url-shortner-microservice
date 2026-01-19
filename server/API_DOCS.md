# API Documentation

**Base URL:** `https://api-clingo.nithindaniel.tech`

---

## Table of Contents

- [Authentication](#authentication)
- [Auth Service Endpoints](#auth-service-endpoints)
- [URL Service Endpoints](#url-service-endpoints)
- [Response Format](#response-format)
- [Error Codes](#error-codes)

---

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained by logging in or registering.

---

## Auth Service Endpoints

### Public Routes

#### Register User

```
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

---

#### Login User

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

---

### Protected Routes (Requires Authentication)

#### Get User Profile

```
GET /api/auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2025-01-19T00:00:00.000Z"
  }
}
```

---

### Admin Only Routes

#### Get All Users

```
GET /api/auth/users
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "createdAt": "2025-01-19T00:00:00.000Z"
    }
  ]
}
```

---

#### Get Users with URL Count

```
GET /api/auth/admin/users-stats
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Users with URL count retrieved successfully",
  "data": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "urlCount": 5
    }
  ]
}
```

---

#### Update User Role

```
PUT /api/auth/users/:userId/role
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

---

#### Delete User

```
DELETE /api/auth/users/:userId
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## URL Service Endpoints

### Protected Routes (Requires Authentication)

#### Create Short URL

```
POST /api/url/shorten
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "originalUrl": "https://example.com/very-long-url-here",
  "customCode": "mycode",       // Optional: custom short code
  "expiresAt": "2025-12-31"     // Optional: expiry date
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Short URL created successfully",
  "data": {
    "originalUrl": "https://example.com/very-long-url-here",
    "shortUrl": "https://api-clingo.nithindaniel.tech/mycode",
    "urlCode": "mycode",
    "clicks": 0,
    "expiresAt": "2025-12-31T00:00:00.000Z",
    "createdAt": "2025-01-19T00:00:00.000Z"
  }
}
```

---

#### Get User's URLs

```
GET /api/url/urls/my
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "URLs retrieved successfully",
  "data": [
    {
      "originalUrl": "https://example.com/url1",
      "shortUrl": "https://api-clingo.nithindaniel.tech/abc123",
      "urlCode": "abc123",
      "clicks": 10,
      "expiresAt": "2025-02-19T00:00:00.000Z",
      "createdAt": "2025-01-19T00:00:00.000Z"
    }
  ]
}
```

---

#### Get URL Statistics

```
GET /api/url/stats/:code
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "URL stats retrieved successfully",
  "data": {
    "originalUrl": "https://example.com/url1",
    "shortUrl": "https://api-clingo.nithindaniel.tech/abc123",
    "urlCode": "abc123",
    "clicks": 10,
    "expiresAt": "2025-02-19T00:00:00.000Z",
    "createdAt": "2025-01-19T00:00:00.000Z"
  }
}
```

---

#### Delete URL

```
DELETE /api/url/urls/:code
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "URL deleted successfully"
}
```

---

### Public Routes (No Authentication Required)

#### Resolve URL (Get Original URL)

```
GET /api/url/resolve/:code
```

**Response (200):**
```json
{
  "success": true,
  "message": "URL resolved successfully",
  "data": {
    "originalUrl": "https://example.com/very-long-url-here"
  }
}
```

---

#### Redirect to Original URL

```
GET /api/url/:code
```

**Response:** Redirects (302) to the original URL.

---

### Admin Only Routes

#### Get All URLs

```
GET /api/url/urls?status=active
```

**Query Parameters:**
| Parameter | Values | Description |
|-----------|--------|-------------|
| status | `active` | Active, non-expired URLs |
| status | `expired` | Expired URLs |
| status | `deleted` | Soft-deleted URLs |

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "URLs retrieved successfully",
  "data": {
    "urls": [...],
    "total": 100
  }
}
```

---

#### Get Admin Statistics

```
GET /api/url/admin/stats
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Admin stats retrieved successfully",
  "data": {
    "totalUrls": 100,
    "activeUrls": 80,
    "expiredUrls": 15,
    "deletedUrls": 5,
    "totalClicks": 5000
  }
}
```

---

#### Get User URL Counts

```
GET /api/url/admin/user-url-counts
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User URL counts retrieved successfully",
  "data": [
    {
      "userId": "user_id",
      "email": "user@example.com",
      "urlCount": 10
    }
  ]
}
```

---

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Description of the operation",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "details": "Additional error details"
  }
}
```

---

## Error Codes

| HTTP Code | Description |
|-----------|-------------|
| 200 | Success |
| 201 | Created |
| 302 | Redirect |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal server error |

---

## Rate Limiting

Currently, no rate limiting is implemented at the API level. Consider using Nginx rate limiting for production.

---

## Health Check Endpoints

Each service exposes a health check endpoint:

- **Auth Service:** `GET /health`
- **URL Service:** `GET /health`
- **Email Service:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "service": "service-name",
  "timestamp": "2025-01-19T00:00:00.000Z"
}
```
