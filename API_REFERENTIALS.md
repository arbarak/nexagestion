# 📚 Referential Management API Documentation

## Overview

The Referential Management API provides endpoints for managing master data across the NexaGestion system. All referential data is shared at the group level and accessible to all companies within the group.

---

## Authentication

All endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

---

## Clients API

### List Clients
```
GET /api/referentials/clients?groupId=<group-id>
```

**Response:**
```json
{
  "data": [
    {
      "id": "client-id",
      "groupId": "group-id",
      "code": "CLI001",
      "name": "Client Name",
      "email": "client@example.com",
      "phone": "+212612345678",
      "address": "123 Street",
      "city": "Casablanca",
      "country": "Morocco",
      "ice": "ICE123456",
      "if": "IF123456",
      "createdAt": "2024-12-21T10:00:00Z",
      "updatedAt": "2024-12-21T10:00:00Z"
    }
  ]
}
```

### Create Client
```
POST /api/referentials/clients
```

**Request Body:**
```json
{
  "groupId": "group-id",
  "code": "CLI001",
  "name": "Client Name",
  "email": "client@example.com",
  "phone": "+212612345678",
  "address": "123 Street",
  "city": "Casablanca",
  "country": "Morocco",
  "ice": "ICE123456",
  "if": "IF123456"
}
```

### Get Client Details
```
GET /api/referentials/clients/<id>
```

### Update Client
```
PATCH /api/referentials/clients/<id>
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "phone": "+212612345679"
}
```

### Delete Client
```
DELETE /api/referentials/clients/<id>
```

---

## Suppliers API

### List Suppliers
```
GET /api/referentials/suppliers?groupId=<group-id>
```

### Create Supplier
```
POST /api/referentials/suppliers
```

**Request Body:**
```json
{
  "groupId": "group-id",
  "code": "SUP001",
  "name": "Supplier Name",
  "email": "supplier@example.com",
  "phone": "+212612345678",
  "address": "123 Street",
  "city": "Fez",
  "country": "Morocco",
  "ice": "ICE123456",
  "if": "IF123456"
}
```

### Get Supplier Details
```
GET /api/referentials/suppliers/<id>
```

### Update Supplier
```
PATCH /api/referentials/suppliers/<id>
```

### Delete Supplier
```
DELETE /api/referentials/suppliers/<id>
```

---

## Products API

### List Products
```
GET /api/referentials/products?groupId=<group-id>
```

**Response includes category and brand details:**
```json
{
  "data": [
    {
      "id": "product-id",
      "groupId": "group-id",
      "code": "PRD001",
      "name": "Product Name",
      "description": "Product description",
      "categoryId": "category-id",
      "category": { "id": "category-id", "name": "Category Name" },
      "brandId": "brand-id",
      "brand": { "id": "brand-id", "name": "Brand Name" },
      "price": 99.99,
      "cost": 50.00,
      "createdAt": "2024-12-21T10:00:00Z",
      "updatedAt": "2024-12-21T10:00:00Z"
    }
  ]
}
```

### Create Product
```
POST /api/referentials/products
```

**Request Body:**
```json
{
  "groupId": "group-id",
  "code": "PRD001",
  "name": "Product Name",
  "description": "Product description",
  "categoryId": "category-id",
  "brandId": "brand-id",
  "price": 99.99,
  "cost": 50.00
}
```

### Get Product Details
```
GET /api/referentials/products/<id>
```

### Update Product
```
PATCH /api/referentials/products/<id>
```

### Delete Product
```
DELETE /api/referentials/products/<id>
```

---

## Categories API

### List Categories
```
GET /api/referentials/categories?groupId=<group-id>
```

### Create Category
```
POST /api/referentials/categories
```

**Request Body:**
```json
{
  "groupId": "group-id",
  "code": "CAT001",
  "name": "Category Name"
}
```

### Get Category Details
```
GET /api/referentials/categories/<id>
```

### Update Category
```
PATCH /api/referentials/categories/<id>
```

### Delete Category
```
DELETE /api/referentials/categories/<id>
```

---

## Brands API

### List Brands
```
GET /api/referentials/brands?groupId=<group-id>
```

### Create Brand
```
POST /api/referentials/brands
```

**Request Body:**
```json
{
  "groupId": "group-id",
  "code": "BRD001",
  "name": "Brand Name"
}
```

### Get Brand Details
```
GET /api/referentials/brands/<id>
```

### Update Brand
```
PATCH /api/referentials/brands/<id>
```

### Delete Brand
```
DELETE /api/referentials/brands/<id>
```

---

## Tax Rates API

### List Tax Rates
```
GET /api/referentials/tax-rates?groupId=<group-id>
```

**Response:**
```json
{
  "data": [
    {
      "id": "tax-rate-id",
      "groupId": "group-id",
      "code": "TVA20",
      "name": "TVA 20%",
      "rate": 20.0,
      "type": "TVA",
      "createdAt": "2024-12-21T10:00:00Z",
      "updatedAt": "2024-12-21T10:00:00Z"
    }
  ]
}
```

### Create Tax Rate
```
POST /api/referentials/tax-rates
```

**Request Body:**
```json
{
  "groupId": "group-id",
  "code": "TVA20",
  "name": "TVA 20%",
  "rate": 20.0,
  "type": "TVA"
}
```

**Type Options:** `TVA`, `TSP`

### Get Tax Rate Details
```
GET /api/referentials/tax-rates/<id>
```

### Update Tax Rate
```
PATCH /api/referentials/tax-rates/<id>
```

### Delete Tax Rate
```
DELETE /api/referentials/tax-rates/<id>
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "CONFLICT",
  "message": "Code already exists"
}
```

---

## Permissions Required

| Resource | CREATE | READ | UPDATE | DELETE |
|----------|--------|------|--------|--------|
| CLIENT | ✅ | ✅ | ✅ | ✅ |
| SUPPLIER | ✅ | ✅ | ✅ | ✅ |
| PRODUCT | ✅ | ✅ | ✅ | ✅ |
| CATEGORY | ✅ | ✅ | ✅ | ✅ |
| BRAND | ✅ | ✅ | ✅ | ✅ |
| TAX_RATE | ✅ | ✅ | ✅ | ✅ |

---

## Rate Limiting

- **Limit:** 100 requests per minute
- **Header:** `X-RateLimit-Remaining`

---

## Pagination

List endpoints support pagination:

```
GET /api/referentials/clients?groupId=<group-id>&page=1&limit=20
```

---

## Sorting

List endpoints support sorting:

```
GET /api/referentials/clients?groupId=<group-id>&sort=name&order=asc
```

---

## Filtering

List endpoints support filtering:

```
GET /api/referentials/clients?groupId=<group-id>&search=name
```

---

## Examples

### cURL

```bash
# List clients
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/referentials/clients?groupId=group-id"

# Create client
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"groupId":"group-id","code":"CLI001","name":"Client"}' \
  "http://localhost:3000/api/referentials/clients"

# Update client
curl -X PATCH \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}' \
  "http://localhost:3000/api/referentials/clients/client-id"

# Delete client
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/referentials/clients/client-id"
```

---

## Best Practices

1. **Always include groupId** in list requests
2. **Validate input** before sending to API
3. **Handle errors** gracefully
4. **Use pagination** for large datasets
5. **Cache responses** when appropriate
6. **Implement retry logic** for failed requests

---

**API Version:** 1.0  
**Last Updated:** 2024-12-21  
**Status:** ✅ Production Ready

