export type Role = "ADMIN" | "MANAGER" | "STOCK" | "ACCOUNTANT" | "VIEWER";

export type Action =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "EXPORT"
  | "APPROVE"
  | "MANAGE_USERS";

type BaseResource =
  | "COMPANY"
  | "CLIENT"
  | "SUPPLIER"
  | "PRODUCT"
  | "SALE"
  | "PURCHASE"
  | "INVOICE"
  | "STOCK"
  | "EMPLOYEE"
  | "BOAT"
  | "PAYMENT"
  | "REPORT"
  | "USER";

export type Resource =
  | BaseResource
  | "PURCHASE_ORDER"
  | "REPORTS"
  | "USERS"
  | "WEBHOOKS";

// Normalize aliases used across routes to a canonical resource
const resourceAliases: Partial<Record<Resource, BaseResource>> = {
  PURCHASE_ORDER: "PURCHASE",
  REPORTS: "REPORT",
  USERS: "USER",
  WEBHOOKS: "COMPANY",
};

const permissions: Record<Role, Record<BaseResource, Action[]>> = {
  ADMIN: {
    COMPANY: ["CREATE", "READ", "UPDATE", "DELETE", "MANAGE_USERS"],
    CLIENT: ["CREATE", "READ", "UPDATE", "DELETE"],
    SUPPLIER: ["CREATE", "READ", "UPDATE", "DELETE"],
    PRODUCT: ["CREATE", "READ", "UPDATE", "DELETE"],
    SALE: ["CREATE", "READ", "UPDATE", "DELETE", "APPROVE"],
    PURCHASE: ["CREATE", "READ", "UPDATE", "DELETE", "APPROVE"],
    INVOICE: ["CREATE", "READ", "UPDATE", "DELETE"],
    STOCK: ["CREATE", "READ", "UPDATE", "DELETE"],
    EMPLOYEE: ["CREATE", "READ", "UPDATE", "DELETE"],
    BOAT: ["CREATE", "READ", "UPDATE", "DELETE"],
    PAYMENT: ["CREATE", "READ", "UPDATE", "DELETE"],
    REPORT: ["READ", "EXPORT"],
    USER: ["CREATE", "READ", "UPDATE", "DELETE", "MANAGE_USERS"],
  },
  MANAGER: {
    COMPANY: ["READ"],
    CLIENT: ["CREATE", "READ", "UPDATE"],
    SUPPLIER: ["CREATE", "READ", "UPDATE"],
    PRODUCT: ["READ"],
    SALE: ["CREATE", "READ", "UPDATE", "APPROVE"],
    PURCHASE: ["CREATE", "READ", "UPDATE", "APPROVE"],
    INVOICE: ["CREATE", "READ", "UPDATE"],
    STOCK: ["READ"],
    EMPLOYEE: ["READ", "UPDATE"],
    BOAT: ["READ"],
    PAYMENT: ["CREATE", "READ", "UPDATE"],
    REPORT: ["READ", "EXPORT"],
    USER: ["READ"],
  },
  STOCK: {
    COMPANY: ["READ"],
    CLIENT: ["READ"],
    SUPPLIER: ["READ"],
    PRODUCT: ["READ"],
    SALE: ["READ"],
    PURCHASE: ["READ"],
    INVOICE: ["READ"],
    STOCK: ["CREATE", "READ", "UPDATE"],
    EMPLOYEE: ["READ"],
    BOAT: ["READ"],
    PAYMENT: ["READ"],
    REPORT: ["READ"],
    USER: [],
  },
  ACCOUNTANT: {
    COMPANY: ["READ"],
    CLIENT: ["READ"],
    SUPPLIER: ["READ"],
    PRODUCT: ["READ"],
    SALE: ["READ"],
    PURCHASE: ["READ"],
    INVOICE: ["CREATE", "READ", "UPDATE"],
    STOCK: ["READ"],
    EMPLOYEE: ["READ"],
    BOAT: ["READ"],
    PAYMENT: ["CREATE", "READ", "UPDATE"],
    REPORT: ["READ", "EXPORT"],
    USER: [],
  },
  VIEWER: {
    COMPANY: ["READ"],
    CLIENT: ["READ"],
    SUPPLIER: ["READ"],
    PRODUCT: ["READ"],
    SALE: ["READ"],
    PURCHASE: ["READ"],
    INVOICE: ["READ"],
    STOCK: ["READ"],
    EMPLOYEE: ["READ"],
    BOAT: ["READ"],
    PAYMENT: ["READ"],
    REPORT: ["READ"],
    USER: [],
  },
};

function normalizeResource(resource: Resource): BaseResource {
  const mapped = resourceAliases[resource];
  if (mapped) return mapped;
  return resource as BaseResource;
}

export function hasPermission(
  role: Role,
  resource: Resource,
  action: Action
): boolean {
  const normalizedResource = normalizeResource(resource);
  const rolePermissions = permissions[role];
  if (!rolePermissions) return false;

  const resourceActions = rolePermissions[normalizedResource];
  if (!resourceActions) return false;

  return resourceActions.includes(action);
}

export function canAccess(
  role: Role,
  resource: Resource,
  action: Action
): boolean {
  return hasPermission(role, resource, action);
}

export function getPermissions(role: Role): Record<BaseResource, Action[]> {
  return permissions[role] || {};
}
