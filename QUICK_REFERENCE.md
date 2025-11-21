# 🚀 Quick Reference Guide - Phase 2

## 📍 File Locations

### API Routes
```
app/api/referentials/
├── clients/route.ts              # GET, POST
├── clients/[id]/route.ts         # GET, PATCH, DELETE
├── suppliers/route.ts            # GET, POST
├── suppliers/[id]/route.ts       # GET, PATCH, DELETE
├── products/route.ts             # GET, POST
├── products/[id]/route.ts        # GET, PATCH, DELETE
├── categories/route.ts           # GET, POST
├── categories/[id]/route.ts      # GET, PATCH, DELETE
├── brands/route.ts               # GET, POST
├── brands/[id]/route.ts          # GET, PATCH, DELETE
├── tax-rates/route.ts            # GET, POST
└── tax-rates/[id]/route.ts       # GET, PATCH, DELETE
```

### Frontend Pages
```
app/referentials/
├── page.tsx                      # Hub page
├── layout.tsx                    # Sidebar layout
├── clients/page.tsx              # Clients management
├── suppliers/page.tsx            # Suppliers management
├── products/page.tsx             # Products management
├── categories/page.tsx           # Categories management
├── brands/page.tsx               # Brands management
└── tax-rates/page.tsx            # Tax rates management
```

### Components
```
components/
├── data-table.tsx                # Generic table component
└── referential-form.tsx          # Generic form component
```

---

## 🔗 API Endpoints

### Clients
```
GET    /api/referentials/clients?groupId=<id>
POST   /api/referentials/clients
GET    /api/referentials/clients/<id>
PATCH  /api/referentials/clients/<id>
DELETE /api/referentials/clients/<id>
```

### Suppliers
```
GET    /api/referentials/suppliers?groupId=<id>
POST   /api/referentials/suppliers
GET    /api/referentials/suppliers/<id>
PATCH  /api/referentials/suppliers/<id>
DELETE /api/referentials/suppliers/<id>
```

### Products
```
GET    /api/referentials/products?groupId=<id>
POST   /api/referentials/products
GET    /api/referentials/products/<id>
PATCH  /api/referentials/products/<id>
DELETE /api/referentials/products/<id>
```

### Categories
```
GET    /api/referentials/categories?groupId=<id>
POST   /api/referentials/categories
GET    /api/referentials/categories/<id>
PATCH  /api/referentials/categories/<id>
DELETE /api/referentials/categories/<id>
```

### Brands
```
GET    /api/referentials/brands?groupId=<id>
POST   /api/referentials/brands
GET    /api/referentials/brands/<id>
PATCH  /api/referentials/brands/<id>
DELETE /api/referentials/brands/<id>
```

### Tax Rates
```
GET    /api/referentials/tax-rates?groupId=<id>
POST   /api/referentials/tax-rates
GET    /api/referentials/tax-rates/<id>
PATCH  /api/referentials/tax-rates/<id>
DELETE /api/referentials/tax-rates/<id>
```

---

## 📝 Request/Response Examples

### Create Client
```bash
POST /api/referentials/clients
{
  "groupId": "group-123",
  "code": "CLI001",
  "name": "Client Name",
  "email": "client@example.com",
  "phone": "+212612345678"
}
```

### Update Client
```bash
PATCH /api/referentials/clients/client-id
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

### Delete Client
```bash
DELETE /api/referentials/clients/client-id
```

---

## 🧩 Component Usage

### DataTable
```typescript
<DataTable
  data={items}
  columns={[
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
  ]}
  onEdit={(item) => handleEdit(item)}
  onDelete={(item) => handleDelete(item)}
  onAdd={() => handleAdd()}
  searchField="name"
/>
```

### ReferentialForm
```typescript
<ReferentialForm
  title="Add New Client"
  fields={[
    { name: "code", label: "Code", required: true },
    { name: "name", label: "Name", required: true },
    { name: "email", label: "Email", type: "email" },
  ]}
  onSubmit={(data) => handleSubmit(data)}
  onCancel={() => handleCancel()}
/>
```

---

## 🔐 Authentication

All endpoints require JWT token:
```
Authorization: Bearer <jwt_token>
```

---

## 🎯 Common Tasks

### Add New Referential Type
1. Create API routes: `app/api/referentials/[entity]/route.ts`
2. Create management page: `app/referentials/[entity]/page.tsx`
3. Add to referentials layout navigation
4. Update documentation

### Modify Form Fields
Edit the `fields` array in management page:
```typescript
fields={[
  { name: "code", label: "Code", required: true },
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", type: "email" },
]}
```

### Add Search Field
Update DataTable `searchField` prop:
```typescript
<DataTable
  ...
  searchField="name"
/>
```

---

## 🐛 Debugging

### Check API Response
```typescript
const response = await fetch(url);
const data = await response.json();
console.log(data);
```

### Check Form Validation
Look for error messages in form component

### Check Permissions
Verify user has required permission in RBAC

---

## 📊 Data Models

### Client
```typescript
{
  id: string
  groupId: string
  code: string (unique per group)
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  ice?: string
  if?: string
}
```

### Product
```typescript
{
  id: string
  groupId: string
  code: string (unique per group)
  name: string
  description?: string
  categoryId?: string
  brandId?: string
  price: number
  cost: number
}
```

### Tax Rate
```typescript
{
  id: string
  groupId: string
  code: string (unique per group)
  name: string
  rate: number
  type: "TVA" | "TSP"
}
```

---

## 🔗 Related Documentation

- `IMPLEMENTATION_PHASE_2.md` - Detailed implementation
- `API_REFERENTIALS.md` - Complete API docs
- `PHASE_2_SUMMARY.md` - Phase summary
- `ARCHITECTURE.md` - System architecture
- `DATABASE.md` - Database schema

---

## ⚡ Quick Commands

### Test API
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
```

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review API_REFERENTIALS.md
3. Check IMPLEMENTATION_PHASE_2.md
4. Review error messages in console

---

**Last Updated:** 2024-12-21  
**Status:** ✅ Production Ready

